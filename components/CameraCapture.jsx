// components/CameraCapture.jsx
"use client";

import React, { useRef, useState, useEffect, useCallback } from 'react';


// Tambahkan prop shouldCapture dan hilangkan tombol manual
const CameraCapture = ({ onPhotoTaken, shouldCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Gunakan useCallback untuk memastikan handleCapture stabil
  const handleCapture = useCallback(() => {
    const video = videoRef.current;

    if (!video || !canvasRef.current) {
      console.error("CAPTURE ERROR [Capture]: Video atau canvas belum siap.");
      return;
    }

    // Tunggu sebentar jika video belum siap
    if (!isReady || video.videoWidth === 0) {
      console.log("LOG [Capture]: Video belum siap, mencoba lagi dalam 100ms...");
      setTimeout(() => {
        if (videoRef.current && videoRef.current.videoWidth > 0) {
          // Coba capture lagi dengan memanggil logic langsung
          const canvas = canvasRef.current;
          const context = canvas.getContext('2d');
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          context.translate(canvas.width, 0);
          context.scale(-1, 1);
          context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          context.setTransform(1, 0, 0, 1, 0, 0);
          const imageDataURL = canvas.toDataURL('image/png');
          onPhotoTaken(imageDataURL);
        } else {
          console.error("CAPTURE ERROR [Capture]: Video stream gagal siap setelah delay.");
        }
      }, 700);
      return;
    }

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Menerapkan transformasi cermin pada Canvas
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    context.setTransform(1, 0, 0, 1, 0, 0);

    const imageDataURL = canvas.toDataURL('image/png');
    console.log("SUCCESS [Capture]: Foto berhasil ditangkap.");

    onPhotoTaken(imageDataURL); // Mengirim data ke komponen induk (PhotoboxClient)
  }, [onPhotoTaken, isReady]);


  // Efek untuk menjalankan CAPTURE secara OTOMATIS
  useEffect(() => {
    if (shouldCapture) {
      console.log("LOG [Capture]: Menerima sinyal 'shouldCapture', menjepret otomatis.");
      // Beri delay 300ms untuk memastikan video stream siap
      const timeoutId = setTimeout(() => {
        handleCapture();
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [shouldCapture, handleCapture]); // Berjalan saat sinyal shouldCapture berubah menjadi true


  // Logika akses kamera (sama seperti sebelumnya)
  useEffect(() => {
    if (!stream && typeof window !== 'undefined') {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setErrorMsg("Browser tidak mendukung akses kamera atau tidak aman (HTTPS required).");
        setIsReady(true);
        return;
      }

      // ... (Logika mendapatkan stream) ...
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((s) => {
          setStream(s);
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.onloadedmetadata = () => {
              setIsReady(true);
            };
          }
        })
        .catch((err) => {
          setIsReady(true);
          console.error("ERROR [Capture]: Gagal mengakses kamera:", err);
          setErrorMsg("Akses kamera ditolak. Pastikan izin diberikan.");
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
      {/* Tampilan Live Feed */}
      {stream ? (
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Video Element */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }} // Mirror locally
          />

          {/* Minimalist Grid Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="w-full h-full border border-white/30 grid grid-cols-3 grid-rows-3">
              <div className="border border-white/10"></div><div className="border border-white/10"></div><div className="border border-white/10"></div>
              <div className="border border-white/10"></div><div className="border border-white/10"></div><div className="border border-white/10"></div>
              <div className="border border-white/10"></div><div className="border border-white/10"></div><div className="border border-white/10"></div>
            </div>
          </div>
        </div>
      ) : (
        // Loading State
        <div className="flex flex-col items-center justify-center text-center p-8">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className={`text-sm font-medium ${isReady ? 'text-red-400' : 'text-purple-300'} max-w-xs`}>
            {errorMsg || (isReady ? 'Kamera tidak tersedia atau akses ditolak.' : 'Menghubungkan ke kamera...')}
          </p>
        </div>
      )}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default CameraCapture;