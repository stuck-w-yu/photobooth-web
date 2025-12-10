"use client";

import { useState } from "react";
// Sesuaikan path import komponen Anda
import IQTestModal from "@/components/IQTestModal"; 

export default function TestIQPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#DBB5EE] flex flex-col items-center justify-center p-4">
      
      <div className="text-center space-y-6 max-w-2xl">
        <div className="w-24 h-24 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30">
          <span className="text-4xl">🧠</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-white">
          Tes IQ Online
        </h1>
        
        <p className="text-black text-lg">
          Ukur kemampuan logika, matematika, dan pola pikir Anda. 
          Tes ini terdiri dari 10 pertanyaan acak dengan waktu pengerjaan 
          sekitar 10 menit.
        </p>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-8 py-4 bg-white text-purple-900 rounded-full font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl"
        >
          Mulai Tes IQ
        </button>
      </div>

      {/* Modal dipanggil di sini dengan state */}
      <IQTestModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
      
    </div>
  );
}