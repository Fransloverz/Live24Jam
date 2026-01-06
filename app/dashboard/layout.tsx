"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const menuItems = [
    { name: "Dashboard", icon: "📊", href: "/dashboard" },
    { name: "Live Streams", icon: "📺", href: "/dashboard/streams" },
    { name: "Upload Video", icon: "📤", href: "/dashboard/upload" },
    { name: "Jadwal", icon: "📅", href: "/dashboard/schedule" },
    { name: "Pengaturan", icon: "⚙️", href: "/dashboard/settings" },
];

function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
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
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
                {/* Logo */}
                <div className="p-6 border-b border-gray-800">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">24</span>
                        </div>
                        <span className="text-xl font-bold text-white">Live24Jam</span>
                    </Link>
                </div>

                {/* Menu */}
                <nav className="p-4">
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

                {/* User Info */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                            U
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-medium text-white truncate">User Demo</div>
                            <div className="text-xs text-gray-500 truncate">user@demo.com</div>
                        </div>
                        <Link href="/login" className="text-gray-400 hover:text-white p-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </aside>
        </>
    );
}

function Header({ onMenuClick }: { onMenuClick: () => void }) {
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
                    <button className="relative p-2 text-gray-400 hover:text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>
                    <Link href="/dashboard/upload" className="btn-primary text-sm py-2 px-4 hidden sm:block">
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

    return (
        <div className="min-h-screen flex">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="flex-1 flex flex-col min-w-0">
                <Header onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 p-4 md:p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
