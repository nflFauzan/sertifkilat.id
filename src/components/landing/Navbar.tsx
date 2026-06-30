"use client";

import { useState } from "react";
import { useScroll, useMotionValueEvent } from "motion/react";
import { List, X, ArrowRight } from "@phosphor-icons/react";
import Link from "next/link";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (v) => {
    setScrolled(v > 40);
  });

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md border-b border-ink-100 shadow-soft"
          : "bg-ink-50/80 backdrop-blur-sm"
      }`}
    >
      <nav className="max-w-[1200px] mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center shadow-soft shrink-0">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
              <path d="M13.2 2.2 4 14h6.6l-1 8.5L19 9.5h-6.6z" />
            </svg>
          </span>
          <span className="font-bold text-[17px] tracking-tight text-ink-900">
            SertifKilat<span className="text-brand-500">.id</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#fitur" className="navlink">Fitur</a>
          <a href="#cara-kerja" className="navlink">Cara Kerja</a>
          <a href="#testimoni" className="navlink">Testimoni</a>
          <a href="#harga" className="navlink">Harga</a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/auth/login" className="btn-ghost">Masuk</Link>
          <Link href="/generator" className="btn-primary">
            Coba Gratis <ArrowRight size={15} weight="bold" />
          </Link>
        </div>

        <button
          className="md:hidden btn-ghost !px-2"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
        >
          {mobileOpen ? <X size={20} /> : <List size={20} />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="md:hidden border-t border-ink-100 bg-white px-5 py-4 space-y-2">
          <a href="#fitur" className="block navlink py-2" onClick={() => setMobileOpen(false)}>Fitur</a>
          <a href="#cara-kerja" className="block navlink py-2" onClick={() => setMobileOpen(false)}>Cara Kerja</a>
          <a href="#testimoni" className="block navlink py-2" onClick={() => setMobileOpen(false)}>Testimoni</a>
          <a href="#harga" className="block navlink py-2" onClick={() => setMobileOpen(false)}>Harga</a>
          <div className="flex gap-2 pt-3 border-t border-ink-100">
            <Link href="/auth/login" className="btn-secondary flex-1 justify-center" onClick={() => setMobileOpen(false)}>Masuk</Link>
            <Link href="/generator" className="btn-primary flex-1 justify-center" onClick={() => setMobileOpen(false)}>Coba Gratis</Link>
          </div>
        </div>
      )}
    </header>
  );
}
