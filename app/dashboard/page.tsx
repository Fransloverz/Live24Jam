"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface StreamData {
    id: number;
    title: string;
    isRunning: boolean;
    startedAt?: string;
    durationHours?: number;
}

interface SystemInfo {
    cpu: {
        model: string;
        cores: number;
        speed: number;
        usage: number;
        speedGHz: string;
    };
    memory: {
        total: number;
        free: number;
        used: number;
        usagePercent: number;
        totalGB: string;
        usedGB: string;
        freeGB: string;
    };
    disk: {
        total: number;
        free: number;
        used: number;
        usagePercent: number;
        totalGB: string;
        usedGB: string;
        freeGB: string;
    };
    network: {
        interfaces: Array<{ name: string; ip: string; mac: string }>;
        primaryIP: string;
    };
    system: {
        platform: string;
        hostname: string;
        uptime: number;
        uptimeFormatted: string;
        arch: string;
        loadAverage: number[];
    };
}

interface DashboardStats {
    totalStreams: number;
    liveNow: number;
    totalViews: number;
    totalLiveHours: number;
    liveStreams: StreamData[];
}

export default function DashboardPage() {
    const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
    const [systemLoading, setSystemLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats>({
        totalStreams: 0,
        liveNow: 0,
        totalViews: 0,
        totalLiveHours: 0,
        liveStreams: []
    });
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update time every second for real-time display
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Calculate live hours in real-time
    const calculateTotalLiveSeconds = () => {
        let totalSeconds = 0;
        stats.liveStreams.forEach(stream => {
            if (stream.isRunning && stream.startedAt) {
                const startTime = new Date(stream.startedAt);
                const now = currentTime;
                const diffSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
                totalSeconds += Math.max(0, diffSeconds);
            }
        });
        return totalSeconds;
    };

    const formatLiveTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m ${seconds}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        }
        return `${seconds}s`;
    };

    // Fetch streams data
    const fetchStats = async () => {
        try {
            const response = await fetch(`${API_URL}/api/streams`);
            if (response.ok) {
                const streams: StreamData[] = await response.json();
                const liveStreams = streams.filter(s => s.isRunning);

                setStats({
                    totalStreams: streams.length,
                    liveNow: liveStreams.length,
                    totalViews: 0, // Views not tracked currently
                    totalLiveHours: 0,
                    liveStreams: liveStreams
                });
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    // Fetch system info
    const fetchSystemInfo = async () => {
        try {
            const response = await fetch(`${API_URL}/api/system`);
            if (response.ok) {
                const data = await response.json();
                setSystemInfo(data);
            }
        } catch (error) {
            console.error("Error fetching system info:", error);
        } finally {
            setSystemLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        fetchSystemInfo();

        // Refresh every 5 seconds
        const interval = setInterval(() => {
            fetchStats();
            fetchSystemInfo();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const getUsageColor = (percent: number) => {
        if (percent >= 90) return "bg-red-500";
        if (percent >= 70) return "bg-yellow-500";
        return "bg-green-500";
    };

    const getUsageTextColor = (percent: number) => {
        if (percent >= 90) return "text-red-400";
        if (percent >= 70) return "text-yellow-400";
        return "text-green-400";
    };

    const totalLiveSeconds = calculateTotalLiveSeconds();

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
                    <p className="text-gray-400 mt-1">Selamat datang kembali! Ini ringkasan streaming kamu.</p>
                </div>
                <Link href="/dashboard/streams" className="btn-primary text-center">
                    + Mulai Streaming
                </Link>
            </div>

            {/* Real-time Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Streams */}
                <div className="card bg-gradient-to-br from-blue-600/20 to-blue-800/10 border-blue-500/30">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Total Streams</p>
                            <p className="text-3xl md:text-4xl font-bold mt-1">{stats.totalStreams}</p>
                        </div>
                        <span className="text-3xl">📺</span>
                    </div>
                    <p className="text-sm mt-2 text-blue-400">
                        Semua stream yang dibuat
                    </p>
                </div>

                {/* Live Now */}
                <div className={`card border-2 ${stats.liveNow > 0 ? 'bg-gradient-to-br from-red-600/30 to-red-800/20 border-red-500/50 animate-pulse-slow' : 'bg-gradient-to-br from-gray-600/20 to-gray-800/10 border-gray-500/30'}`}>
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Live Sekarang</p>
                            <p className="text-3xl md:text-4xl font-bold mt-1">{stats.liveNow}</p>
                        </div>
                        <span className="text-3xl">{stats.liveNow > 0 ? '🔴' : '⚪'}</span>
                    </div>
                    <p className={`text-sm mt-2 ${stats.liveNow > 0 ? 'text-red-400' : 'text-gray-500'}`}>
                        {stats.liveNow > 0 ? 'Sedang streaming...' : 'Tidak ada yang live'}
                    </p>
                </div>

                {/* Total Views */}
                <div className="card bg-gradient-to-br from-purple-600/20 to-purple-800/10 border-purple-500/30">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Total Views</p>
                            <p className="text-3xl md:text-4xl font-bold mt-1">-</p>
                        </div>
                        <span className="text-3xl">👁️</span>
                    </div>
                    <p className="text-sm mt-2 text-purple-400">
                        (Fitur coming soon)
                    </p>
                </div>

                {/* Live Time - Real-time */}
                <div className="card bg-gradient-to-br from-green-600/20 to-green-800/10 border-green-500/30">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Jam Live</p>
                            <p className="text-2xl md:text-3xl font-bold mt-1 font-mono">
                                {stats.liveNow > 0 ? formatLiveTime(totalLiveSeconds) : '0s'}
                            </p>
                        </div>
                        <span className="text-3xl">⏱️</span>
                    </div>
                    <p className="text-sm mt-2 text-green-400">
                        {stats.liveNow > 0 ? 'Real-time' : 'Tidak ada stream aktif'}
                    </p>
                </div>
            </div>

            {/* Live Streams Info */}
            {stats.liveNow > 0 && (
                <div className="card bg-gradient-to-r from-red-900/20 to-orange-900/20 border-red-500/30">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                        Stream Aktif ({stats.liveNow})
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {stats.liveStreams.map(stream => {
                            const startTime = stream.startedAt ? new Date(stream.startedAt) : null;
                            const streamSeconds = startTime
                                ? Math.floor((currentTime.getTime() - startTime.getTime()) / 1000)
                                : 0;

                            return (
                                <div key={stream.id} className="bg-gray-800/50 rounded-lg p-3">
                                    <p className="font-medium truncate">{stream.title}</p>
                                    <div className="flex justify-between items-center mt-2 text-sm">
                                        <span className="text-gray-400">Mulai:</span>
                                        <span className="text-green-400 font-mono">
                                            {startTime?.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center mt-1 text-sm">
                                        <span className="text-gray-400">Durasi:</span>
                                        <span className="text-indigo-400 font-mono">
                                            {formatLiveTime(streamSeconds)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* VPS Specifications Card */}
            <div className="card bg-gradient-to-br from-gray-900/80 to-gray-800/50 border-indigo-500/30">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <span className="text-2xl">🖥️</span>
                        Spesifikasi VPS
                    </h2>
                    {systemInfo && (
                        <span className="text-xs text-gray-500">
                            Uptime: {systemInfo.system.uptimeFormatted}
                        </span>
                    )}
                </div>

                {systemLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin text-3xl">⏳</div>
                        <span className="ml-2 text-gray-400">Memuat info sistem...</span>
                    </div>
                ) : systemInfo ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* CPU */}
                        <div className="bg-gray-800/50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-gray-400 text-sm">CPU</span>
                                <span className="text-2xl">⚡</span>
                            </div>
                            <p className="text-xl font-bold mb-1">{systemInfo.cpu.cores} Cores</p>
                            <p className="text-xs text-gray-500 truncate mb-2" title={systemInfo.cpu.model}>
                                {systemInfo.cpu.model.split(' ').slice(0, 3).join(' ')}
                            </p>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">Penggunaan</span>
                                <span className={getUsageTextColor(systemInfo.cpu.usage)}>
                                    {systemInfo.cpu.usage}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                                <div
                                    className={`h-2 rounded-full transition-all duration-500 ${getUsageColor(systemInfo.cpu.usage)}`}
                                    style={{ width: `${systemInfo.cpu.usage}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Memory */}
                        <div className="bg-gray-800/50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-gray-400 text-sm">RAM</span>
                                <span className="text-2xl">🧠</span>
                            </div>
                            <p className="text-xl font-bold mb-1">{systemInfo.memory.totalGB} GB</p>
                            <p className="text-xs text-gray-500 mb-2">
                                Terpakai: {systemInfo.memory.usedGB} GB
                            </p>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">Penggunaan</span>
                                <span className={getUsageTextColor(systemInfo.memory.usagePercent)}>
                                    {systemInfo.memory.usagePercent}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                                <div
                                    className={`h-2 rounded-full transition-all duration-500 ${getUsageColor(systemInfo.memory.usagePercent)}`}
                                    style={{ width: `${systemInfo.memory.usagePercent}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Storage */}
                        <div className="bg-gray-800/50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-gray-400 text-sm">Storage</span>
                                <span className="text-2xl">💾</span>
                            </div>
                            <p className="text-xl font-bold mb-1">{systemInfo.disk.totalGB} GB</p>
                            <p className="text-xs text-gray-500 mb-2">
                                Terpakai: {systemInfo.disk.usedGB} GB
                            </p>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">Penggunaan</span>
                                <span className={getUsageTextColor(systemInfo.disk.usagePercent)}>
                                    {systemInfo.disk.usagePercent}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                                <div
                                    className={`h-2 rounded-full transition-all duration-500 ${getUsageColor(systemInfo.disk.usagePercent)}`}
                                    style={{ width: `${systemInfo.disk.usagePercent}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Network */}
                        <div className="bg-gray-800/50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-gray-400 text-sm">Network</span>
                                <span className="text-2xl">🌐</span>
                            </div>
                            <p className="text-xl font-bold mb-1 font-mono text-sm">
                                {systemInfo.network.primaryIP}
                            </p>
                            <p className="text-xs text-gray-500 mb-2">
                                Host: {systemInfo.system.hostname}
                            </p>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">Platform</span>
                                <span className="text-indigo-400 capitalize">
                                    {systemInfo.system.platform === 'linux' ? 'Linux' : systemInfo.system.platform}
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-400">
                        <p>⚠️ Tidak dapat memuat informasi sistem.</p>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="card">
                <h2 className="text-lg font-semibold mb-4">Aksi Cepat</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link href="/dashboard/upload" className="p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors text-center">
                        <span className="text-3xl block mb-2">📤</span>
                        <span className="text-sm text-gray-300">Upload Video</span>
                    </Link>
                    <Link href="/dashboard/streams" className="p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors text-center">
                        <span className="text-3xl block mb-2">📺</span>
                        <span className="text-sm text-gray-300">Kelola Stream</span>
                    </Link>
                    <Link href="/dashboard/videos" className="p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors text-center">
                        <span className="text-3xl block mb-2">🎬</span>
                        <span className="text-sm text-gray-300">Video Library</span>
                    </Link>
                    <Link href="/dashboard/settings" className="p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors text-center">
                        <span className="text-3xl block mb-2">⚙️</span>
                        <span className="text-sm text-gray-300">Pengaturan</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
