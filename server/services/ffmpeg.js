const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Store running processes
const runningStreams = new Map();
const streamLogs = new Map();

// Video directory
const VIDEOS_DIR = process.env.VIDEOS_DIR || path.join(__dirname, '../../videos');

// Ensure videos directory exists
if (!fs.existsSync(VIDEOS_DIR)) {
    fs.mkdirSync(VIDEOS_DIR, { recursive: true });
}

/**
 * Get quality settings for FFmpeg
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
 */
async function startStream(stream) {
    return new Promise((resolve, reject) => {
        const { id, videoFile, rtmpUrl, streamKey, quality } = stream;
        const videoPath = path.join(VIDEOS_DIR, videoFile);

        // Check if video file exists
        if (!fs.existsSync(videoPath)) {
            return reject(new Error(`Video file not found: ${videoFile}`));
        }

        const qualitySettings = getQualitySettings(quality);
        const rtmpFullUrl = `${rtmpUrl}/${streamKey}`;

        // FFmpeg arguments for 24/7 loop streaming
        const args = [
            '-re',                              // Read input at native frame rate
            '-stream_loop', '-1',               // Infinite loop
            '-i', videoPath,                    // Input file
            '-c:v', 'libx264',                  // Video codec
            '-preset', 'veryfast',              // Encoding preset (balance speed/quality)
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

        console.log(`Starting stream ${id}: ffmpeg ${args.join(' ')}`);

        const ffmpeg = spawn('ffmpeg', args);

        // Initialize logs array
        streamLogs.set(id, []);

        ffmpeg.stdout.on('data', (data) => {
            const log = data.toString();
            addLog(id, log);
        });

        ffmpeg.stderr.on('data', (data) => {
            const log = data.toString();
            addLog(id, log);
            // FFmpeg outputs progress to stderr
            if (log.includes('frame=')) {
                console.log(`Stream ${id}: ${log.trim()}`);
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
        });

        // Store process reference
        runningStreams.set(id, ffmpeg);

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
    const ffmpeg = runningStreams.get(streamId);
    if (ffmpeg) {
        console.log(`Stopping stream ${streamId}`);
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

module.exports = {
    startStream,
    stopStream,
    isStreamRunning,
    getStreamLogs,
    getRunningStreamIds
};
