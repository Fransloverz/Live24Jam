"use client";

import { useState } from "react";
import Link from "next/link";

type UploadSource = "local" | "gdrive" | "url";

interface DriveFile {
    id: string;
    name: string;
    size: string;
    mimeType: string;
}

export default function UploadPage() {
    const [formData, setFormData] = useState({
        title: "",
        platform: "youtube",
        quality: "1080p",
        streamKey: "",
        scheduleEnabled: false,
        scheduleDate: "",
        scheduleTime: "",
        loop: true,
    });
    const [uploadSource, setUploadSource] = useState<UploadSource>("local");
    const [file, setFile] = useState<File | null>(null);
    const [driveFile, setDriveFile] = useState<DriveFile | null>(null);
    const [videoUrl, setVideoUrl] = useState("");
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showDrivePicker, setShowDrivePicker] = useState(false);
    const [driveConnected, setDriveConnected] = useState(false);

    // Mock Google Drive files for demo
    const mockDriveFiles: DriveFile[] = [
        { id: "1", name: "relaxing-piano-music.mp4", size: "256 MB", mimeType: "video/mp4" },
        { id: "2", name: "rain-sounds-asmr.mp4", size: "128 MB", mimeType: "video/mp4" },
        { id: "3", name: "lofi-beats-study.mp4", size: "512 MB", mimeType: "video/mp4" },
        { id: "4", name: "nature-forest-ambient.mp4", size: "384 MB", mimeType: "video/mp4" },
        { id: "5", name: "ocean-waves-sleep.mp4", size: "192 MB", mimeType: "video/mp4" },
    ];

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            setUploadSource("local");
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setUploadSource("local");
        }
    };

    const connectGoogleDrive = () => {
        // Simulate Google OAuth flow
        setDriveConnected(true);
        setShowDrivePicker(true);
    };

    const selectDriveFile = (driveFileItem: DriveFile) => {
        setDriveFile(driveFileItem);
        setFile(null);
        setVideoUrl("");
        setShowDrivePicker(false);
    };

    const clearSelection = () => {
        setFile(null);
        setDriveFile(null);
        setVideoUrl("");
    };

    const hasVideoSelected = file !== null || driveFile !== null || (uploadSource === "url" && videoUrl.trim() !== "");

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hasVideoSelected) {
            alert("Pilih video terlebih dahulu!");
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        try {
            if (uploadSource === "local" && file) {
                // Real file upload with progress
                const formDataUpload = new FormData();
                formDataUpload.append("video", file);

                const xhr = new XMLHttpRequest();

                xhr.upload.addEventListener("progress", (event) => {
                    if (event.lengthComputable) {
                        const percentComplete = (event.loaded / event.total) * 100;
                        setUploadProgress(percentComplete);
                    }
                });

                xhr.addEventListener("load", async () => {
                    if (xhr.status === 200) {
                        const result = JSON.parse(xhr.responseText);
                        alert(`Video "${result.file.name}" berhasil diupload! (${result.file.sizeFormatted})`);
                        window.location.href = "/dashboard/streams";
                    } else {
                        const error = JSON.parse(xhr.responseText);
                        alert(`Upload gagal: ${error.error}`);
                        setUploading(false);
                    }
                });

                xhr.addEventListener("error", () => {
                    alert("Upload gagal. Periksa koneksi internet Anda.");
                    setUploading(false);
                });

                xhr.open("POST", `${API_URL}/api/videos/upload`);
                xhr.send(formDataUpload);
            } else {
                // For Google Drive or URL - simulate for now
                let progress = 0;
                const interval = setInterval(() => {
                    progress += Math.random() * 15;
                    if (progress >= 100) {
                        progress = 100;
                        clearInterval(interval);
                        setTimeout(() => {
                            alert("Video berhasil dikonfigurasi! Stream akan segera dimulai.");
                            window.location.href = "/dashboard/streams";
                        }, 500);
                    }
                    setUploadProgress(progress);
                }, 300);
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert("Terjadi kesalahan saat upload");
            setUploading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold">Upload Video Baru</h1>
                <p className="text-gray-400 mt-1">Upload video yang akan di-loop untuk live streaming.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Video Upload */}
                <div className="card">
                    <h2 className="font-semibold mb-4">📤 Sumber Video</h2>

                    {/* Source Tabs */}
                    <div className="flex gap-2 mb-6 flex-wrap">
                        <button
                            type="button"
                            onClick={() => setUploadSource("local")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${uploadSource === "local"
                                ? "bg-indigo-500 text-white"
                                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                                }`}
                        >
                            <span>💻</span> Upload Lokal
                        </button>
                        <button
                            type="button"
                            onClick={() => setUploadSource("gdrive")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${uploadSource === "gdrive"
                                ? "bg-indigo-500 text-white"
                                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                                }`}
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M7.71 3.5L1.15 15l4.58 7.5h13.54l4.58-7.5L17.29 3.5H7.71zm-.25 1.5h5.79l-5.9 9.5H2.17l5.29-9.5zm6.75 0h2.08l5.29 9.5h-5.18l-2.19-3.5V5zm0 7.29l1.96 3.21H8.83l5.38-8.68v5.47z" />
                            </svg>
                            Google Drive
                        </button>
                        <button
                            type="button"
                            onClick={() => setUploadSource("url")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${uploadSource === "url"
                                ? "bg-indigo-500 text-white"
                                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                                }`}
                        >
                            <span>🔗</span> URL Video
                        </button>
                    </div>

                    {/* Local Upload */}
                    {uploadSource === "local" && (
                        <div
                            className={`
                border-2 border-dashed rounded-xl p-8 text-center transition-colors
                ${dragActive ? "border-indigo-500 bg-indigo-500/10" : "border-gray-700 hover:border-gray-600"}
                ${file ? "border-green-500 bg-green-500/10" : ""}
              `}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            {file ? (
                                <div>
                                    <span className="text-5xl block mb-4">✅</span>
                                    <p className="font-medium text-green-400">{file.name}</p>
                                    <p className="text-gray-400 text-sm mt-1">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                    <button
                                        type="button"
                                        onClick={clearSelection}
                                        className="mt-4 text-sm text-red-400 hover:text-red-300"
                                    >
                                        Hapus & pilih lagi
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <span className="text-5xl block mb-4">📁</span>
                                    <p className="font-medium mb-2">Drag & drop video di sini</p>
                                    <p className="text-gray-500 text-sm mb-4">atau</p>
                                    <label className="btn-secondary cursor-pointer inline-block">
                                        Pilih File
                                        <input
                                            type="file"
                                            accept="video/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </label>
                                    <p className="text-gray-500 text-xs mt-4">
                                        Format: MP4, MOV, AVI (Max 5GB)
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Google Drive */}
                    {uploadSource === "gdrive" && (
                        <div className="space-y-4">
                            {!driveConnected ? (
                                <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center">
                                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 via-green-500 to-yellow-500 rounded-2xl flex items-center justify-center">
                                        <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M7.71 3.5L1.15 15l4.58 7.5h13.54l4.58-7.5L17.29 3.5H7.71zm-.25 1.5h5.79l-5.9 9.5H2.17l5.29-9.5zm6.75 0h2.08l5.29 9.5h-5.18l-2.19-3.5V5zm0 7.29l1.96 3.21H8.83l5.38-8.68v5.47z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">Hubungkan Google Drive</h3>
                                    <p className="text-gray-400 text-sm mb-4">
                                        Akses video langsung dari Google Drive kamu tanpa perlu download ulang
                                    </p>
                                    <button
                                        type="button"
                                        onClick={connectGoogleDrive}
                                        className="btn-primary inline-flex items-center gap-2"
                                    >
                                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M7.71 3.5L1.15 15l4.58 7.5h13.54l4.58-7.5L17.29 3.5H7.71z" />
                                        </svg>
                                        Hubungkan Google Drive
                                    </button>
                                </div>
                            ) : driveFile ? (
                                <div className="border-2 border-green-500 bg-green-500/10 rounded-xl p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-green-500 to-yellow-500 rounded-lg flex items-center justify-center">
                                            <span className="text-2xl">🎬</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-green-400 truncate">{driveFile.name}</p>
                                            <p className="text-gray-400 text-sm">Google Drive • {driveFile.size}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => { setDriveFile(null); setShowDrivePicker(true); }}
                                            className="text-sm text-gray-400 hover:text-white"
                                        >
                                            Ganti
                                        </button>
                                    </div>
                                </div>
                            ) : showDrivePicker ? (
                                <div className="border border-gray-700 rounded-xl overflow-hidden">
                                    <div className="p-4 bg-gray-800/50 border-b border-gray-700 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M7.71 3.5L1.15 15l4.58 7.5h13.54l4.58-7.5L17.29 3.5H7.71z" />
                                            </svg>
                                            <span className="font-medium">Google Drive</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowDrivePicker(false)}
                                            className="text-gray-400 hover:text-white"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {mockDriveFiles.map((driveFileItem) => (
                                            <button
                                                key={driveFileItem.id}
                                                type="button"
                                                onClick={() => selectDriveFile(driveFileItem)}
                                                className="w-full flex items-center gap-3 p-3 hover:bg-gray-800/50 transition-colors text-left"
                                            >
                                                <span className="text-2xl">🎬</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate">{driveFileItem.name}</p>
                                                    <p className="text-gray-500 text-sm">{driveFileItem.size}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="p-3 bg-gray-800/30 border-t border-gray-700 text-center">
                                        <p className="text-gray-500 text-xs">
                                            Menampilkan file video dari Google Drive kamu
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center">
                                    <span className="text-5xl block mb-4">📂</span>
                                    <p className="font-medium mb-2">Pilih video dari Google Drive</p>
                                    <p className="text-gray-500 text-sm mb-4">
                                        Video akan streaming langsung dari Drive tanpa download
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setShowDrivePicker(true)}
                                        className="btn-secondary"
                                    >
                                        Buka Google Drive
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* URL Input */}
                    {uploadSource === "url" && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    URL Video
                                </label>
                                <input
                                    type="url"
                                    value={videoUrl}
                                    onChange={(e) => setVideoUrl(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white placeholder-gray-500"
                                    placeholder="https://drive.google.com/file/d/... atau URL video lainnya"
                                />
                                <p className="text-gray-500 text-xs mt-2">
                                    Masukkan URL langsung ke file video (MP4, MOV) atau share link Google Drive
                                </p>
                            </div>
                            {videoUrl && (
                                <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                                    <span className="text-2xl">🔗</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-green-400 truncate">{videoUrl}</p>
                                        <p className="text-gray-400 text-sm">URL video siap digunakan</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setVideoUrl("")}
                                        className="text-gray-400 hover:text-red-400"
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {uploading && (
                        <div className="mt-4">
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-gray-400">
                                    {uploadSource === "gdrive" ? "Menghubungkan ke Google Drive..." : "Mengupload..."}
                                </span>
                                <span className="text-indigo-400">{Math.round(uploadProgress)}%</span>
                            </div>
                            <div className="w-full bg-gray-800 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Stream Info */}
                <div className="card">
                    <h2 className="font-semibold mb-4">📺 Informasi Stream</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Judul Stream
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white placeholder-gray-500"
                                placeholder="Contoh: Relaxing Piano Music 24/7"
                                required
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Platform
                                </label>
                                <select
                                    value={formData.platform}
                                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white"
                                >
                                    <option value="youtube">🔴 YouTube</option>
                                    <option value="facebook">🔵 Facebook</option>
                                    <option value="tiktok">🎵 TikTok</option>
                                    <option value="twitch">💜 Twitch</option>
                                    <option value="instagram">📷 Instagram</option>
                                    <option value="custom">⚙️ Custom RTMP</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Kualitas Video
                                </label>
                                <select
                                    value={formData.quality}
                                    onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white"
                                >
                                    <option value="720p">720p (HD)</option>
                                    <option value="1080p">1080p (Full HD)</option>
                                    <option value="4k">4K (Ultra HD)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Stream Key
                            </label>
                            <input
                                type="password"
                                value={formData.streamKey}
                                onChange={(e) => setFormData({ ...formData, streamKey: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white placeholder-gray-500"
                                placeholder="Paste stream key dari YouTube/Facebook"
                                required
                            />
                            <p className="text-gray-500 text-xs mt-1">
                                Dapatkan stream key dari pengaturan live streaming di platform kamu
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="loop"
                                checked={formData.loop}
                                onChange={(e) => setFormData({ ...formData, loop: e.target.checked })}
                                className="w-5 h-5 rounded border-gray-700 bg-gray-800 text-indigo-500 focus:ring-indigo-500"
                            />
                            <label htmlFor="loop" className="text-gray-300">
                                Loop video terus menerus (recommended untuk 24/7)
                            </label>
                        </div>
                    </div>
                </div>

                {/* Schedule */}
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold">📅 Jadwal (Opsional)</h2>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.scheduleEnabled}
                                onChange={(e) => setFormData({ ...formData, scheduleEnabled: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                        </label>
                    </div>

                    {formData.scheduleEnabled && (
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Tanggal Mulai
                                </label>
                                <input
                                    type="date"
                                    value={formData.scheduleDate}
                                    onChange={(e) => setFormData({ ...formData, scheduleDate: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Jam Mulai
                                </label>
                                <input
                                    type="time"
                                    value={formData.scheduleTime}
                                    onChange={(e) => setFormData({ ...formData, scheduleTime: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Submit */}
                <div className="flex gap-4">
                    <Link href="/dashboard/streams" className="btn-secondary flex-1 text-center">
                        Batal
                    </Link>
                    <button
                        type="submit"
                        disabled={uploading || !hasVideoSelected}
                        className="btn-primary flex-1 disabled:opacity-50"
                    >
                        {uploading ? "Mengupload..." : formData.scheduleEnabled ? "Jadwalkan Stream" : "Mulai Stream Sekarang"}
                    </button>
                </div>
            </form>
        </div>
    );
}
