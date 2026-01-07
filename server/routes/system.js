const express = require('express');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const router = express.Router();

// Get system information
router.get('/', (req, res) => {
    try {
        const systemInfo = getSystemInfo();
        res.json(systemInfo);
    } catch (error) {
        console.error('Error getting system info:', error);
        res.status(500).json({ error: 'Failed to get system info' });
    }
});

function getSystemInfo() {
    // CPU Info
    const cpus = os.cpus();
    const cpuModel = cpus[0]?.model || 'Unknown';
    const cpuCores = cpus.length;
    const cpuSpeed = cpus[0]?.speed || 0; // MHz

    // CPU Usage
    const cpuUsage = getCpuUsage();

    // Memory Info
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsagePercent = Math.round((usedMemory / totalMemory) * 100);

    // Disk Info
    const diskInfo = getDiskInfo();

    // Network Info
    const networkInfo = getNetworkInfo();

    // System Info
    const platform = os.platform();
    const hostname = os.hostname();
    const uptime = os.uptime();
    const arch = os.arch();

    // Load Average (Linux/Mac only)
    const loadAvg = os.loadavg();

    return {
        cpu: {
            model: cpuModel,
            cores: cpuCores,
            speed: cpuSpeed,
            usage: cpuUsage,
            speedGHz: (cpuSpeed / 1000).toFixed(2)
        },
        memory: {
            total: totalMemory,
            free: freeMemory,
            used: usedMemory,
            usagePercent: memoryUsagePercent,
            totalGB: (totalMemory / (1024 * 1024 * 1024)).toFixed(2),
            usedGB: (usedMemory / (1024 * 1024 * 1024)).toFixed(2),
            freeGB: (freeMemory / (1024 * 1024 * 1024)).toFixed(2)
        },
        disk: diskInfo,
        network: networkInfo,
        system: {
            platform: platform,
            hostname: hostname,
            uptime: uptime,
            uptimeFormatted: formatUptime(uptime),
            arch: arch,
            loadAverage: loadAvg
        }
    };
}

function getCpuUsage() {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach(cpu => {
        for (const type in cpu.times) {
            totalTick += cpu.times[type];
        }
        totalIdle += cpu.times.idle;
    });

    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
    const usage = Math.round(((total - idle) / total) * 100);

    return usage;
}

function getDiskInfo() {
    try {
        const platform = os.platform();

        if (platform === 'win32') {
            // Windows
            const result = execSync('wmic logicaldisk get size,freespace,caption', { encoding: 'utf8' });
            const lines = result.trim().split('\n').slice(1);
            let totalSpace = 0;
            let freeSpace = 0;

            lines.forEach(line => {
                const parts = line.trim().split(/\s+/);
                if (parts.length >= 3 && parts[1] && parts[2]) {
                    freeSpace += parseInt(parts[1]) || 0;
                    totalSpace += parseInt(parts[2]) || 0;
                }
            });

            const usedSpace = totalSpace - freeSpace;
            const usagePercent = totalSpace > 0 ? Math.round((usedSpace / totalSpace) * 100) : 0;

            return {
                total: totalSpace,
                free: freeSpace,
                used: usedSpace,
                usagePercent: usagePercent,
                totalGB: (totalSpace / (1024 * 1024 * 1024)).toFixed(2),
                usedGB: (usedSpace / (1024 * 1024 * 1024)).toFixed(2),
                freeGB: (freeSpace / (1024 * 1024 * 1024)).toFixed(2)
            };
        } else {
            // Linux/Mac
            const result = execSync("df -k / | tail -1", { encoding: 'utf8' });
            const parts = result.trim().split(/\s+/);
            const totalSpace = parseInt(parts[1]) * 1024;
            const usedSpace = parseInt(parts[2]) * 1024;
            const freeSpace = parseInt(parts[3]) * 1024;
            const usagePercent = parseInt(parts[4]);

            return {
                total: totalSpace,
                free: freeSpace,
                used: usedSpace,
                usagePercent: usagePercent,
                totalGB: (totalSpace / (1024 * 1024 * 1024)).toFixed(2),
                usedGB: (usedSpace / (1024 * 1024 * 1024)).toFixed(2),
                freeGB: (freeSpace / (1024 * 1024 * 1024)).toFixed(2)
            };
        }
    } catch (error) {
        console.error('Error getting disk info:', error);
        return {
            total: 0,
            free: 0,
            used: 0,
            usagePercent: 0,
            totalGB: '0',
            usedGB: '0',
            freeGB: '0'
        };
    }
}

function getNetworkInfo() {
    const interfaces = os.networkInterfaces();
    const result = {
        interfaces: [],
        primaryIP: 'N/A'
    };

    for (const name in interfaces) {
        interfaces[name].forEach(iface => {
            if (!iface.internal && iface.family === 'IPv4') {
                result.interfaces.push({
                    name: name,
                    ip: iface.address,
                    mac: iface.mac
                });
                if (result.primaryIP === 'N/A') {
                    result.primaryIP = iface.address;
                }
            }
        });
    }

    return result;
}

function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);

    return parts.join(' ') || '< 1m';
}

module.exports = router;
