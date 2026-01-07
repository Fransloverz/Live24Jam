"use client";

import { useState } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Store token and user info
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                window.location.href = "/dashboard";
            } else {
                setError(data.error || "Login gagal");
                setIsLoading(false);
            }
        } catch (err) {
            setError("Gagal terhubung ke server");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-pink-900/20"></div>
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full filter blur-3xl"></div>

            <div className="relative z-10 w-full max-w-md px-6">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">24</span>
                        </div>
                        <span className="text-2xl font-bold text-white">Live24Jam</span>
                    </Link>
                    <p className="text-gray-400 mt-2">Masuk ke akun kamu</p>
                </div>
                {/* Login Form */}
                <div className="card p-8">
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                            ⚠️ {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                                Username
                            </label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white placeholder-gray-500 transition-colors"
                                placeholder="username"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white placeholder-gray-500 transition-colors"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-indigo-500 focus:ring-indigo-500" />
                                <span className="ml-2 text-sm text-gray-400">Ingat saya</span>
                            </label>
                            <a href="#" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                                Lupa password?
                            </a>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Memproses...
                                </>
                            ) : (
                                "Masuk"
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-400">
                            Belum punya akun?{" "}
                            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                                Daftar sekarang
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Back to Home */}
                <div className="text-center mt-6">
                    <Link href="/" className="text-gray-500 hover:text-gray-400 transition-colors text-sm">
                        ← Kembali ke beranda
                    </Link>
                </div>
            </div>
        </div>
    );
}
