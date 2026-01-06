"use client";

import { useState } from "react";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("profile");
    const [profile, setProfile] = useState({
        name: "User Demo",
        email: "user@demo.com",
        phone: "+62 812-3456-7890",
    });
    const [channels, setChannels] = useState([
        { id: 1, platform: "youtube", name: "My YouTube Channel", connected: true },
        { id: 2, platform: "facebook", name: "My Facebook Page", connected: true },
    ]);
    const [notifications, setNotifications] = useState({
        email: true,
        whatsapp: true,
        streamStart: true,
        streamEnd: true,
        streamError: true,
    });

    const tabs = [
        { id: "profile", label: "👤 Profil", icon: "👤" },
        { id: "channels", label: "📺 Channel", icon: "📺" },
        { id: "notifications", label: "🔔 Notifikasi", icon: "🔔" },
        { id: "billing", label: "💳 Tagihan", icon: "💳" },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold">Pengaturan</h1>
                <p className="text-gray-400 mt-1">Kelola akun dan preferensi kamu.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.id
                                ? "bg-indigo-500 text-white"
                                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Profile Tab */}
            {activeTab === "profile" && (
                <div className="card">
                    <h2 className="font-semibold text-lg mb-6">Informasi Profil</h2>

                    <div className="flex items-center gap-6 mb-8">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-3xl text-white font-bold">
                            {profile.name.charAt(0)}
                        </div>
                        <div>
                            <button className="btn-secondary text-sm">Ganti Foto</button>
                        </div>
                    </div>

                    <div className="space-y-4 max-w-md">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Nama Lengkap
                            </label>
                            <input
                                type="text"
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={profile.email}
                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Nomor HP (WhatsApp)
                            </label>
                            <input
                                type="tel"
                                value={profile.phone}
                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white"
                            />
                        </div>

                        <div className="pt-4">
                            <button className="btn-primary">Simpan Perubahan</button>
                        </div>
                    </div>

                    <hr className="border-gray-800 my-8" />

                    <h3 className="font-semibold mb-4">Keamanan</h3>
                    <button className="btn-secondary">Ganti Password</button>
                </div>
            )}

            {/* Channels Tab */}
            {activeTab === "channels" && (
                <div className="space-y-4">
                    <div className="card">
                        <h2 className="font-semibold text-lg mb-4">Channel Terhubung</h2>
                        <div className="space-y-4">
                            {channels.map((channel) => (
                                <div key={channel.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <span className="text-3xl">
                                            {channel.platform === "youtube" ? "📺" : "📘"}
                                        </span>
                                        <div>
                                            <p className="font-medium">{channel.name}</p>
                                            <p className={`text-sm ${channel.connected ? "text-green-400" : "text-gray-400"}`}>
                                                {channel.connected ? "✓ Terhubung" : "Tidak terhubung"}
                                            </p>
                                        </div>
                                    </div>
                                    <button className={`px-4 py-2 rounded-lg text-sm font-medium ${channel.connected
                                            ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                            : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                                        }`}>
                                        {channel.connected ? "Putuskan" : "Hubungkan"}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card">
                        <h2 className="font-semibold text-lg mb-4">Tambah Channel Baru</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <button className="p-6 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors text-center">
                                <span className="text-4xl block mb-2">📺</span>
                                <span className="font-medium">YouTube</span>
                            </button>
                            <button className="p-6 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors text-center">
                                <span className="text-4xl block mb-2">📘</span>
                                <span className="font-medium">Facebook</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
                <div className="card">
                    <h2 className="font-semibold text-lg mb-6">Preferensi Notifikasi</h2>

                    <div className="space-y-6">
                        <div>
                            <h3 className="font-medium mb-4">Metode Notifikasi</h3>
                            <div className="space-y-3">
                                {[
                                    { key: "email", label: "Email", desc: "Terima notifikasi via email" },
                                    { key: "whatsapp", label: "WhatsApp", desc: "Terima notifikasi via WhatsApp" },
                                ].map((method) => (
                                    <label key={method.key} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg cursor-pointer">
                                        <div>
                                            <p className="font-medium">{method.label}</p>
                                            <p className="text-sm text-gray-400">{method.desc}</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={notifications[method.key as keyof typeof notifications]}
                                            onChange={(e) => setNotifications({ ...notifications, [method.key]: e.target.checked })}
                                            className="w-5 h-5 rounded border-gray-700 bg-gray-800 text-indigo-500 focus:ring-indigo-500"
                                        />
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="font-medium mb-4">Jenis Notifikasi</h3>
                            <div className="space-y-3">
                                {[
                                    { key: "streamStart", label: "Stream Dimulai", desc: "Notifikasi saat stream berhasil dimulai" },
                                    { key: "streamEnd", label: "Stream Berakhir", desc: "Notifikasi saat stream selesai" },
                                    { key: "streamError", label: "Error Stream", desc: "Notifikasi jika terjadi error pada stream" },
                                ].map((type) => (
                                    <label key={type.key} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg cursor-pointer">
                                        <div>
                                            <p className="font-medium">{type.label}</p>
                                            <p className="text-sm text-gray-400">{type.desc}</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={notifications[type.key as keyof typeof notifications]}
                                            onChange={(e) => setNotifications({ ...notifications, [type.key]: e.target.checked })}
                                            className="w-5 h-5 rounded border-gray-700 bg-gray-800 text-indigo-500 focus:ring-indigo-500"
                                        />
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button className="btn-primary">Simpan Preferensi</button>
                    </div>
                </div>
            )}

            {/* Billing Tab */}
            {activeTab === "billing" && (
                <div className="space-y-4">
                    {/* Current Plan */}
                    <div className="card">
                        <h2 className="font-semibold text-lg mb-4">Paket Saat Ini</h2>
                        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl border border-indigo-500/30">
                            <div>
                                <p className="text-2xl font-bold gradient-text">Set 2</p>
                                <p className="text-gray-400">Berlaku sampai: 6 Feb 2024</p>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-bold">Rp350k<span className="text-lg text-gray-400">/bln</span></p>
                                <button className="btn-secondary text-sm mt-2">Upgrade</button>
                            </div>
                        </div>
                    </div>

                    {/* Usage */}
                    <div className="card">
                        <h2 className="font-semibold text-lg mb-4">Penggunaan Bulan Ini</h2>
                        <div className="space-y-4">
                            {[
                                { label: "Live Streams", used: 12, max: 17, unit: "streams" },
                                { label: "Storage", used: 28, max: 37, unit: "GB" },
                                { label: "Bandwidth", used: "∞", max: "Unlimited", unit: "" },
                            ].map((item, index) => (
                                <div key={index}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-400">{item.label}</span>
                                        <span>{item.used} / {item.max} {item.unit}</span>
                                    </div>
                                    {typeof item.used === "number" && typeof item.max === "number" && (
                                        <div className="w-full bg-gray-800 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                                                style={{ width: `${(item.used / item.max) * 100}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Payment History */}
                    <div className="card">
                        <h2 className="font-semibold text-lg mb-4">Riwayat Pembayaran</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-gray-500 text-sm border-b border-gray-800">
                                        <th className="pb-3 font-medium">Tanggal</th>
                                        <th className="pb-3 font-medium">Deskripsi</th>
                                        <th className="pb-3 font-medium">Jumlah</th>
                                        <th className="pb-3 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {[
                                        { date: "6 Jan 2024", desc: "Set 2 - Januari 2024", amount: "Rp350.000", status: "paid" },
                                        { date: "6 Des 2023", desc: "Set 2 - Desember 2023", amount: "Rp350.000", status: "paid" },
                                        { date: "6 Nov 2023", desc: "Set 1 - November 2023", amount: "Rp200.000", status: "paid" },
                                    ].map((payment, index) => (
                                        <tr key={index}>
                                            <td className="py-3 text-gray-400">{payment.date}</td>
                                            <td className="py-3">{payment.desc}</td>
                                            <td className="py-3 font-medium">{payment.amount}</td>
                                            <td className="py-3">
                                                <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">
                                                    Lunas
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
