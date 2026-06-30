"use client";

import { motion, useReducedMotion } from "motion/react";
import { UploadSimple, FileXls, Lightning } from "@phosphor-icons/react";

const steps = [
  {
    id: "step-1",
    num: "01",
    icon: UploadSimple,
    title: "Unggah Template",
    desc: "Pakai desain PNG/PDF Anda sendiri, atau pilih dari galeri template siap pakai.",
  },
  {
    id: "step-2",
    num: "02",
    icon: FileXls,
    title: "Import Data Peserta",
    desc: "Tarik file Excel atau CSV berisi nama peserta, atau tambahkan manual satu per satu.",
  },
  {
    id: "step-3",
    num: "03",
    icon: Lightning,
    title: "Generate & Bagikan",
    desc: "Semua sertifikat dibuat otomatis lengkap dengan QR verifikasi, siap diunduh.",
  },
];

export default function HowItWorks() {
  const reduce = useReducedMotion();

  return (
    <section id="cara-kerja" className="max-w-[1200px] mx-auto px-5 sm:px-8 py-20">
      <div className="text-center max-w-xl mx-auto mb-14">
        <h2 className="font-display text-3xl sm:text-4xl font-semibold text-ink-900">
          Tiga langkah, ratusan sertifikat
        </h2>
        <p className="text-ink-500 mt-3 text-base">
          Tidak perlu desain ulang satu per satu. Urutannya selalu sama, secepat apa pun jumlah pesertanya.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.id}
              className="card p-7 relative overflow-hidden hover:shadow-soft transition-shadow"
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="font-display text-6xl text-brand-100 absolute top-4 right-5 select-none leading-none">
                {step.num}
              </span>
              <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center mb-5 relative">
                <Icon size={20} weight="bold" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-ink-900">{step.title}</h3>
              <p className="text-sm text-ink-500 leading-relaxed">{step.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
