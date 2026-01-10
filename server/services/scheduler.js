const fs = require('fs');
const path = require('path');
const ffmpegService = require('./ffmpeg');

// Data file path
const SCHEDULES_FILE = path.join(__dirname, '../data/schedules.json');
const STREAMS_FILE = path.join(__dirname, '../data/streams.json');

// Scheduler check interval (every minute)
const CHECK_INTERVAL = 60000;

// Day mapping
const DAY_MAP = {
    0: 'sun',
    1: 'mon',
    2: 'tue',
    3: 'wed',
    4: 'thu',
    5: 'fri',
    6: 'sat'
};

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
 * Load streams from file
 */
function loadStreams() {
    try {
        if (fs.existsSync(STREAMS_FILE)) {
            const data = fs.readFileSync(STREAMS_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading streams:', error);
    }
    return [];
}

/**
 * Get all schedules
 */
function getSchedules() {
    return loadSchedules();
}

/**
 * Get schedule by ID
 */
function getScheduleById(id) {
    const schedules = loadSchedules();
    return schedules.find(s => s.id === id);
}

/**
 * Create a new schedule
 */
function createSchedule(scheduleData) {
    const schedules = loadSchedules();
    const newSchedule = {
        id: Date.now(),
        title: scheduleData.title,
        streamId: scheduleData.streamId,
        scheduleType: scheduleData.scheduleType || 'recurring', // 'once' or 'recurring'
        specificDate: scheduleData.specificDate || null, // for 'once' type: YYYY-MM-DD
        days: scheduleData.days || [],
        startTime: scheduleData.startTime,
        endTime: scheduleData.endTime,
        videoFile: scheduleData.videoFile || null,
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
    return schedule;
}

/**
 * Check if current time matches schedule
 */
function isTimeInRange(startTime, endTime) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    // Handle overnight schedules (e.g., 22:00 - 06:00)
    if (endMinutes < startMinutes) {
        return currentMinutes >= startMinutes || currentMinutes < endMinutes;
    }

    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}

/**
 * Check if today matches specific date (for 'once' type schedules)
 */
function isDateMatch(specificDate) {
    if (!specificDate) return false;
    const today = new Date();
    const scheduleDate = new Date(specificDate);
    return today.getFullYear() === scheduleDate.getFullYear() &&
        today.getMonth() === scheduleDate.getMonth() &&
        today.getDate() === scheduleDate.getDate();
}

/**
 * Check if current day matches schedule (for 'recurring' type)
 */
function isDayMatch(days) {
    if (!days || days.length === 0) return false;
    const today = DAY_MAP[new Date().getDay()];
    return days.includes(today);
}

/**
 * Check and execute schedules
 */
function checkSchedules() {
    const schedules = loadSchedules();
    const streams = loadStreams();

    for (const schedule of schedules) {
        if (!schedule.active) continue;
        if (!schedule.streamId) continue;

        const stream = streams.find(s => s.id === schedule.streamId);
        if (!stream) continue;

        const isRunning = ffmpegService.isStreamRunning(stream.id);
        const timeMatch = isTimeInRange(schedule.startTime, schedule.endTime);

        // Check date/day match based on schedule type
        let dateMatch = false;
        if (schedule.scheduleType === 'once') {
            // Specific date schedule
            dateMatch = isDateMatch(schedule.specificDate);
        } else {
            // Recurring (weekly) schedule - default behavior
            dateMatch = isDayMatch(schedule.days || []);
        }

        if (dateMatch && timeMatch) {
            // Should be running
            if (!isRunning) {
                console.log(`⏰ Schedule: Starting stream "${stream.title}" (schedule: ${schedule.title})`);
                ffmpegService.startStream(stream)
                    .then(() => {
                        console.log(`✅ Schedule: Stream "${stream.title}" started successfully`);
                        // Update last run
                        schedule.lastRun = new Date().toISOString();
                        saveSchedules(schedules);
                    })
                    .catch(err => {
                        console.error(`❌ Schedule: Failed to start stream:`, err.message);
                    });
            }
        } else {
            // Should be stopped (only if this schedule started it)
            // Note: we don't auto-stop manual streams
            if (isRunning && schedule.lastRun) {
                // Check if this schedule was the one that started the stream
                const lastRunTime = new Date(schedule.lastRun).getTime();
                const hoursSinceRun = (Date.now() - lastRunTime) / (1000 * 60 * 60);

                // Only auto-stop if schedule started within last 24 hours
                if (hoursSinceRun < 24) {
                    console.log(`⏰ Schedule: Stopping stream "${stream.title}" (outside schedule: ${schedule.title})`);
                    ffmpegService.stopStream(stream.id);
                    console.log(`✅ Schedule: Stream "${stream.title}" stopped`);
                }
            }
        }
    }
}

/**
 * Start the scheduler service
 */
function startScheduler() {
    console.log('📅 Starting stream scheduler service...');

    // Initial check
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
    checkSchedules
};
