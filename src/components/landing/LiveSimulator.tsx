"use client";

import { useState } from "react";
import { ArrowRight, QrCode } from "@phosphor-icons/react";
import Link from "next/link";
import { useTranslation } from "@/lib/hooks/useTranslation";

function CertPreview({ name, event }: { name: string; event: string }) {
  const { lang } = useTranslation();
  const isNameEmpty = !name.trim();
  const isEventEmpty = !event.trim();
  
  const displayName = name.trim() || (lang === "id" ? "[Nama Peserta]" : "[Recipient Name]");
  const displayEvent = event.trim() || (lang === "id" ? "[Nama Event]" : "[Event Name]");

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
          <span className="text-[9px] tracking-[0.28em] text-slate-400 font-medium">
            {lang === "id" ? "SERTIFIKAT PENGHARGAAN" : "CERTIFICATE OF APPRECIATION"}
          </span>
          <p className="text-[10px] text-slate-400 mt-2">{lang === "id" ? "Diberikan kepada" : "Presented to"}</p>
          <div 
            className={`mt-2 font-display text-xl sm:text-2xl transition-all duration-200 ${
              isNameEmpty ? "text-slate-300 italic font-normal" : "text-slate-800"
            }`}
          >
            {displayName}
          </div>
          <div className="w-16 h-px bg-[#C9A84C]/45 my-2" />
          <p className="text-[10px] text-slate-500 max-w-[200px] leading-relaxed transition-all duration-200">
            {lang === "id" ? "atas partisipasinya dalam" : "for active participation in"}{" "}
            <span className={`font-medium ${isEventEmpty ? "text-slate-300 italic" : "text-slate-800"}`}>
              {displayEvent}
            </span>
          </p>
        </div>
 
        <div className="absolute bottom-3 right-3 w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center">
          <QrCode size={16} className="text-white" />
        </div>
        <div className="absolute bottom-4 left-5">
          <div className="w-12 h-px bg-slate-300 mb-1" />
          <div className="text-[8px] text-slate-400">{lang === "id" ? "Ketua Panitia" : "Committee Chairman"}</div>
        </div>
        <div className="absolute top-3 right-3 font-mono text-[7px] text-slate-300">
          SK-2026-####
        </div>
      </div>
    </div>
  );
}

export default function LiveSimulator() {
  const [name, setName] = useState("");
  const [event, setEvent] = useState("");
  const { lang } = useTranslation();

  return (
    <section className="max-w-[1200px] mx-auto px-5 sm:px-8 py-20">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Left: controls */}
        <div>
          <span className="badge-brand mb-4">{lang === "id" ? "Coba Langsung" : "Try Live"}</span>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-ink-900 mt-4">
            {lang === "id" ? "Lihat hasilnya sebelum generate" : "See the results before generating"}
          </h2>
          <p className="text-ink-500 mt-3 text-base leading-relaxed">
            {lang === "id"
              ? "Ketik nama penerima dan nama acara. Pratinjau sertifikat berubah secara langsung - persis seperti saat generate massal."
              : "Type a recipient name and event name. The certificate preview updates in real-time - exactly how it works for bulk generation."}
          </p>

          <div className="mt-8 space-y-4">
            <div>
              <label className="block text-xs font-medium text-ink-500 mb-1.5" htmlFor="sim-name">
                {lang === "id" ? "Nama Penerima" : "Recipient Name"}
              </label>
              <input
                id="sim-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={lang === "id" ? "Nama peserta..." : "Recipient name..."}
                maxLength={50}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-500 mb-1.5" htmlFor="sim-event">
                {lang === "id" ? "Nama Acara" : "Event Name"}
              </label>
              <input
                id="sim-event"
                type="text"
                value={event}
                onChange={(e) => setEvent(e.target.value)}
                placeholder={lang === "id" ? "Nama webinar atau pelatihan..." : "Webinar or training name..."}
                maxLength={80}
                className="input-field"
              />
            </div>
            <p className="text-xs text-ink-400 pt-1">
              {lang === "id"
                ? "Dalam produk sesungguhnya, data diambil otomatis dari file Excel Anda - satu baris per sertifikat."
                : "In the actual product, data is pulled automatically from your Excel sheet - one row per certificate."}
            </p>
          </div>

          <div className="mt-6">
            <Link href="/dashboard/generator" className="btn-primary">
              {lang === "id" ? "Mulai Generate Sekarang" : "Start Generating Now"} <ArrowRight size={15} weight="bold" />
            </Link>
          </div>
        </div>

        {/* Right: live preview */}
        <div className="relative">
          <CertPreview name={name} event={event} />
          <div className="absolute -top-3 -right-3 badge-brand text-xs px-3 py-1.5 shadow-soft">
            {lang === "id" ? "Pratinjau langsung" : "Live preview"}
          </div>
        </div>
      </div>
    </section>
  );
}
