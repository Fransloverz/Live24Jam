"use client";

import { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface SystemInfo {
    cpu: { cores: number; model: string; usage: number; speedGHz: string };
    memory: { total: number; used: number; free: number; usagePercent: number; totalGB: string; usedGB: string; freeGB: string };
    disk: { total: number; used: number; free: number; usagePercent: number; totalGB: string; usedGB: string; freeGB: string };
    network: { interfaces: { name: string; ip: string; mac: string }[]; primaryIP: string };
    system: { platform: string; arch: string; uptime: number; uptimeFormatted: string; hostname: string };
}

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
    const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
    const [streams, setStreams] = useState<{ total: number; running: number }>({ total: 0, running: 0 });

    // Password change state
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    // Fetch system info
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [sysRes, streamsRes] = await Promise.all([
                    fetch(`${API_URL}/api/system`),
                    fetch(`${API_URL}/api/streams`)
                ]);
                if (sysRes.ok) {
                    const sysData = await sysRes.json();
                    setSystemInfo(sysData);
                }
                if (streamsRes.ok) {
                    const streamsData = await streamsRes.json();
                    const running = streamsData.filter((s: { isRunning: boolean }) => s.isRunning).length;
                    setStreams({ total: streamsData.length, running });
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    // Handle password change
    const handlePasswordChange = async () => {
        setPasswordError("");
        setPasswordSuccess(false);

        if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
            setPasswordError("Semua field harus diisi");
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            setPasswordError("Password baru minimal 6 karakter");
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError("Konfirmasi password tidak cocok");
            return;
        }

        setPasswordLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/api/auth/change-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                setPasswordSuccess(true);
                setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                setTimeout(() => {
                    setShowPasswordModal(false);
                    setPasswordSuccess(false);
                }, 2000);
            } else {
                setPasswordError(data.error || "Gagal mengubah password");
            }
        } catch (error) {
            setPasswordError("Gagal menghubungi server");
        } finally {
            setPasswordLoading(false);
        }
    };

    const tabs = [
        { id: "profile", label: "👤 Profil", icon: "👤" },
        { id: "channels", label: "📺 Channel", icon: "📺" },
        { id: "notifications", label: "🔔 Notifikasi", icon: "🔔" },
        { id: "server", label: "🖥️ Server", icon: "🖥️" },
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
                    <button onClick={() => setShowPasswordModal(true)} className="btn-secondary">Ganti Password</button>
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

            {/* Server Tab - Real VPS Stats */}
            {activeTab === "server" && (
                <div className="space-y-4">
                    {/* Server Status */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-lg">🖥️ Status Server</h2>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                <span className="text-green-400 text-sm">Online</span>
                            </div>
                        </div>

                        {systemInfo ? (
                            <div className="grid md:grid-cols-2 gap-4">
                                {/* Hostname & IP */}
                                <div className="p-4 bg-gray-800/50 rounded-lg">
                                    <div className="text-gray-400 text-sm mb-1">Hostname</div>
                                    <div className="font-medium">{systemInfo.system.hostname}</div>
                                    <div className="text-gray-500 text-sm mt-1">{systemInfo.network.primaryIP}</div>
                                </div>

                                {/* Uptime */}
                                <div className="p-4 bg-gray-800/50 rounded-lg">
                                    <div className="text-gray-400 text-sm mb-1">Uptime</div>
                                    <div className="font-medium text-green-400">{systemInfo.system.uptimeFormatted}</div>
                                    <div className="text-gray-500 text-sm mt-1">{systemInfo.system.platform} ({systemInfo.system.arch})</div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <div className="animate-spin text-2xl mb-2">⏳</div>
                                Memuat info server...
                            </div>
                        )}
                    </div>

                    {/* Resource Usage */}
                    <div className="card">
                        <h2 className="font-semibold text-lg mb-4">📊 Penggunaan Resource</h2>

                        {systemInfo ? (
                            <div className="space-y-6">
                                {/* CPU */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">⚡</span>
                                            <span className="font-medium">CPU</span>
                                            <span className="text-gray-500 text-sm">({systemInfo.cpu.cores} Cores)</span>
                                        </div>
                                        <span className={`font-bold ${systemInfo.cpu.usage < 50 ? 'text-green-400' : systemInfo.cpu.usage < 80 ? 'text-yellow-400' : 'text-red-400'}`}>
                                            {systemInfo.cpu.usage.toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-800 rounded-full h-3">
                                        <div
                                            className={`h-3 rounded-full transition-all ${systemInfo.cpu.usage < 50 ? 'bg-green-500' : systemInfo.cpu.usage < 80 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                            style={{ width: `${Math.min(systemInfo.cpu.usage, 100)}%` }}
                                        />
                                    </div>
                                    <div className="text-gray-500 text-xs mt-1">{systemInfo.cpu.model}</div>
                                </div>

                                {/* RAM */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">🧠</span>
                                            <span className="font-medium">RAM</span>
                                        </div>
                                        <span className={`font-bold ${systemInfo.memory.usagePercent < 50 ? 'text-green-400' : systemInfo.memory.usagePercent < 80 ? 'text-yellow-400' : 'text-red-400'}`}>
                                            {systemInfo.memory.usagePercent.toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-800 rounded-full h-3">
                                        <div
                                            className={`h-3 rounded-full transition-all ${systemInfo.memory.usagePercent < 50 ? 'bg-green-500' : systemInfo.memory.usagePercent < 80 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                            style={{ width: `${systemInfo.memory.usagePercent}%` }}
                                        />
                                    </div>
                                    <div className="text-gray-500 text-xs mt-1">
                                        {systemInfo.memory.usedGB} GB / {systemInfo.memory.totalGB} GB
                                    </div>
                                </div>

                                {/* Storage */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">💾</span>
                                            <span className="font-medium">Storage</span>
                                        </div>
                                        <span className={`font-bold ${systemInfo.disk.usagePercent < 50 ? 'text-green-400' : systemInfo.disk.usagePercent < 80 ? 'text-yellow-400' : 'text-red-400'}`}>
                                            {systemInfo.disk.usagePercent.toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-800 rounded-full h-3">
                                        <div
                                            className={`h-3 rounded-full transition-all ${systemInfo.disk.usagePercent < 50 ? 'bg-green-500' : systemInfo.disk.usagePercent < 80 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                            style={{ width: `${systemInfo.disk.usagePercent}%` }}
                                        />
                                    </div>
                                    <div className="text-gray-500 text-xs mt-1">
                                        {systemInfo.disk.usedGB} GB / {systemInfo.disk.totalGB} GB
                                        <span className="text-green-400 ml-2">({systemInfo.disk.freeGB} GB tersedia)</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <div className="animate-spin text-2xl mb-2">⏳</div>
                                Memuat resource...
                            </div>
                        )}
                    </div>

                    {/* Streaming Stats */}
                    <div className="card">
                        <h2 className="font-semibold text-lg mb-4">🎬 Statistik Streaming</h2>
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="p-4 bg-gray-800/50 rounded-lg text-center">
                                <div className="text-3xl font-bold text-indigo-400">{streams.running}</div>
                                <div className="text-gray-400 text-sm">Stream Aktif</div>
                            </div>
                            <div className="p-4 bg-gray-800/50 rounded-lg text-center">
                                <div className="text-3xl font-bold text-green-400">{streams.total}</div>
                                <div className="text-gray-400 text-sm">Total Stream</div>
                            </div>
                            <div className="p-4 bg-gray-800/50 rounded-lg text-center">
                                <div className="text-3xl font-bold text-orange-400">∞</div>
                                <div className="text-gray-400 text-sm">Tanpa Batas</div>
                            </div>
                        </div>

                        <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                            <div className="flex items-center gap-2 text-green-400">
                                <span>✓</span>
                                <span className="font-medium">Self-Hosted - Tidak ada batasan paket!</span>
                            </div>
                            <p className="text-gray-400 text-sm mt-1">
                                Live24Jam berjalan di VPS Anda sendiri. Semua fitur unlimited.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Password Change Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">🔐 Ganti Password</h2>

                        {passwordSuccess ? (
                            <div className="text-center py-8">
                                <span className="text-6xl block mb-4">✅</span>
                                <p className="text-green-400 font-medium">Password berhasil diubah!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {passwordError && (
                                    <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                                        {passwordError}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Password Lama
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordForm.currentPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white"
                                        placeholder="Masukkan password lama"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Password Baru
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white"
                                        placeholder="Minimal 6 karakter"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Konfirmasi Password Baru
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white"
                                        placeholder="Ulangi password baru"
                                    />
                                </div>

                                <div className="flex gap-4 mt-6">
                                    <button
                                        onClick={() => {
                                            setShowPasswordModal(false);
                                            setPasswordError("");
                                            setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                                        }}
                                        className="btn-secondary flex-1"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handlePasswordChange}
                                        disabled={passwordLoading}
                                        className="btn-primary flex-1 disabled:opacity-50"
                                    >
                                        {passwordLoading ? "⏳ Menyimpan..." : "Simpan"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
