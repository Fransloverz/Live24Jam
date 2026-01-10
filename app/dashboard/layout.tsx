"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface User {
    id: number;
    username: string;
    email: string;
    role: string;
}

const menuItems = [
    { name: "Dashboard", icon: "📊", href: "/dashboard" },
    { name: "Live Streams", icon: "📺", href: "/dashboard/streams" },
    { name: "Upload Video", icon: "📤", href: "/dashboard/upload" },
    { name: "Video Library", icon: "📁", href: "/dashboard/videos" },
    { name: "Stream Logs", icon: "📋", href: "/dashboard/logs" },
    { name: "Jadwal", icon: "📅", href: "/dashboard/schedule" },
    { name: "Pengaturan", icon: "⚙️", href: "/dashboard/settings" },
];

function Sidebar({ isOpen, onClose, user, onLogout }: {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onLogout: () => void;
}) {
    const pathname = usePathname();

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed top-0 left-0 h-full w-64 bg-gray-900 border-r border-gray-800 z-50
        transform transition-transform duration-300 ease-in-out flex flex-col
        lg:translate-x-0 lg:static
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
                {/* Logo */}
                <div className="p-6 border-b border-gray-800 flex-shrink-0">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">24</span>
                        </div>
                        <span className="text-xl font-bold text-white">Live24Jam</span>
                    </Link>
                </div>

                {/* Menu - Scrollable Area */}
                <nav className="p-4 flex-1 overflow-y-auto">
                    <ul className="space-y-2">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        onClick={onClose}
                                        className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                      ${isActive
                                                ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                                                : "text-gray-400 hover:bg-gray-800 hover:text-white"
                                            }
                    `}
                                    >
                                        <span className="text-xl">{item.icon}</span>
                                        <span className="font-medium">{item.name}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* User Info - Fixed at Bottom */}
                <div className="p-4 border-t border-gray-800 flex-shrink-0 bg-gray-900">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                            {user?.username?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-medium text-white truncate">{user?.username || "Guest"}</div>
                            <div className="text-xs text-gray-500 truncate">{user?.email || "Not logged in"}</div>
                        </div>
                        <button
                            onClick={onLogout}
                            className="text-gray-400 hover:text-red-400 p-2 transition-colors"
                            title="Logout"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}

function Header({ onMenuClick, user }: { onMenuClick: () => void; user: User | null }) {
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update clock every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('id-ID', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });
    };

    return (
        <header className="h-16 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-30">
            <div className="h-full px-4 flex items-center justify-between">
                {/* Mobile Menu Button */}
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 text-gray-400 hover:text-white"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                {/* Real-time Clock */}
                <div className="flex items-center gap-2 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-lg px-3 py-1.5">
                    <span className="text-lg">🕐</span>
                    <div className="text-center">
                        <div className="text-lg font-bold font-mono text-indigo-400 leading-tight">
                            {formatTime(currentTime)}
                        </div>
                        <div className="text-[10px] text-gray-400 leading-tight">
                            {formatDate(currentTime)}
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="hidden md:flex flex-1 max-w-md mx-4">
                    <div className="relative w-full">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="search"
                            placeholder="Cari stream..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white placeholder-gray-500"
                        />
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    {user && (
                        <span className="hidden sm:block text-sm text-gray-400">
                            👋 Halo, <span className="text-indigo-400 font-medium">{user.username}</span>
                        </span>
                    )}
                    <button className="relative p-2 text-gray-400 hover:text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>
                    <Link href="/dashboard/streams" className="btn-primary text-sm py-2 px-4 hidden sm:block">
                        + New Stream
                    </Link>
                </div>
            </div>
        </header>
    );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check authentication
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        if (!token || !userData) {
            // Not logged in, redirect to login
            router.push("/login");
            return;
        }

        // Verify token with server
        fetch(`${API_URL}/api/auth/verify`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                if (res.ok) {
                    return res.json();
                }
                throw new Error("Invalid token");
            })
            .then(data => {
                setUser(data.user);
                setLoading(false);
            })
            .catch(() => {
                // Token invalid, clear and redirect
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                router.push("/login");
            });
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-950">
                <div className="text-center">
                    <div className="animate-spin text-5xl mb-4">⏳</div>
                    <p className="text-gray-400">Memverifikasi sesi...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex">
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                user={user}
                onLogout={handleLogout}
            />
            <div className="flex-1 flex flex-col min-w-0">
                <Header onMenuClick={() => setSidebarOpen(true)} user={user} />
                <main className="flex-1 p-4 md:p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
