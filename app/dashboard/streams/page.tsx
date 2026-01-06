"use client";

import { useState } from "react";
import Link from "next/link";

// Mock data for streams
const initialStreams = [
    { id: 1, title: "Relaxing Piano Music 24/7", platform: "youtube", status: "live", viewers: 127, quality: "1080p", startTime: "2024-01-06 08:00", video: "piano-relaxing.mp4" },
    { id: 2, title: "Rain Sounds for Sleep", platform: "youtube", status: "live", viewers: 89, quality: "720p", startTime: "2024-01-06 12:00", video: "rain-sounds.mp4" },
    { id: 3, title: "Lo-Fi Study Beats", platform: "facebook", status: "live", viewers: 45, quality: "1080p", startTime: "2024-01-06 14:00", video: "lofi-beats.mp4" },
    { id: 4, title: "Nature Sounds", platform: "youtube", status: "scheduled", viewers: 0, quality: "4K", startTime: "2024-01-07 06:00", video: "nature.mp4" },
    { id: 5, title: "ASMR Typing", platform: "youtube", status: "stopped", viewers: 0, quality: "1080p", startTime: "2024-01-05 20:00", video: "asmr-typing.mp4" },
    { id: 6, title: "Jazz Coffee Shop", platform: "facebook", status: "stopped", viewers: 0, quality: "720p", startTime: "2024-01-05 10:00", video: "jazz-cafe.mp4" },
];

export default function StreamsPage() {
    const [streams, setStreams] = useState(initialStreams);
    const [filter, setFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredStreams = streams.filter((stream) => {
        const matchesFilter = filter === "all" || stream.status === filter;
        const matchesSearch = stream.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const toggleStream = (id: number) => {
        setStreams(streams.map((stream) => {
            if (stream.id === id) {
                return {
                    ...stream,
                    status: stream.status === "live" ? "stopped" : "live",
                    viewers: stream.status === "live" ? 0 : Math.floor(Math.random() * 100) + 10,
                };
            }
            return stream;
        }));
    };

    const deleteStream = (id: number) => {
        if (confirm("Yakin mau hapus stream ini?")) {
            setStreams(streams.filter((stream) => stream.id !== id));
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Live Streams</h1>
                    <p className="text-gray-400 mt-1">Kelola semua live streaming kamu di sini.</p>
                </div>
                <Link href="/dashboard/upload" className="btn-primary text-center">
                    + Tambah Stream
                </Link>
            </div>

            {/* Filters */}
            <div className="card">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <input
                            type="search"
                            placeholder="Cari stream..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white placeholder-gray-500"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {[
                            { value: "all", label: "Semua" },
                            { value: "live", label: "🔴 Live" },
                            { value: "scheduled", label: "📅 Terjadwal" },
                            { value: "stopped", label: "⏹ Berhenti" },
                        ].map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setFilter(option.value)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === option.value
                                        ? "bg-indigo-500 text-white"
                                        : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Streams Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStreams.map((stream) => (
                    <div key={stream.id} className="card hover:border-indigo-500/50">
                        {/* Preview */}
                        <div className="aspect-video bg-gray-800 rounded-lg mb-4 relative overflow-hidden">
                            <div className="absolute inset-0 flex items-center justify-center text-4xl">
                                📺
                            </div>
                            {stream.status === "live" && (
                                <div className="absolute top-2 left-2 flex items-center gap-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                                    LIVE
                                </div>
                            )}
                            {stream.status === "scheduled" && (
                                <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
                                    TERJADWAL
                                </div>
                            )}
                            {stream.viewers > 0 && (
                                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                    👁️ {stream.viewers}
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <h3 className="font-semibold mb-2 truncate" title={stream.title}>
                            {stream.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                            <span className={stream.platform === "youtube" ? "text-red-400" : "text-blue-400"}>
                                {stream.platform === "youtube" ? "YouTube" : "Facebook"}
                            </span>
                            <span>{stream.quality}</span>
                            <span>{stream.video}</span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => toggleStream(stream.id)}
                                className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${stream.status === "live"
                                        ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                        : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                                    }`}
                            >
                                {stream.status === "live" ? "⏹ Stop" : "▶️ Start"}
                            </button>
                            <button className="px-3 py-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 transition-colors">
                                ✏️
                            </button>
                            <button
                                onClick={() => deleteStream(stream.id)}
                                className="px-3 py-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-colors"
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredStreams.length === 0 && (
                <div className="card text-center py-12">
                    <span className="text-6xl block mb-4">📺</span>
                    <h3 className="text-xl font-semibold mb-2">Tidak ada stream ditemukan</h3>
                    <p className="text-gray-400 mb-4">
                        {searchQuery ? "Coba kata kunci lain" : "Mulai dengan menambahkan stream baru"}
                    </p>
                    <Link href="/dashboard/upload" className="btn-primary inline-block">
                        + Tambah Stream
                    </Link>
                </div>
            )}
        </div>
    );
}
