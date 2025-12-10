// components/PhotoboxClient.jsx
"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import CameraCapture from './CameraCapture'; 
import { styles } from '../utils/styles'; 
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
                console.error('ERROR: Gagal memuat template dari URL: ' + layout.template);
                console.log("LOG: Menampilkan kolase tanpa frame template.");
            };
            templateImg.src = layout.template; 
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
    <div style={styles.container}>
      <h1 style={styles.header}>📸 FRAME MAKER PHOTOBOX (KOLASE)</h1>

      <div style={styles.contentBox}>
        {isCollageReady ? (
          // --- TAMPILAN HASIL AKHIR ---
          <div style={styles.resultArea}>
            <p style={styles.successText}>Kolase Anda sudah siap! ✨</p>
            <canvas 
              ref={finalCanvasRef} 
              style={styles.canvasResult} 
            />
            <div style={{ marginTop: '15px' }}>
                <button onClick={handleDownload} style={styles.downloadButton}>
                    📥 Unduh Kolase PNG
                </button>
                <button onClick={startCaptureSequence} style={styles.retakeButton}>
                    Buat Kolase Baru
                </button>
            </div>
          </div>
        ) : (
          // --- TAMPILAN PEMILIHAN LAYOUT / KAMERA ---
          <div style={styles.cameraArea}>
            {/* DSLR Camera Interface Top */}
            <div style={styles.dslrTopPanel}>
                <div style={styles.dslrModeDial}>
                    <div style={styles.dialMarking}>M</div>
                    <div style={styles.dialMarking}>AV</div>
                    <div style={styles.dialMarking}>TV</div>
                    <div style={styles.dialMarking}>P</div>
                    <div style={styles.dialMarkingActive}>AUTO</div>
                </div>
                <div style={styles.dslrShutterButton}>
                    <div style={styles.shutterButton}></div>
                </div>
                <div style={styles.dslrInfoPanel}>
                    <div style={styles.infoDisplay}>PHOTOBOX PRO</div>
                    <div style={styles.infoSubtext}>FRAMES: {selectedLayout.maxPhotos}</div>
                </div>
            </div>

            {/* DSLR Viewfinder Area */}
            <div style={styles.dslrViewfinderArea}>
                <div style={styles.viewfinderFrame}>
                    <div style={styles.statusText}>{getCameraStatusText()}</div>
                    {countdown > 0 && (
                        <div style={styles.dslrCountdown}>
                            <div style={styles.countdownCircle}>
                                <div style={styles.countdownNumber}>{countdown}</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {isCapturing ? (
                // Tampilkan kamera saat proses capture berjalan
                <div style={styles.dslrCameraBody}>
                    <CameraCapture {...cameraProps} />
                </div>
            ) : (
                // Tampilan Pemilihan Layout DSLR Style
                <div style={styles.dslrControlPanel}>
                    <div style={styles.controlPanelHeader}>
                        <div style={styles.controlPanelTitle}>MODE SELECTION</div>
                        <div style={styles.controlPanelIndicator}>● READY</div>
                    </div>
                    
                    <div style={styles.layoutSelector}>
                        <div style={styles.selectorLabel}>SHOOTING MODE</div>
                        <div style={styles.customDropdown}>
                            <select 
                                onChange={(e) => setSelectedLayout(LAYOUT_OPTIONS[e.target.value])}
                                value={Object.keys(LAYOUT_OPTIONS).find(key => LAYOUT_OPTIONS[key] === selectedLayout)}
                                style={styles.dropdownSelect}
                            >
                                {Object.entries(LAYOUT_OPTIONS).map(([key, layout]) => (
                                    <option key={key} value={key}>{layout.name.toUpperCase()}</option>
                                ))}
                            </select>
                            <div style={styles.dropdownArrow}>▼</div>
                        </div>
                        
                        <div style={styles.modeInfo}>
                            <div style={styles.modeInfoText}>FRAMES: {selectedLayout.maxPhotos}</div>
                            <div style={styles.modeInfoText}>LAYOUT: {selectedLayout.name.split(' - ')[1]}</div>
                        </div>
                    </div>
                    
                    <div style={styles.startButtonContainer}>
                        <button onClick={startCaptureSequence} style={styles.dslrStartButton}>
                            <div style={styles.buttonIcon}>📷</div>
                            <div style={styles.buttonText}>
                                <div style={styles.buttonMainText}>START SHOOTING</div>
                                <div style={styles.buttonSubText}>{selectedLayout.maxPhotos} FRAMES</div>
                            </div>
                        </button>
                    </div>
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}