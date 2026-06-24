"use client";

import { motion, useReducedMotion } from "motion/react";
import { Star } from "@phosphor-icons/react";

const testimonials = [
  {
    quote: "Dulu butuh dua hari kerja untuk 300 sertifikat peserta webinar. Sekarang selesai sebelum rapat sore berakhir.",
    name: "Dini Rahmawati", role: "Event Lead", org: "Komunitas Ngomestic", initials: "DR", color: "bg-brand-500",
  },
  {
    quote: "Fitur QR verifikasi bikin peserta lebih percaya. Tinggal scan, langsung kelihatan sertifikatnya asli.",
    name: "Bagas Santoso", role: "Founder", org: "KelasOnline.id", initials: "BS", color: "bg-ink-700",
  },
  {
    quote: "Drag-and-drop posisi nama itu kecil tapi krusial - template kami jadi bisa dipakai untuk semua jenis acara.",
    name: "Putri Lestari", role: "HR Manager", org: "Studio Kreatif Nusantara", initials: "PL", color: "bg-emerald-600",
  },
];

export default function Testimonials() {
  const reduce = useReducedMotion();
  return (
    <section id="testimoni" className="max-w-[1200px] mx-auto px-5 sm:px-8 py-20">
      <div className="text-center max-w-xl mx-auto mb-14">
        <h2 className="font-display text-3xl sm:text-4xl font-semibold text-ink-900">
          Dipercaya tim yang sibuk
        </h2>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <motion.div key={t.name} className="card p-6 flex flex-col"
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}>
            <div className="flex gap-0.5 text-gold-500 mb-4">
              {Array.from({ length: 5 }).map((_, j) => <Star key={j} size={15} weight="fill" />)}
            </div>
            <p className="text-sm text-ink-600 leading-relaxed flex-1 mb-5">{`"${t.quote}"`}</p>
            <div className="flex items-center gap-3 pt-4 border-t border-ink-100">
              <div className={`w-9 h-9 rounded-full ${t.color} text-white text-xs font-semibold flex items-center justify-center shrink-0`}>
                {t.initials}
              </div>
              <div>
                <div className="text-sm font-semibold text-ink-900">{t.name}</div>
                <div className="text-xs text-ink-400">{t.role}, {t.org}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
