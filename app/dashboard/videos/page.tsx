"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface VideoFile {
    name: string;
    size: number;
    sizeFormatted: string;
    modified: string;
}

interface VideoInfo {
    filename: string;
    duration: number | null;
    durationFormatted: string | null;
    size: number | null;
    sizeFormatted: string | null;
    bitrate: number | null;
    bitrateFormatted: string | null;
    video: {
        codec: string;
        codecLong: string;
        width: number;
        height: number;
        resolution: string;
        fps: string | null;
        bitrate: number | null;
        bitrateFormatted: string | null;
    } | null;
    audio: {
        codec: string;
        codecLong: string;
        sampleRate: string;
        channels: number;
        bitrate: number | null;
        bitrateFormatted: string | null;
    } | null;
}

export default function VideosPage() {
    const [videos, setVideos] = useState<VideoFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [previewVideo, setPreviewVideo] = useState<string | null>(null);
    const [renameVideo, setRenameVideo] = useState<string | null>(null);
    const [newVideoName, setNewVideoName] = useState("");
    const [renaming, setRenaming] = useState(false);
    const [infoVideo, setInfoVideo] = useState<string | null>(null);
    const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
    const [loadingInfo, setLoadingInfo] = useState(false);

    const fetchVideos = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/videos`);
            if (response.ok) {
                const data = await response.json();
                setVideos(data);
            }
        } catch (error) {
            console.error("Error fetching videos:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVideos();
    }, []);

    const deleteVideo = async (filename: string) => {
        if (!confirm(`Yakin mau hapus video "${filename}"?`)) return;

        try {
            const response = await fetch(`${API_URL}/api/videos/${encodeURIComponent(filename)}`, {
                method: "DELETE"
            });
            if (response.ok) {
                setVideos(videos.filter(v => v.name !== filename));
            } else {
                alert("Gagal menghapus video");
            }
        } catch (error) {
            console.error("Error deleting video:", error);
            alert("Gagal menghubungi server");
        }
    };

    const openPreview = (filename: string) => {
        setPreviewVideo(filename);
    };

    const closePreview = () => {
        setPreviewVideo(null);
    };

    const openRename = (filename: string) => {
        // Remove extension for editing
        const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
        setNewVideoName(nameWithoutExt);
        setRenameVideo(filename);
    };

    const closeRename = () => {
        setRenameVideo(null);
        setNewVideoName("");
    };

    const openInfo = async (filename: string) => {
        setInfoVideo(filename);
        setLoadingInfo(true);
        setVideoInfo(null);

        try {
            const response = await fetch(`${API_URL}/api/videos/info/${encodeURIComponent(filename)}`);
            if (response.ok) {
                const data = await response.json();
                setVideoInfo(data);
            } else {
                const error = await response.json();
                alert(error.error || "Gagal mendapatkan info video");
                setInfoVideo(null);
            }
        } catch (error) {
            console.error("Error fetching video info:", error);
            alert("Gagal menghubungi server");
            setInfoVideo(null);
        } finally {
            setLoadingInfo(false);
        }
    };

    const closeInfo = () => {
        setInfoVideo(null);
        setVideoInfo(null);
    };

    const handleRename = async () => {
        if (!renameVideo || !newVideoName.trim()) return;

        setRenaming(true);
        try {
            const response = await fetch(`${API_URL}/api/videos/${encodeURIComponent(renameVideo)}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newFilename: newVideoName.trim() })
            });

            const data = await response.json();

            if (response.ok) {
                // Update the video list with new name
                setVideos(videos.map(v =>
                    v.name === renameVideo
                        ? { ...v, name: data.newFilename }
                        : v
                ));
                closeRename();
            } else {
                alert(data.error || "Gagal rename video");
            }
        } catch (error) {
            console.error("Error renaming video:", error);
            alert("Gagal menghubungi server");
        } finally {
            setRenaming(false);
        }
    };

    const filteredVideos = videos.filter(video =>
        video.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    return (
        <div className="space-y-6">
            {/* Video Preview Modal */}
            {previewVideo && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={closePreview}
                >
                    <div
                        className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-700"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-700">
                            <h3 className="font-medium text-white truncate pr-4" title={previewVideo}>
                                🎬 {previewVideo}
                            </h3>
                            <button
                                onClick={closePreview}
                                className="text-gray-400 hover:text-white transition-colors text-2xl leading-none"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Video Player */}
                        <div className="p-4">
                            <video
                                src={`${API_URL}/api/videos/stream/${encodeURIComponent(previewVideo)}`}
                                controls
                                autoPlay
                                className="w-full rounded-lg bg-black"
                                style={{ maxHeight: 'calc(90vh - 120px)' }}
                            >
                                Browser Anda tidak mendukung video player.
                            </video>
                        </div>
                    </div>
                </div>
            )}

            {/* Rename Modal */}
            {renameVideo && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={closeRename}
                >
                    <div
                        className="bg-gray-900 rounded-xl max-w-md w-full border border-gray-700"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-700">
                            <h3 className="font-medium text-white">✏️ Rename Video</h3>
                            <button
                                onClick={closeRename}
                                className="text-gray-400 hover:text-white transition-colors text-2xl leading-none"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Nama file saat ini:</label>
                                <p className="text-gray-500 text-sm truncate">{renameVideo}</p>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Nama file baru:</label>
                                <input
                                    type="text"
                                    value={newVideoName}
                                    onChange={(e) => setNewVideoName(e.target.value)}
                                    placeholder="Masukkan nama baru..."
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white placeholder-gray-500"
                                    onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                                    autoFocus
                                />
                                <p className="text-xs text-gray-500 mt-1">Ekstensi file akan otomatis ditambahkan</p>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex gap-3 p-4 border-t border-gray-700">
                            <button
                                onClick={closeRename}
                                className="flex-1 py-2 px-4 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleRename}
                                disabled={renaming || !newVideoName.trim()}
                                className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {renaming ? "Menyimpan..." : "Simpan"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Video Info Modal */}
            {infoVideo && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={closeInfo}
                >
                    <div
                        className="bg-gray-900 rounded-xl max-w-lg w-full border border-gray-700"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-700">
                            <h3 className="font-medium text-white">📊 Info Video</h3>
                            <button
                                onClick={closeInfo}
                                className="text-gray-400 hover:text-white transition-colors text-2xl leading-none"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-4">
                            {loadingInfo ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin text-4xl mb-4">⏳</div>
                                    <p className="text-gray-400">Menganalisa video...</p>
                                </div>
                            ) : videoInfo ? (
                                <div className="space-y-4">
                                    {/* File Info */}
                                    <div className="bg-gray-800/50 rounded-lg p-3">
                                        <h4 className="text-sm font-medium text-gray-400 mb-2">📁 File</h4>
                                        <p className="text-white text-sm truncate">{videoInfo.filename}</p>
                                        <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                                            <div>
                                                <span className="text-gray-500">Ukuran:</span>
                                                <span className="text-white ml-2">{videoInfo.sizeFormatted}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Durasi:</span>
                                                <span className="text-white ml-2">{videoInfo.durationFormatted || '-'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bitrate - Highlighted */}
                                    <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-lg p-3">
                                        <h4 className="text-sm font-medium text-indigo-400 mb-2">📈 Bitrate Total</h4>
                                        <p className="text-2xl font-bold text-white">{videoInfo.bitrateFormatted || '-'}</p>
                                    </div>

                                    {/* Video Stream */}
                                    {videoInfo.video && (
                                        <div className="bg-gray-800/50 rounded-lg p-3">
                                            <h4 className="text-sm font-medium text-green-400 mb-2">🎬 Video</h4>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <span className="text-gray-500">Resolusi:</span>
                                                    <span className="text-white ml-2">{videoInfo.video.resolution}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">FPS:</span>
                                                    <span className="text-white ml-2">{videoInfo.video.fps || '-'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Codec:</span>
                                                    <span className="text-white ml-2">{videoInfo.video.codec?.toUpperCase()}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Bitrate:</span>
                                                    <span className="text-white ml-2">{videoInfo.video.bitrateFormatted || '-'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Audio Stream */}
                                    {videoInfo.audio && (
                                        <div className="bg-gray-800/50 rounded-lg p-3">
                                            <h4 className="text-sm font-medium text-blue-400 mb-2">🔊 Audio</h4>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <span className="text-gray-500">Codec:</span>
                                                    <span className="text-white ml-2">{videoInfo.audio.codec?.toUpperCase()}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Sample Rate:</span>
                                                    <span className="text-white ml-2">{videoInfo.audio.sampleRate} Hz</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Channels:</span>
                                                    <span className="text-white ml-2">{videoInfo.audio.channels === 2 ? 'Stereo' : videoInfo.audio.channels === 1 ? 'Mono' : videoInfo.audio.channels}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Bitrate:</span>
                                                    <span className="text-white ml-2">{videoInfo.audio.bitrateFormatted || '-'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-400">
                                    Gagal memuat info video
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-gray-700">
                            <button
                                onClick={closeInfo}
                                className="w-full py-2 px-4 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">📁 Video Library</h1>
                    <p className="text-gray-400 mt-1">Kelola semua video yang sudah diupload.</p>
                </div>
                <Link href="/dashboard/upload" className="btn-primary text-center">
                    + Upload Video
                </Link>
            </div>

            {/* Search and Stats */}
            <div className="card">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex-1 w-full md:max-w-md">
                        <input
                            type="search"
                            placeholder="Cari video..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white placeholder-gray-500"
                        />
                    </div>
                    <div className="flex gap-4 text-sm">
                        <span className="text-gray-400">
                            Total: <span className="text-white font-medium">{videos.length} video</span>
                        </span>
                        <button
                            onClick={fetchVideos}
                            className="text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                            🔄 Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="card text-center py-12">
                    <div className="animate-spin text-4xl mb-4">⏳</div>
                    <p className="text-gray-400">Memuat video...</p>
                </div>
            )}

            {/* Empty State */}
            {!loading && videos.length === 0 && (
                <div className="card text-center py-12">
                    <span className="text-6xl block mb-4">📹</span>
                    <h3 className="text-xl font-semibold mb-2">Belum ada video</h3>
                    <p className="text-gray-400 mb-4">Upload video pertamamu untuk memulai streaming</p>
                    <Link href="/dashboard/upload" className="btn-primary inline-block">
                        + Upload Video Sekarang
                    </Link>
                </div>
            )}

            {/* Video Grid */}
            {!loading && filteredVideos.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredVideos.map((video) => (
                        <div key={video.name} className="card hover:border-indigo-500/50 transition-colors">
                            {/* Video Preview Placeholder - Click to preview */}
                            <div
                                className="bg-gray-800 rounded-lg h-32 flex items-center justify-center mb-4 cursor-pointer hover:bg-gray-700 transition-colors group"
                                onClick={() => openPreview(video.name)}
                            >
                                <div className="text-center">
                                    <span className="text-5xl block group-hover:scale-110 transition-transform">🎬</span>
                                    <span className="text-xs text-gray-500 group-hover:text-indigo-400 mt-1 block">Klik untuk preview</span>
                                </div>
                            </div>

                            {/* Video Info */}
                            <div className="space-y-2">
                                <h3 className="font-medium text-white truncate" title={video.name}>
                                    {video.name}
                                </h3>
                                <div className="flex items-center justify-between text-sm text-gray-400">
                                    <span>📦 {video.sizeFormatted}</span>
                                    <span>📅 {formatDate(video.modified)}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-800">
                                <button
                                    onClick={() => openPreview(video.name)}
                                    className="flex-1 py-2 px-3 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
                                >
                                    ▶️ Preview
                                </button>
                                <button
                                    onClick={() => openRename(video.name)}
                                    className="py-2 px-3 text-sm bg-gray-800 text-gray-400 rounded-lg hover:bg-yellow-500/20 hover:text-yellow-400 transition-colors"
                                    title="Rename"
                                >
                                    ✏️
                                </button>
                                <button
                                    onClick={() => openInfo(video.name)}
                                    className="py-2 px-3 text-sm bg-gray-800 text-gray-400 rounded-lg hover:bg-indigo-500/20 hover:text-indigo-400 transition-colors"
                                    title="Info Video"
                                >
                                    📊
                                </button>
                                <button
                                    onClick={() => deleteVideo(video.name)}
                                    className="py-2 px-3 text-sm bg-gray-800 text-gray-400 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-colors"
                                    title="Hapus"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* No Search Results */}
            {!loading && videos.length > 0 && filteredVideos.length === 0 && (
                <div className="card text-center py-8">
                    <span className="text-4xl block mb-2">🔍</span>
                    <p className="text-gray-400">Tidak ada video dengan kata kunci "{searchQuery}"</p>
                </div>
            )}
        </div>
    );
}

