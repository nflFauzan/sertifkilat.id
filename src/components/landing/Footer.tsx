"use client";

import Link from "next/link";
import { GithubLogo, TwitterLogo, LinkedinLogo, InstagramLogo, FacebookLogo } from "@phosphor-icons/react";
import { useTranslation } from "@/lib/hooks/useTranslation";

export default function Footer() {
  const { t, lang } = useTranslation();

  return (
    <footer className="border-t border-ink-150 dark:border-ink-850 bg-white dark:bg-ink-950 transition-colors">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10">
        
        {/* Brand details column */}
        <div className="lg:col-span-2 space-y-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="w-8.5 h-8.5 rounded-xl bg-brand-500 flex items-center justify-center shrink-0 shadow-md">
              <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 text-white" fill="currentColor">
                <path d="M13.2 2.2 4 14h6.6l-1 8.5L19 9.5h-6.6z" />
              </svg>
            </span>
            <span className="font-extrabold tracking-tight text-ink-900 dark:text-white text-base">
              SertifKilat<span className="text-brand-500">.id</span>
            </span>
          </Link>
          <p className="text-xs sm:text-sm text-ink-500 dark:text-ink-400 leading-relaxed max-w-xs font-semibold">
            {t("landing.footer.desc")}
          </p>

          {/* Social Media Icons */}
          <div className="flex items-center gap-3.5 pt-2">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg border border-ink-150 dark:border-ink-800 flex items-center justify-center text-ink-600 dark:text-ink-400 hover:text-brand-500 hover:border-brand-500 dark:hover:text-brand-400 dark:hover:border-brand-400 transition-all hover:scale-105">
              <GithubLogo className="w-4 h-4" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg border border-ink-150 dark:border-ink-800 flex items-center justify-center text-ink-600 dark:text-ink-400 hover:text-brand-500 hover:border-brand-500 dark:hover:text-brand-400 dark:hover:border-brand-400 transition-all hover:scale-105">
              <TwitterLogo className="w-4 h-4" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg border border-ink-150 dark:border-ink-800 flex items-center justify-center text-ink-600 dark:text-ink-400 hover:text-brand-500 hover:border-brand-500 dark:hover:text-brand-400 dark:hover:border-brand-400 transition-all hover:scale-105">
              <LinkedinLogo className="w-4 h-4" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg border border-ink-150 dark:border-ink-800 flex items-center justify-center text-ink-600 dark:text-ink-400 hover:text-brand-500 hover:border-brand-500 dark:hover:text-brand-400 dark:hover:border-brand-400 transition-all hover:scale-105">
              <InstagramLogo className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* 1. Navigation Column */}
        <div className="space-y-4">
          <h4 className="text-xs font-extrabold uppercase tracking-widest text-ink-900 dark:text-white">
            {lang === "id" ? "Navigasi" : "Navigation"}
          </h4>
          <ul className="space-y-2 text-xs sm:text-sm text-ink-500 dark:text-ink-400 font-semibold">
            <li><a href="#fitur" className="hover:text-brand-500 transition-colors">{t("landing.nav.features")}</a></li>
            <li><a href="#cara-kerja" className="hover:text-brand-500 transition-colors">{t("landing.nav.howItWorks")}</a></li>
            <li><a href="#testimoni" className="hover:text-brand-500 transition-colors">{t("landing.nav.testimonials")}</a></li>
            <li><a href="#harga" className="hover:text-brand-500 transition-colors">{t("landing.nav.pricing")}</a></li>
          </ul>
        </div>

        {/* 2. Product Column */}
        <div className="space-y-4">
          <h4 className="text-xs font-extrabold uppercase tracking-widest text-ink-900 dark:text-white">
            {t("landing.footer.product")}
          </h4>
          <ul className="space-y-2 text-xs sm:text-sm text-ink-500 dark:text-ink-400 font-semibold">
            <li><a href="#harga" className="hover:text-brand-500 transition-colors">{t("landing.nav.pricing")}</a></li>
            <li><Link href="/auth/register" className="hover:text-brand-500 transition-colors">{lang === "id" ? "Daftar Gratis" : "Sign Up Free"}</Link></li>
            <li><Link href="/verify/SK-2026-0001" className="hover:text-brand-500 transition-colors">{lang === "id" ? "Verifikasi Sertifikat" : "Verify Certificate"}</Link></li>
            <li><Link href="/dashboard/templates" className="hover:text-brand-500 transition-colors">{lang === "id" ? "Pustaka Desain" : "Design Library"}</Link></li>
          </ul>
        </div>

        {/* 3. Resources Column */}
        <div className="space-y-4">
          <h4 className="text-xs font-extrabold uppercase tracking-widest text-ink-900 dark:text-white">
            {lang === "id" ? "Sumber Daya" : "Resources"}
          </h4>
          <ul className="space-y-2 text-xs sm:text-sm text-ink-500 dark:text-ink-400 font-semibold">
            <li><span className="text-ink-500 dark:text-ink-450 cursor-default">{lang === "id" ? "Panduan API" : "API Guide"}</span></li>
            <li><span className="text-ink-500 dark:text-ink-450 cursor-default">{lang === "id" ? "Status Server" : "Server Status"}</span></li>
            <li><span className="text-ink-500 dark:text-ink-450 cursor-default">{lang === "id" ? "Dokumentasi" : "Documentation"}</span></li>
            <li><span className="text-ink-500 dark:text-ink-450 cursor-default">Changelog</span></li>
          </ul>
        </div>

        {/* 4. Legal & Contact Column */}
        <div className="space-y-4">
          <h4 className="text-xs font-extrabold uppercase tracking-widest text-ink-900 dark:text-white">
            Legal
          </h4>
          <ul className="space-y-2 text-xs sm:text-sm text-ink-500 dark:text-ink-400 font-semibold">
            <li><span className="text-ink-500 dark:text-ink-450 cursor-default">{lang === "id" ? "Kebijakan Privasi" : "Privacy Policy"}</span></li>
            <li><span className="text-ink-500 dark:text-ink-450 cursor-default">{lang === "id" ? "Syarat Layanan" : "Terms of Service"}</span></li>
            <li>
              <a href="mailto:support@sertifkilat.id" className="hover:text-brand-500 transition-colors">
                {lang === "id" ? "Hubungi Kami" : "Contact Us"}
              </a>
            </li>
          </ul>
        </div>

      </div>
      
      {/* Footer disclaimer */}
      <div className="border-t border-ink-100 dark:border-ink-850 py-6 text-center text-xxs sm:text-xs text-ink-400 dark:text-ink-500 font-bold transition-colors">
        &copy; 2026 SertifKilat.id &mdash; {lang === "id" ? "Platform Generator Sertifikat Indonesia" : "Indonesian Certificate Generator Platform"}
      </div>
    </footer>
  );
}
