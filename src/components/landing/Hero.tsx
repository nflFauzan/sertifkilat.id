"use client";

import { motion } from "motion/react";
import { Lightning, ArrowRight, CheckCircle, Sparkle, FileZip } from "@phosphor-icons/react";
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
                  <img src="/sertifkilat.png" alt="Sertifikat" className="w-full h-full object-cover" />
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
