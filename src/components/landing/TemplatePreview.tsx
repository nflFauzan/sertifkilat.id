"use client";

import { Cards, NotePencil, Lightning, ArrowRight } from "@phosphor-icons/react";
import Link from "next/link";
import { useTranslation } from "@/lib/hooks/useTranslation";

export default function TemplatePreview() {
  const { lang } = useTranslation();

  const features = [
    {
      id: "pro-templates",
      icon: Cards,
      title: lang === "id" ? "Professional Templates" : "Professional Templates",
      desc: lang === "id" 
        ? "Template sertifikat profesional siap pakai untuk: Webinar, Seminar, Workshop, Pelatihan, Sertifikasi."
        : "Professional certificate templates ready to use for: Webinars, Seminars, Workshops, Trainings, Certifications.",
      color: "from-blue-500/10 to-indigo-500/10 dark:from-blue-500/5 dark:to-indigo-500/5",
      iconColor: "text-brand-500 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 border-brand-100 dark:border-brand-900",
    },
    {
      id: "easy-editor",
      icon: NotePencil,
      title: lang === "id" ? "Easy Certificate Editor" : "Easy Certificate Editor",
      desc: lang === "id" 
        ? "Editor langsung di browser. Dapat mengubah: Nama, QR Code, Tanda tangan, Tanggal, Elemen lainnya tanpa aplikasi desain."
        : "Editor directly in your browser. Can modify: Name, QR Code, Signature, Date, and other elements without design software.",
      color: "from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/5 dark:to-teal-500/5",
      iconColor: "text-emerald-500 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900",
    },
    {
      id: "instant-generation",
      icon: Lightning,
      title: lang === "id" ? "Instant Certificate Generation" : "Instant Certificate Generation",
      desc: lang === "id" 
        ? "Generate ratusan sertifikat dalam hitungan detik. Ekspor ke format: PNG, PDF, ZIP."
        : "Generate hundreds of certificates in seconds. Export to format: PNG, PDF, ZIP.",
      color: "from-purple-500/10 to-pink-500/10 dark:from-purple-500/5 dark:to-pink-500/5",
      iconColor: "text-purple-500 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border-purple-100 dark:border-purple-900",
    },
  ];

  return (
    <section id="features-highlights" className="bg-gradient-to-b from-white to-blue-50/10 dark:from-ink-950 dark:to-ink-950 py-24 border-t border-ink-150 dark:border-ink-850 relative overflow-hidden">
      {/* Radial blur background glows */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/45 border border-brand-100 dark:border-brand-900 text-brand-700 dark:text-brand-400 text-xs font-extrabold tracking-wide uppercase shadow-sm">
            {lang === "id" ? "Keunggulan Sistem" : "Core Capabilities"}
          </div>
          <h2 className="font-sans text-3xl sm:text-4xl font-extrabold text-ink-900 dark:text-white tracking-tight">
            {lang === "id" ? "Fitur Utama SertifKilat.id" : "Why Choose SertifKilat.id"}
          </h2>
          <p className="text-ink-700 dark:text-ink-300 text-sm sm:text-base leading-relaxed font-medium">
            {lang === "id" 
              ? "Platform modern yang dirancang untuk mempercepat pembuatan, validasi, dan pendistribusian sertifikat Anda."
              : "A production-grade engine built to speed up the drafting, approval and layout workflows."}
          </p>
        </div>

        {/* Feature Cards Grid (3 Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                className="card rounded-3xl p-8 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 relative backdrop-blur-md"
              >
                {/* Visual Glass Glow Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl -z-10`} />

                <div className="space-y-6">
                  {/* Large Icon Container */}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${feat.iconColor} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                    <Icon size={28} weight="bold" />
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-extrabold text-lg text-ink-900 dark:text-white transition-colors group-hover:text-brand-500 dark:group-hover:text-brand-400">
                      {feat.title}
                    </h3>
                    <p className="text-sm text-ink-700 dark:text-ink-300 leading-relaxed font-medium">
                      {feat.desc}
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-ink-100 dark:border-ink-850/50">
                  <Link
                    href="/auth/register"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors group-hover:translate-x-1 duration-200"
                  >
                    <span>{lang === "id" ? "Mulai Sekarang" : "Get Started"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
