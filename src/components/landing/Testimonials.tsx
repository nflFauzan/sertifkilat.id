"use client";

import { useState, useEffect } from "react";
import { Star, CaretLeft, CaretRight, Quotes } from "@phosphor-icons/react";
import { useTranslation } from "@/lib/hooks/useTranslation";

const testimonials = [
  {
    id: "testimonial-dini",
    quote: {
      id: "Dulu butuh dua hari kerja untuk 300 sertifikat peserta webinar. Sekarang selesai sebelum rapat sore berakhir.",
      en: "It used to take two business days for 300 certificates. Now it is done before our afternoon meeting finishes."
    },
    name: "Dini Rahmawati",
    role: "Event Lead",
    org: "Ngomestic Community",
    initials: "DR",
    color: "from-brand-500 to-indigo-500",
  },
  {
    id: "testimonial-bagas",
    quote: {
      id: "Fitur QR verifikasi bikin peserta lebih percaya. Tinggal scan, langsung kelihatan sertifikatnya asli.",
      en: "The QR verification feature builds trust with participants. Just scan to see its authenticity immediately."
    },
    name: "Bagas Santoso",
    role: "Founder",
    org: "KelasOnline.id",
    initials: "BS",
    color: "from-slate-700 to-slate-900",
  },
  {
    id: "testimonial-putri",
    quote: {
      id: "Drag-and-drop posisi nama itu kecil tapi krusial — template kami jadi bisa dipakai untuk semua jenis acara.",
      en: "Name placement drag-and-drop is a small but crucial feature — our templates can now be used for any event type."
    },
    name: "Putri Lestari",
    role: "HR Manager",
    org: "Studio Kreatif Nusantara",
    initials: "PL",
    color: "from-emerald-500 to-teal-600",
  },
];

export default function Testimonials() {
  const { lang } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-scroll testimonials carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <section id="testimoni" className="bg-gradient-to-b from-white to-blue-50/10 dark:from-ink-950 dark:to-ink-950 py-24 border-t border-ink-100 dark:border-ink-800 relative overflow-hidden">
      
      {/* Background decoration blur glows */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/45 border border-brand-100 dark:border-brand-900 text-brand-700 dark:text-brand-400 text-xs font-extrabold tracking-wide uppercase shadow-sm">
            Testimonials
          </div>
          <h2 className="font-sans text-3xl sm:text-4xl font-extrabold text-ink-900 dark:text-white tracking-tight">
            {lang === "id" ? "Dipercaya oleh Tim & Penyelenggara Event" : "Trusted by Event Creators & Organizers"}
          </h2>
        </div>

        {/* Carousel Slider */}
        <div className="relative max-w-3xl mx-auto">
          
          {/* Decorative quotes icon */}
          <div className="absolute -top-10 -left-6 text-brand-500/10 dark:text-brand-500/5 pointer-events-none">
            <Quotes size={80} weight="fill" />
          </div>

          <div className="overflow-hidden relative min-h-[260px] flex items-center">
            {testimonials.map((t, idx) => {
              const isActive = idx === activeIndex;
              return (
                <div
                  key={t.id}
                  style={{
                    opacity: isActive ? 1 : 0,
                    transform: isActive ? "translateX(0) scale(1)" : "translateX(24px) scale(0.96)",
                    transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                    position: isActive ? "relative" : "absolute",
                    pointerEvents: isActive ? "auto" : "none",
                  }}
                  className="w-full card rounded-3xl p-8 sm:p-10 shadow-lg flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Star Rating */}
                    <div className="flex gap-0.5 text-amber-400">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} size={16} weight="fill" />
                      ))}
                    </div>
                    {/* Testimonial Quote */}
                    <p className="text-sm sm:text-base text-ink-650 dark:text-ink-300 font-medium italic leading-relaxed">
                      {`"${lang === "id" ? t.quote.id : t.quote.en}"`}
                    </p>
                  </div>

                  {/* Profile info */}
                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-ink-100 dark:border-ink-850">
                    <div className="flex items-center gap-4">
                      {/* Avatar initials with gradient bg */}
                      <div className={`w-11 h-11 rounded-full bg-gradient-to-tr ${t.color} text-white text-sm font-bold flex items-center justify-center shadow-md`}>
                        {t.initials}
                      </div>
                      <div>
                        <h4 className="text-sm sm:text-base font-extrabold text-ink-900 dark:text-white">{t.name}</h4>
                        <p className="text-[11px] sm:text-xs text-ink-450 dark:text-ink-500 font-semibold">
                          {t.role} &middot; <span className="text-brand-500 dark:text-brand-400">{t.org}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Carousel Navigation Buttons */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={handlePrev}
              className="w-10 h-10 rounded-full card hover:bg-ink-50 dark:hover:bg-ink-850 text-ink-600 dark:text-ink-400 flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-all"
              aria-label="Previous testimonial"
            >
              <CaretLeft className="w-5 h-5" />
            </button>
            
            {/* Dots Indicators */}
            <div className="flex gap-2">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    idx === activeIndex 
                      ? "bg-brand-500 w-6" 
                      : "bg-ink-200 dark:bg-ink-800 hover:bg-ink-300 dark:hover:bg-ink-750"
                  }`}
                  aria-label={`Go to testimonial ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="w-10 h-10 rounded-full card hover:bg-ink-50 dark:hover:bg-ink-850 text-ink-600 dark:text-ink-400 flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-all"
              aria-label="Next testimonial"
            >
              <CaretRight className="w-5 h-5" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
