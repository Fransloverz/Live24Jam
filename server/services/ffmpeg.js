const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Store running processes
const runningStreams = new Map();
const streamLogs = new Map();
const streamConfigs = new Map(); // Store stream configs for auto-restart

// Auto-restart configuration
const AUTO_RESTART_CONFIG = {
    enabled: true,
    maxRetries: 5,           // Maximum restart attempts
    retryDelay: 5000,        // Delay between restarts (5 seconds)
    resetRetryAfter: 300000  // Reset retry count after 5 minutes of stable streaming
};

// Video directory
const VIDEOS_DIR = process.env.VIDEOS_DIR || path.join(__dirname, '../../videos');

// Ensure videos directory exists
if (!fs.existsSync(VIDEOS_DIR)) {
    fs.mkdirSync(VIDEOS_DIR, { recursive: true });
}

/**
 * Get quality settings for FFmpeg (only used when re-encoding)
 */
function getQualitySettings(quality) {
    const settings = {
        '720p': { resolution: '1280x720', bitrate: '2500k', audioBitrate: '128k' },
        '1080p': { resolution: '1920x1080', bitrate: '4500k', audioBitrate: '192k' },
        '4K': { resolution: '3840x2160', bitrate: '15000k', audioBitrate: '320k' }
    };
    return settings[quality] || settings['1080p'];
}

/**
 * Start streaming with FFmpeg
 * Uses stream copy mode by default (no re-encoding) for maximum efficiency
 * Falls back to re-encoding mode if specified or if stream copy fails
 */
async function startStream(stream, forceReencode = false) {
    return new Promise((resolve, reject) => {
        const { id, videoFile, rtmpUrl, streamKey, quality, reencode } = stream;
        const videoPath = path.join(VIDEOS_DIR, videoFile);

        // Check if video file exists
        if (!fs.existsSync(videoPath)) {
            return reject(new Error(`Video file not found: ${videoFile}`));
        }

        const rtmpFullUrl = `${rtmpUrl}/${streamKey}`;
        const useReencode = forceReencode || reencode === true;

        let args;

        if (useReencode) {
            // Re-encoding mode (higher CPU usage, can change quality)
            const qualitySettings = getQualitySettings(quality);
            args = [
                '-re',                              // Read input at native frame rate
                '-stream_loop', '-1',               // Infinite loop
                '-i', videoPath,                    // Input file
                '-c:v', 'libx264',                  // Video codec
                '-preset', 'veryfast',              // Encoding preset
                '-b:v', qualitySettings.bitrate,    // Video bitrate
                '-maxrate', qualitySettings.bitrate,
                '-bufsize', qualitySettings.bitrate,
                '-vf', `scale=${qualitySettings.resolution}`, // Scale to resolution
                '-g', '60',                         // Keyframe interval
                '-c:a', 'aac',                      // Audio codec
                '-b:a', qualitySettings.audioBitrate,
                '-ar', '44100',                     // Audio sample rate
                '-f', 'flv',                        // Output format
                rtmpFullUrl                         // RTMP destination
            ];
            console.log(`Starting stream ${id} (RE-ENCODE mode)`);
        } else {
            // Stream copy mode (LOW CPU, NO STORAGE, FAST)
            // Just copies the video/audio without re-encoding
            args = [
                '-stream_loop', '-1',               // Infinite loop
                '-re',                              // Read input at native frame rate
                '-i', videoPath,                    // Input file
                '-c:v', 'copy',                     // Copy video stream (no re-encoding)
                '-c:a', 'copy',                     // Copy audio stream (no re-encoding)
                '-f', 'flv',                        // Output format
                '-flvflags', 'no_duration_filesize', // Optimize for streaming
                rtmpFullUrl                         // RTMP destination
            ];
            console.log(`Starting stream ${id} (STREAM COPY mode - Low CPU)`);
        }

        console.log(`FFmpeg command: ffmpeg ${args.join(' ')}`);

        const ffmpeg = spawn('ffmpeg', args);

        // Initialize logs array
        streamLogs.set(id, []);

        // Store stream config for auto-restart
        if (!streamConfigs.has(id)) {
            streamConfigs.set(id, {
                stream: stream,
                forceReencode: forceReencode,
                retryCount: 0,
                autoRestart: true,
                lastRestartTime: null
            });
        }

        ffmpeg.stdout.on('data', (data) => {
            const log = data.toString();
            addLog(id, log);
        });

        ffmpeg.stderr.on('data', (data) => {
            const log = data.toString();
            addLog(id, log);
            // FFmpeg outputs progress to stderr
            if (log.includes('frame=') || log.includes('speed=')) {
                console.log(`Stream ${id}: ${log.trim().substring(0, 100)}`);
            }
        });

        ffmpeg.on('error', (error) => {
            console.error(`Stream ${id} error:`, error);
            runningStreams.delete(id);
            reject(error);
        });

        ffmpeg.on('close', (code) => {
            console.log(`Stream ${id} closed with code ${code}`);
            runningStreams.delete(id);
            addLog(id, `Process exited with code ${code}`);

            // Auto-restart logic
            const config = streamConfigs.get(id);
            if (config && config.autoRestart && AUTO_RESTART_CONFIG.enabled && code !== 0) {
                if (config.retryCount < AUTO_RESTART_CONFIG.maxRetries) {
                    config.retryCount++;
                    config.lastRestartTime = new Date();

                    console.log(`🔄 Auto-restarting stream ${id} (attempt ${config.retryCount}/${AUTO_RESTART_CONFIG.maxRetries})...`);
                    addLog(id, `Auto-restart attempt ${config.retryCount}/${AUTO_RESTART_CONFIG.maxRetries}`);

                    setTimeout(() => {
                        startStream(config.stream, config.forceReencode)
                            .then(() => {
                                console.log(`✅ Stream ${id} restarted successfully`);
                                addLog(id, 'Stream restarted successfully');

                                // Reset retry count after stable period
                                setTimeout(() => {
                                    if (isStreamRunning(id)) {
                                        config.retryCount = 0;
                                        console.log(`Stream ${id} stable, reset retry count`);
                                    }
                                }, AUTO_RESTART_CONFIG.resetRetryAfter);
                            })
                            .catch((err) => {
                                console.error(`❌ Failed to restart stream ${id}:`, err);
                                addLog(id, `Restart failed: ${err.message}`);
                            });
                    }, AUTO_RESTART_CONFIG.retryDelay);
                } else {
                    console.error(`❌ Stream ${id} exceeded max retries (${AUTO_RESTART_CONFIG.maxRetries})`);
                    addLog(id, `Max retries exceeded. Stream stopped.`);
                    config.autoRestart = false;
                }
            }
        });

        // Store process reference with mode info
        runningStreams.set(id, {
            process: ffmpeg,
            mode: useReencode ? 'reencode' : 'copy',
            startTime: new Date(),
            retryCount: streamConfigs.get(id)?.retryCount || 0
        });

        // Give FFmpeg a moment to start
        setTimeout(() => {
            if (runningStreams.has(id)) {
                resolve();
            } else {
                reject(new Error('FFmpeg failed to start'));
            }
        }, 2000);
    });
}

/**
 * Stop a running stream
 */
function stopStream(streamId) {
    // Disable auto-restart when manually stopped
    const config = streamConfigs.get(streamId);
    if (config) {
        config.autoRestart = false;
        console.log(`Auto-restart disabled for stream ${streamId} (manual stop)`);
    }

    const streamData = runningStreams.get(streamId);
    if (streamData) {
        const ffmpeg = streamData.process;
        console.log(`Stopping stream ${streamId} (mode: ${streamData.mode})`);
        ffmpeg.kill('SIGTERM');

        // Force kill after 5 seconds if still running
        setTimeout(() => {
            if (runningStreams.has(streamId)) {
                ffmpeg.kill('SIGKILL');
                runningStreams.delete(streamId);
            }
        }, 5000);
    }
}

/**
 * Check if a stream is running
 */
function isStreamRunning(streamId) {
    return runningStreams.has(streamId);
}

/**
 * Get stream logs
 */
function getStreamLogs(streamId) {
    return streamLogs.get(streamId) || [];
}

/**
 * Add log entry
 */
function addLog(streamId, message) {
    const logs = streamLogs.get(streamId) || [];
    logs.push({
        timestamp: new Date().toISOString(),
        message: message.trim()
    });
    // Keep only last 100 logs
    if (logs.length > 100) {
        logs.shift();
    }
    streamLogs.set(streamId, logs);
}

/**
 * Get all running stream IDs
 */
function getRunningStreamIds() {
    return Array.from(runningStreams.keys());
}

/**
 * Get stream info (mode, uptime, etc.)
 */
function getStreamInfo(streamId) {
    const streamData = runningStreams.get(streamId);
    if (!streamData) return null;

    const uptime = Math.floor((new Date() - streamData.startTime) / 1000);
    return {
        mode: streamData.mode,
        startTime: streamData.startTime,
        uptime: uptime,
        uptimeFormatted: formatStreamUptime(uptime)
    };
}

function formatStreamUptime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
}

module.exports = {
    startStream,
    stopStream,
    isStreamRunning,
    getStreamLogs,
    getRunningStreamIds,
    getStreamInfo
};
