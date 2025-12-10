// components/CameraCapture.jsx
"use client"; 

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { cameraStyles } from '../utils/styles'; 

// Tambahkan prop shouldCapture dan hilangkan tombol manual
const CameraCapture = ({ onPhotoTaken, shouldCapture }) => { 
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isReady, setIsReady] = useState(false);
  
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
    if (!stream && typeof window !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
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
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]); 

  return (
    <div style={cameraStyles.container}>
      {/* Tampilan Live Feed dengan Overlay Kamera */}
      {stream && (
        <div style={cameraStyles.videoContainer}>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              style={cameraStyles.videoFeed} 
            />
            
            {/* Overlay Viewfinder Modern */}
            <div style={cameraStyles.viewfinderOverlay}>
                {/* Camera Body Details */}
                <div style={cameraStyles.cameraBody}>
                    <div style={cameraStyles.cameraLens}></div>
                    <div style={cameraStyles.cameraShutter}></div>
                    <div style={cameraStyles.cameraFlash}></div>
                </div>
                
                {/* Corner brackets */}
                <div style={cameraStyles.cornerTopLeft}></div>
                <div style={cameraStyles.cornerTopRight}></div>
                <div style={cameraStyles.cornerBottomLeft}></div>
                <div style={cameraStyles.cornerBottomRight}></div>
                
                {/* Center focus indicator */}
                <div style={cameraStyles.focusIndicator}>
                    <div style={cameraStyles.focusRing}></div>
                </div>
                
                {/* Camera info */}
                <div style={cameraStyles.cameraInfo}>
                    <div style={cameraStyles.recIndicator}>● REC</div>
                    <div style={cameraStyles.cameraMode}>PHOTO</div>
                </div>
                
                {/* Camera controls */}
                <div style={cameraStyles.cameraControls}>
                    <div style={cameraStyles.controlButton}>●</div>
                    <div style={cameraStyles.controlButton}>●</div>
                    <div style={cameraStyles.controlButton}>●</div>
                </div>
            </div>
        </div>
      )}

      {/* Pesan status / error */}
      {!stream && (
        <div style={cameraStyles.loadingContainer}>
            <div style={cameraStyles.loadingIcon}>📷</div>
            <p style={{ color: isReady ? 'red' : 'black', marginTop: '15px', fontSize: '16px' }}>
                {isReady ? 'Kamera tidak tersedia atau akses ditolak.' : 'Memuat kamera atau menunggu izin...'}
            </p>
        </div>
      )}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default CameraCapture;