"use client";

import { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Platform presets
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

interface Schedule {
    id: number;
    title: string;
    platform: string;
    rtmpUrl: string;
    streamKey: string;
    videoFile: string;
    quality: string;
    startDateTime: string;  // Full datetime: YYYY-MM-DDTHH:mm
    endDateTime: string;    // Full datetime: YYYY-MM-DDTHH:mm
    active: boolean;
    isRunning?: boolean;
    lastRun?: string;
}

interface VideoFile {
    name: string;
    sizeFormatted: string;
}

export default function SchedulePage() {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [videos, setVideos] = useState<VideoFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    // Get current datetime for default values
    const now = new Date();
    const defaultStart = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
    const defaultEnd = new Date(now.getTime() + 3 * 60 * 60 * 1000); // 3 hours from now

    const formatDateTimeLocal = (date: Date) => {
        return date.toISOString().slice(0, 16);
    };

    const [formData, setFormData] = useState({
        title: "",
        platform: "youtube",
        rtmpUrl: PLATFORM_PRESETS.youtube.rtmpUrl,
        streamKey: "",
        videoFile: "",
        quality: "1080p",
        startDateTime: formatDateTimeLocal(defaultStart),
        endDateTime: formatDateTimeLocal(defaultEnd),
    });

    // Handle platform change
    const handlePlatformChange = (platform: string) => {
        const preset = PLATFORM_PRESETS[platform as keyof typeof PLATFORM_PRESETS];
        setFormData({
            ...formData,
            platform,
            rtmpUrl: preset?.rtmpUrl || ""
        });
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const [schedulesRes, videosRes] = await Promise.all([
                fetch(`${API_URL}/api/schedules`),
                fetch(`${API_URL}/api/videos`)
            ]);

            if (schedulesRes.ok) {
                const data = await schedulesRes.json();
                setSchedules(data);
            }

            if (videosRes.ok) {
                const data = await videosRes.json();
                setVideos(data);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Manual start streaming
    const startStreaming = async (schedule: Schedule) => {
        setActionLoading(schedule.id);
        try {
            const response = await fetch(`${API_URL}/api/schedules/${schedule.id}/start`, {
                method: "POST"
            });

            if (response.ok) {
                alert(`✅ Streaming "${schedule.title}" berhasil dimulai!`);
                await fetchData();
            } else {
                const error = await response.json();
                alert(error.error || "Gagal memulai streaming");
            }
        } catch (error) {
            console.error("Error starting stream:", error);
            alert("Gagal menghubungi server");
        } finally {
            setActionLoading(null);
        }
    };

    // Manual stop streaming
    const stopStreaming = async (schedule: Schedule) => {
        setActionLoading(schedule.id);
        try {
            const response = await fetch(`${API_URL}/api/schedules/${schedule.id}/stop`, {
                method: "POST"
            });

            if (response.ok) {
                alert(`⏹️ Streaming "${schedule.title}" berhasil dihentikan!`);
                await fetchData();
            } else {
                const error = await response.json();
                alert(error.error || "Gagal menghentikan streaming");
            }
        } catch (error) {
            console.error("Error stopping stream:", error);
            alert("Gagal menghubungi server");
        } finally {
            setActionLoading(null);
        }
    };

    const toggleSchedule = async (id: number) => {
        try {
            const response = await fetch(`${API_URL}/api/schedules/${id}/toggle`, {
                method: "POST"
            });
            if (response.ok) {
                const updated = await response.json();
                setSchedules(schedules.map(s => s.id === id ? updated : s));
            }
        } catch (error) {
            console.error("Error toggling schedule:", error);
        }
    };

    const deleteSchedule = async (id: number) => {
        if (!confirm("Yakin mau hapus jadwal ini?")) return;

        try {
            const response = await fetch(`${API_URL}/api/schedules/${id}`, {
                method: "DELETE"
            });
            if (response.ok) {
                setSchedules(schedules.filter(s => s.id !== id));
            }
        } catch (error) {
            console.error("Error deleting schedule:", error);
        }
    };

    const openModal = (schedule?: Schedule) => {
        if (schedule) {
            setEditingSchedule(schedule);
            setFormData({
                title: schedule.title,
                platform: schedule.platform || "youtube",
                rtmpUrl: schedule.rtmpUrl || PLATFORM_PRESETS.youtube.rtmpUrl,
                streamKey: schedule.streamKey || "",
                videoFile: schedule.videoFile || "",
                quality: schedule.quality || "1080p",
                startDateTime: schedule.startDateTime || formatDateTimeLocal(defaultStart),
                endDateTime: schedule.endDateTime || formatDateTimeLocal(defaultEnd),
            });
        } else {
            setEditingSchedule(null);
            setFormData({
                title: "",
                platform: "youtube",
                rtmpUrl: PLATFORM_PRESETS.youtube.rtmpUrl,
                streamKey: "",
                videoFile: "",
                quality: "1080p",
                startDateTime: formatDateTimeLocal(defaultStart),
                endDateTime: formatDateTimeLocal(defaultEnd),
            });
        }
        setShowModal(true);
    };

    const saveSchedule = async () => {
        if (!formData.title || !formData.streamKey || !formData.videoFile || !formData.startDateTime || !formData.endDateTime) {
            alert("Lengkapi semua field!");
            return;
        }

        // Validate end time is after start time
        if (new Date(formData.endDateTime) <= new Date(formData.startDateTime)) {
            alert("Waktu selesai harus setelah waktu mulai!");
            return;
        }

        try {
            const payload = {
                ...formData
            };

            if (editingSchedule) {
                const response = await fetch(`${API_URL}/api/schedules/${editingSchedule.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                if (response.ok) {
                    const updated = await response.json();
                    setSchedules(schedules.map(s => s.id === editingSchedule.id ? updated : s));
                }
            } else {
                const response = await fetch(`${API_URL}/api/schedules`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                if (response.ok) {
                    const newSchedule = await response.json();
                    setSchedules([...schedules, newSchedule]);
                }
            }
            setShowModal(false);
        } catch (error) {
            console.error("Error saving schedule:", error);
            alert("Gagal menyimpan jadwal");
        }
    };

    const formatDateTime = (dateTimeStr: string) => {
        const date = new Date(dateTimeStr);
        return date.toLocaleString('id-ID', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <span className="animate-pulse text-gray-400">Memuat jadwal...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Jadwal Live Streaming</h1>
                    <p className="text-gray-400 mt-1">Buat jadwal streaming dengan tanggal dan waktu spesifik.</p>
                </div>
                <button onClick={() => openModal()} className="btn-primary">
                    + Buat Jadwal Baru
                </button>
            </div>

            {/* Info Card */}
            <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-xl p-4">
                <p className="text-indigo-400 text-sm">
                    💡 <strong>Cara kerja:</strong> Buat jadwal dengan memasukkan stream key langsung. Streaming akan otomatis dimulai dan berhenti sesuai waktu yang Anda tentukan. Anda juga bisa start/stop secara manual kapan saja.
                </p>
            </div>

            {/* Schedule List */}
            <div className="space-y-4">
                {schedules.map((schedule) => {
                    const platform = PLATFORM_PRESETS[schedule.platform as keyof typeof PLATFORM_PRESETS];
                    const isLoading = actionLoading === schedule.id;

                    return (
                        <div key={schedule.id} className={`card ${!schedule.active && "opacity-60"}`}>
                            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                {/* Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                                        <h3 className="font-semibold text-lg">{schedule.title}</h3>
                                        <span className={`text-xs px-2 py-1 rounded-full ${platform?.color || 'text-gray-400'} bg-gray-800`}>
                                            {platform?.icon} {platform?.name || schedule.platform}
                                        </span>
                                        {schedule.active && (
                                            <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                                                ✅ Aktif
                                            </span>
                                        )}
                                        {schedule.isRunning && (
                                            <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400 flex items-center gap-1">
                                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                                LIVE
                                            </span>
                                        )}
                                    </div>

                                    {/* Video Info */}
                                    <p className="text-gray-500 text-sm mb-3">
                                        🎬 {schedule.videoFile} • {schedule.quality}
                                    </p>

                                    {/* Datetime Info */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="bg-green-500/10 rounded-lg px-3 py-2">
                                            <p className="text-green-400 text-xs font-medium mb-1">🟢 MULAI</p>
                                            <p className="text-green-300 text-sm font-mono">
                                                {formatDateTime(schedule.startDateTime)}
                                            </p>
                                        </div>
                                        <div className="bg-red-500/10 rounded-lg px-3 py-2">
                                            <p className="text-red-400 text-xs font-medium mb-1">🔴 SELESAI</p>
                                            <p className="text-red-300 text-sm font-mono">
                                                {formatDateTime(schedule.endDateTime)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-wrap gap-2">
                                    {schedule.isRunning ? (
                                        <button
                                            onClick={() => stopStreaming(schedule)}
                                            disabled={isLoading}
                                            className={`px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium transition-colors ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
                                        >
                                            {isLoading ? '⏳' : '⏹️'} Stop Manual
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => startStreaming(schedule)}
                                            disabled={isLoading}
                                            className={`px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition-colors ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
                                        >
                                            {isLoading ? '⏳' : '▶️'} Start Manual
                                        </button>
                                    )}

                                    <button
                                        onClick={() => toggleSchedule(schedule.id)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${schedule.active
                                            ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                                            : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                                            }`}
                                    >
                                        {schedule.active ? "⏸️ Pause Auto" : "▶️ Aktifkan Auto"}
                                    </button>
                                    <button
                                        onClick={() => openModal(schedule)}
                                        className="px-4 py-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 transition-colors"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => deleteSchedule(schedule.id)}
                                        className="px-4 py-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-colors"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {schedules.length === 0 && (
                    <div className="card text-center py-12">
                        <span className="text-6xl block mb-4">📅</span>
                        <h3 className="text-xl font-semibold mb-2">Belum ada jadwal streaming</h3>
                        <p className="text-gray-400 mb-4">Buat jadwal baru dengan memasukkan stream key langsung</p>
                        <button onClick={() => openModal()} className="btn-primary">
                            + Buat Jadwal Baru
                        </button>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">
                                {editingSchedule ? "Edit Jadwal" : "Buat Jadwal Streaming Baru"}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white text-2xl">
                                ×
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Judul Streaming
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white placeholder-gray-500"
                                    placeholder="Contoh: Jazz Music 24/7"
                                />
                            </div>

                            {/* Platform */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Platform
                                </label>
                                <select
                                    value={formData.platform}
                                    onChange={(e) => handlePlatformChange(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white"
                                >
                                    {Object.entries(PLATFORM_PRESETS).map(([key, preset]) => (
                                        <option key={key} value={key}>
                                            {preset.icon} {preset.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* RTMP URL */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    RTMP URL
                                </label>
                                <input
                                    type="text"
                                    value={formData.rtmpUrl}
                                    onChange={(e) => setFormData({ ...formData, rtmpUrl: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white font-mono text-sm"
                                />
                            </div>

                            {/* Stream Key */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    🔑 Stream Key
                                </label>
                                <input
                                    type="password"
                                    value={formData.streamKey}
                                    onChange={(e) => setFormData({ ...formData, streamKey: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white"
                                    placeholder="Paste stream key dari platform"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    📌 Dapatkan dari YouTube Studio / Facebook Live Producer
                                </p>
                            </div>

                            {/* Video Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    🎬 Pilih Video
                                </label>
                                <select
                                    value={formData.videoFile}
                                    onChange={(e) => setFormData({ ...formData, videoFile: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white"
                                >
                                    <option value="">-- Pilih Video --</option>
                                    {videos.map(video => (
                                        <option key={video.name} value={video.name}>
                                            📹 {video.name} ({video.sizeFormatted})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Quality */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Kualitas
                                </label>
                                <select
                                    value={formData.quality}
                                    onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white"
                                >
                                    <option value="720p">720p (HD)</option>
                                    <option value="1080p">1080p (Full HD)</option>
                                    <option value="4K">4K (Ultra HD)</option>
                                </select>
                            </div>

                            {/* Start DateTime */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    🟢 Tanggal & Jam Mulai
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.startDateTime}
                                    onChange={(e) => setFormData({ ...formData, startDateTime: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-green-500 text-white"
                                />
                            </div>

                            {/* End DateTime */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    🔴 Tanggal & Jam Selesai
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.endDateTime}
                                    onChange={(e) => setFormData({ ...formData, endDateTime: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500 text-white"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-3 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={saveSchedule}
                                className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-colors font-medium"
                            >
                                💾 Simpan Jadwal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
