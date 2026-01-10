"use client";

import { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Schedule {
    id: number;
    title: string;
    streamId: number;
    videoFile?: string;
    scheduleType: 'recurring' | 'once';  // recurring = hari berulang, once = tanggal spesifik
    days?: string[];          // untuk recurring
    specificDate?: string;    // untuk once (YYYY-MM-DD)
    startTime: string;
    endTime: string;
    active: boolean;
    lastRun?: string;
}

interface Stream {
    id: number;
    title: string;
    platform: string;
    videoFile?: string;
    isRunning?: boolean;
}

interface VideoFile {
    name: string;
    sizeFormatted: string;
}

const dayLabels: { [key: string]: string } = {
    mon: "Sen",
    tue: "Sel",
    wed: "Rab",
    thu: "Kam",
    fri: "Jum",
    sat: "Sab",
    sun: "Min",
};

export default function SchedulePage() {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [streams, setStreams] = useState<Stream[]>([]);
    const [videos, setVideos] = useState<VideoFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        streamId: "",
        videoFile: "",
        scheduleType: "once" as 'recurring' | 'once',
        days: [] as string[],
        specificDate: "",
        startTime: "",
        endTime: "",
    });

    // Fetch schedules and streams
    useEffect(() => {
        fetchData();
        // Refresh every 10 seconds
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const [schedulesRes, streamsRes, videosRes] = await Promise.all([
                fetch(`${API_URL}/api/schedules`),
                fetch(`${API_URL}/api/streams`),
                fetch(`${API_URL}/api/videos`)
            ]);

            if (schedulesRes.ok) {
                const data = await schedulesRes.json();
                setSchedules(data);
            }

            if (streamsRes.ok) {
                const data = await streamsRes.json();
                setStreams(data);
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

    // Manual start stream from schedule
    const manualStartStream = async (schedule: Schedule) => {
        const stream = streams.find(s => s.id === schedule.streamId);
        if (!stream) {
            alert("Stream tidak ditemukan!");
            return;
        }

        if (stream.isRunning) {
            alert("Stream sudah berjalan!");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/streams/${stream.id}/start`, {
                method: "POST"
            });

            if (response.ok) {
                alert(`✅ Stream "${stream.title}" berhasil dimulai!`);
                await fetchData();
            } else {
                const error = await response.json();
                alert(error.error || "Gagal memulai stream");
            }
        } catch (error) {
            console.error("Error starting stream:", error);
            alert("Gagal menghubungi server");
        }
    };

    // Manual stop stream
    const manualStopStream = async (schedule: Schedule) => {
        const stream = streams.find(s => s.id === schedule.streamId);
        if (!stream) {
            alert("Stream tidak ditemukan!");
            return;
        }

        if (!stream.isRunning) {
            alert("Stream tidak sedang berjalan!");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/streams/${stream.id}/stop`, {
                method: "POST"
            });

            if (response.ok) {
                alert(`⏹️ Stream "${stream.title}" berhasil dihentikan!`);
                await fetchData();
            } else {
                const error = await response.json();
                alert(error.error || "Gagal menghentikan stream");
            }
        } catch (error) {
            console.error("Error stopping stream:", error);
            alert("Gagal menghubungi server");
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
                streamId: schedule.streamId.toString(),
                videoFile: schedule.videoFile || "",
                scheduleType: schedule.scheduleType || 'once',
                days: schedule.days || [],
                specificDate: schedule.specificDate || "",
                startTime: schedule.startTime,
                endTime: schedule.endTime,
            });
        } else {
            setEditingSchedule(null);
            // Set default date to today
            const today = new Date().toISOString().split('T')[0];
            setFormData({
                title: "",
                streamId: "",
                videoFile: "",
                scheduleType: "once",
                days: [],
                specificDate: today,
                startTime: "",
                endTime: ""
            });
        }
        setShowModal(true);
    };

    const saveSchedule = async () => {
        if (!formData.title || !formData.streamId || !formData.startTime || !formData.endTime) {
            alert("Lengkapi semua field!");
            return;
        }

        if (formData.scheduleType === 'recurring' && formData.days.length === 0) {
            alert("Pilih minimal 1 hari untuk jadwal berulang!");
            return;
        }

        if (formData.scheduleType === 'once' && !formData.specificDate) {
            alert("Pilih tanggal untuk jadwal!");
            return;
        }

        try {
            const payload = {
                ...formData,
                streamId: parseInt(formData.streamId)
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

    const toggleDay = (day: string) => {
        setFormData({
            ...formData,
            days: formData.days.includes(day)
                ? formData.days.filter((d) => d !== day)
                : [...formData.days, day],
        });
    };

    const getStreamInfo = (streamId: number) => {
        return streams.find(s => s.id === streamId);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
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
                    <h1 className="text-2xl md:text-3xl font-bold">Jadwal Stream</h1>
                    <p className="text-gray-400 mt-1">Atur jadwal otomatis untuk live streaming.</p>
                </div>
                <button onClick={() => openModal()} className="btn-primary">
                    + Tambah Jadwal
                </button>
            </div>

            {/* Info Cards */}
            <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4">
                    <p className="text-indigo-400 text-sm">
                        📅 <strong>Jadwal Sekali:</strong> Stream akan berjalan pada tanggal dan jam tertentu
                    </p>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                    <p className="text-green-400 text-sm">
                        🔁 <strong>Jadwal Berulang:</strong> Stream akan berjalan di hari-hari yang dipilih setiap minggu
                    </p>
                </div>
            </div>

            {/* Schedule List */}
            <div className="space-y-4">
                {schedules.map((schedule) => {
                    const stream = getStreamInfo(schedule.streamId);
                    const isStreamRunning = stream?.isRunning || false;

                    return (
                        <div key={schedule.id} className={`card ${!schedule.active && "opacity-60"}`}>
                            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                {/* Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                                        <h3 className="font-semibold text-lg">{schedule.title}</h3>
                                        <span className={`text-xs px-2 py-1 rounded-full ${schedule.active
                                            ? "bg-green-500/20 text-green-400"
                                            : "bg-gray-500/20 text-gray-400"
                                            }`}>
                                            {schedule.active ? "Aktif" : "Nonaktif"}
                                        </span>
                                        {isStreamRunning && (
                                            <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400 flex items-center gap-1">
                                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                                LIVE
                                            </span>
                                        )}
                                        <span className={`text-xs px-2 py-1 rounded-full ${schedule.scheduleType === 'once'
                                                ? "bg-blue-500/20 text-blue-400"
                                                : "bg-purple-500/20 text-purple-400"
                                            }`}>
                                            {schedule.scheduleType === 'once' ? '📅 Sekali' : '🔁 Berulang'}
                                        </span>
                                    </div>

                                    <p className="text-gray-500 text-sm mb-1">
                                        📺 {stream?.title || "Stream tidak ditemukan"}
                                    </p>

                                    {schedule.videoFile && (
                                        <p className="text-gray-500 text-sm mb-2">
                                            🎬 Video: {schedule.videoFile}
                                        </p>
                                    )}

                                    {/* Schedule timing */}
                                    {schedule.scheduleType === 'once' && schedule.specificDate ? (
                                        <div className="bg-blue-500/10 rounded-lg px-3 py-2 mb-2 inline-block">
                                            <p className="text-blue-400 text-sm font-medium">
                                                📆 {formatDate(schedule.specificDate)}
                                            </p>
                                            <p className="text-blue-300 text-sm">
                                                ⏰ {schedule.startTime} - {schedule.endTime}
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {Object.keys(dayLabels).map((day) => (
                                                    <span
                                                        key={day}
                                                        className={`text-xs px-2 py-1 rounded ${schedule.days?.includes(day)
                                                            ? "bg-indigo-500/20 text-indigo-400"
                                                            : "bg-gray-800 text-gray-600"
                                                            }`}
                                                    >
                                                        {dayLabels[day]}
                                                    </span>
                                                ))}
                                            </div>
                                            <p className="text-gray-400 text-sm">
                                                ⏰ {schedule.startTime} - {schedule.endTime}
                                            </p>
                                        </>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex flex-wrap gap-2">
                                    {/* Manual Start/Stop */}
                                    {isStreamRunning ? (
                                        <button
                                            onClick={() => manualStopStream(schedule)}
                                            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 font-medium transition-colors"
                                        >
                                            ⏹️ Stop Manual
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => manualStartStream(schedule)}
                                            className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 font-medium transition-colors"
                                        >
                                            ▶️ Start Manual
                                        </button>
                                    )}

                                    <button
                                        onClick={() => toggleSchedule(schedule.id)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${schedule.active
                                            ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                                            : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                                            }`}
                                    >
                                        {schedule.active ? "⏸️ Pause" : "▶️ Aktifkan"}
                                    </button>
                                    <button
                                        onClick={() => openModal(schedule)}
                                        className="px-4 py-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 transition-colors"
                                    >
                                        ✏️ Edit
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
                        <h3 className="text-xl font-semibold mb-2">Belum ada jadwal</h3>
                        <p className="text-gray-400 mb-4">Buat jadwal untuk mengotomasi live streaming kamu</p>
                        <button onClick={() => openModal()} className="btn-primary">
                            + Tambah Jadwal
                        </button>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">
                            {editingSchedule ? "Edit Jadwal" : "Tambah Jadwal Baru"}
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Nama Jadwal
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white placeholder-gray-500"
                                    placeholder="Contoh: Morning Jazz"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Pilih Stream
                                </label>
                                <select
                                    value={formData.streamId}
                                    onChange={(e) => setFormData({ ...formData, streamId: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white"
                                >
                                    <option value="">-- Pilih Stream --</option>
                                    {streams.map(stream => (
                                        <option key={stream.id} value={stream.id}>
                                            {stream.title} ({stream.platform})
                                        </option>
                                    ))}
                                </select>
                                {streams.length === 0 && (
                                    <p className="text-yellow-400 text-xs mt-1">
                                        ⚠️ Belum ada stream. Buat stream terlebih dahulu.
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    🎬 Pilih Video (Opsional)
                                </label>
                                <select
                                    value={formData.videoFile}
                                    onChange={(e) => setFormData({ ...formData, videoFile: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white"
                                >
                                    <option value="">-- Gunakan video dari stream --</option>
                                    {videos.map(video => (
                                        <option key={video.name} value={video.name}>
                                            📹 {video.name} ({video.sizeFormatted})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Schedule Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Tipe Jadwal
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, scheduleType: 'once' })}
                                        className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${formData.scheduleType === 'once'
                                                ? "bg-blue-500 text-white"
                                                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                                            }`}
                                    >
                                        📅 Sekali (Tanggal)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, scheduleType: 'recurring' })}
                                        className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${formData.scheduleType === 'recurring'
                                                ? "bg-purple-500 text-white"
                                                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                                            }`}
                                    >
                                        🔁 Berulang (Hari)
                                    </button>
                                </div>
                            </div>

                            {/* Date/Day Selection */}
                            {formData.scheduleType === 'once' ? (
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        📆 Pilih Tanggal
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.specificDate}
                                        onChange={(e) => setFormData({ ...formData, specificDate: e.target.value })}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white"
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Pilih Hari (Setiap Minggu)
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(dayLabels).map(([day, label]) => (
                                            <button
                                                key={day}
                                                type="button"
                                                onClick={() => toggleDay(day)}
                                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${formData.days.includes(day)
                                                    ? "bg-indigo-500 text-white"
                                                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                                                    }`}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Jam Mulai
                                    </label>
                                    <input
                                        type="time"
                                        value={formData.startTime}
                                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Jam Selesai
                                    </label>
                                    <input
                                        type="time"
                                        value={formData.endTime}
                                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={() => setShowModal(false)}
                                className="btn-secondary flex-1"
                            >
                                Batal
                            </button>
                            <button onClick={saveSchedule} className="btn-primary flex-1">
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
