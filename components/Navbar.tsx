"use client";

import GooeyNav from "./GooeyNav"; // Pastikan path import sesuai lokasi file GooeyNav Anda

export default function Navbar() {
  // Definisi menu item dengan rute URL yang benar
  const items = [
    { label: "Docs", href: "/"},
    { label: "Test MBTI", href: "/mbti" }, // Mengarah ke file app/mbti.tsx
    { label: "Test IQ", href: "/test-iq" },
    { label: "Photobooth", href: "/photobooth" },
    { label: "About Us", href: "/about" },
  ];

  return (
    // Styling pembungkus yang Anda inginkan
      <GooeyNav 
        items={items} 
        initialActiveIndex={0} // Opsi ini tetap ada, tapi kode sebelumnya sudah auto-detect URL
      />
  );
}