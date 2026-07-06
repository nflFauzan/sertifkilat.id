"use client";

import { useState } from "react";
import { useScroll, useMotionValueEvent } from "motion/react";
import { List, X, ArrowRight } from "@phosphor-icons/react";
import Link from "next/link";
import ThemeSwitcher from "./ThemeSwitcher";
import { useTranslation } from "@/lib/hooks/useTranslation";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();
  const { t, lang } = useTranslation();

  useMotionValueEvent(scrollY, "change", (v) => {
    setScrolled(v > 40);
  });

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 dark:bg-ink-900/90 backdrop-blur-md border-b border-ink-100 dark:border-ink-800 shadow-soft"
          : "bg-ink-50/80 dark:bg-ink-950/80 backdrop-blur-sm"
      }`}
    >
      <nav className="max-w-[1200px] mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center shadow-soft shrink-0">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
              <path d="M13.2 2.2 4 14h6.6l-1 8.5L19 9.5h-6.6z" />
            </svg>
          </span>
          <span className="font-bold text-[17px] tracking-tight text-ink-900 dark:text-white">
            SertifKilat<span className="text-brand-500">.id</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#fitur" className="navlink dark:text-ink-300 dark:hover:text-white">{t("landing.nav.features")}</a>
          <a href="#cara-kerja" className="navlink dark:text-ink-300 dark:hover:text-white">{t("landing.nav.howItWorks")}</a>
          <a href="#testimoni" className="navlink dark:text-ink-300 dark:hover:text-white">{t("landing.nav.testimonials")}</a>
          <a href="#harga" className="navlink dark:text-ink-300 dark:hover:text-white">{t("landing.nav.pricing")}</a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {/* Global Theme Switcher */}
          <ThemeSwitcher />
          <a href="#harga" className="px-3.5 py-2 text-sm font-bold text-brand-600 dark:text-brand-400 hover:bg-brand-50/50 dark:hover:bg-brand-950/20 rounded-xl transition-all">
            Upgrade
          </a>
          <Link href="/auth/login" className="btn-ghost dark:text-ink-300 dark:hover:bg-ink-800">{t("landing.nav.signIn")}</Link>
          <Link href="/auth/login" className="btn-primary">
            {t("landing.nav.tryFree")} <ArrowRight size={15} weight="bold" />
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {/* Theme switcher on mobile too */}
          <ThemeSwitcher />
          <button
            className="btn-ghost !px-2"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
          >
            {mobileOpen ? <X size={20} /> : <List size={20} />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="md:hidden border-t border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900 px-5 py-4 space-y-2">
          <a href="#fitur" className="block navlink py-2" onClick={() => setMobileOpen(false)}>{t("landing.nav.features")}</a>
          <a href="#cara-kerja" className="block navlink py-2" onClick={() => setMobileOpen(false)}>{t("landing.nav.howItWorks")}</a>
          <a href="#testimoni" className="block navlink py-2" onClick={() => setMobileOpen(false)}>{t("landing.nav.testimonials")}</a>
          <a href="#harga" className="block navlink py-2" onClick={() => setMobileOpen(false)}>{t("landing.nav.pricing")}</a>
          <div className="flex gap-2 pt-3 border-t border-ink-100 dark:border-ink-800">
            <a href="#harga" className="btn-ghost text-brand-600 justify-center flex-1 flex items-center" onClick={() => setMobileOpen(false)}>Upgrade</a>
            <Link href="/auth/login" className="btn-secondary flex-1 justify-center" onClick={() => setMobileOpen(false)}>{t("landing.nav.signIn")}</Link>
            <Link href="/auth/login" className="btn-primary flex-1 justify-center" onClick={() => setMobileOpen(false)}>{t("landing.nav.tryFree")}</Link>
          </div>
        </div>
      )}
    </header>
  );
}
