"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/hooks/useTranslation";

export default function CtaBand() {
  const { lang } = useTranslation();

  return (
    <div className="max-w-[1200px] mx-auto px-5 sm:px-8 pb-20">
      <div className="rounded-3xl bg-brand-600 px-8 sm:px-14 py-14 text-center relative overflow-hidden">
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-brand-400/30 rounded-full blur-3xl pointer-events-none" />
        <h2 className="font-display text-3xl sm:text-4xl font-semibold text-white relative">
          {lang === "id" ? "Siap bikin sertifikat lebih cepat?" : "Ready to generate certificates faster?"}
        </h2>
        <p className="text-brand-100 mt-3 relative">
          {lang === "id" ? "Gratis untuk 25 sertifikat pertama. Tidak perlu kartu kredit." : "Free for the first 25 certificates. No credit card required."}
        </p>
        <Link href="/auth/register"
          className="inline-flex items-center gap-2 bg-white text-brand-600 hover:bg-brand-50 px-7 py-3 rounded-xl text-base font-semibold transition-all mt-7 relative shadow-soft">
          {lang === "id" ? "Mulai Sekarang" : "Get Started"}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="12" x2="19" y2="12"/><polyline points="13.5 6 19.5 12 13.5 18"/>
          </svg>
        </Link>
      </div>
    </div>
  );
}
