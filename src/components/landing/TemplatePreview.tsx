"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkle, ArrowRight, Palette } from "@phosphor-icons/react";
import { useTranslation } from "@/lib/hooks/useTranslation";

export default function TemplatePreview() {
  const { lang } = useTranslation();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const templates = [
    {
      id: "navy-gold",
      name: lang === "id" ? "Elegan Navy Gold" : "Elegant Navy Gold",
      src: "/templates/elegan-navy-gold.svg",
      badge: "FREE",
      badgeColor: "bg-ink-100 text-ink-700 border-ink-200",
      description: lang === "id" ? "Desain klasik bernuansa emas dan biru gelap untuk seminar formal." : "Classic gold and deep blue design suited for formal seminars.",
    },
    {
      id: "modern-appreciation",
      name: lang === "id" ? "Modern Appreciation" : "Modern Appreciation",
      src: "/templates/modern-appreciation.svg",
      badge: "FREE",
      badgeColor: "bg-ink-100 text-ink-700 border-ink-200",
      description: lang === "id" ? "Desain minimalis modern dengan warna bersih untuk pelatihan kerja." : "Modern minimalist layout with clean styles for professional training.",
    },
    {
      id: "luxury-achievement",
      name: lang === "id" ? "Luxury Achievement" : "Luxury Achievement",
      src: "/templates/luxury-achievement.svg",
      badge: "PRO",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
      description: lang === "id" ? "Desain mewah berornamen khusus untuk penghargaan tinggi." : "Luxurious design with intricate border patterns for prestigious awards.",
    },
    {
      id: "elegant-gold",
      name: lang === "id" ? "Elegant Gold Premium" : "Elegant Gold Premium",
      src: "/templates/elegant-gold.svg",
      badge: "PRO",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
      description: lang === "id" ? "Desain bersertifikat emas mengkilap untuk kelulusan lembaga." : "Shining gold layout tailored for institutional academic graduations.",
    },
    {
      id: "sertifikat-formal",
      name: lang === "id" ? "Sertifikat Formal Biru" : "Formal Corporate Blue",
      src: "/templates/sertifikat1.svg",
      badge: "BUSINESS",
      badgeColor: "bg-brand-100 text-brand-800 border-brand-200",
      description: lang === "id" ? "Desain korporat resmi dengan ruang tanda tangan ganda." : "Official corporate structure supporting multiple verification signers.",
    },
    {
      id: "sertifikat-modern-dua",
      name: lang === "id" ? "Sertifikat Minimalis Merah" : "Minimalist Coral Red",
      src: "/templates/sertifikat2.svg",
      badge: "BUSINESS",
      badgeColor: "bg-brand-100 text-brand-800 border-brand-200",
      description: lang === "id" ? "Desain cerah modern untuk kompetisi kreatif dan hackathon." : "Vibrant template best for creative design hackathons & workshops.",
    },
  ];

  return (
    <section id="templates" className="bg-gradient-to-b from-white to-blue-50/10 dark:from-ink-950 dark:to-ink-900 py-24 border-t border-ink-100 dark:border-ink-800 relative overflow-hidden">
      {/* Radial blur glows */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900 text-brand-700 dark:text-brand-400 text-xxs font-bold uppercase tracking-wider">
            <Palette className="w-3.5 h-3.5" />
            {lang === "id" ? "Pustaka Desain" : "Design Library"}
          </div>
          <h2 className="font-sans text-3xl sm:text-4xl font-extrabold text-ink-900 dark:text-white tracking-tight">
            {lang === "id" ? "Pilih Template Desain Profesional" : "Choose From Professional Layouts"}
          </h2>
          <p className="text-ink-500 dark:text-ink-400 text-sm sm:text-base leading-relaxed">
            {lang === "id" 
              ? "Sesuaikan tata letak dengan mudah langsung dari browser Anda tanpa aplikasi desain luar."
              : "Customize coordinates, sizes, fonts and QR codes instantly using our built-in canvas editor."}
          </p>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {templates.map((tpl) => {
            const isHovered = hoveredId === tpl.id;
            return (
              <div
                key={tpl.id}
                onMouseEnter={() => setHoveredId(tpl.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="bg-white dark:bg-ink-900 border border-ink-150 dark:border-ink-800 rounded-3xl p-5 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 relative"
              >
                {/* Image Container with Hover Zoom */}
                <div className="aspect-[1.41/1] w-full rounded-2xl bg-ink-50 dark:bg-ink-950 relative overflow-hidden border border-ink-100 dark:border-ink-800 shadow-inner">
                  <Image
                    src={tpl.src}
                    alt={tpl.name}
                    fill
                    className="object-cover transition-transform duration-500 ease-out"
                    style={{
                      transform: isHovered ? "scale(1.08)" : "scale(1.01)",
                    }}
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-1 text-[9px] font-extrabold uppercase rounded-full border tracking-widest ${tpl.badgeColor} shadow-sm`}>
                      {tpl.badge}
                    </span>
                  </div>
                </div>

                {/* Info and button */}
                <div className="space-y-4 mt-5">
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-sm text-ink-900 dark:text-white flex items-center gap-1.5 group-hover:text-brand-500 transition-colors">
                      {tpl.name}
                    </h3>
                    <p className="text-[11px] text-ink-450 dark:text-ink-550 leading-relaxed min-h-[32px]">
                      {tpl.description}
                    </p>
                  </div>

                  <Link
                    href="/dashboard/templates"
                    className="w-full py-2.5 rounded-xl border border-ink-150 dark:border-ink-750 text-ink-700 dark:text-ink-200 hover:text-white hover:bg-brand-500 hover:border-brand-500 transition-all font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 duration-200"
                  >
                    <span>{lang === "id" ? "Gunakan Template" : "Use Template"}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
