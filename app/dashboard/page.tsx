"use client";

import Link from "next/link";

// Mock data for demo
const stats = [
    { label: "Total Streams", value: "12", icon: "📺", change: "+2", positive: true },
    { label: "Live Sekarang", value: "3", icon: "🔴", change: "0", positive: true },
    { label: "Total Views", value: "45.2K", icon: "👁️", change: "+12%", positive: true },
    { label: "Jam Live", value: "312h", icon: "⏱️", change: "+48h", positive: true },
];

const recentStreams = [
    { id: 1, title: "Relaxing Piano Music 24/7", platform: "YouTube", status: "live", viewers: 127, duration: "24h 15m" },
    { id: 2, title: "Rain Sounds for Sleep", platform: "YouTube", status: "live", viewers: 89, duration: "12h 30m" },
    { id: 3, title: "Lo-Fi Study Beats", platform: "Facebook", status: "live", viewers: 45, duration: "8h 45m" },
    { id: 4, title: "Nature Sounds", platform: "YouTube", status: "scheduled", viewers: 0, duration: "Starts in 2h" },
    { id: 5, title: "ASMR Typing", platform: "YouTube", status: "stopped", viewers: 0, duration: "Ended 3h ago" },
];

const activityLog = [
    { time: "2 menit lalu", action: "Stream dimulai", stream: "Relaxing Piano Music 24/7" },
    { time: "1 jam lalu", action: "Video diupload", stream: "ocean-waves.mp4" },
    { time: "3 jam lalu", action: "Stream dihentikan", stream: "Morning Jazz" },
    { time: "5 jam lalu", action: "Jadwal dibuat", stream: "Night Ambience" },
];

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
                    <p className="text-gray-400 mt-1">Selamat datang kembali! Ini ringkasan streaming kamu.</p>
                </div>
                <Link href="/dashboard/upload" className="btn-primary text-center">
                    + Tambah Stream Baru
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <div key={index} className="card">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">{stat.label}</p>
                                <p className="text-2xl md:text-3xl font-bold mt-1">{stat.value}</p>
                            </div>
                            <span className="text-2xl">{stat.icon}</span>
                        </div>
                        <p className={`text-sm mt-2 ${stat.positive ? "text-green-400" : "text-red-400"}`}>
                            {stat.change} dari kemarin
                        </p>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Recent Streams */}
                <div className="lg:col-span-2 card">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Stream Terbaru</h2>
                        <Link href="/dashboard/streams" className="text-indigo-400 hover:text-indigo-300 text-sm">
                            Lihat Semua →
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-gray-500 text-sm border-b border-gray-800">
                                    <th className="pb-3 font-medium">Judul</th>
                                    <th className="pb-3 font-medium hidden sm:table-cell">Platform</th>
                                    <th className="pb-3 font-medium">Status</th>
                                    <th className="pb-3 font-medium hidden md:table-cell">Viewers</th>
                                    <th className="pb-3 font-medium hidden lg:table-cell">Durasi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {recentStreams.map((stream) => (
                                    <tr key={stream.id} className="hover:bg-gray-800/50 transition-colors">
                                        <td className="py-3">
                                            <div className="font-medium truncate max-w-[200px]">{stream.title}</div>
                                        </td>
                                        <td className="py-3 hidden sm:table-cell">
                                            <span className={`text-sm ${stream.platform === "YouTube" ? "text-red-400" : "text-blue-400"}`}>
                                                {stream.platform}
                                            </span>
                                        </td>
                                        <td className="py-3">
                                            <span className={`
                        inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                        ${stream.status === "live" ? "bg-green-500/20 text-green-400" :
                                                    stream.status === "scheduled" ? "bg-yellow-500/20 text-yellow-400" :
                                                        "bg-gray-500/20 text-gray-400"}
                      `}>
                                                {stream.status === "live" && <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>}
                                                {stream.status === "live" ? "Live" : stream.status === "scheduled" ? "Terjadwal" : "Berhenti"}
                                            </span>
                                        </td>
                                        <td className="py-3 hidden md:table-cell text-gray-400">
                                            {stream.viewers > 0 ? stream.viewers.toLocaleString() : "-"}
                                        </td>
                                        <td className="py-3 hidden lg:table-cell text-gray-400 text-sm">
                                            {stream.duration}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Activity Log */}
                <div className="card">
                    <h2 className="text-lg font-semibold mb-4">Aktivitas Terbaru</h2>
                    <div className="space-y-4">
                        {activityLog.map((activity, index) => (
                            <div key={index} className="flex gap-3">
                                <div className="w-2 h-2 mt-2 rounded-full bg-indigo-500 flex-shrink-0"></div>
                                <div className="min-w-0">
                                    <p className="text-sm">
                                        <span className="text-gray-400">{activity.action}:</span>{" "}
                                        <span className="font-medium truncate">{activity.stream}</span>
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
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
                    <Link href="/dashboard/schedule" className="p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors text-center">
                        <span className="text-3xl block mb-2">📅</span>
                        <span className="text-sm text-gray-300">Atur Jadwal</span>
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
