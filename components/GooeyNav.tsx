'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link'; // <--- 1. Import Link Next.js
import { usePathname } from 'next/navigation'; // <--- 2. Import untuk mendeteksi URL aktif

interface GooeyNavItem {
  label: string;
  href: string;
}

export interface GooeyNavProps {
  items: GooeyNavItem[];
  initialActiveIndex?: number;
}

const GooeyNav: React.FC<GooeyNavProps> = ({
  items,
  initialActiveIndex = 0
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLUListElement>(null);
  const filterRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [activeIndex, setActiveIndex] = useState<number>(initialActiveIndex);
  
  // Ambil URL saat ini
  const pathname = usePathname(); 

  // --- LOGIKA POSISI BACKGROUND (PILL) ---
  const updateEffectPosition = (element: HTMLElement) => {
    if (!containerRef.current || !filterRef.current || !textRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const pos = element.getBoundingClientRect();
    const styles = {
      left: `${pos.x - containerRect.x}px`,
      top: `${pos.y - containerRect.y}px`,
      width: `${pos.width}px`,
      height: `${pos.height}px`
    };
    Object.assign(filterRef.current.style, styles);
    Object.assign(textRef.current.style, styles);
    textRef.current.innerText = element.innerText;
  };

  // Logic Klik (Visual)
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, index: number) => {
    // Kita tidak perlu e.preventDefault() karena kita ingin Link bekerja
    const liEl = e.currentTarget;
    if (activeIndex === index) return;
    
    setActiveIndex(index);
    updateEffectPosition(liEl);
    
    // Efek teks "morph" sedikit saat diklik
    if (textRef.current) {
      textRef.current.classList.remove('active');
      void textRef.current.offsetWidth; // Trigger reflow
      textRef.current.classList.add('active');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLAnchorElement>, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      // Untuk aksesibilitas keyboard
      const liEl = e.currentTarget; 
      if (liEl) {
        handleClick(
          {
            currentTarget: liEl
          } as React.MouseEvent<HTMLAnchorElement>,
          index
        );
      }
    }
  };

  // --- 3. LOGIC OTOMATIS BERDASARKAN URL ---
  // Effect ini akan jalan setiap kali kita pindah halaman
  useEffect(() => {
    // Cari index item yang href-nya cocok dengan URL sekarang
    const currentPathIndex = items.findIndex(item => item.href === pathname);
    
    if (currentPathIndex !== -1) {
      setActiveIndex(currentPathIndex);
    }
  }, [pathname, items]); // Dependency ke pathname

  // Effect untuk animasi posisi saat activeIndex berubah
  useEffect(() => {
    if (!navRef.current || !containerRef.current) return;
    // Tunggu render selesai sedikit agar element ada
    const timer = setTimeout(() => {
        const activeLi = navRef.current?.querySelectorAll('li')[activeIndex] as HTMLElement;
        const activeLink = activeLi?.querySelector('a') as HTMLElement; // Targetkan anchor didalam li

        if (activeLink) {
          updateEffectPosition(activeLink); // Posisi berdasarkan Link/Anchor, bukan Li
          textRef.current?.classList.add('active');
        }
    }, 50);

    const resizeObserver = new ResizeObserver(() => {
      const currentActiveLi = navRef.current?.querySelectorAll('li')[activeIndex] as HTMLElement;
      const currentLink = currentActiveLi?.querySelector('a') as HTMLElement;
      if (currentLink) {
        updateEffectPosition(currentLink);
      }
    });
    
    resizeObserver.observe(containerRef.current);
    return () => {
        resizeObserver.disconnect();
        clearTimeout(timer);
    };
  }, [activeIndex]);

  return (
    <>
      <style>
        {`
          .effect {
            position: absolute;
            opacity: 1;
            pointer-events: none;
            display: grid;
            place-items: center;
            z-index: 1;
          }
          .effect.text {
            color: white;
            transition: color 0.3s ease;
            pointer-events: none;
            /* Pastikan font style sama persis dengan link asli agar pas */
            font-weight: inherit;
            font-family: inherit;
          }
          .effect.text.active {
            color: black;
          }
          
          /* Background Putih (Pill) */
          .effect.filter::after {
            content: "";
            position: absolute;
            inset: 0;
            background: #7E4CA5;
            opacity: 1; 
            z-index: -1;
            border-radius: 9999px;
            transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
          }
          
          li.active {
            color: black;
            text-shadow: none;
          }
        `}
      </style>
      <div className="relative" ref={containerRef}>
        <nav className="flex relative items-center justify-center" style={{ transform: 'translate3d(0,0,0.01px)' }}>
          <ul
            ref={navRef}
            className="flex gap-8 list-none p-0 px-4 m-0 relative z-[3]"
            style={{
              textShadow: '0 1px 1px hsl(205deg 30% 10% / 0.2)'
            }}
          >
            {items.map((item, index) => (
              <li
                key={index}
                className={`rounded-full relative cursor-pointer transition-[background-color_color_box-shadow] duration-300 ease shadow-[0_0_0.5px_1.5px_transparent] text-black ${
                  activeIndex === index ? 'active' : ''
                }`}
              >
                {/* --- PERUBAHAN UTAMA DI SINI: Gunakan Link --- */}
                <Link
                  href={item.href}
                  onClick={e => handleClick(e, index)}
                  onKeyDown={e => handleKeyDown(e, index)}
                  className="outline-none p-1 px-[40px] inline-block font-medium"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {/* Elemen ini yang membuat efek background putih pindah-pindah */}
        <span className="effect filter" ref={filterRef} />
        <span className="effect text" ref={textRef} />
      </div>
    </>
  );
};

export default GooeyNav;