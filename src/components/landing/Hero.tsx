"use client";

import { motion } from "motion/react";
import { ArrowRight, Sparkle, Trophy, CheckSquare, Lightning, ArrowsOut } from "@phosphor-icons/react";
import Link from "next/link";
import Image from "next/image";

import { useTranslation } from "@/lib/hooks/useTranslation";

interface HeroProps {
  stats?: {
    totalCertificates: number;
    totalUsers: number;
  };
}

export default function Hero({ stats }: HeroProps) {
  const { t, lang } = useTranslation();
  
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
    <section className="relative overflow-hidden min-h-[95vh] flex items-center bg-gradient-to-b from-blue-50/20 via-white to-white dark:from-ink-950 dark:via-ink-950 dark:to-ink-900 py-16 lg:py-24">
      
      {/* ── Background Glows & Mesh Overlay ── */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-brand-500/5 via-transparent to-transparent pointer-events-none -z-10" />
      <div className="absolute top-10 left-1/3 w-[600px] h-[600px] bg-brand-500/10 dark:bg-brand-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute top-40 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* Subtle Noise / Grid Pattern Overlay using CSS */}
      <div 
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.02] pointer-events-none -z-10"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, black 1px, transparent 0)`,
          backgroundSize: "24px 24px"
        }}
      />

      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 w-full z-10 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-center">
        
        {/* Left Side Content */}
        <div className="lg:col-span-6 flex flex-col space-y-6 sm:space-y-8 text-center lg:text-left items-center lg:items-start">
          
          {/* Animated Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/45 border border-brand-100 dark:border-brand-900 text-brand-700 dark:text-brand-400 text-xs font-extrabold tracking-wide uppercase shadow-sm">
            <Sparkle className="w-3.5 h-3.5 text-brand-500 animate-spin-slow" weight="fill" />
            {t("landing.hero.badge")}
          </div>

          {/* Premium Typography Heading */}
          <div className="space-y-4">
            <h1 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-ink-900 dark:text-white leading-[1.05] max-w-xl">
              {t("landing.hero.title1")} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 via-indigo-500 to-indigo-600 dark:from-brand-400 dark:via-indigo-400 dark:to-indigo-500">
                {t("landing.hero.title2")}
              </span>
            </h1>
            
            {/* Description */}
            <p className="text-base sm:text-lg text-ink-550 dark:text-ink-400 max-w-lg leading-relaxed font-medium">
              {t("landing.hero.subtitle")}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 w-full">
            <Link 
              href="/auth/register" 
              className="btn-primary !px-8 !py-4 !text-sm flex items-center gap-2 group shadow-glow shadow-brand-500/20 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 font-extrabold"
            >
              {t("landing.hero.ctaStart")}
              <ArrowRight size={16} weight="bold" className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <a
              href="#cara-kerja"
              className="px-6 py-4 rounded-xl border border-ink-150 dark:border-ink-800 text-ink-700 dark:text-ink-300 font-bold text-sm bg-white dark:bg-ink-900 hover:bg-ink-50 dark:hover:bg-ink-850 hover:border-ink-200 dark:hover:border-ink-750 transition-all hover:-translate-y-1 active:translate-y-0 shadow-sm"
            >
              {lang === "id" ? "Pelajari Fitur" : "Explore Features"}
            </a>
          </div>

          {/* Micro stats banner */}
          <div className="grid grid-cols-3 gap-4 w-full max-w-md pt-4">
            <div className="bg-white/60 dark:bg-ink-900/60 backdrop-blur-md rounded-2xl p-4 border border-white/80 dark:border-ink-850 shadow-sm flex flex-col items-center lg:items-start justify-center transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group">
              <span className="text-2xl font-black text-brand-600 dark:text-brand-400 tracking-tight group-hover:scale-105 transition-transform">{formattedUsers}</span>
              <span className="text-[10px] font-bold text-ink-400 mt-1 uppercase tracking-wider text-center lg:text-left">{t("landing.hero.statUsers")}</span>
            </div>
            <div className="bg-white/60 dark:bg-ink-900/60 backdrop-blur-md rounded-2xl p-4 border border-white/80 dark:border-ink-850 shadow-sm flex flex-col items-center lg:items-start justify-center transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group">
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight group-hover:scale-105 transition-transform">{formattedCerts}</span>
              <span className="text-[10px] font-bold text-ink-400 mt-1 uppercase tracking-wider text-center lg:text-left">{t("landing.hero.statCerts")}</span>
            </div>
            <div className="bg-white/60 dark:bg-ink-900/60 backdrop-blur-md rounded-2xl p-4 border border-white/80 dark:border-ink-850 shadow-sm flex flex-col items-center lg:items-start justify-center transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight group-hover:scale-105 transition-transform">99.9%</span>
              <span className="text-[10px] font-bold text-ink-400 mt-1 uppercase tracking-wider text-center lg:text-left">{t("common.success")}</span>
            </div>
          </div>
        </div>

        {/* Right Side Image Pedestal */}
        <div className="lg:col-span-6 relative aspect-[4/3] w-full flex items-center justify-center">
          
          {/* Radial glow directly behind the mock image */}
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-500/20 via-indigo-500/10 to-transparent rounded-full blur-[80px] -z-10" />

          {/* Pedestal platform reflection glow */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[75%] h-16 bg-gradient-to-tr from-brand-400/30 to-indigo-500/30 rounded-full blur-2xl -z-10" />

          {/* 3D Glass Pedestal Platform */}
          <div 
            className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[90%] h-10 bg-gradient-to-b from-white/80 to-ink-200/30 dark:from-ink-800/80 dark:to-ink-950/20 rounded-full border border-white/70 dark:border-ink-800/50 shadow-xl -z-20 transform scale-y-[0.25]"
          />

          {/* Floating perspective card element */}
          <motion.div
            className="relative w-full max-w-[540px] aspect-[4/3] cursor-pointer"
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Premium Preview wrapper with 3D projection rotation */}
            <div 
              className="relative w-full h-full rounded-2xl overflow-hidden shadow-3xl border border-white/85 dark:border-ink-800/80 bg-white/40 dark:bg-ink-950/40 backdrop-blur-sm transition-all duration-700 ease-out hover:rotate-0 hover:scale-[1.04]"
              style={{ 
                transform: "perspective(1200px) rotateY(-10deg) rotateX(10deg) rotateZ(-2deg)",
                transformStyle: "preserve-3d"
              }}
            >
              <Image
                src="/templates/landingpage.png"
                alt="SertifKilat Dashboard Preview"
                fill
                priority
                className="object-contain p-2"
              />
            </div>

            {/* Floating Glassmorphic Badges */}
            <div className="flex items-center gap-1.5 bg-white/85 dark:bg-ink-900/85 backdrop-blur-md border border-white/50 dark:border-ink-800 shadow-xl px-4 py-2.5 rounded-full absolute -top-8 -left-6 z-20 hover:scale-105 transition-transform text-[11px] font-extrabold text-ink-850 dark:text-white">
              <span className="text-emerald-500 font-black">✓</span> QR Verification
            </div>

            <div className="flex items-center gap-1.5 bg-white/85 dark:bg-ink-900/85 backdrop-blur-md border border-white/50 dark:border-ink-800 shadow-xl px-4 py-2.5 rounded-full absolute -bottom-6 -right-4 z-20 hover:scale-105 transition-transform text-[11px] font-extrabold text-brand-500 dark:text-brand-400">
              <Lightning className="w-3.5 h-3.5" weight="fill" /> Generate Certificate
            </div>

            <div className="flex items-center gap-1.5 bg-white/85 dark:bg-ink-900/85 backdrop-blur-md border border-white/50 dark:border-ink-800 shadow-xl px-4 py-2.5 rounded-full absolute top-[60%] -left-12 z-20 hover:scale-105 transition-transform text-[11px] font-extrabold text-ink-850 dark:text-white">
              <Trophy className="text-amber-500" weight="fill" /> Premium Templates
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
