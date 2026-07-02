"use client";

import { motion, useReducedMotion } from "motion/react";
import { Stack, ArrowsOut, QrCode, Image, ChartBar, Download } from "@phosphor-icons/react";

const features = [
  {
    id: "feature-mass-gen",
    icon: Stack,
    title: "Generator Massal",
    desc: "Buat 1 hingga 10.000 sertifikat sekaligus dari satu template yang sama.",
  },
  {
    id: "feature-drag-drop",
    icon: ArrowsOut,
    title: "Drag & Drop Posisi",
    desc: "Atur posisi nama, tanggal, dan tanda tangan langsung di atas kanvas sertifikat.",
  },
  {
    id: "feature-qr-verify",
    icon: QrCode,
    title: "QR Verifikasi",
    desc: "Setiap sertifikat punya kode QR dan tautan unik yang bisa diverifikasi publik.",
  },
  {
    id: "feature-templates",
    icon: Image,
    title: "Template Siap Pakai",
    desc: "Puluhan desain untuk webinar, lomba, hingga pelatihan internal - tinggal isi data.",
  },
  {
    id: "feature-analytics",
    icon: ChartBar,
    title: "Analitik Real-time",
    desc: "Pantau jumlah unduhan, scan verifikasi, dan keterlibatan peserta dari satu dasbor.",
  },
  {
    id: "feature-export",
    icon: Download,
    title: "Ekspor Fleksibel",
    desc: "Unduh sebagai PDF atau PNG, atau kirim langsung ke email peserta secara massal.",
  },
];

export default function Features() {
  const reduce = useReducedMotion();

  return (
    <section id="fitur" className="bg-white border-y border-ink-100">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-20">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="badge-brand mb-4">Fitur</span>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-ink-900 mt-4">
            Semua yang dibutuhkan tim event
          </h2>
          <p className="text-ink-500 mt-3 text-base">
            Dirancang untuk panitia, HR, dan tim pelatihan yang menerbitkan sertifikat secara rutin.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.id}
                className="card p-6 hover:shadow-soft transition-all hover:-translate-y-0.5"
                initial={reduce ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.4, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-500 flex items-center justify-center mb-4">
                  <Icon size={18} weight="bold" />
                </div>
                <h3 className="font-semibold text-ink-900 mb-1.5">{feat.title}</h3>
                <p className="text-sm text-ink-500 leading-relaxed">{feat.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
