const express = require('express');
const schedulerService = require('../services/scheduler');

const router = express.Router();

/**
 * GET /api/schedules - Get all schedules
 */
router.get('/', (req, res) => {
    try {
        const schedules = schedulerService.getSchedules();
        res.json(schedules);
    } catch (error) {
        console.error('Error getting schedules:', error);
        res.status(500).json({ error: 'Failed to get schedules' });
    }
});

/**
 * GET /api/schedules/:id - Get schedule by ID
 */
router.get('/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const schedule = schedulerService.getScheduleById(id);

        if (!schedule) {
            return res.status(404).json({ error: 'Schedule not found' });
        }

        res.json(schedule);
    } catch (error) {
        console.error('Error getting schedule:', error);
        res.status(500).json({ error: 'Failed to get schedule' });
    }
});

/**
 * POST /api/schedules - Create a new schedule with direct stream key
 */
router.post('/', (req, res) => {
    try {
        const { title, platform, rtmpUrl, streamKey, videoFile, quality, startDateTime, endDateTime } = req.body;

        if (!title || !streamKey || !videoFile || !startDateTime || !endDateTime) {
            return res.status(400).json({ error: 'Missing required fields: title, streamKey, videoFile, startDateTime, endDateTime' });
        }

        const schedule = schedulerService.createSchedule({
            title,
            platform: platform || 'youtube',
            rtmpUrl: rtmpUrl || 'rtmp://a.rtmp.youtube.com/live2',
            streamKey,
            videoFile,
            quality: quality || '1080p',
            startDateTime,
            endDateTime
        });

        console.log(`Schedule created: ${schedule.title}`);
        res.status(201).json(schedule);
    } catch (error) {
        console.error('Error creating schedule:', error);
        res.status(500).json({ error: 'Failed to create schedule' });
    }
});

/**
 * PUT /api/schedules/:id - Update a schedule
 */
router.put('/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const updates = req.body;

        const schedule = schedulerService.updateSchedule(id, updates);

        if (!schedule) {
            return res.status(404).json({ error: 'Schedule not found' });
        }

        console.log(`Schedule updated: ${schedule.title}`);
        res.json(schedule);
    } catch (error) {
        console.error('Error updating schedule:', error);
        res.status(500).json({ error: 'Failed to update schedule' });
    }
});

/**
 * DELETE /api/schedules/:id - Delete a schedule
 */
router.delete('/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const deleted = schedulerService.deleteSchedule(id);

        if (!deleted) {
            return res.status(404).json({ error: 'Schedule not found' });
        }

        console.log(`Schedule deleted: ${id}`);
        res.json({ success: true, message: 'Schedule deleted' });
    } catch (error) {
        console.error('Error deleting schedule:', error);
        res.status(500).json({ error: 'Failed to delete schedule' });
    }
});

/**
 * POST /api/schedules/:id/toggle - Toggle schedule active state
 */
router.post('/:id/toggle', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const schedule = schedulerService.toggleSchedule(id);

        if (!schedule) {
            return res.status(404).json({ error: 'Schedule not found' });
        }

        console.log(`Schedule toggled: ${schedule.title} -> ${schedule.active ? 'active' : 'inactive'}`);
        res.json(schedule);
    } catch (error) {
        console.error('Error toggling schedule:', error);
        res.status(500).json({ error: 'Failed to toggle schedule' });
    }
});

/**
 * POST /api/schedules/:id/start - Manually start streaming for a schedule
 */
router.post('/:id/start', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const result = await schedulerService.startScheduleStream(id);

        if (!result.success) {
            return res.status(400).json({ error: result.error });
        }

        res.json({ success: true, message: `Stream started for schedule: ${result.schedule.title}` });
    } catch (error) {
        console.error('Error starting schedule stream:', error);
        res.status(500).json({ error: 'Failed to start stream' });
    }
});

/**
 * POST /api/schedules/:id/stop - Manually stop streaming for a schedule
 */
router.post('/:id/stop', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const result = await schedulerService.stopScheduleStream(id);

        if (!result.success) {
            return res.status(400).json({ error: result.error });
        }

        res.json({ success: true, message: `Stream stopped for schedule: ${result.schedule.title}` });
    } catch (error) {
        console.error('Error stopping schedule stream:', error);
        res.status(500).json({ error: 'Failed to stop stream' });
    }
});

module.exports = router;
