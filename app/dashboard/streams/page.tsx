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
    startedAt?: string;
    estimatedEndAt?: string;
    durationHours?: number;
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
    const [isCustomDuration, setIsCustomDuration] = useState(false);
    const [newStream, setNewStream] = useState({
        title: "",
        platform: "youtube",
        rtmpUrl: PLATFORM_PRESETS.youtube.rtmpUrl,
        streamKey: "",
        videoFile: "",
        quality: "1080p",
        durationHours: 0 // 0 = unlimited (24/7)
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
                    quality: "1080p",
                    durationHours: 0
                });
                setIsCustomDuration(false);
            } else {
                const error = await response.json();
                alert(error.error || "Gagal menambah stream");
            }
        } catch (error) {
            console.error("Error adding stream:", error);
            alert("Gagal menghubungi server");
        }
    };

    // Add stream and immediately start streaming
    const addAndStartStream = async () => {
        if (!newStream.title || !newStream.streamKey || !newStream.videoFile) {
            alert("Lengkapi semua field terlebih dahulu!");
            return;
        }

        try {
            // First, create the stream
            const createResponse = await fetch(`${API_URL}/api/streams`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newStream)
            });

            if (!createResponse.ok) {
                const error = await createResponse.json();
                alert(error.error || "Gagal menambah stream");
                return;
            }

            const createdStream = await createResponse.json();

            // Then immediately start the stream
            const startResponse = await fetch(`${API_URL}/api/streams/${createdStream.id}/start`, {
                method: "POST"
            });

            if (startResponse.ok) {
                await fetchStreams();
                setShowAddModal(false);
                setNewStream({
                    title: "",
                    platform: "youtube",
                    rtmpUrl: "rtmp://a.rtmp.youtube.com/live2",
                    streamKey: "",
                    videoFile: "",
                    quality: "1080p",
                    durationHours: 0
                });
                setIsCustomDuration(false);
                alert("🎉 Stream berhasil dibuat dan dimulai!");
            } else {
                const error = await startResponse.json();
                alert(`Stream dibuat tapi gagal dimulai: ${error.error}`);
                await fetchStreams();
                setShowAddModal(false);
            }
        } catch (error) {
            console.error("Error adding and starting stream:", error);
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
                                type="button"
                                onClick={() => setFilter(option.value)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-2 ${filter === option.value
                                    ? "bg-indigo-500 text-white border-indigo-400 shadow-lg shadow-indigo-500/30"
                                    : "bg-gray-800 text-gray-400 border-transparent hover:bg-gray-700 hover:text-white"
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
                            <p className="text-xs text-gray-500 mb-2 truncate" title={stream.videoFile}>
                                📁 {stream.videoFile}
                            </p>

                            {/* Stream Timing Info - only show when running */}
                            {stream.isRunning && stream.startedAt && (
                                <div className="bg-gray-800/50 rounded-lg p-2 mb-3 text-xs space-y-1">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">🟢 Mulai:</span>
                                        <span className="text-green-400 font-mono">
                                            {new Date(stream.startedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    {stream.estimatedEndAt ? (
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">🔴 Selesai:</span>
                                            <span className="text-red-400 font-mono">
                                                {new Date(stream.estimatedEndAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                {' '}
                                                <span className="text-gray-600">
                                                    ({new Date(stream.estimatedEndAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })})
                                                </span>
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">⏱️ Durasi:</span>
                                            <span className="text-indigo-400">♾️ Unlimited</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Duration info when not running */}
                            {!stream.isRunning && stream.durationHours !== undefined && (
                                <p className="text-xs text-gray-500 mb-3">
                                    ⏱️ Durasi: {stream.durationHours === 0 ? '♾️ Unlimited' : `${stream.durationHours} jam`}
                                </p>
                            )}

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
                                        <Link
                                            href="/dashboard/upload"
                                            className="text-sm text-indigo-400 hover:text-indigo-300 underline mt-2 inline-block"
                                        >
                                            📤 Upload Video Sekarang
                                        </Link>
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

                            <div>
                                <label className="block text-sm font-medium mb-2">Durasi Streaming</label>
                                <div className="flex gap-2 items-center">
                                    <select
                                        value={isCustomDuration ? "custom" : newStream.durationHours}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === "custom") {
                                                setIsCustomDuration(true);
                                                setNewStream({ ...newStream, durationHours: 5 }); // Default custom value
                                            } else {
                                                setIsCustomDuration(false);
                                                setNewStream({ ...newStream, durationHours: Number(val) });
                                            }
                                        }}
                                        className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white"
                                    >
                                        <option value={0}>♾️ Unlimited (24/7)</option>
                                        <option value={1}>1 Jam</option>
                                        <option value={2}>2 Jam</option>
                                        <option value={3}>3 Jam</option>
                                        <option value={4}>4 Jam</option>
                                        <option value={6}>6 Jam</option>
                                        <option value={8}>8 Jam</option>
                                        <option value={10}>10 Jam</option>
                                        <option value={12}>12 Jam</option>
                                        <option value={24}>24 Jam</option>
                                        <option value={48}>48 Jam</option>
                                        <option value={72}>72 Jam (3 Hari)</option>
                                        <option value="custom">✏️ Custom...</option>
                                    </select>
                                    {isCustomDuration && (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                min="1"
                                                max="720"
                                                value={newStream.durationHours}
                                                onChange={(e) => setNewStream({ ...newStream, durationHours: Math.max(1, Number(e.target.value)) })}
                                                className="w-20 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white text-center"
                                                autoFocus
                                            />
                                            <span className="text-gray-400 text-sm">jam</span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    ⏱️ Stream akan otomatis berhenti setelah waktu yang ditentukan
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 pt-4">
                                {/* Primary action - Start Streaming */}
                                <button
                                    type="button"
                                    onClick={addAndStartStream}
                                    disabled={!newStream.title || !newStream.streamKey || !newStream.videoFile}
                                    className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/30"
                                >
                                    🔴 Mulai Live Streaming
                                </button>

                                {/* Secondary actions */}
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 py-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-2 bg-indigo-500/50 text-white rounded-lg hover:bg-indigo-500 transition-colors font-medium"
                                    >
                                        💾 Simpan Saja
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
