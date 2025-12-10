"use client";

import Image from "next/image";
import Link from "next/link";

// --- DATA PENGEMBANG (Silakan edit di sini) ---
const developers = [
  {
    name: "Wahyu Firmansyah",
    role: "WebDev",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex", // Placeholder avatar
    link: "https://github.com/stuck-w-yu",
    desc: "Prodi Teknik Informatika",
  },
  {
    name: "Rijalul Firkri",
    role: "WebDev",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    link: "https://github.com/qwerty0999999",
    desc: "Prodi Teknik Informatika",
  },
  {
    name: "Rama Maghdalena",
    role: "WebDev",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
    link: "https://github.com/Rmglna-006",
    desc: "Prodi Sistem Informasi",
  },
  {
    name: "Arif Budianto",
    role: "Fullstack Developer",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jess",
    link: "https://tigers.my.id/",
    desc: "Mentor",
  },
  {
    name: "Fedora Aliansi Digital",
    role: "Community",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rian",
    link: "https://fedoraweb.site",
    desc: "WebDev Community",
  },
];

export default function AboutUs() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16 space-y-4 p-7">
          <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 p-7">
            Tim Pengembang
          </h2>
          <p className="text-black max-w-2xl mx-auto text-lg">
            Di balik setiap baris kode yang hebat, ada tim yang berdedikasi.
            Kenali orang-orang yang membuat proyek ini menjadi nyata.
          </p>
        </div>

        {/* Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {developers.map((dev, index) => (
            <Link
              href={dev.link}
              key={index}
              target="_blank" // Membuka di tab baru
              rel="noopener noreferrer" // Keamanan untuk target blank
              className="group relative"
            >
              {/* Card Container */}
              <div className="h-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-2 hover:bg-white/10 hover:border-purple-500/30 hover:shadow-xl hover:shadow-purple-500/10">
                
                {/* Image Wrapper dengan Efek Glow */}
                {/* <div className="relative w-24 h-24 mb-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur opacity-0 group-hover:opacity-70 transition-opacity duration-300" />
                  <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white/20 group-hover:border-white/80 transition-colors bg-gray-800">
                    <Image
                      src={dev.image}
                      alt={dev.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div> */}

                {/* Text Content */}
                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-black transition-colors p-2">
                  {dev.name}
                </h3>
                <span className="text-xs font-medium px-3 py-1 bg-white/10 rounded-full text-white mb-3 border border-white/5 group-hover:bg-purple-500/20 group-hover:border-purple-500/30 transition-all">
                  {dev.role}
                </span>
                <p className="text-sm text-black leading-relaxed">
                  {dev.desc}
                </p>

                {/* External Icon (Visual Cue) */}
                <div className="mt-auto pt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <span className="text-xs text-pink-400 flex items-center gap-1">
                    Kunjungi Profil 
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}