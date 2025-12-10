'use client'

import { useState } from 'react';
import TextType from './TextType'; 

const content = {
    Heading1: ["Ini Website Apaan Sih?"],
    Heading2: ["Ini website sederhana yang menggunakan Next.Js"],
    Paragraph: [
        "Next.Js adalah Framework dari bahasa pemrograman Javascript yang sudah client side. Yang artinya aplikasi di jalankan dan di proses di browser pengguna, sehingga aplikasi dapat merespons interaksi pengguna dengan instan tanpa harus menunggu balasan dari server. Dan di dukung dengan framework Tailwind.css agar tampilan bisa lebih bagus dan deklarasi kode bisa lebih efesien"
    ],
};

export default function Docs() {
    // State untuk melacak urutan animasi
    const [isH1Done, setIsH1Done] = useState(false);
    const [isH2Done, setIsH2Done] = useState(false);

    return (
        <section className="w-full min-h-screen flex flex-col items-start relative z-10 pt-20">
            <div className="container mx-auto px-6 md:px-12 flex flex-col gap-4">
                
                {/* --- 1. H1 (HEADLINE) --- */}
                <h1 className="block min-h-[4rem]"> {/* min-h digunakan agar layout stabil */}
                    <TextType 
                        text={content.Heading1} 
                        loop={false} 
                        className="text-4xl md:text-6xl font-bold text-gray-900"
                        // Saat H1 selesai, nyalakan switch H1Done
                        onSentenceComplete={(sentence, index) => {
                            if (index === content.Heading1.length - 1) setIsH1Done(true);
                        }}
                    />
                </h1>

                {/* --- 2. H2 (SUB-HEADLINE) --- */}
                <h2 className="block min-h-[3rem]">
                    {/* Hanya render jika H1 sudah selesai */}
                    {isH1Done && (
                        <TextType 
                            text={content.Heading2} 
                            loop={false} 
                            typingSpeed={40} // Sedikit lebih cepat dari H1
                            className="text-2xl md:text-3xl font-semibold text-black"
                            // Saat H2 selesai, nyalakan switch H2Done
                            onSentenceComplete={(sentence, index) => {
                                if (index === content.Heading2.length - 1) setIsH2Done(true);
                            }}
                        />
                    )}
                </h2>

                {/* --- 3. PARAGRAPH (BODY TEXT) --- */}
                <div className="block max-w-3xl text-justify md:text-left">
                    {/* Hanya render jika H2 sudah selesai */}
                    {isH2Done && (
                        <TextType 
                            text={content.Paragraph} 
                            loop={false} 
                            typingSpeed={20} // Paling cepat karena teks panjang
                            className="text-lg text-black leading-relaxed"
                        />
                    )}
                </div>

            </div>
        </section>
    )
}