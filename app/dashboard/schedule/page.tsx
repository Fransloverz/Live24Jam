"use client";

import { useState } from "react";

// Mock data for scheduled streams
const initialSchedule = [
    { id: 1, title: "Morning Jazz", days: ["mon", "tue", "wed", "thu", "fri"], startTime: "06:00", endTime: "10:00", active: true },
    { id: 2, title: "Relaxing Piano", days: ["sat", "sun"], startTime: "08:00", endTime: "22:00", active: true },
    { id: 3, title: "Night Ambience", days: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"], startTime: "22:00", endTime: "06:00", active: true },
    { id: 4, title: "Study Music", days: ["mon", "wed", "fri"], startTime: "14:00", endTime: "18:00", active: false },
];

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
    const [schedules, setSchedules] = useState(initialSchedule);
    const [showModal, setShowModal] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<typeof initialSchedule[0] | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        days: [] as string[],
        startTime: "",
        endTime: "",
    });

    const toggleSchedule = (id: number) => {
        setSchedules(schedules.map((s) =>
            s.id === id ? { ...s, active: !s.active } : s
        ));
    };

    const deleteSchedule = (id: number) => {
        if (confirm("Yakin mau hapus jadwal ini?")) {
            setSchedules(schedules.filter((s) => s.id !== id));
        }
    };

    const openModal = (schedule?: typeof initialSchedule[0]) => {
        if (schedule) {
            setEditingSchedule(schedule);
            setFormData({
                title: schedule.title,
                days: schedule.days,
                startTime: schedule.startTime,
                endTime: schedule.endTime,
            });
        } else {
            setEditingSchedule(null);
            setFormData({ title: "", days: [], startTime: "", endTime: "" });
        }
        setShowModal(true);
    };

    const saveSchedule = () => {
        if (!formData.title || formData.days.length === 0 || !formData.startTime || !formData.endTime) {
            alert("Lengkapi semua field!");
            return;
        }

        if (editingSchedule) {
            setSchedules(schedules.map((s) =>
                s.id === editingSchedule.id ? { ...s, ...formData } : s
            ));
        } else {
            setSchedules([...schedules, {
                id: Date.now(),
                ...formData,
                active: true,
            }]);
        }
        setShowModal(false);
    };

    const toggleDay = (day: string) => {
        setFormData({
            ...formData,
            days: formData.days.includes(day)
                ? formData.days.filter((d) => d !== day)
                : [...formData.days, day],
        });
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Jadwal Stream</h1>
                    <p className="text-gray-400 mt-1">Atur jadwal otomatis untuk live streaming kamu.</p>
                </div>
                <button onClick={() => openModal()} className="btn-primary">
                    + Tambah Jadwal
                </button>
            </div>

            {/* Schedule List */}
            <div className="space-y-4">
                {schedules.map((schedule) => (
                    <div key={schedule.id} className={`card ${!schedule.active && "opacity-60"}`}>
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                            {/* Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="font-semibold text-lg">{schedule.title}</h3>
                                    <span className={`text-xs px-2 py-1 rounded-full ${schedule.active
                                            ? "bg-green-500/20 text-green-400"
                                            : "bg-gray-500/20 text-gray-400"
                                        }`}>
                                        {schedule.active ? "Aktif" : "Nonaktif"}
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-2">
                                    {Object.keys(dayLabels).map((day) => (
                                        <span
                                            key={day}
                                            className={`text-xs px-2 py-1 rounded ${schedule.days.includes(day)
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
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => toggleSchedule(schedule.id)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${schedule.active
                                            ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                                            : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                                        }`}
                                >
                                    {schedule.active ? "Pause" : "Aktifkan"}
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
                ))}

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
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">
                            {editingSchedule ? "Edit Jadwal" : "Tambah Jadwal Baru"}
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Nama Stream
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
                                    Hari
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
