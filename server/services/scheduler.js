const fs = require('fs');
const path = require('path');
const ffmpegService = require('./ffmpeg');

// Data file path
const SCHEDULES_FILE = path.join(__dirname, '../data/schedules.json');

// Scheduler check interval (every minute)
const CHECK_INTERVAL = 60000;

// Track running schedule streams
const runningScheduleStreams = new Map();

/**
 * Load schedules from file
 */
function loadSchedules() {
    try {
        if (fs.existsSync(SCHEDULES_FILE)) {
            const data = fs.readFileSync(SCHEDULES_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading schedules:', error);
    }
    return [];
}

/**
 * Save schedules to file
 */
function saveSchedules(schedules) {
    try {
        fs.writeFileSync(SCHEDULES_FILE, JSON.stringify(schedules, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving schedules:', error);
        return false;
    }
}

/**
 * Get all schedules with running status
 */
function getSchedules() {
    const schedules = loadSchedules();
    return schedules.map(s => ({
        ...s,
        isRunning: runningScheduleStreams.has(s.id)
    }));
}

/**
 * Get schedule by ID
 */
function getScheduleById(id) {
    const schedules = loadSchedules();
    const schedule = schedules.find(s => s.id === id);
    if (schedule) {
        schedule.isRunning = runningScheduleStreams.has(id);
    }
    return schedule;
}

/**
 * Create a new schedule with direct stream key
 */
function createSchedule(scheduleData) {
    const schedules = loadSchedules();
    const newSchedule = {
        id: Date.now(),
        title: scheduleData.title,
        platform: scheduleData.platform || 'youtube',
        rtmpUrl: scheduleData.rtmpUrl || 'rtmp://a.rtmp.youtube.com/live2',
        streamKey: scheduleData.streamKey,
        videoFile: scheduleData.videoFile,
        quality: scheduleData.quality || '1080p',
        startDateTime: scheduleData.startDateTime,
        endDateTime: scheduleData.endDateTime,
        active: true,
        createdAt: new Date().toISOString(),
        lastRun: null
    };
    schedules.push(newSchedule);
    saveSchedules(schedules);
    return newSchedule;
}

/**
 * Update a schedule
 */
function updateSchedule(id, updates) {
    const schedules = loadSchedules();
    const index = schedules.findIndex(s => s.id === id);
    if (index === -1) return null;

    schedules[index] = { ...schedules[index], ...updates };
    saveSchedules(schedules);
    return schedules[index];
}

/**
 * Delete a schedule
 */
function deleteSchedule(id) {
    // Stop if running
    if (runningScheduleStreams.has(id)) {
        stopScheduleStream(id);
    }

    const schedules = loadSchedules();
    const filtered = schedules.filter(s => s.id !== id);
    if (filtered.length === schedules.length) return false;
    saveSchedules(filtered);
    return true;
}

/**
 * Toggle schedule active state
 */
function toggleSchedule(id) {
    const schedules = loadSchedules();
    const schedule = schedules.find(s => s.id === id);
    if (!schedule) return null;

    schedule.active = !schedule.active;
    saveSchedules(schedules);
    return { ...schedule, isRunning: runningScheduleStreams.has(id) };
}

/**
 * Manually start streaming for a schedule
 */
async function startScheduleStream(id) {
    const schedule = getScheduleById(id);
    if (!schedule) {
        return { success: false, error: 'Schedule not found' };
    }

    if (runningScheduleStreams.has(id)) {
        return { success: false, error: 'Stream is already running' };
    }

    // Create stream config from schedule
    const streamConfig = {
        id: schedule.id,
        title: schedule.title,
        rtmpUrl: schedule.rtmpUrl,
        streamKey: schedule.streamKey,
        videoFile: schedule.videoFile,
        quality: schedule.quality
    };

    try {
        await ffmpegService.startStream(streamConfig);
        runningScheduleStreams.set(id, true);

        // Update last run
        const schedules = loadSchedules();
        const scheduleIndex = schedules.findIndex(s => s.id === id);
        if (scheduleIndex !== -1) {
            schedules[scheduleIndex].lastRun = new Date().toISOString();
            saveSchedules(schedules);
        }

        console.log(`✅ Manual start: Schedule "${schedule.title}" stream started`);
        return { success: true, schedule };
    } catch (error) {
        console.error(`❌ Failed to start schedule stream:`, error);
        return { success: false, error: error.message };
    }
}

/**
 * Manually stop streaming for a schedule
 */
async function stopScheduleStream(id) {
    const schedule = getScheduleById(id);
    if (!schedule) {
        return { success: false, error: 'Schedule not found' };
    }

    if (!runningScheduleStreams.has(id)) {
        return { success: false, error: 'Stream is not running' };
    }

    try {
        ffmpegService.stopStream(id);
        runningScheduleStreams.delete(id);
        console.log(`✅ Manual stop: Schedule "${schedule.title}" stream stopped`);
        return { success: true, schedule };
    } catch (error) {
        console.error(`❌ Failed to stop schedule stream:`, error);
        return { success: false, error: error.message };
    }
}

/**
 * Check if current time is within schedule datetime range
 */
function isWithinScheduleTime(startDateTime, endDateTime) {
    const now = new Date();
    const start = new Date(startDateTime);
    const end = new Date(endDateTime);
    return now >= start && now < end;
}

/**
 * Check and execute schedules based on datetime
 */
function checkSchedules() {
    const schedules = loadSchedules();
    const now = new Date();

    for (const schedule of schedules) {
        if (!schedule.active) continue;
        if (!schedule.startDateTime || !schedule.endDateTime) continue;

        const isRunning = runningScheduleStreams.has(schedule.id);
        const shouldRun = isWithinScheduleTime(schedule.startDateTime, schedule.endDateTime);
        const endTime = new Date(schedule.endDateTime);

        if (shouldRun && !isRunning) {
            // Should be running - start stream
            console.log(`⏰ Auto-start: Schedule "${schedule.title}" starting...`);
            startScheduleStream(schedule.id);
        } else if (!shouldRun && isRunning) {
            // Past end time - stop stream
            console.log(`⏰ Auto-stop: Schedule "${schedule.title}" ending...`);
            stopScheduleStream(schedule.id);
        } else if (now > endTime && !isRunning) {
            // Past end time and not running - deactivate one-time schedules
            // Keep active for recurring or manual restart later
        }
    }
}

/**
 * Start the scheduler service
 */
function startScheduler() {
    console.log('📅 Starting stream scheduler service...');

    // Initial check after 5 seconds
    setTimeout(() => {
        checkSchedules();
    }, 5000);

    // Periodic checks
    setInterval(() => {
        checkSchedules();
    }, CHECK_INTERVAL);

    console.log(`📅 Scheduler running, checking every ${CHECK_INTERVAL / 1000}s`);
}

// Start scheduler on module load
startScheduler();

module.exports = {
    getSchedules,
    getScheduleById,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    toggleSchedule,
    startScheduleStream,
    stopScheduleStream,
    checkSchedules
};
