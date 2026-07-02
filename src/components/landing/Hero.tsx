"use client";

import { motion } from "motion/react";
import { Lightning, ArrowRight, QrCode, CheckCircle, Sparkle, FileZip } from "@phosphor-icons/react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden min-h-[92dvh] flex items-center bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/30">
      {/* Blurred decorative circles */}
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-brand-200/25 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-[30%] -left-60 w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-10 right-[20%] w-[350px] h-[350px] bg-blue-100/30 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-8 pb-16 w-full z-10">
        <div className="grid lg:grid-cols-12 gap-14 items-center">

          {/* Left Column (Information) */}
          <motion.div
            className="lg:col-span-7 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-semibold tracking-wide">
              <Sparkle className="w-3.5 h-3.5 text-brand-500 animate-pulse" weight="fill" />
              Indonesia's Smart Certificate Generator
            </div>

            {/* Typography Title */}
            <h1 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-ink-900 leading-[1.08]">
              Buat Sertifikat Profesional <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 via-indigo-500 to-indigo-600">
                dalam Hitungan Menit
              </span>
            </h1>

            {/* Subdescription */}
            <p className="text-base sm:text-lg text-ink-500 max-w-xl leading-relaxed">
              Unggah satu desain, tarik data peserta dari Excel, atur posisi nama sekali — 
              SertifKilat.id menyusun seluruh sertifikat digital lengkap dengan QR verifikasi unik dan siap unduh.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-wrap gap-4 pt-2">
              <Link 
                href="/generator" 
                className="btn-primary !px-7 !py-3.5 !text-sm flex items-center gap-2 group shadow-glow shadow-brand-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                Coba Gratis Sekarang
                <ArrowRight size={16} weight="bold" className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="#templates" 
                className="btn-secondary !px-7 !py-3.5 !text-sm hover:bg-ink-100 hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                Lihat Template
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-ink-100 max-w-lg mt-10">
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-brand-600 tracking-tight">500+</p>
                <p className="text-xxs sm:text-xs font-semibold text-ink-400 mt-1 uppercase tracking-wider">Events & Acara</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-indigo-600 tracking-tight">18K+</p>
                <p className="text-xxs sm:text-xs font-semibold text-ink-400 mt-1 uppercase tracking-wider">Sertifikat Dibuat</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight">99.9%</p>
                <p className="text-xxs sm:text-xs font-semibold text-ink-400 mt-1 uppercase tracking-wider">Success Rate</p>
              </div>
            </div>
          </motion.div>

          {/* Right Column (Visual Focus) */}
          <motion.div
            className="lg:col-span-5 relative flex items-center justify-center py-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Soft Shadow Glow Backdrop */}
            <div className="absolute -inset-4 bg-gradient-to-br from-brand-100/40 via-indigo-100/20 to-transparent rounded-[2.5rem] -z-10 blur-xl" />

            {/* Floater perspective element */}
            <motion.div
              className="relative w-full max-w-[480px] cursor-pointer"
              style={{ perspective: 1200 }}
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Premium Certificate mock with slight perspective rotate */}
              <div 
                className="card shadow-2xl p-3 sm:p-4 bg-white/95 border border-white/80 transition-all duration-700 ease-out hover:rotate-0 hover:scale-[1.02]"
                style={{ 
                  transform: "rotateY(-12deg) rotateX(10deg) rotateZ(-2deg)",
                  transformStyle: "preserve-3d"
                }}
              >
                <div
                  className="bg-[#FAF8F5] rounded-xl relative overflow-hidden border-4 border-[#C5A03C]"
                  style={{ aspectRatio: "1.41 / 1" }}
                >
                  {/* Elegant Wavy Blue & Gold Vector Background */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 284" fill="none" preserveAspectRatio="none">
                    {/* Gold background wave edge */}
                    <path d="M 0,0 H 145 C 175,80 120,200 150,284 H 0 Z" fill="url(#goldGrad)" opacity="0.9" />
                    {/* Main deep blue wave */}
                    <path d="M 0,0 H 138 C 168,80 113,200 143,284 H 0 Z" fill="url(#blueGrad)" />
                    {/* Additional golden divider lines */}
                    <path d="M 132,0 C 162,80 107,200 137,284" stroke="url(#goldGrad)" strokeWidth="1" opacity="0.5" />
                    
                    {/* Subtle top-right gold accent shape */}
                    <path d="M 330,0 H 400 V 70 C 380,45 355,20 330,0 Z" fill="url(#goldGrad)" opacity="0.15" />
                    <path d="M 350,0 C 370,15 385,30 400,50" stroke="url(#goldGrad)" strokeWidth="0.75" opacity="0.3" />

                    <defs>
                      <linearGradient id="blueGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#0B1E36" />
                        <stop offset="40%" stopColor="#0F2A4A" />
                        <stop offset="100%" stopColor="#051020" />
                      </linearGradient>
                      <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#F5D782" />
                        <stop offset="30%" stopColor="#D4AF37" />
                        <stop offset="70%" stopColor="#AA8010" />
                        <stop offset="100%" stopColor="#F3D175" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Ornate corners on the right side */}
                  <div className="absolute top-4 right-4 w-6 h-6 border-t border-r border-[#C5A03C]/40 rounded-tr-sm" />
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-b border-r border-[#C5A03C]/40 rounded-br-sm" />

                  {/* Gold double inset border on right side only to look clean */}
                  <div className="absolute inset-y-2.5 right-2.5 left-[160px] border border-[#C5A03C]/20 rounded-r-lg pointer-events-none" />

                  {/* Center content shifted to the right to accommodate the left waves */}
                  <div className="absolute inset-0 flex flex-col justify-center pl-[150px] pr-8 text-center">
                    <span className="text-[9px] sm:text-[10px] tracking-[0.25em] text-ink-950 font-bold font-serif">
                      CERTIFICATE
                    </span>
                    <span className="text-[6px] sm:text-[7px] tracking-[0.3em] text-[#AA8010] font-semibold mt-0.5">
                      OF APPRECIATION
                    </span>
                    
                    <p className="text-[5px] sm:text-[6.5px] text-ink-400 mt-3 tracking-wider uppercase">
                      THIS CERTIFICATE IS PROUDLY PRESENTED TO
                    </p>
                    
                    <div className="mt-1 sm:mt-1.5 font-serif italic text-base sm:text-lg text-[#0F2A4A] leading-tight font-semibold">
                      Dewi Zuni
                    </div>
                    
                    <div className="w-20 h-[0.5px] bg-[#C5A03C]/40 mx-auto my-1.5" />
                    
                    <p className="text-[5px] sm:text-[6px] text-ink-500 max-w-[200px] mx-auto leading-relaxed">
                      for outstanding contribution and dedication as a participant in<br />
                      <span className="font-semibold text-ink-800">UI/UX Design Masterclass 2026</span>
                    </p>

                    {/* Bottom signatures and dates */}
                    <div className="flex justify-between items-end mt-4 px-2">
                      <div className="text-left">
                        <div className="w-10 h-[0.5px] bg-[#C5A03C]/40 mb-0.5" />
                        <div className="text-[4px] sm:text-[5px] text-ink-400">Date Issued</div>
                      </div>
                      <div className="text-right">
                        <div className="w-12 h-[0.5px] bg-[#C5A03C]/40 mb-0.5" />
                        <div className="text-[4px] sm:text-[5px] text-ink-400">Authorized Signature</div>
                      </div>
                    </div>
                  </div>

                  {/* QR code verification zone - bottom right */}
                  <div className="absolute bottom-3 right-3 w-8 h-8 rounded bg-white flex items-center justify-center p-1 shadow-sm border border-ink-100">
                    <QrCode size={14} className="text-ink-900" />
                  </div>

                  {/* Ribbon Seal Badge overlapping the left wave boundary */}
                  <div className="absolute top-[28%] left-[118px] z-10 flex flex-col items-center">
                    {/* Ribbon tails hanging down */}
                    <div className="absolute top-4 flex gap-1 justify-center w-full">
                      <div className="w-2.5 h-6 bg-[#AA8010] rotate-12 origin-top rounded-b-[2px] shadow-sm" />
                      <div className="w-2.5 h-6 bg-[#C5A03C] -rotate-12 origin-top rounded-b-[2px] shadow-sm" />
                    </div>
                    {/* Circular Seal */}
                    <div className="relative w-8 h-8 bg-gradient-to-br from-[#FAF8F5] via-[#D5B55E] to-[#AA8010] rounded-full p-[1px] shadow-md flex items-center justify-center">
                      <div className="w-7 h-7 bg-gradient-to-br from-[#0B1E36] to-[#0F2A4A] rounded-full flex flex-col items-center justify-center border border-[#FAF8F5]/20">
                        <Sparkle size={6} className="text-[#F5D782]" weight="fill" />
                        <span className="text-[3px] text-[#F5D782] font-semibold tracking-tighter mt-0.5">SEAL</span>
                      </div>
                    </div>
                  </div>

                  {/* Serial code */}
                  <div className="absolute bottom-3 left-4 font-mono text-[5px] text-white/50 z-20">
                    SK-2026-0004
                  </div>
                </div>
              </div>

              {/* Floating Glassmorphic Card 1: QR Verified */}
              <div className="flex items-center gap-2 bg-white/75 backdrop-blur-md border border-white/50 shadow-[0_8px_32px_0_rgba(11,18,32,0.1)] p-2.5 rounded-xl absolute -top-8 -left-8 z-20 hover:scale-105 transition-transform">
                <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500">
                  <CheckCircle size={14} weight="fill" />
                </div>
                <span className="text-[10px] font-bold text-ink-850 whitespace-nowrap">✓ QR Verified</span>
              </div>

              {/* Floating Glassmorphic Card 2: 120 Certificates Generated */}
              <div className="flex items-center gap-2 bg-white/75 backdrop-blur-md border border-white/50 shadow-[0_8px_32px_0_rgba(11,18,32,0.1)] p-2.5 rounded-xl absolute -bottom-8 -right-8 z-20 hover:scale-105 transition-transform">
                <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500">
                  <Lightning size={14} weight="fill" />
                </div>
                <span className="text-[10px] font-bold text-ink-850 whitespace-nowrap">✓ 120 Certificates Generated</span>
              </div>

              {/* Floating Glassmorphic Card 3: Export ZIP Ready */}
              <div className="flex items-center gap-2 bg-white/75 backdrop-blur-md border border-white/50 shadow-[0_8px_32px_0_rgba(11,18,32,0.1)] p-2.5 rounded-xl absolute top-[60%] -left-12 z-20 hover:scale-105 transition-transform">
                <div className="w-6 h-6 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-500">
                  <FileZip size={14} weight="fill" />
                </div>
                <span className="text-[10px] font-bold text-ink-850 whitespace-nowrap">✓ Export ZIP Ready</span>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
