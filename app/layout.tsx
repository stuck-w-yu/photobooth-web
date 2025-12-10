import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { FaWindowClose } from "react-icons/fa";
import { FaRegWindowMaximize } from "react-icons/fa6";
import { FaRegWindowMinimize } from "react-icons/fa";


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
      <body className="bg-[#4C1C72] text-black" >
        <div className="bg-[#DBB5EE] text-black m-4 rounded-2xl mx-5 p-3 text-end pr-6">
          <FaRegWindowMinimize className="inline-block mr-4"/>
          <FaRegWindowMaximize className="inline-block mr-4"/>
          <FaWindowClose className="inline-block mr-4"/>
          </div>
        <div className="bg-[#DBB5EE] text-black m-4 rounded-2xl p-1 text-end pr-6 px-2">
          <Navbar />
        </div>
        <div className="bg-[#DBB5EE] text-black m-4 rounded-2xl mx-5 p-3 text-left justify-left pr-6">
          {children}
        </div>
      </body>
    </html>
  );
}
