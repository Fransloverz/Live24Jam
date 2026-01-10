"use client";

import Link from "next/link";

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                            <span className="text-white font-bold text-xl">24</span>
                        </div>
                        <span className="text-2xl font-bold text-white">Live24Jam</span>
                    </Link>
                </div>

                {/* Card */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 text-center">
                    <span className="text-6xl block mb-4">🔒</span>
                    <h1 className="text-2xl font-bold mb-4">Registrasi Ditutup</h1>
                    <p className="text-gray-400 mb-6">
                        Sistem ini hanya untuk penggunaan internal.
                        Hubungi admin jika Anda memerlukan akses.
                    </p>

                    <div className="space-y-3">
                        <a
                            href="https://wa.me/6288238880227"
                            target="_blank"
                            className="block w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-full font-medium transition-colors"
                        >
                            💬 Hubungi Admin
                        </a>
                        <Link
                            href="/login"
                            className="block w-full py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-full font-medium transition-colors"
                        >
                            Sudah punya akun? Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
