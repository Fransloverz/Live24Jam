"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Platform presets with RTMP URLs
const PLATFORM_PRESETS = {
    youtube: {
        name: "YouTube",
        icon: "🔴",
        rtmpUrl: "rtmp://a.rtmp.youtube.com/live2",
        color: "text-red-400"
    },
    facebook: {
        name: "Facebook",
        icon: "🔵",
        rtmpUrl: "rtmp://live-api-s.facebook.com:443/rtmp/",
        color: "text-blue-400"
    },
    tiktok: {
        name: "TikTok",
        icon: "🎵",
        rtmpUrl: "rtmp://push.tiktok.com/live/",
        color: "text-pink-400"
    },
    twitch: {
        name: "Twitch",
        icon: "💜",
        rtmpUrl: "rtmp://live.twitch.tv/app/",
        color: "text-purple-400"
    },
    instagram: {
        name: "Instagram",
        icon: "📷",
        rtmpUrl: "rtmp://live-upload.instagram.com/rtmp/",
        color: "text-pink-500"
    },
    custom: {
        name: "Custom RTMP",
        icon: "⚙️",
        rtmpUrl: "",
        color: "text-gray-400"
    }
};

interface Stream {
    id: number;
    title: string;
    platform: string;
    rtmpUrl: string;
    streamKey: string;
    videoFile: string;
    quality: string;
    status: string;
    viewers: number;
    isRunning?: boolean;
    createdAt?: string;
}

interface VideoFile {
    name: string;
    size: number;
    sizeFormatted: string;
    modified: string;
    extension: string;
}

export default function StreamsPage() {
    const [streams, setStreams] = useState<Stream[]>([]);
    const [videos, setVideos] = useState<VideoFile[]>([]);
    const [videosLoading, setVideosLoading] = useState(false);
    const [filter, setFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newStream, setNewStream] = useState({
        title: "",
        platform: "youtube",
        rtmpUrl: PLATFORM_PRESETS.youtube.rtmpUrl,
        streamKey: "",
        videoFile: "",
        quality: "1080p"
    });

    // Handle platform change - auto-fill RTMP URL
    const handlePlatformChange = (platform: string) => {
        const preset = PLATFORM_PRESETS[platform as keyof typeof PLATFORM_PRESETS];
        setNewStream({
            ...newStream,
            platform,
            rtmpUrl: preset?.rtmpUrl || ""
        });
    };

    // Fetch streams from API
    const fetchStreams = async () => {
        try {
            const response = await fetch(`${API_URL}/api/streams`);
            if (response.ok) {
                const data = await response.json();
                setStreams(data);
            }
        } catch (error) {
            console.error("Error fetching streams:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch available videos from API
    const fetchVideos = async () => {
        setVideosLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/videos`);
            if (response.ok) {
                const data = await response.json();
                setVideos(data);
            }
        } catch (error) {
            console.error("Error fetching videos:", error);
        } finally {
            setVideosLoading(false);
        }
    };

    useEffect(() => {
        fetchStreams();
        // Poll for updates every 5 seconds
        const interval = setInterval(fetchStreams, 5000);
        return () => clearInterval(interval);
    }, []);

    // Fetch videos when modal opens
    useEffect(() => {
        if (showAddModal) {
            fetchVideos();
        }
    }, [showAddModal]);

    const filteredStreams = streams.filter((stream) => {
        const status = stream.isRunning ? "live" : stream.status;
        const matchesFilter = filter === "all" || status === filter;
        const matchesSearch = stream.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const toggleStream = async (id: number) => {
        const stream = streams.find(s => s.id === id);
        if (!stream) return;

        setActionLoading(id);
        try {
            const action = stream.isRunning ? "stop" : "start";
            const response = await fetch(`${API_URL}/api/streams/${id}/${action}`, {
                method: "POST"
            });

            if (response.ok) {
                await fetchStreams();
            } else {
                const error = await response.json();
                alert(error.error || "Gagal mengubah status stream");
            }
        } catch (error) {
            console.error("Error toggling stream:", error);
            alert("Gagal menghubungi server");
        } finally {
            setActionLoading(null);
        }
    };

    const deleteStream = async (id: number) => {
        if (!confirm("Yakin mau hapus stream ini?")) return;

        try {
            const response = await fetch(`${API_URL}/api/streams/${id}`, {
                method: "DELETE"
            });

            if (response.ok) {
                setStreams(streams.filter(s => s.id !== id));
            }
        } catch (error) {
            console.error("Error deleting stream:", error);
        }
    };

    const addStream = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch(`${API_URL}/api/streams`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newStream)
            });

            if (response.ok) {
                await fetchStreams();
                setShowAddModal(false);
                setNewStream({
                    title: "",
                    platform: "youtube",
                    rtmpUrl: "rtmp://a.rtmp.youtube.com/live2",
                    streamKey: "",
                    videoFile: "",
                    quality: "1080p"
                });
            } else {
                const error = await response.json();
                alert(error.error || "Gagal menambah stream");
            }
        } catch (error) {
            console.error("Error adding stream:", error);
            alert("Gagal menghubungi server");
        }
    };

    const platformRtmpUrls: Record<string, string> = {
        youtube: "rtmp://a.rtmp.youtube.com/live2",
        facebook: "rtmps://live-api-s.facebook.com:443/rtmp",
        twitch: "rtmp://live.twitch.tv/app"
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Live Streams</h1>
                    <p className="text-gray-400 mt-1">Kelola semua live streaming kamu di sini.</p>
                </div>
                <button onClick={() => setShowAddModal(true)} className="btn-primary text-center">
                    + Tambah Stream
                </button>
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

            {/* Loading State */}
            {loading && (
                <div className="card text-center py-12">
                    <div className="animate-spin text-4xl mb-4">⏳</div>
                    <p className="text-gray-400">Memuat streams...</p>
                </div>
            )}

            {/* Streams Grid */}
            {!loading && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredStreams.map((stream) => (
                        <div key={stream.id} className="card hover:border-indigo-500/50">
                            {/* Preview */}
                            <div className="aspect-video bg-gray-800 rounded-lg mb-4 relative overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center text-4xl">
                                    📺
                                </div>
                                {stream.isRunning && (
                                    <div className="absolute top-2 left-2 flex items-center gap-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                                        LIVE
                                    </div>
                                )}
                                {stream.status === "scheduled" && !stream.isRunning && (
                                    <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
                                        TERJADWAL
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <h3 className="font-semibold mb-2 truncate" title={stream.title}>
                                {stream.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                                <span className={PLATFORM_PRESETS[stream.platform as keyof typeof PLATFORM_PRESETS]?.color || "text-gray-400"}>
                                    {PLATFORM_PRESETS[stream.platform as keyof typeof PLATFORM_PRESETS]?.icon || "📺"}{" "}
                                    {PLATFORM_PRESETS[stream.platform as keyof typeof PLATFORM_PRESETS]?.name || stream.platform}
                                </span>
                                <span>{stream.quality}</span>
                            </div>
                            <p className="text-xs text-gray-500 mb-4 truncate" title={stream.videoFile}>
                                📁 {stream.videoFile}
                            </p>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => toggleStream(stream.id)}
                                    disabled={actionLoading === stream.id}
                                    className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${stream.isRunning
                                        ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                        : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                                        } ${actionLoading === stream.id ? "opacity-50 cursor-wait" : ""}`}
                                >
                                    {actionLoading === stream.id
                                        ? "⏳ Loading..."
                                        : stream.isRunning
                                            ? "⏹ Stop"
                                            : "▶️ Start"}
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
            )}

            {!loading && filteredStreams.length === 0 && (
                <div className="card text-center py-12">
                    <span className="text-6xl block mb-4">📺</span>
                    <h3 className="text-xl font-semibold mb-2">Tidak ada stream ditemukan</h3>
                    <p className="text-gray-400 mb-4">
                        {searchQuery ? "Coba kata kunci lain" : "Mulai dengan menambahkan stream baru"}
                    </p>
                    <button onClick={() => setShowAddModal(true)} className="btn-primary inline-block">
                        + Tambah Stream
                    </button>
                </div>
            )}

            {/* Add Stream Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="card max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Tambah Stream Baru</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white text-2xl">
                                ×
                            </button>
                        </div>

                        <form onSubmit={addStream} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Judul Stream</label>
                                <input
                                    type="text"
                                    required
                                    value={newStream.title}
                                    onChange={(e) => setNewStream({ ...newStream, title: e.target.value })}
                                    placeholder="Contoh: Relaxing Piano Music 24/7"
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Platform</label>
                                <select
                                    value={newStream.platform}
                                    onChange={(e) => handlePlatformChange(e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white"
                                >
                                    {Object.entries(PLATFORM_PRESETS).map(([key, preset]) => (
                                        <option key={key} value={key}>
                                            {preset.icon} {preset.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">RTMP URL</label>
                                <input
                                    type="text"
                                    required
                                    value={newStream.rtmpUrl}
                                    onChange={(e) => setNewStream({ ...newStream, rtmpUrl: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white font-mono text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Stream Key</label>
                                <input
                                    type="password"
                                    required
                                    value={newStream.streamKey}
                                    onChange={(e) => setNewStream({ ...newStream, streamKey: e.target.value })}
                                    placeholder="Paste stream key dari platform"
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    📌 Dapatkan stream key dari YouTube Studio / Facebook Live Producer
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Pilih Video
                                    <button
                                        type="button"
                                        onClick={fetchVideos}
                                        className="ml-2 text-xs text-indigo-400 hover:text-indigo-300"
                                    >
                                        🔄 Refresh
                                    </button>
                                </label>
                                {videosLoading ? (
                                    <div className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 text-center">
                                        <span className="animate-pulse">⏳ Memuat daftar video...</span>
                                    </div>
                                ) : videos.length > 0 ? (
                                    <select
                                        required
                                        value={newStream.videoFile}
                                        onChange={(e) => setNewStream({ ...newStream, videoFile: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white"
                                    >
                                        <option value="">-- Pilih Video --</option>
                                        {videos.map((video) => (
                                            <option key={video.name} value={video.name}>
                                                📹 {video.name} ({video.sizeFormatted})
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-center">
                                        <p className="text-gray-400 text-sm">⚠️ Tidak ada video ditemukan</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Upload video ke folder <code className="bg-gray-700 px-1 rounded">videos/</code>
                                        </p>
                                    </div>
                                )}
                                {newStream.videoFile && (
                                    <p className="text-xs text-green-400 mt-1">
                                        ✅ Dipilih: {newStream.videoFile}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Kualitas</label>
                                <select
                                    value={newStream.quality}
                                    onChange={(e) => setNewStream({ ...newStream, quality: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white"
                                >
                                    <option value="720p">720p (HD)</option>
                                    <option value="1080p">1080p (Full HD)</option>
                                    <option value="4K">4K (Ultra HD)</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors font-medium"
                                >
                                    Simpan Stream
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
