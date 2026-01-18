// components/PhotoboxClient.jsx
"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import CameraCapture from './CameraCapture';

// Asumsi Anda telah membuat file utils/layouts.js
import { LAYOUT_OPTIONS, COLLAGE_SIZE } from '../utils/layouts';

export default function PhotoboxClient() {
    // --- DEKLARASI STATE ---
    const [capturedPhotos, setCapturedPhotos] = useState([]);
    const [isCollageReady, setIsCollageReady] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [isCapturing, setIsCapturing] = useState(false);
    const finalCanvasRef = useRef(null);

    // State untuk layout yang dipilih (Default ke 1-Single)
    const [selectedLayout, setSelectedLayout] = useState(LAYOUT_OPTIONS.L_1_SINGLE);

    // State untuk Frame Style
    const FRAME_STYLES = [
        { id: 'modern', name: 'Cosmic (Default)', emoji: '🌌' },
        { id: 'clean', name: 'Clean Minimal', emoji: '🤍' },
        { id: 'vaporwave', name: 'Vaporwave', emoji: '📼' },
        { id: 'cute', name: 'Cute Pastel', emoji: '🌸' },
    ];
    const [selectedFrameStyle, setSelectedFrameStyle] = useState(FRAME_STYLES[0]);
    // ----------------------------------------------------


    // Fungsi yang dipanggil CameraCapture saat pengambilan gambar selesai
    const handlePhotoTaken = useCallback((newPhotoDataURL) => {
        console.log(`LOG [Client]: Menerima foto #${capturedPhotos.length + 1}.`);

        setCapturedPhotos((prevPhotos) => {
            const updatedPhotos = [...prevPhotos, newPhotoDataURL];
            const MAX_PHOTOS = selectedLayout.maxPhotos;

            // Cek apakah semua foto sudah lengkap
            if (updatedPhotos.length === MAX_PHOTOS) {
                setIsCollageReady(true); // Mulai proses rendering kolase
                setIsCapturing(false); // Selesai proses capturing
            } else {
                // Reset countdown ke 3 untuk foto berikutnya
                setCountdown(3);
            }
            return updatedPhotos;
        });

    }, [capturedPhotos.length, selectedLayout.maxPhotos]);

    // Logika Countdown
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [countdown]);

    // Logika Rendering Kolase
    useEffect(() => {
        if (isCollageReady) {
            const canvas = finalCanvasRef.current;
            const ctx = canvas.getContext('2d');

            canvas.width = COLLAGE_SIZE;
            canvas.height = COLLAGE_SIZE;


            const layout = selectedLayout;

            // Gambar background putih dulu
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, COLLAGE_SIZE, COLLAGE_SIZE);

            // Gambar foto-foto dulu
            let photosLoaded = 0;
            const totalPhotos = capturedPhotos.filter((_, index) => layout.map[index]).length;

            capturedPhotos.forEach((dataUrl, index) => {
                if (layout.map[index]) {
                    const img = new Image();
                    img.crossOrigin = "anonymous";
                    img.onload = () => {
                        const { x, y, w, h } = layout.map[index];

                        // Hitung aspect ratio untuk maintain proporsi foto
                        const aspectRatio = img.width / img.height;
                        let drawWidth = w;
                        let drawHeight = h;
                        let drawX = x;
                        let drawY = y;

                        if (aspectRatio > w / h) {
                            // Foto lebih lebar, potong samping
                            drawHeight = h;
                            drawWidth = h * aspectRatio;
                            drawX = x - (drawWidth - w) / 2;
                        } else {
                            // Foto lebih tinggi, potong atas/bawah
                            drawWidth = w;
                            drawHeight = w / aspectRatio;
                            drawY = y - (drawHeight - h) / 2;
                        }

                        // Gambar foto dengan crop yang tepat
                        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

                        photosLoaded++;
                        console.log(`LOG: Foto #${index + 1} berhasil digambar.`);

                        // Setelah semua foto selesai, gambar template di atasnya
                        if (photosLoaded === totalPhotos) {
                            drawFinalTemplate();
                        }
                    };
                    img.onerror = () => {
                        console.error(`ERROR: Gagal memuat foto #${index + 1}`);
                        photosLoaded++;
                        if (photosLoaded === totalPhotos) {
                            drawFinalTemplate();
                        }
                    };
                    img.src = dataUrl;
                }
            });

            // Fungsi untuk menggambar template di atas foto
            const drawFinalTemplate = () => {
                console.log("LOG: Mulai menggambar template frame...");
                const templateImg = new Image();
                templateImg.onload = () => {
                    ctx.drawImage(templateImg, 0, 0, COLLAGE_SIZE, COLLAGE_SIZE);
                    console.log("LOG: Template frame berhasil digambar di atas foto.");
                };
                templateImg.onerror = () => {
                    console.error('ERROR: Gagal memuat template dari URL: ' + templateImg.src);
                    console.log("LOG: Menampilkan kolase tanpa frame template.");
                };

                // Construct dynamic template path
                // Format: /frames/template_{layoutType}_{styleId}.svg
                // e.g. /frames/template_1_single_modern.svg
                const layoutType = layout.type || (layout.maxPhotos === 1 ? '1_single' : '4_square');
                const templatePath = `/frames/template_${layoutType}_${selectedFrameStyle.id}.svg`;

                templateImg.src = templatePath;
            };
        }
    }, [isCollageReady, capturedPhotos, selectedLayout]);

    // Fungsi untuk memulai proses capture awal
    const startCaptureSequence = () => {
        setCapturedPhotos([]); // Reset
        setIsCollageReady(false); // Reset
        setIsCapturing(true); // Mulai sequence
        setCountdown(3); // Mulai hitungan mundur
    }

    // Fungsi untuk mengunduh hasil dengan header
    const handleDownload = () => {
        if (finalCanvasRef.current) {
            // Buat canvas baru untuk header + kolase
            const downloadCanvas = document.createElement('canvas');
            const downloadCtx = downloadCanvas.getContext('2d');

            // Set ukuran canvas (tambah 80px untuk header)
            downloadCanvas.width = COLLAGE_SIZE;
            downloadCanvas.height = COLLAGE_SIZE + 80;

            // Gambar background
            downloadCtx.fillStyle = '#333';
            downloadCtx.fillRect(0, 0, COLLAGE_SIZE, COLLAGE_SIZE + 80);

            // Gambar header text
            downloadCtx.fillStyle = 'white';
            downloadCtx.font = 'bold 28px Arial';
            downloadCtx.textAlign = 'center';
            downloadCtx.fillText('📸 FRAME MAKER PHOTOBOX', COLLAGE_SIZE / 2, 35);

            downloadCtx.font = '18px Arial';
            downloadCtx.fillText(`${selectedLayout.name} - ${new Date().toLocaleDateString('id-ID')}`, COLLAGE_SIZE / 2, 60);

            // Gambar kolase di bawah header
            downloadCtx.drawImage(finalCanvasRef.current, 0, 80);

            // Download
            const link = document.createElement('a');
            link.download = `photobox_${selectedLayout.name.replace(/\s/g, '_')}_${Date.now()}.png`;
            link.href = downloadCanvas.toDataURL('image/png');
            link.click();
        }
    };

    // Membungkus prop untuk CameraCapture untuk menstabilkan re-render
    const cameraProps = useMemo(() => ({
        onPhotoTaken: handlePhotoTaken,
        // Sinyal capture berjalan jika countdown=0, proses aktif, dan foto belum penuh
        shouldCapture: (countdown === 0 && isCapturing && capturedPhotos.length < selectedLayout.maxPhotos),
    }), [handlePhotoTaken, countdown, isCapturing, capturedPhotos.length, selectedLayout.maxPhotos]);

    // Teks yang ditampilkan di atas kamera
    const getCameraStatusText = () => {
        if (!isCapturing && capturedPhotos.length === 0) return `Pilih layout dan tekan Mulai.`;
        if (countdown > 0) return `Foto #${capturedPhotos.length + 1}: Siap dalam ${countdown}...`;
        if (countdown === 0 && capturedPhotos.length < selectedLayout.maxPhotos) return `Foto #${capturedPhotos.length + 1}: JEPPRET!`;
        return "Memproses Kolase...";
    }


    return (
        <div className="w-full min-h-[calc(100vh-6rem)] p-4 flex flex-col items-center">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 tracking-tight">
                    FRAME MAKER PHOTOBOX
                </h1>
                <p className="text-gray-400 text-sm mt-2 font-medium tracking-widest uppercase">
                    Professional Collage Studio
                </p>
            </div>

            <div className="w-full max-w-6xl">
                {isCollageReady ? (
                    // --- TAMPILAN HASIL AKHIR ---
                    <div className="glass-panel p-8 rounded-3xl flex flex-col items-center animate-fade-in-up">
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                            <span className="text-3xl">✨</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Kolase Siap!</h2>
                        <p className="text-gray-400 mb-8">Hasil tangkapan momen terbaikmu</p>

                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 shadow-2xl">
                            <canvas
                                ref={finalCanvasRef}
                                className="max-w-full h-auto rounded-lg shadow-lg"
                            />
                        </div>

                        <div className="flex flex-wrap gap-4 mt-8">
                            <button
                                onClick={handleDownload}
                                className="px-8 py-3 bg-white text-purple-900 rounded-full font-bold hover:bg-gray-100 transition-all flex items-center gap-2 shadow-lg hover:shadow-white/20"
                            >
                                <span>📥</span> Unduh PNG
                            </button>
                            <button
                                onClick={startCaptureSequence}
                                className="px-8 py-3 bg-purple-600/20 text-purple-300 border border-purple-500/50 rounded-full font-bold hover:bg-purple-600/30 transition-all"
                            >
                                Buat Baru
                            </button>
                        </div>
                    </div>
                ) : (
                    // --- KONTEN UTAMA ---
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* LEFT PANEL: VIEWFINDER */}
                        <div className="lg:col-span-8">
                            <div className="glass-panel p-1 rounded-3xl overflow-hidden relative aspect-[4/3] bg-black shadow-2xl border border-white/10">
                                {/* Status Bar Overlay */}
                                <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center pointer-events-none">
                                    <div className="px-3 py-1 bg-black/50 backdrop-blur-md rounded-full border border-white/10 text-xs font-mono text-green-400 flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        REC
                                    </div>
                                    <div className="px-3 py-1 bg-black/50 backdrop-blur-md rounded-full border border-white/10 text-xs font-mono text-white">
                                        {getCameraStatusText()}
                                    </div>
                                </div>

                                {/* Focus Brackets Overlay */}
                                <div className="absolute inset-8 border-2 border-white/10 rounded-2xl z-10 pointer-events-none opacity-50">
                                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/50 rounded-tl-lg"></div>
                                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/50 rounded-tr-lg"></div>
                                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white/50 rounded-bl-lg"></div>
                                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/50 rounded-br-lg"></div>
                                </div>

                                {/* Main Display Area */}
                                <div className="w-full h-full bg-gray-900 flex items-center justify-center relative">
                                    {countdown > 0 && (
                                        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-pulse">
                                            <div className="text-9xl font-bold text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                                                {countdown}
                                            </div>
                                        </div>
                                    )}

                                    {isCapturing ? (
                                        <CameraCapture {...cameraProps} />
                                    ) : (
                                        <div className="text-center p-8">
                                            <div className="w-20 h-20 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
                                                <span className="text-4xl">📸</span>
                                            </div>
                                            <h3 className="text-xl font-bold text-white mb-2">Siap Mengambil Gambar?</h3>
                                            <p className="text-gray-400 text-sm">Pilih layout di panel kanan dan mulai sesi foto.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT PANEL: CONTROLS */}
                        <div className="lg:col-span-4 space-y-4">
                            {/* Control Panel */}
                            <div className="glass-panel p-6 rounded-3xl h-full flex flex-col">
                                <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                                    <h3 className="text-lg font-bold text-white">Setup Studio</h3>
                                    <span className="text-xs font-mono text-purple-400 bg-purple-400/10 px-2 py-1 rounded">PRO MODE</span>
                                </div>

                                <div className="space-y-6 flex-1">
                                    {/* Layout Selector */}
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Layout Template</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {Object.entries(LAYOUT_OPTIONS).map(([key, layout]) => (
                                                <button
                                                    key={key}
                                                    onClick={() => setSelectedLayout(LAYOUT_OPTIONS[key])}
                                                    className={`group relative p-3 rounded-xl border text-left transition-all duration-200 ${selectedLayout === layout
                                                        ? 'bg-purple-600/20 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                                                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-purple-500/30'
                                                        }`}
                                                >
                                                    <div className="text-sm font-bold text-white mb-1 truncate">{layout.name.split(' - ')[1] || layout.name}</div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs text-gray-400">{layout.maxPhotos} Frames</span>
                                                        {selectedLayout === layout && <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Frame Style Selector */}
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Frame Style</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {FRAME_STYLES.map((style) => (
                                                <button
                                                    key={style.id}
                                                    onClick={() => setSelectedFrameStyle(style)}
                                                    className={`group relative p-3 rounded-xl border text-left transition-all duration-200 ${selectedFrameStyle.id === style.id
                                                        ? 'bg-purple-600/20 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                                                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-purple-500/30'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xl">{style.emoji}</span>
                                                        <div className="text-sm font-bold text-white truncate">{style.name}</div>
                                                    </div>
                                                    <div className="flex justify-between items-center px-1">
                                                        <span className="text-[10px] text-gray-500 uppercase tracking-widest">{style.id}</span>
                                                        {selectedFrameStyle.id === style.id && <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></span>}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Recent Photos Preview (Mini) */}
                                    {capturedPhotos.length > 0 && (
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Progress Sesi</label>
                                            <div className="flex gap-2 p-3 bg-black/20 rounded-xl overflow-x-auto">
                                                {capturedPhotos.map((photo, i) => (
                                                    <div key={i} className="w-12 h-12 rounded-lg bg-gray-800 flex-shrink-0 overflow-hidden border border-white/20">
                                                        <img src={photo} className="w-full h-full object-cover" />
                                                    </div>
                                                ))}
                                                {Array(selectedLayout.maxPhotos - capturedPhotos.length).fill(0).map((_, i) => (
                                                    <div key={i} className="w-12 h-12 rounded-lg bg-white/5 flex-shrink-0 border border-white/5 flex items-center justify-center">
                                                        <span className="text-xs text-gray-600">{i + 1 + capturedPhotos.length}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Action Button */}
                                <button
                                    onClick={startCaptureSequence}
                                    disabled={isCapturing}
                                    className={`w-full py-4 rounded-2xl font-bold text-lg mt-6 shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 ${isCapturing
                                        ? 'bg-red-500/20 text-red-400 border border-red-500/50 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-purple-500/25'
                                        }`}
                                >
                                    {isCapturing ? (
                                        <>
                                            <span className="animate-spin">🌀</span> Sedang Foto...
                                        </>
                                    ) : (
                                        <>
                                            <span>📷</span> Mulai Foto
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}