"use client";

import { useState } from "react";
// Sesuaikan path import ini dengan lokasi file komponen Anda
import MBTITestModal from "@/components/MBTITestModal"; 

export default function MBTIPage() {
  // State untuk mengontrol apakah modal terbuka atau tertutup
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#DBB5EE] flex flex-col items-center justify-center p-4">
      
      {/* Bagian Halaman Utama (Background) */}
      <div className="text-center space-y-6 max-w-2xl">
        <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Kenali Diri Anda
        </h1>
        <p className="text-black text-lg">
          Temukan tipe kepribadian MBTI Anda melalui tes psikologi interaktif ini.
          Hanya butuh waktu kurang dari 15 menit.
        </p>

        {/* Tombol untuk Membuka Modal */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-purple-500/25"
        >
          Mulai Tes Sekarang
        </button>
      </div>

      {/* Memanggil Komponen Modal dengan Props yang Dibutuhkan */}
      <MBTITestModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
      
    </div>
  );
}