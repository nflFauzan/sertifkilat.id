"use client";

import { useState, useEffect } from "react";
import { motion, animate, useReducedMotion } from "motion/react";
import { Lightning, ArrowRight, QrCode, CheckCircle } from "@phosphor-icons/react";
import Link from "next/link";

interface HeroStats {
  totalCertificates: number;
  totalUsers: number;
}

export default function Hero({ stats }: { stats: HeroStats }) {
  const reduce = useReducedMotion();
  const [statA, setStatA] = useState(0);
  const [statB, setStatB] = useState(0);

  // Gunakan nilai nyata dari database; jika 0, tampilkan 0 (jujur)
  const targetCerts = stats.totalCertificates;
  const targetUsers = stats.totalUsers;

  useEffect(() => {
    if (reduce) {
      setStatA(targetCerts);
      setStatB(targetUsers);
      return;
    }
    const c1 = animate(0, targetCerts, {
      duration: 2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setStatA(Math.round(v)),
    });
    const c2 = animate(0, targetUsers, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setStatB(Math.round(v)),
    });
    return () => {
      c1.stop();
      c2.stop();
    };
  }, [reduce, targetCerts, targetUsers]);

  return (
    <section className="relative overflow-hidden min-h-[100dvh] flex items-center bg-ink-50">
      <div className="absolute -top-32 -right-32 w-[520px] h-[520px] bg-brand-200/40 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-10 -left-40 w-[420px] h-[420px] bg-brand-100/50 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-8 pb-16 w-full">
        <div className="grid lg:grid-cols-2 gap-14 items-center">

          {/* Left column */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="badge badge-brand mb-5 inline-flex items-center gap-1.5">
              <Lightning size={13} weight="fill" />
              Generator sertifikat tercepat di Indonesia
            </div>

            <h1 className="font-display text-[2.4rem] sm:text-5xl lg:text-[3.2rem] leading-[1.08] font-semibold tracking-tight text-ink-900">
              Sertifikat untuk ribuan peserta,{" "}
              <span className="text-brand-500">selesai sebelum kopi Anda dingin.</span>
            </h1>

            <p className="mt-6 text-lg text-ink-500 max-w-xl leading-relaxed">
              Unggah satu desain, tarik data peserta dari Excel, atur posisi nama sekali —
              SertifKilat.id menyusun semua sertifikat lengkap dengan QR verifikasi dalam
              hitungan menit.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/auth/register" className="btn-primary !px-6 !py-3 !text-base">
                Coba Gratis Sekarang <ArrowRight size={17} weight="bold" />
              </Link>
              <Link href="/auth/login" className="btn-secondary !px-6 !py-3 !text-base">
                Masuk ke Dashboard
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-8">
              <div>
                <div className="font-display text-2xl font-semibold text-ink-900">
                  {statA > 0 ? statA.toLocaleString("id-ID") : "—"}
                </div>
                <div className="text-xs text-ink-400 mt-0.5">Sertifikat dibuat</div>
              </div>
              <div>
                <div className="font-display text-2xl font-semibold text-ink-900">
                  {statB > 0 ? `${statB.toLocaleString("id-ID")}+` : "—"}
                </div>
                <div className="text-xs text-ink-400 mt-0.5">Pengguna terdaftar</div>
              </div>
              <div>
                <div className="font-display text-2xl font-semibold text-ink-900">
                  &lt; 3 mnt
                </div>
                <div className="text-xs text-ink-400 mt-0.5">Untuk 100 sertifikat</div>
              </div>
            </div>
          </motion.div>

          {/* Right column: certificate mockup */}
          <motion.div
            className="relative"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="absolute -inset-6 bg-gradient-to-br from-brand-100/60 to-transparent rounded-[2.5rem] -z-10" />

            <div className="card shadow-glow p-3 sm:p-4 rotate-[1.2deg] hover:rotate-[0.3deg] transition-transform duration-500">
              <div
                className="bg-[#FBF8F0] rounded-xl relative overflow-hidden"
                style={{ aspectRatio: "1.41 / 1" }}
              >
                {/* Gold inset border */}
                <div className="absolute inset-3 border border-[#C9A84C]/35 rounded-lg pointer-events-none" />

                {/* Corner ornament */}
                <div className="absolute top-5 left-5 w-4 h-4 border-t-2 border-l-2 border-[#C9A84C]/40 rounded-tl" />
                <div className="absolute top-5 right-5 w-4 h-4 border-t-2 border-r-2 border-[#C9A84C]/40 rounded-tr" />
                <div className="absolute bottom-5 left-5 w-4 h-4 border-b-2 border-l-2 border-[#C9A84C]/40 rounded-bl" />
                <div className="absolute bottom-5 right-5 w-4 h-4 border-b-2 border-r-2 border-[#C9A84C]/40 rounded-br" />

                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
                  <span className="text-[9px] tracking-[0.28em] text-ink-400 font-medium">
                    SERTIFIKAT PENGHARGAAN
                  </span>
                  <p className="text-[10px] text-ink-400 mt-2">Diberikan kepada</p>
                  <div className="mt-2 font-display text-2xl sm:text-3xl text-ink-900 leading-tight">
                    Bagas Santoso
                  </div>
                  <div className="w-20 h-px bg-[#C9A84C]/45 my-2.5" />
                  <p className="text-[10px] text-ink-500 max-w-[240px] leading-relaxed">
                    atas partisipasinya dalam Webinar Nasional<br />
                    <span className="font-medium">Desain UI/UX 2026</span>, 12 Juni 2026
                  </p>
                </div>

                {/* QR code placeholder */}
                <div className="absolute bottom-4 right-4 w-11 h-11 rounded-lg bg-ink-900 flex items-center justify-center">
                  <QrCode size={22} className="text-white" />
                </div>

                {/* Signature line */}
                <div className="absolute bottom-5 left-6">
                  <div className="w-16 h-px bg-ink-400/50 mb-1" />
                  <div className="text-[8px] text-ink-400">Ketua Panitia</div>
                </div>

                {/* ID */}
                <div className="absolute top-3.5 right-4 font-mono text-[7px] text-ink-300">
                  SK-2026-0001
                </div>
              </div>
            </div>

            {/* Status overlay badge */}
            <div className="absolute -bottom-5 -left-4 sm:-left-8 card shadow-soft px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                <CheckCircle size={18} weight="bold" className="text-emerald-500" />
              </div>
              <div>
                {targetCerts > 0 ? (
                  <>
                    <div className="text-sm font-semibold text-ink-900">
                      {targetCerts.toLocaleString("id-ID")} sertifikat dibuat
                    </div>
                    <div className="text-[11px] text-ink-400">dan terverifikasi QR</div>
                  </>
                ) : (
                  <>
                    <div className="text-sm font-semibold text-ink-900">QR Verifikasi Aktif</div>
                    <div className="text-[11px] text-ink-400">setiap sertifikat unik</div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
