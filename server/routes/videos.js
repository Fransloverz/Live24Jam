const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const router = express.Router();

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
        fileSize: 10 * 1024 * 1024 * 1024 // 10GB max
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
 * GET /api/videos/path - Get videos directory path
 */
router.get('/path', (req, res) => {
    res.json({ path: VIDEOS_DIR });
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

// Error handling middleware for multer
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File terlalu besar. Maksimal 10GB.' });
        }
        return res.status(400).json({ error: error.message });
    }
    if (error) {
        return res.status(400).json({ error: error.message });
    }
    next();
});

module.exports = router;
