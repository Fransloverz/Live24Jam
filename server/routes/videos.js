const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const https = require('https');
const http = require('http');
const { spawn, exec } = require('child_process');

const router = express.Router();

// Active downloads tracking for progress
const activeDownloads = new Map();

// Video directory
const VIDEOS_DIR = process.env.VIDEOS_DIR || path.join(__dirname, '../../videos');

// Supported video extensions
const VIDEO_EXTENSIONS = ['.mp4', '.mkv', '.avi', '.mov', '.webm', '.flv', '.wmv', '.m4v'];

// Ensure videos directory exists
if (!fs.existsSync(VIDEOS_DIR)) {
    fs.mkdirSync(VIDEOS_DIR, { recursive: true });
}

// Multer configuration for video uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, VIDEOS_DIR);
    },
    filename: (req, file, cb) => {
        // Sanitize filename
        const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        const uniqueName = `${Date.now()}_${sanitizedName}`;
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (VIDEO_EXTENSIONS.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error(`Format file tidak didukung. Gunakan: ${VIDEO_EXTENSIONS.join(', ')}`), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 1024 * 1024 // 1TB - practically unlimited
    }
});

/**
 * GET /api/videos - Get list of available videos
 */
router.get('/', (req, res) => {
    try {
        // Ensure directory exists
        if (!fs.existsSync(VIDEOS_DIR)) {
            fs.mkdirSync(VIDEOS_DIR, { recursive: true });
            return res.json([]);
        }

        const files = fs.readdirSync(VIDEOS_DIR);
        const videos = files
            .filter(file => {
                const ext = path.extname(file).toLowerCase();
                return VIDEO_EXTENSIONS.includes(ext);
            })
            .map(file => {
                const filePath = path.join(VIDEOS_DIR, file);
                const stats = fs.statSync(filePath);
                return {
                    name: file,
                    size: stats.size,
                    sizeFormatted: formatFileSize(stats.size),
                    modified: stats.mtime,
                    extension: path.extname(file).toLowerCase().replace('.', '')
                };
            })
            .sort((a, b) => b.modified - a.modified); // Sort by newest first

        res.json(videos);
    } catch (error) {
        console.error('Error listing videos:', error);
        res.status(500).json({ error: 'Failed to list videos' });
    }
});

/**
 * POST /api/videos/upload - Upload a video file
 */
router.post('/upload', upload.single('video'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const fileInfo = {
            name: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size,
            sizeFormatted: formatFileSize(req.file.size),
            path: req.file.path,
            mimetype: req.file.mimetype
        };

        console.log(`Video uploaded: ${fileInfo.name} (${fileInfo.sizeFormatted})`);
        res.json({
            success: true,
            message: 'Video berhasil diupload!',
            file: fileInfo
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
});

/**
 * DELETE /api/videos/:filename - Delete a video file
 */
router.delete('/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(VIDEOS_DIR, filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found' });
        }

        fs.unlinkSync(filePath);
        console.log(`Video deleted: ${filename}`);
        res.json({ success: true, message: 'Video berhasil dihapus' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Delete failed' });
    }
});

/**
 * PATCH /api/videos/:filename - Rename a video file
 */
router.patch('/:filename', (req, res) => {
    try {
        const oldFilename = req.params.filename;
        const { newFilename } = req.body;

        if (!newFilename) {
            return res.status(400).json({ error: 'Nama file baru tidak boleh kosong' });
        }

        const oldPath = path.join(VIDEOS_DIR, oldFilename);

        // Preserve extension from old file if not provided in new name
        const oldExt = path.extname(oldFilename).toLowerCase();
        const newExt = path.extname(newFilename).toLowerCase();
        const finalFilename = newExt ? newFilename : `${newFilename}${oldExt}`;

        // Sanitize filename
        const sanitizedFilename = finalFilename.replace(/[^a-zA-Z0-9._-]/g, '_');
        const newPath = path.join(VIDEOS_DIR, sanitizedFilename);

        if (!fs.existsSync(oldPath)) {
            return res.status(404).json({ error: 'File tidak ditemukan' });
        }

        if (fs.existsSync(newPath) && oldPath !== newPath) {
            return res.status(400).json({ error: 'File dengan nama tersebut sudah ada' });
        }

        fs.renameSync(oldPath, newPath);
        console.log(`Video renamed: ${oldFilename} -> ${sanitizedFilename}`);

        res.json({
            success: true,
            message: 'Video berhasil di-rename',
            oldFilename: oldFilename,
            newFilename: sanitizedFilename
        });
    } catch (error) {
        console.error('Rename error:', error);
        res.status(500).json({ error: 'Gagal rename video' });
    }
});

/**
 * GET /api/videos/info/:filename - Get video metadata using ffprobe
 */
router.get('/info/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(VIDEOS_DIR, filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File tidak ditemukan' });
    }

    // Use ffprobe to get video information
    const ffprobeArgs = [
        '-v', 'quiet',
        '-print_format', 'json',
        '-show_format',
        '-show_streams',
        filePath
    ];

    const ffprobe = spawn('ffprobe', ffprobeArgs);
    let output = '';
    let errorOutput = '';

    ffprobe.stdout.on('data', (data) => {
        output += data.toString();
    });

    ffprobe.stderr.on('data', (data) => {
        errorOutput += data.toString();
    });

    ffprobe.on('close', (code) => {
        if (code !== 0) {
            console.error('ffprobe error:', errorOutput);
            return res.status(500).json({
                error: 'Gagal mendapatkan info video',
                details: errorOutput
            });
        }

        try {
            const probeData = JSON.parse(output);

            // Find video stream
            const videoStream = probeData.streams?.find(s => s.codec_type === 'video');
            const audioStream = probeData.streams?.find(s => s.codec_type === 'audio');
            const format = probeData.format;

            // Calculate bitrate
            const bitrate = format?.bit_rate ? parseInt(format.bit_rate) : null;
            const videoBitrate = videoStream?.bit_rate ? parseInt(videoStream.bit_rate) : null;
            const audioBitrate = audioStream?.bit_rate ? parseInt(audioStream.bit_rate) : null;

            const videoInfo = {
                filename: filename,
                duration: format?.duration ? parseFloat(format.duration) : null,
                durationFormatted: format?.duration ? formatDuration(parseFloat(format.duration)) : null,
                size: format?.size ? parseInt(format.size) : null,
                sizeFormatted: format?.size ? formatFileSize(parseInt(format.size)) : null,
                bitrate: bitrate,
                bitrateFormatted: bitrate ? formatBitrate(bitrate) : null,
                video: videoStream ? {
                    codec: videoStream.codec_name,
                    codecLong: videoStream.codec_long_name,
                    width: videoStream.width,
                    height: videoStream.height,
                    resolution: `${videoStream.width}x${videoStream.height}`,
                    fps: videoStream.r_frame_rate ? eval(videoStream.r_frame_rate).toFixed(2) : null,
                    bitrate: videoBitrate,
                    bitrateFormatted: videoBitrate ? formatBitrate(videoBitrate) : null
                } : null,
                audio: audioStream ? {
                    codec: audioStream.codec_name,
                    codecLong: audioStream.codec_long_name,
                    sampleRate: audioStream.sample_rate,
                    channels: audioStream.channels,
                    bitrate: audioBitrate,
                    bitrateFormatted: audioBitrate ? formatBitrate(audioBitrate) : null
                } : null
            };

            res.json(videoInfo);
        } catch (parseError) {
            console.error('Error parsing ffprobe output:', parseError);
            res.status(500).json({ error: 'Gagal memproses info video' });
        }
    });

    ffprobe.on('error', (err) => {
        console.error('ffprobe spawn error:', err);
        res.status(500).json({
            error: 'ffprobe tidak tersedia. Pastikan FFmpeg terinstall.',
            details: err.message
        });
    });
});

/**
 * Format duration to human readable
 */
function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format bitrate to human readable
 */
function formatBitrate(bps) {
    if (bps >= 1000000) {
        return `${(bps / 1000000).toFixed(2)} Mbps`;
    } else if (bps >= 1000) {
        return `${(bps / 1000).toFixed(0)} Kbps`;
    }
    return `${bps} bps`;
}

/**
 * GET /api/videos/path - Get videos directory path
 */
router.get('/path', (req, res) => {
    res.json({ path: VIDEOS_DIR });
});

/**
 * GET /api/videos/stream/:filename - Stream video file with range support
 */
router.get('/stream/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(VIDEOS_DIR, filename);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Video not found' });
        }

        const stat = fs.statSync(filePath);
        const fileSize = stat.size;
        const range = req.headers.range;

        // Determine content type based on extension
        const ext = path.extname(filename).toLowerCase();
        const mimeTypes = {
            '.mp4': 'video/mp4',
            '.webm': 'video/webm',
            '.mkv': 'video/x-matroska',
            '.avi': 'video/x-msvideo',
            '.mov': 'video/quicktime',
            '.flv': 'video/x-flv',
            '.wmv': 'video/x-ms-wmv',
            '.m4v': 'video/x-m4v'
        };
        const contentType = mimeTypes[ext] || 'video/mp4';

        if (range) {
            // Handle range request for video seeking
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunkSize = (end - start) + 1;

            const file = fs.createReadStream(filePath, { start, end });

            res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunkSize,
                'Content-Type': contentType,
            });

            file.pipe(res);
        } else {
            // No range, send entire file
            res.writeHead(200, {
                'Content-Length': fileSize,
                'Content-Type': contentType,
            });

            fs.createReadStream(filePath).pipe(res);
        }
    } catch (error) {
        console.error('Stream error:', error);
        res.status(500).json({ error: 'Failed to stream video' });
    }
});

/**
 * Format file size to human readable
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Parse Google Drive URL to get file ID
 */
function parseGoogleDriveUrl(url) {
    if (!url) return null;

    // Pattern 1: https://drive.google.com/file/d/{FILE_ID}/view
    let match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match) return match[1];

    // Pattern 2: https://drive.google.com/open?id={FILE_ID}
    match = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (match) return match[1];

    // Pattern 3: https://drive.google.com/uc?id={FILE_ID}
    match = url.match(/\/uc\?.*id=([a-zA-Z0-9_-]+)/);
    if (match) return match[1];

    // Pattern 4: just the file ID
    if (/^[a-zA-Z0-9_-]{25,}$/.test(url)) return url;

    return null;
}

/**
 * Download file from URL with redirects and cookies support for Google Drive
 */
function downloadFile(url, destPath, onProgress, options = {}) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        const cookies = options.cookies || '';

        const urlObj = new URL(url);
        const requestOptions = {
            hostname: urlObj.hostname,
            path: urlObj.pathname + urlObj.search,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            }
        };

        if (cookies) {
            requestOptions.headers['Cookie'] = cookies;
        }

        const request = protocol.get(requestOptions, (response) => {
            // Collect cookies from response
            const setCookies = response.headers['set-cookie'] || [];
            let newCookies = setCookies.map(c => c.split(';')[0]).join('; ');
            if (cookies && newCookies) {
                newCookies = cookies + '; ' + newCookies;
            } else if (cookies) {
                newCookies = cookies;
            }

            // Handle redirects
            if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 303 || response.statusCode === 307) {
                const redirectUrl = response.headers.location;
                if (redirectUrl) {
                    const fullRedirectUrl = redirectUrl.startsWith('http') ? redirectUrl : `https://${urlObj.hostname}${redirectUrl}`;
                    return downloadFile(fullRedirectUrl, destPath, onProgress, { cookies: newCookies })
                        .then(resolve)
                        .catch(reject);
                }
            }

            // Check if this is Google Drive's virus scan warning page
            const contentType = response.headers['content-type'] || '';
            if (contentType.includes('text/html') && url.includes('drive.google.com')) {
                // This is likely the confirmation page, extract the confirm token
                let htmlData = '';
                response.on('data', chunk => { htmlData += chunk.toString(); });
                response.on('end', () => {
                    // Look for confirmation URL in the HTML
                    const confirmMatch = htmlData.match(/confirm=([a-zA-Z0-9_-]+)/);
                    const uuidMatch = htmlData.match(/uuid=([a-zA-Z0-9_-]+)/);

                    if (confirmMatch) {
                        // Extract file ID and build new URL with confirmation
                        const fileIdMatch = url.match(/id=([a-zA-Z0-9_-]+)/);
                        if (fileIdMatch) {
                            const confirmUrl = `https://drive.google.com/uc?export=download&id=${fileIdMatch[1]}&confirm=${confirmMatch[1]}`;
                            return downloadFile(confirmUrl, destPath, onProgress, { cookies: newCookies })
                                .then(resolve)
                                .catch(reject);
                        }
                    }

                    // Alternative: look for the download form action
                    const formMatch = htmlData.match(/action="(https:\/\/[^"]+download[^"]+)"/);
                    if (formMatch) {
                        return downloadFile(formMatch[1].replace(/&amp;/g, '&'), destPath, onProgress, { cookies: newCookies })
                            .then(resolve)
                            .catch(reject);
                    }

                    // If we still get HTML and can't find confirmation, try with confirm=t
                    const fileIdMatch = url.match(/id=([a-zA-Z0-9_-]+)/);
                    if (fileIdMatch && !url.includes('confirm=t')) {
                        const retryUrl = `https://drive.google.com/uc?export=download&id=${fileIdMatch[1]}&confirm=t`;
                        return downloadFile(retryUrl, destPath, onProgress, { cookies: newCookies })
                            .then(resolve)
                            .catch(reject);
                    }

                    reject(new Error('Could not get download link from Google Drive. Make sure the file is shared publicly.'));
                });
                return;
            }

            if (response.statusCode !== 200) {
                reject(new Error(`Download failed with status: ${response.statusCode}`));
                return;
            }

            const contentLength = parseInt(response.headers['content-length'], 10) || 0;
            let downloadedBytes = 0;

            const fileStream = fs.createWriteStream(destPath);

            response.on('data', (chunk) => {
                downloadedBytes += chunk.length;
                if (contentLength > 0 && onProgress) {
                    const progress = (downloadedBytes / contentLength) * 100;
                    onProgress(progress, downloadedBytes, contentLength);
                }
            });

            response.pipe(fileStream);

            fileStream.on('finish', () => {
                fileStream.close();

                // Verify we didn't download an HTML error page
                const stats = fs.statSync(destPath);
                if (stats.size < 1000) {
                    const content = fs.readFileSync(destPath, 'utf8');
                    if (content.includes('<!DOCTYPE html>') || content.includes('<html')) {
                        fs.unlinkSync(destPath);
                        reject(new Error('Downloaded file appears to be an error page. Check if the file is shared publicly.'));
                        return;
                    }
                }

                resolve({
                    size: downloadedBytes,
                    path: destPath
                });
            });

            fileStream.on('error', (err) => {
                fs.unlink(destPath, () => { }); // Delete incomplete file
                reject(err);
            });
        });

        request.on('error', (err) => {
            reject(err);
        });

        // Increase timeout for large files
        request.setTimeout(300000, () => { // 5 minutes timeout
            request.destroy();
            reject(new Error('Download timeout - file may be too large or connection is slow'));
        });
    });
}

/**
 * Download from Google Drive using gdown (Python tool)
 * gdown is more reliable for large files and handles Google's confirmation pages
 */
function downloadWithGdown(fileId, destPath) {
    return new Promise((resolve, reject) => {
        const gdriveUrl = `https://drive.google.com/uc?id=${fileId}`;

        console.log(`Using gdown to download: ${gdriveUrl}`);
        console.log(`Destination: ${destPath}`);

        // Use gdown command
        const gdown = spawn('gdown', [
            gdriveUrl,
            '-O', destPath,
            '--fuzzy',  // Allow fuzzy matching for file ID
            '--continue' // Resume download if interrupted
        ], {
            stdio: ['pipe', 'pipe', 'pipe']
        });

        let stdoutData = '';
        let stderrData = '';

        gdown.stdout.on('data', (data) => {
            stdoutData += data.toString();
            console.log(`gdown: ${data.toString()}`);
        });

        gdown.stderr.on('data', (data) => {
            stderrData += data.toString();
            console.log(`gdown stderr: ${data.toString()}`);
        });

        gdown.on('close', (code) => {
            if (code === 0) {
                // Check if file exists and get size
                if (fs.existsSync(destPath)) {
                    const stats = fs.statSync(destPath);
                    resolve({
                        size: stats.size,
                        path: destPath
                    });
                } else {
                    reject(new Error('File was not downloaded'));
                }
            } else {
                reject(new Error(`gdown failed with code ${code}: ${stderrData}`));
            }
        });

        gdown.on('error', (err) => {
            // If gdown is not installed, fall back to HTTP download
            if (err.code === 'ENOENT') {
                console.log('gdown not found, falling back to HTTP download...');
                reject(new Error('GDOWN_NOT_INSTALLED'));
            } else {
                reject(err);
            }
        });
    });
}

/**
 * POST /api/videos/download-gdrive - Download video from Google Drive URL
 * Uses gdown for reliable large file downloads
 */
router.post('/download-gdrive', async (req, res) => {
    try {
        const { url, filename } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL tidak boleh kosong' });
        }

        // Parse Google Drive URL
        const fileId = parseGoogleDriveUrl(url);

        if (!fileId) {
            return res.status(400).json({
                error: 'URL Google Drive tidak valid. Pastikan file sudah di-share sebagai "Anyone with the link"'
            });
        }

        // Generate filename
        const timestamp = Date.now();
        const safeFilename = filename
            ? filename.replace(/[^a-zA-Z0-9._-]/g, '_')
            : `gdrive_${fileId}_${timestamp}.mp4`;
        const destPath = path.join(VIDEOS_DIR, safeFilename);

        // Create download ID for tracking
        const downloadId = `${fileId}_${timestamp}`;
        activeDownloads.set(downloadId, {
            progress: 0,
            status: 'downloading',
            filename: safeFilename
        });

        console.log(`Starting Google Drive download with gdown: ${fileId} -> ${safeFilename}`);

        let result;

        try {
            // Use gdown only (more reliable for large files)
            result = await downloadWithGdown(fileId, destPath);
        } catch (gdownError) {
            if (gdownError.message === 'GDOWN_NOT_INSTALLED') {
                // gdown is required, show installation instructions
                activeDownloads.delete(downloadId);
                return res.status(500).json({
                    error: 'gdown belum terinstall di server. Jalankan: pip install gdown',
                    instructions: 'SSH ke VPS dan jalankan: pip3 install gdown'
                });
            } else {
                throw gdownError;
            }
        }

        // Download complete
        activeDownloads.set(downloadId, {
            progress: 100,
            status: 'complete',
            filename: safeFilename
        });

        // Clean up tracking after 1 minute
        setTimeout(() => activeDownloads.delete(downloadId), 60000);

        console.log(`Google Drive download complete: ${safeFilename} (${formatFileSize(result.size)})`);

        res.json({
            success: true,
            message: 'Video berhasil didownload dari Google Drive!',
            file: {
                name: safeFilename,
                size: result.size,
                sizeFormatted: formatFileSize(result.size),
                path: destPath,
                downloadId
            }
        });

    } catch (error) {
        console.error('Google Drive download error:', error);
        res.status(500).json({
            error: `Gagal download dari Google Drive: ${error.message}. Pastikan file sudah di-share sebagai public.`
        });
    }
});

/**
 * GET /api/videos/download-progress/:downloadId - Get download progress
 */
router.get('/download-progress/:downloadId', (req, res) => {
    const { downloadId } = req.params;
    const progress = activeDownloads.get(downloadId);

    if (!progress) {
        return res.status(404).json({ error: 'Download not found' });
    }

    res.json(progress);
});

/**
 * POST /api/videos/download-url - Download video from any direct URL
 */
router.post('/download-url', async (req, res) => {
    try {
        const { url, filename } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL tidak boleh kosong' });
        }

        // Validate URL
        try {
            new URL(url);
        } catch {
            return res.status(400).json({ error: 'URL tidak valid' });
        }

        // Generate filename
        const timestamp = Date.now();
        const urlPath = new URL(url).pathname;
        const urlFilename = path.basename(urlPath) || `video_${timestamp}.mp4`;
        const safeFilename = filename
            ? filename.replace(/[^a-zA-Z0-9._-]/g, '_')
            : `${timestamp}_${urlFilename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const destPath = path.join(VIDEOS_DIR, safeFilename);

        const downloadId = `url_${timestamp}`;
        activeDownloads.set(downloadId, {
            progress: 0,
            status: 'downloading',
            filename: safeFilename
        });

        console.log(`Starting URL download: ${url} -> ${safeFilename}`);

        const result = await downloadFile(url, destPath, (progress, downloaded, total) => {
            activeDownloads.set(downloadId, {
                progress: Math.round(progress),
                status: 'downloading',
                filename: safeFilename,
                downloaded: formatFileSize(downloaded),
                total: formatFileSize(total)
            });
        });

        activeDownloads.set(downloadId, {
            progress: 100,
            status: 'complete',
            filename: safeFilename
        });

        setTimeout(() => activeDownloads.delete(downloadId), 60000);

        console.log(`URL download complete: ${safeFilename} (${formatFileSize(result.size)})`);

        res.json({
            success: true,
            message: 'Video berhasil didownload!',
            file: {
                name: safeFilename,
                size: result.size,
                sizeFormatted: formatFileSize(result.size),
                path: destPath,
                downloadId
            }
        });

    } catch (error) {
        console.error('URL download error:', error);
        res.status(500).json({ error: `Gagal download: ${error.message}` });
    }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File terlalu besar.' });
        }
        return res.status(400).json({ error: error.message });
    }
    if (error) {
        return res.status(400).json({ error: error.message });
    }
    next();
});

module.exports = router;
