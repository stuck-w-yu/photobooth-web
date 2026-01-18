// components/CameraCapture.jsx
"use client";

import React, { useRef, useState, useEffect, useCallback } from 'react';


// Tambahkan prop shouldCapture dan hilangkan tombol manual
const CameraCapture = ({ onPhotoTaken, shouldCapture, onReady, onError }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Gunakan useCallback untuk memastikan handleCapture stabil
  const handleCapture = useCallback(async () => {
    const video = videoRef.current;

    if (!video || !canvasRef.current) {
      console.error("CAPTURE ERROR: Video/Canvas ref is null");
      return;
    }

    // Helper: Tunggu sampai video memiliki dimensi (siap)
    const waitForVideoReady = async (maxAttempts = 10, interval = 200) => {
      for (let i = 0; i < maxAttempts; i++) {
        if (video.readyState >= 2 && video.videoWidth > 0) { // HAVE_CURRENT_DATA
          return true;
        }
        console.log(`LOG [Capture]: Menunggu video ready... percobaan ${i + 1}/${maxAttempts}`);
        await new Promise(r => setTimeout(r, interval));
      }
      return false;
    };

    const isVideoReady = await waitForVideoReady();

    if (!isVideoReady) {
      console.error("CAPTURE ERROR: Video stream timeout. Tidak mendapat dimensi video.");
      // Fallback or Alert User here? For now just log.
      // Bisa trigger callback error jika ada prop onError
      return;
    }

    // Capture Frame
    try {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Transformasi Cermin
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      context.setTransform(1, 0, 0, 1, 0, 0);

      const imageDataURL = canvas.toDataURL('image/png');
      console.log("SUCCESS [Capture]: Foto berhasil diambil.");
      onPhotoTaken(imageDataURL);

    } catch (e) {
      console.error("CAPTURE ERROR: Gagal mengambil gambar dari canvas", e);
    }

  }, [onPhotoTaken]);


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


  // Helper: Cek ketersediaan perangkat video
  const checkVideoDevices = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      console.warn("enumerateDevices() not supported.");
      return false;
    }
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputDevices = devices.filter(device => device.kind === 'videoinput');
      if (videoInputDevices.length === 0) {
        setErrorMsg("Tidak ada kamera yang terdeteksi.");
        return false;
      }
      return true;
    } catch (err) {
      console.error("Error enumerating devices:", err);
      return false;
    }
  };

  // Logika akses kamera
  useEffect(() => {
    let mounted = true;

    const initCamera = async () => {
      if (typeof window === 'undefined') return;

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (mounted) setErrorMsg("Browser ini tidak mendukung akses kamera (atau bukan HTTPS).");
        if (mounted) setIsReady(true);
        if (onReady) onReady(false); // Trigger onReady(false) for initialization errors
        if (onError) onError("Browser not supported or HTTP");
        return;
      }

      const hasDevice = await checkVideoDevices();
      if (!hasDevice) {
        if (mounted) setIsReady(true);
        if (onReady) onReady(false); // Trigger onReady(false) for initialization errors
        if (onError) onError("No camera device");
        return;
      }

      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (!mounted) {
          s.getTracks().forEach(track => track.stop());
          return;
        }

        setStream(s);

        if (videoRef.current) {
          videoRef.current.srcObject = s;

          // Gunakan addEventListener untuk reliability lebih baik daripada properti on...
          videoRef.current.onloadedmetadata = () => {
            console.log(`LOG [Camera]: Metadata loaded. Size: ${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`);
            if (mounted) {
              setIsReady(true);
              if (onReady) onReady(true);
            }
          };

          // Explicit play
          try {
            await videoRef.current.play();
          } catch (playErr) {
            console.error("ERROR [Camera]: Auto-play failed", playErr);
            // Jangan fail di sini, kadang still works
          }
        }
      } catch (err) {
        console.error("ERROR [Capture]: Gagal mengakses kamera:", err);
        if (!mounted) return;
        setIsReady(true);
        if (onReady) onReady(false);
        if (onError) onError(err); // Notify parent

        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setErrorMsg("Izin kamera ditolak. Mohon izinkan akses kamera.");
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setErrorMsg("Perangkat kamera tidak ditemukan.");
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setErrorMsg("Kamera sedang digunakan aplikasi lain.");
        } else {
          setErrorMsg(`Gagal mengakses kamera: ${err.message}`);
        }
      }
    };

    if (!stream) {
      initCamera();
    }

    return () => {
      mounted = false;
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
            muted // Recommended for autoplay policies
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