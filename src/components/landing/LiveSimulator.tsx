"use client";

import { useState } from "react";
import { ArrowRight, QrCode } from "@phosphor-icons/react";
import Link from "next/link";

function CertPreview({ name, event }: { name: string; event: string }) {
  const displayName = name.trim() || "Nama Penerima";
  const displayEvent = event.trim() || "Nama Acara";

  return (
    <div className="card shadow-glow p-3">
      <div
        className="bg-[#FBF8F0] rounded-xl relative overflow-hidden"
        style={{ aspectRatio: "1.41 / 1" }}
      >
        <div className="absolute inset-3 border border-[#C9A84C]/35 rounded-lg pointer-events-none" />
        <div className="absolute top-5 left-5 w-3.5 h-3.5 border-t-2 border-l-2 border-[#C9A84C]/35 rounded-tl" />
        <div className="absolute top-5 right-5 w-3.5 h-3.5 border-t-2 border-r-2 border-[#C9A84C]/35 rounded-tr" />
        <div className="absolute bottom-5 left-5 w-3.5 h-3.5 border-b-2 border-l-2 border-[#C9A84C]/35 rounded-bl" />
        <div className="absolute bottom-5 right-5 w-3.5 h-3.5 border-b-2 border-r-2 border-[#C9A84C]/35 rounded-br" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
          <span className="text-[9px] tracking-[0.28em] text-ink-400 font-medium">
            SERTIFIKAT PENGHARGAAN
          </span>
          <p className="text-[10px] text-ink-400 mt-2">Diberikan kepada</p>
          <div className="mt-2 font-display text-xl sm:text-2xl text-ink-900 transition-all duration-200">
            {displayName}
          </div>
          <div className="w-16 h-px bg-[#C9A84C]/45 my-2" />
          <p className="text-[10px] text-ink-500 max-w-[200px] leading-relaxed transition-all duration-200">
            atas partisipasinya dalam{" "}
            <span className="font-medium">{displayEvent}</span>
          </p>
        </div>

        <div className="absolute bottom-3 right-3 w-9 h-9 rounded-lg bg-ink-900 flex items-center justify-center">
          <QrCode size={16} className="text-white" />
        </div>
        <div className="absolute bottom-4 left-5">
          <div className="w-12 h-px bg-ink-400/50 mb-1" />
          <div className="text-[8px] text-ink-400">Ketua Panitia</div>
        </div>
        <div className="absolute top-3 right-3 font-mono text-[7px] text-ink-300">
          SK-2026-####
        </div>
      </div>
    </div>
  );
}

export default function LiveSimulator() {
  const [name, setName] = useState("Bagas Santoso");
  const [event, setEvent] = useState("Webinar Nasional UI/UX 2026");

  return (
    <section className="max-w-[1200px] mx-auto px-5 sm:px-8 py-20">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Left: controls */}
        <div>
          <span className="badge badge-brand mb-4">Coba Langsung</span>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-ink-900 mt-4">
            Lihat hasilnya sebelum generate
          </h2>
          <p className="text-ink-500 mt-3 text-base leading-relaxed">
            Ketik nama penerima dan nama acara. Pratinjau sertifikat berubah secara langsung - persis seperti saat generate massal.
          </p>

          <div className="mt-8 space-y-4">
            <div>
              <label className="block text-xs font-medium text-ink-500 mb-1.5" htmlFor="sim-name">
                Nama Penerima
              </label>
              <input
                id="sim-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama peserta..."
                maxLength={50}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-500 mb-1.5" htmlFor="sim-event">
                Nama Acara
              </label>
              <input
                id="sim-event"
                type="text"
                value={event}
                onChange={(e) => setEvent(e.target.value)}
                placeholder="Nama webinar atau pelatihan..."
                maxLength={80}
                className="input-field"
              />
            </div>
            <p className="text-xs text-ink-400 pt-1">
              Dalam produk sesungguhnya, data diambil otomatis dari file Excel Anda - satu baris per sertifikat.
            </p>
          </div>

          <div className="mt-6">
            <Link href="/generator" className="btn-primary">
              Mulai Generate Sekarang <ArrowRight size={15} weight="bold" />
            </Link>
          </div>
        </div>

        {/* Right: live preview */}
        <div className="relative">
          <CertPreview name={name} event={event} />
          <div className="absolute -top-3 -right-3 badge badge-brand text-xs px-3 py-1.5 shadow-soft">
            Preview langsung
          </div>
        </div>
      </div>
    </section>
  );
}
