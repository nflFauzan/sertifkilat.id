"use client";

import { motion } from "motion/react";
import { ArrowRight, Sparkle } from "@phosphor-icons/react";
import Link from "next/link";
import Image from "next/image";

interface HeroProps {
  stats?: {
    totalCertificates: number;
    totalUsers: number;
  };
}

export default function Hero({ stats }: HeroProps) {
  const formattedCerts = stats?.totalCertificates
    ? stats.totalCertificates >= 1000
      ? `${(stats.totalCertificates / 1000).toFixed(1).replace(".0", "")}K+`
      : stats.totalCertificates
    : "26+";

  const formattedUsers = stats?.totalUsers
    ? stats.totalUsers >= 1000
      ? `${(stats.totalUsers / 1000).toFixed(1).replace(".0", "")}K+`
      : `${stats.totalUsers}+`
    : "5+";

  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center bg-gradient-to-b from-white via-blue-50/20 to-indigo-50/40 py-16 lg:py-24">
      
      {/* Soft large blur background decoration */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-brand-100/30 to-indigo-100/20 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 w-full z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        
        {/* Left Side Info */}
        <div className="lg:col-span-6 flex flex-col space-y-6 sm:space-y-8 text-center lg:text-left items-center lg:items-start">
          
          {/* Premium Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-semibold tracking-wide">
            <Sparkle className="w-3.5 h-3.5 text-brand-500 animate-pulse" weight="fill" />
            Indonesia&apos;s Smart Certificate Generator
          </div>

          {/* Title */}
          <h1 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-ink-900 leading-[1.08] max-w-xl">
            Buat Sertifikat Profesional <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 via-indigo-500 to-indigo-600">
              dalam Hitungan Menit
            </span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg text-ink-550 max-w-xl leading-relaxed">
            Unggah satu desain, tarik data peserta dari Excel, atur posisi nama sekali — 
            SertifKilat.id menyusun seluruh sertifikat digital lengkap dengan QR verifikasi unik dan siap unduh.
          </p>

          {/* CTA Button with hover animation */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
            <Link 
              href="/auth/register" 
              className="btn-primary !px-8 !py-4 !text-sm flex items-center gap-2 group shadow-glow shadow-brand-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
            >
              Coba Gratis Sekarang
              <ArrowRight size={16} weight="bold" className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-3 gap-4 w-full max-w-md pt-4">
            <div className="bg-white/60 backdrop-blur-md rounded-xl p-4 border border-white/80 shadow-md flex flex-col items-center lg:items-start justify-center transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
              <span className="text-2xl font-extrabold text-brand-600 tracking-tight">{formattedUsers}</span>
              <span className="text-[10px] font-bold text-ink-400 mt-1 uppercase tracking-wider">Events</span>
            </div>
            <div className="bg-white/60 backdrop-blur-md rounded-xl p-4 border border-white/80 shadow-md flex flex-col items-center lg:items-start justify-center transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
              <span className="text-2xl font-extrabold text-indigo-600 tracking-tight">{formattedCerts}</span>
              <span className="text-[10px] font-bold text-ink-400 mt-1 uppercase tracking-wider text-center lg:text-left">Certificates</span>
            </div>
            <div className="bg-white/60 backdrop-blur-md rounded-xl p-4 border border-white/80 shadow-md flex flex-col items-center lg:items-start justify-center transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
              <span className="text-2xl font-extrabold text-emerald-600 tracking-tight">99.9%</span>
              <span className="text-[10px] font-bold text-ink-400 mt-1 uppercase tracking-wider">Success</span>
            </div>
          </div>
        </div>

        {/* Right Side Image (3D pedestal mockup layout) */}
        <div className="lg:col-span-6 relative aspect-[4/3] w-full flex items-center justify-center">
          
          {/* Neon Glow reflection on the pedestal */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[70%] h-12 bg-gradient-to-tr from-brand-400/20 to-indigo-500/20 rounded-full blur-xl -z-10" />

          {/* 3D Pedestal / Platform */}
          <div 
            className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[85%] h-8 bg-gradient-to-b from-white/90 to-ink-150/40 rounded-full border border-white/60 shadow-lg -z-20 transform scale-y-[0.25]"
          />

          {/* Floating perspective element */}
          <motion.div
            className="relative w-full max-w-[540px] aspect-[4/3] cursor-pointer"
            animate={{ y: [0, -16, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Soft Shadow Glow Backdrop & Blue-White Gradient behind the image */}
            <div className="absolute -inset-6 bg-gradient-to-tr from-brand-300/30 via-indigo-200/20 to-white/10 rounded-[2.5rem] -z-10 blur-2xl animate-pulse" />

            {/* Premium Preview Image with shadow-2xl, rotate and border */}
            <div 
              className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/85 bg-white/40 transition-all duration-700 ease-out hover:rotate-0 hover:scale-[1.03]"
              style={{ 
                transform: "rotateY(-12deg) rotateX(12deg) rotateZ(-3deg)",
                transformStyle: "preserve-3d"
              }}
            >
              <Image
                src="/templates/landingpage.png"
                alt="Landing Preview"
                fill
                priority
                className="object-contain"
              />
            </div>

            {/* Floating Glassmorphic Badges */}
            <div className="flex items-center gap-1.5 bg-white/70 backdrop-blur-md border border-white/50 shadow-xl px-4 py-2 rounded-full absolute -top-8 -left-6 z-20 hover:scale-105 transition-transform text-xs font-bold text-ink-850">
              <span className="text-emerald-500 font-bold">✓</span> QR Verification
            </div>

            <div className="flex items-center gap-1.5 bg-white/70 backdrop-blur-md border border-white/50 shadow-xl px-4 py-2 rounded-full absolute -bottom-8 -right-6 z-20 hover:scale-105 transition-transform text-xs font-bold text-ink-850">
              <span className="text-brand-500 font-bold">⚡</span> Generate Certificate
            </div>

            <div className="flex items-center gap-1.5 bg-white/70 backdrop-blur-md border border-white/50 shadow-xl px-4 py-2 rounded-full absolute top-[55%] -left-16 z-20 hover:scale-105 transition-transform text-xs font-bold text-ink-850">
              <span className="font-bold">📦</span> Export ZIP
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
