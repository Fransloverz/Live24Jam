"use client";

import { useState } from "react";
import Link from "next/link";

type UploadSource = "local" | "gdrive" | "url";

export default function UploadPage() {
    const [uploadSource, setUploadSource] = useState<UploadSource>("local");
    const [file, setFile] = useState<File | null>(null);
    const [videoUrl, setVideoUrl] = useState("");
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadSuccess, setUploadSuccess] = useState<{ name: string; size: string } | null>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";


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

    const clearSelection = () => {
        setFile(null);
        setVideoUrl("");
    };

    const hasVideoSelected = file !== null || (uploadSource === "gdrive" && videoUrl.trim() !== "") || (uploadSource === "url" && videoUrl.trim() !== "");

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
                        setUploadSuccess({ name: result.file.name, size: result.file.sizeFormatted });
                        setFile(null);
                        setUploading(false);
                        setUploadProgress(0);
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
            } else if (uploadSource === "gdrive" && videoUrl.trim()) {
                // Download from Google Drive
                setUploadProgress(10);

                const response = await fetch(`${API_URL}/api/videos/download-gdrive`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        url: videoUrl
                    })
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    setUploadProgress(100);
                    setUploadSuccess({ name: result.file.name, size: result.file.sizeFormatted });
                    setVideoUrl("");
                    setUploading(false);
                    setUploadProgress(0);
                } else {
                    alert(`Download gagal: ${result.error}`);
                    setUploading(false);
                }
            } else if (uploadSource === "url" && videoUrl.trim()) {
                // Download from URL
                setUploadProgress(10);

                // Check if it's a Google Drive URL
                const isGDrive = videoUrl.includes("drive.google.com");
                const endpoint = isGDrive ? "download-gdrive" : "download-url";

                const response = await fetch(`${API_URL}/api/videos/${endpoint}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        url: videoUrl
                    })
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    setUploadProgress(100);
                    setUploadSuccess({ name: result.file.name, size: result.file.sizeFormatted });
                    setVideoUrl("");
                    setUploading(false);
                    setUploadProgress(0);
                } else {
                    alert(`Download gagal: ${result.error}`);
                    setUploading(false);
                }
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert("Terjadi kesalahan saat upload/download");
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

            {/* Success Notification */}
            {uploadSuccess && (
                <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 flex items-center gap-4">
                    <span className="text-3xl">✅</span>
                    <div className="flex-1">
                        <p className="font-semibold text-green-400">Upload Berhasil!</p>
                        <p className="text-gray-300 text-sm">
                            Video &quot;{uploadSuccess.name}&quot; ({uploadSuccess.size}) telah berhasil diupload.
                        </p>
                    </div>
                    <button
                        onClick={() => setUploadSuccess(null)}
                        className="text-gray-400 hover:text-white"
                    >
                        ✕
                    </button>
                </div>
            )}

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
                            <div className="border-2 border-dashed border-gray-700 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-green-500 to-yellow-500 rounded-xl flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M7.71 3.5L1.15 15l4.58 7.5h13.54l4.58-7.5L17.29 3.5H7.71zm-.25 1.5h5.79l-5.9 9.5H2.17l5.29-9.5zm6.75 0h2.08l5.29 9.5h-5.18l-2.19-3.5V5zm0 7.29l1.96 3.21H8.83l5.38-8.68v5.47z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Download dari Google Drive</h3>
                                        <p className="text-gray-400 text-sm">Paste link share Google Drive kamu</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <input
                                        type="url"
                                        value={videoUrl}
                                        onChange={(e) => setVideoUrl(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white placeholder-gray-500"
                                        placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                                    />
                                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                                        <p className="text-blue-400 text-sm font-medium mb-1">💡 Cara mendapatkan link:</p>
                                        <ol className="text-gray-400 text-xs space-y-1 list-decimal list-inside">
                                            <li>Buka file video di Google Drive</li>
                                            <li>Klik kanan → &quot;Bagikan&quot; atau &quot;Share&quot;</li>
                                            <li>Ubah akses ke &quot;Anyone with the link&quot;</li>
                                            <li>Copy link dan paste di sini</li>
                                        </ol>
                                    </div>
                                </div>

                                {videoUrl && (
                                    <div className="mt-4 flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                                        <span className="text-2xl">🔗</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-green-400 truncate text-sm">{videoUrl}</p>
                                            <p className="text-gray-400 text-xs">Link Google Drive siap didownload</p>
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

                {/* Submit */}
                <div className="flex gap-4">
                    <Link href="/dashboard/streams" className="btn-secondary flex-1 text-center">
                        Kembali
                    </Link>
                    <button
                        type="submit"
                        disabled={uploading || !hasVideoSelected}
                        className="btn-primary flex-1 disabled:opacity-50"
                    >
                        {uploading ? "Mengupload..." : "Upload Video"}
                    </button>
                </div>
            </form>
        </div>
    );
}
