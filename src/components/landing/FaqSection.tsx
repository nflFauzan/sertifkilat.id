"use client";

import { useState } from "react";
import { CaretDown, Question } from "@phosphor-icons/react";
import { useTranslation } from "@/lib/hooks/useTranslation";

export default function FaqSection() {
  const { lang } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: lang === "id" ? "Bagaimana cara kerja generator sertifikat massal?" : "How does the bulk certificate generator work?",
      a: lang === "id" 
        ? "Anda cukup mengunggah data peserta dalam format Excel/CSV, mendesain letak field (Nama, Acara, dsb.) dengan editor drag-and-drop kami, lalu sistem kami akan menghasilkan ratusan file sertifikat dalam hitungan detik. Setiap sertifikat akan mendapat kode unik dan QR Code otomatis."
        : "You simply upload participant data in Excel/CSV format, position coordinate fields (Name, Event, etc.) using our drag-and-drop editor, and our server generates hundreds of custom certificates in seconds. Each certificate receives a unique serial number and verified QR Code automatically.",
    },
    {
      q: lang === "id" ? "Apakah QR Code verifikasi benar-benar aman?" : "Is the verification QR Code secure?",
      a: lang === "id" 
        ? "Sangat aman. Setiap sertifikat memiliki tautan verifikasi unik yang disimpan di basis data kami. Ketika discan, sistem mencocokkan data penerima dengan catatan asli. Ini mencegah pemalsuan sertifikat secara instan tanpa perlu mendaftar akun."
        : "Extremely secure. Each certificate contains a unique verification path stored in our secure database. When scanned, the system cross-references the recipient's parameters against the origin record. This instantly flags forgery without requiring a sign-in.",
    },
    {
      q: lang === "id" ? "Bisakah saya mengunggah template desain buatan sendiri?" : "Can I upload my own custom design templates?",
      a: lang === "id" 
        ? "Ya, Anda bisa mengunggah desain buatan sendiri dalam format PNG, JPG, atau SVG, kemudian menambahkan variabel dinamis di atasnya menggunakan editor visual kami."
        : "Yes, you can upload custom background graphics in PNG, JPG, or SVG formats, then position dynamic text labels (name, event title, dates) directly on top using our drag-and-drop canvas editor.",
    },
    {
      q: lang === "id" ? "Format file apa saja yang didukung untuk data peserta?" : "What participant database formats are supported?",
      a: lang === "id" 
        ? "Sistem mendukung file Excel (.xlsx, .xls) dan CSV. Kami menyediakan file template Excel contoh untuk Anda unduh di dalam dashboard agar data terstruktur dengan benar."
        : "We fully support Excel worksheets (.xlsx, .xls) and standard comma-separated files (CSV). We also provide downloadable template spreadsheets in the dashboard to ensure correct variable binding.",
    },
    {
      q: lang === "id" ? "Apakah saya dapat membatalkan paket langganan kapan saja?" : "Can I cancel my subscription package at any time?",
      a: lang === "id" 
        ? "Tentu saja. Anda dapat meningkatkan, menurunkan, atau membatalkan langganan kapan saja langsung dari pengaturan billing akun Anda tanpa biaya pembatalan tersembunyi."
        : "Absolutely. You can upgrade, downgrade, or cancel your active subscription plan at any time directly in your account billing settings with no hidden cancellation fees.",
    },
  ];

  return (
    <section id="faq" className="bg-gradient-to-b from-blue-50/10 to-white dark:from-ink-950 dark:to-ink-950 py-24 border-t border-ink-100 dark:border-ink-800 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-[800px] mx-auto px-5 sm:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900 text-brand-700 dark:text-brand-400 text-xxs font-bold uppercase tracking-wider">
            <Question className="w-3.5 h-3.5" />
            {lang === "id" ? "Tanya Jawab" : "FAQ Section"}
          </div>
          <h2 className="font-sans text-3xl sm:text-4xl font-extrabold text-ink-900 dark:text-white tracking-tight">
            {lang === "id" ? "Pertanyaan yang Sering Diajukan" : "Frequently Asked Questions"}
          </h2>
          <p className="text-ink-500 dark:text-ink-400 text-sm sm:text-base leading-relaxed">
            {lang === "id" 
              ? "Temukan jawaban singkat tentang fitur, keamanan, dan tata cara penggunaan SertifKilat.id."
              : "Quick answers about limits, bulk generation, QR codes, security and subscription renewals."}
          </p>
        </div>

        {/* Accordion Layout */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="card rounded-2xl overflow-hidden transition-all duration-300 shadow-sm"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-ink-900 dark:text-white hover:bg-ink-50/50 dark:hover:bg-ink-950/20 transition-colors"
                >
                  <span>{faq.q}</span>
                  <div className={`w-8 h-8 rounded-full bg-ink-50 dark:bg-ink-800 flex items-center justify-center shrink-0 text-ink-600 dark:text-ink-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
                    <CaretDown className="w-4 h-4" />
                  </div>
                </button>

                <div
                  style={{
                    maxHeight: isOpen ? "300px" : "0px",
                    opacity: isOpen ? 1 : 0,
                    transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 pt-1 border-t border-ink-100 dark:border-ink-850 text-xs sm:text-sm text-ink-500 dark:text-ink-400 leading-relaxed">
                    {faq.a}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
