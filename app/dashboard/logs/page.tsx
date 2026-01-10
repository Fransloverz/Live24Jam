"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Stream {
    id: number;
    title: string;
    platform: string;
    isRunning: boolean;
}

interface LogEntry {
    timestamp: string;
    message: string;
}

export default function LogsPage() {
    const [streams, setStreams] = useState<Stream[]>([]);
    const [selectedStreamId, setSelectedStreamId] = useState<number | null>(null);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [logsLoading, setLogsLoading] = useState(false);
    const [autoScroll, setAutoScroll] = useState(true);
    const logsEndRef = useRef<HTMLDivElement>(null);

    // Fetch streams
    useEffect(() => {
        const fetchStreams = async () => {
            try {
                const response = await fetch(`${API_URL}/api/streams`);
                if (response.ok) {
                    const data = await response.json();
                    setStreams(data);
                    // Auto-select first running stream
                    const runningStream = data.find((s: Stream) => s.isRunning);
                    if (runningStream && !selectedStreamId) {
                        setSelectedStreamId(runningStream.id);
                    }
                }
            } catch (error) {
                console.error("Error fetching streams:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStreams();
        const interval = setInterval(fetchStreams, 5000);
        return () => clearInterval(interval);
    }, [selectedStreamId]);

    // Fetch logs for selected stream
    useEffect(() => {
        if (!selectedStreamId) return;

        const fetchLogs = async () => {
            setLogsLoading(true);
            try {
                const response = await fetch(`${API_URL}/api/streams/${selectedStreamId}/status`);
                if (response.ok) {
                    const data = await response.json();
                    setLogs(data.logs || []);
                }
            } catch (error) {
                console.error("Error fetching logs:", error);
            } finally {
                setLogsLoading(false);
            }
        };

        fetchLogs();
        const interval = setInterval(fetchLogs, 2000);
        return () => clearInterval(interval);
    }, [selectedStreamId]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (autoScroll && logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [logs, autoScroll]);

    const getLogColor = (message: string) => {
        if (message.includes("error") || message.includes("Error") || message.includes("failed")) {
            return "text-red-400";
        }
        if (message.includes("warning") || message.includes("Warning")) {
            return "text-yellow-400";
        }
        if (message.includes("success") || message.includes("restarted") || message.includes("Started")) {
            return "text-green-400";
        }
        if (message.includes("frame=") || message.includes("speed=")) {
            return "text-cyan-400";
        }
        return "text-gray-300";
    };

    const formatTimestamp = (timestamp: string) => {
        try {
            return new Date(timestamp).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            });
        } catch {
            return timestamp;
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Stream Logs</h1>
                    <p className="text-gray-400 mt-1">Monitor log FFmpeg secara real-time</p>
                </div>
                <Link href="/dashboard/streams" className="btn-secondary text-center">
                    ← Kembali ke Streams
                </Link>
            </div>

            <div className="grid lg:grid-cols-4 gap-6">
                {/* Stream List */}
                <div className="card lg:col-span-1">
                    <h2 className="font-semibold mb-4">📺 Pilih Stream</h2>
                    {loading ? (
                        <div className="text-center py-4 text-gray-400">
                            <span className="animate-pulse">Memuat...</span>
                        </div>
                    ) : streams.length === 0 ? (
                        <div className="text-center py-4 text-gray-400">
                            <p>Tidak ada stream</p>
                            <Link href="/dashboard/streams" className="text-indigo-400 text-sm hover:underline">
                                Tambah stream →
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {streams.map((stream) => (
                                <button
                                    key={stream.id}
                                    onClick={() => setSelectedStreamId(stream.id)}
                                    className={`w-full p-3 rounded-lg text-left transition-colors ${selectedStreamId === stream.id
                                        ? "bg-indigo-500/20 border border-indigo-500/50"
                                        : "bg-gray-800/50 hover:bg-gray-800"
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        {stream.isRunning && (
                                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                        )}
                                        <span className="font-medium truncate text-sm">{stream.title}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-xs ${stream.platform === "youtube" ? "text-red-400" :
                                            stream.platform === "facebook" ? "text-blue-400" : "text-purple-400"
                                            }`}>
                                            {stream.platform}
                                        </span>
                                        <span className={`text-xs ${stream.isRunning ? "text-green-400" : "text-gray-500"}`}>
                                            {stream.isRunning ? "● Live" : "○ Stopped"}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Logs Viewer */}
                <div className="card lg:col-span-3">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold">📋 Log Output</h2>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 text-sm text-gray-400">
                                <input
                                    type="checkbox"
                                    checked={autoScroll}
                                    onChange={(e) => setAutoScroll(e.target.checked)}
                                    className="rounded bg-gray-800 border-gray-700"
                                />
                                Auto-scroll
                            </label>
                            {selectedStreamId && (
                                <button
                                    onClick={() => setLogs([])}
                                    className="text-sm text-gray-400 hover:text-white"
                                >
                                    🗑️ Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {!selectedStreamId ? (
                        <div className="h-96 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <span className="text-4xl block mb-2">📋</span>
                                <p>Pilih stream untuk melihat log</p>
                            </div>
                        </div>
                    ) : logsLoading && logs.length === 0 ? (
                        <div className="h-96 flex items-center justify-center text-gray-500">
                            <span className="animate-pulse">Memuat log...</span>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="h-96 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <span className="text-4xl block mb-2">📭</span>
                                <p>Belum ada log untuk stream ini</p>
                                <p className="text-sm mt-1">Log akan muncul saat stream aktif</p>
                            </div>
                        </div>
                    ) : (
                        <div className="h-96 overflow-y-auto bg-gray-950 rounded-lg p-4 font-mono text-xs">
                            {logs.map((log, index) => (
                                <div key={index} className="flex gap-2 py-0.5 hover:bg-gray-900/50">
                                    <span className="text-gray-500 flex-shrink-0">
                                        [{formatTimestamp(log.timestamp)}]
                                    </span>
                                    <span className={getLogColor(log.message)}>
                                        {log.message}
                                    </span>
                                </div>
                            ))}
                            <div ref={logsEndRef} />
                        </div>
                    )}

                    {/* Status Bar */}
                    {selectedStreamId && (
                        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                            <span>Total: {logs.length} log entries</span>
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Auto-refresh: 2s
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Legend */}
            <div className="card">
                <h3 className="font-semibold mb-3">📊 Legenda Warna Log</h3>
                <div className="flex flex-wrap gap-4 text-sm">
                    <span className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-cyan-400 rounded"></span>
                        <span className="text-gray-400">Progress (frame/speed)</span>
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-green-400 rounded"></span>
                        <span className="text-gray-400">Success/Started</span>
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-yellow-400 rounded"></span>
                        <span className="text-gray-400">Warning</span>
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-red-400 rounded"></span>
                        <span className="text-gray-400">Error</span>
                    </span>
                </div>
            </div>
        </div>
    );
}
