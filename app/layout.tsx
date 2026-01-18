import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";



const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Website Photobooth",
  description: "for Pameran UPB 2025",
};
// const items = [
//   { label: "Docs", href: "#" },
//   { label: "Test MBTI", href: "/mbti" },
//   { label: "Test IQ", href: "#" },
//   { label: "Photobooth", href: "#" },
//   { label: "About Us", href: "#" },
// ];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
          <Navbar />
        </div>
        <main className="relative z-10 w-full min-h-screen pt-24 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html >
  );
}
