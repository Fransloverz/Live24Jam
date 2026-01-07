const express = require('express');
const router = express.Router();
const ffmpegService = require('../services/ffmpeg');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/streams.json');

// Helper: Read streams from file
function getStreams() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
            return [];
        }
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch (error) {
        console.error('Error reading streams:', error);
        return [];
    }
}

// Helper: Save streams to file
function saveStreams(streams) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(streams, null, 2));
}

// GET /api/streams - Get all streams
router.get('/', (req, res) => {
    const streams = getStreams();
    // Add process status for each stream
    const streamsWithStatus = streams.map(stream => ({
        ...stream,
        isRunning: ffmpegService.isStreamRunning(stream.id)
    }));
    res.json(streamsWithStatus);
});

// GET /api/streams/:id - Get single stream
router.get('/:id', (req, res) => {
    const streams = getStreams();
    const stream = streams.find(s => s.id === parseInt(req.params.id));
    if (!stream) {
        return res.status(404).json({ error: 'Stream not found' });
    }
    stream.isRunning = ffmpegService.isStreamRunning(stream.id);
    res.json(stream);
});

// POST /api/streams - Create new stream
router.post('/', (req, res) => {
    const { title, platform, rtmpUrl, streamKey, videoFile, quality } = req.body;

    if (!title || !rtmpUrl || !streamKey || !videoFile) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const streams = getStreams();
    const newStream = {
        id: Date.now(),
        title,
        platform: platform || 'youtube',
        rtmpUrl,
        streamKey,
        videoFile,
        quality: quality || '1080p',
        status: 'stopped',
        viewers: 0,
        createdAt: new Date().toISOString()
    };

    streams.push(newStream);
    saveStreams(streams);
    res.status(201).json(newStream);
});

// PUT /api/streams/:id - Update stream
router.put('/:id', (req, res) => {
    const streams = getStreams();
    const index = streams.findIndex(s => s.id === parseInt(req.params.id));

    if (index === -1) {
        return res.status(404).json({ error: 'Stream not found' });
    }

    // Don't allow update while streaming
    if (ffmpegService.isStreamRunning(streams[index].id)) {
        return res.status(400).json({ error: 'Cannot update while streaming. Stop the stream first.' });
    }

    streams[index] = { ...streams[index], ...req.body, id: streams[index].id };
    saveStreams(streams);
    res.json(streams[index]);
});

// DELETE /api/streams/:id - Delete stream
router.delete('/:id', (req, res) => {
    const streamId = parseInt(req.params.id);

    // Stop if running
    if (ffmpegService.isStreamRunning(streamId)) {
        ffmpegService.stopStream(streamId);
    }

    const streams = getStreams();
    const filtered = streams.filter(s => s.id !== streamId);

    if (filtered.length === streams.length) {
        return res.status(404).json({ error: 'Stream not found' });
    }

    saveStreams(filtered);
    res.json({ message: 'Stream deleted' });
});

// POST /api/streams/:id/start - Start streaming
router.post('/:id/start', async (req, res) => {
    const streams = getStreams();
    const stream = streams.find(s => s.id === parseInt(req.params.id));

    if (!stream) {
        return res.status(404).json({ error: 'Stream not found' });
    }

    if (ffmpegService.isStreamRunning(stream.id)) {
        return res.status(400).json({ error: 'Stream is already running' });
    }

    try {
        await ffmpegService.startStream(stream);

        // Update status in file
        const updatedStreams = streams.map(s =>
            s.id === stream.id ? { ...s, status: 'live' } : s
        );
        saveStreams(updatedStreams);

        res.json({ message: 'Stream started', streamId: stream.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/streams/:id/stop - Stop streaming
router.post('/:id/stop', (req, res) => {
    const streamId = parseInt(req.params.id);
    const streams = getStreams();
    const stream = streams.find(s => s.id === streamId);

    if (!stream) {
        return res.status(404).json({ error: 'Stream not found' });
    }

    if (!ffmpegService.isStreamRunning(streamId)) {
        return res.status(400).json({ error: 'Stream is not running' });
    }

    ffmpegService.stopStream(streamId);

    // Update status in file
    const updatedStreams = streams.map(s =>
        s.id === streamId ? { ...s, status: 'stopped' } : s
    );
    saveStreams(updatedStreams);

    res.json({ message: 'Stream stopped' });
});

// GET /api/streams/:id/status - Get stream status with logs
router.get('/:id/status', (req, res) => {
    const streamId = parseInt(req.params.id);
    const isRunning = ffmpegService.isStreamRunning(streamId);
    const logs = ffmpegService.getStreamLogs(streamId);
    const streamInfo = ffmpegService.getStreamInfo(streamId);

    res.json({
        streamId,
        isRunning,
        mode: streamInfo?.mode || null,
        uptime: streamInfo?.uptimeFormatted || null,
        startTime: streamInfo?.startTime || null,
        logs: logs.slice(-100) // Last 100 log lines
    });
});

module.exports = router;
