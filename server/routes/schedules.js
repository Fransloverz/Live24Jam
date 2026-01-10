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
 * POST /api/schedules - Create a new schedule
 */
router.post('/', (req, res) => {
    try {
        const { title, streamId, days, startTime, endTime } = req.body;

        if (!title || !streamId || !days || !startTime || !endTime) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (!Array.isArray(days) || days.length === 0) {
            return res.status(400).json({ error: 'At least one day must be selected' });
        }

        const schedule = schedulerService.createSchedule({
            title,
            streamId: parseInt(streamId),
            days,
            startTime,
            endTime
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

module.exports = router;
