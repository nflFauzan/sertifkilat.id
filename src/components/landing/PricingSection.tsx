"use client";

import { useState } from "react";
import { Check, Sparkle, Lock, CheckCircle } from "@phosphor-icons/react";
import Link from "next/link";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { useSession } from "next-auth/react";
import UpgradeModal from "@/components/UpgradeModal";

function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function PricingSection() {
  const [yearly, setYearly] = useState(false);
  const { t, lang } = useTranslation();
  const { data: session } = useSession();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [modalInitialPlan, setModalInitialPlan] = useState<"PRO" | "BUSINESS">("PRO");

  const userPlan = session?.user?.plan || "NONE";

  const handleCtaClick = (plan: "FREE" | "PRO" | "BUSINESS", e: React.MouseEvent) => {
    if (!session) return; // Allow normal link redirect for non-logged in users
    e.preventDefault();

    if (plan === "PRO" || plan === "BUSINESS") {
      setModalInitialPlan(plan);
      setShowUpgradeModal(true);
    }
  };

  const PLANS = [
    {
      id: "FREE",
      name: "FREE",
      priceMonthly: 0,
      description: lang === "id" ? "Untuk mencoba dan proyek kecil mandiri" : "For trying out and personal projects",
      features: [
        lang === "id" ? "3 Kegiatan" : "3 Events",
        lang === "id" ? "100 Peserta" : "100 Participants",
        lang === "id" ? "2 Template Sertifikat" : "2 Templates",
        lang === "id" ? "Verifikasi QR" : "QR Verification",
        lang === "id" ? "Unduh Bundel ZIP" : "ZIP Download",
      ]
    },
    {
      id: "PRO",
      name: "PRO",
      priceMonthly: 149000,
      priceYearly: 119200 * 12,
      description: lang === "id" ? "Sempurna untuk panitia aktif dan event menengah" : "Perfect for active committees and mid-sized events",
      recommended: true,
      features: [
        lang === "id" ? "Kegiatan Tidak Terbatas" : "Unlimited Events",
        lang === "id" ? "Peserta Tidak Terbatas" : "Unlimited Participants",
        lang === "id" ? "Template Tidak Terbatas" : "Unlimited Templates",
        lang === "id" ? "Pengiriman Email Otomatis" : "Email Delivery",
        lang === "id" ? "Ekspor PDF Berkualitas Tinggi" : "PDF Export",
        lang === "id" ? "Dashboard Analistik Lengkap" : "Analytics",
        lang === "id" ? "Log Aktivitas Keamanan" : "Activity Log",
      ]
    },
    {
      id: "BUSINESS",
      name: "BUSINESS",
      priceMonthly: 379000,
      priceYearly: 303200 * 12,
      description: lang === "id" ? "Untuk institusi skala besar & multi-organisasi" : "For large institutions & multi-organizations",
      features: [
        lang === "id" ? "Semua Fitur Paket PRO" : "Everything in PRO",
        lang === "id" ? "Multi Organisasi & Profil" : "Multi Organization",
        lang === "id" ? "Multi Administrator Berizin" : "Multi Admin",
        lang === "id" ? "Integrasi API Developer" : "API Integration",
        lang === "id" ? "Tanpa Label SertifKilat (White Label)" : "White Label",
        lang === "id" ? "Domain Kustom (sertifikat.anda.com)" : "Custom Domain",
        lang === "id" ? "Alur Kerja Persetujuan (Approval Workflow)" : "Approval Workflow",
      ]
    }
  ];

  return (
    <section id="harga" className="bg-gradient-to-b from-white to-blue-50/20 dark:from-ink-950 dark:to-ink-950 border-t border-ink-150 dark:border-ink-850 relative overflow-hidden">
      {/* Upgrade Checkout Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={userPlan}
        initialSelectedPlan={modalInitialPlan}
      />

      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-500/5 dark:bg-brand-950/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-24">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900 text-brand-700 dark:text-brand-400 text-xxs font-bold uppercase tracking-wider">
            {lang === "id" ? "Daftar Harga" : "Pricing Plans"}
          </div>
          <h2 className="font-sans text-3xl sm:text-4xl font-extrabold text-ink-900 dark:text-white tracking-tight">
            {lang === "id" ? "Pilih Paket yang Sesuai" : "Choose the Perfect Plan"}
          </h2>
          <p className="text-ink-500 dark:text-ink-400 text-sm sm:text-base leading-relaxed font-medium">
            {lang === "id" 
              ? "Tingkatkan produktivitas pembuatan sertifikat Anda dengan fitur premium SaaS kami." 
              : "Boost your certificate generation productivity with our high-fidelity premium SaaS features."}
          </p>

          {/* Monthly / Yearly Toggle */}
          <div className="flex items-center justify-center gap-3.5 pt-4">
            <span className={`text-xs font-bold uppercase tracking-wider transition-colors ${!yearly ? "text-brand-600 dark:text-brand-400" : "text-ink-400"}`}>
              {lang === "id" ? "Bulanan" : "Monthly"}
            </span>
            <button
              onClick={() => setYearly((y) => !y)}
              className={`relative w-12 h-6.5 rounded-full transition-all duration-300 ${yearly ? "bg-brand-500 shadow-inner" : "bg-ink-200 dark:bg-ink-800"}`}
              aria-label="Toggle billing period"
            >
              <div
                className={`absolute top-1 left-1 w-4.5 h-4.5 bg-white rounded-full shadow-md transition-transform duration-300 ${
                  yearly ? "translate-x-5.5" : "translate-x-0"
                }`}
              />
            </button>
            <span className={`text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 ${yearly ? "text-brand-600 dark:text-brand-400" : "text-ink-400"}`}>
              {lang === "id" ? "Tahunan" : "Yearly"}
              <span className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-450 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900">
                {lang === "id" ? "Hemat 20%" : "Save 20%"}
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
          {PLANS.map((plan) => {
            const isHighlighted = plan.recommended;
            
            // Format price dynamically
            let priceText = "";
            if (plan.id === "FREE") {
              priceText = lang === "id" ? "Gratis" : "Free";
            } else {
              const priceVal = yearly ? (plan.priceYearly ? plan.priceYearly / 12 : 0) : plan.priceMonthly;
              priceText = formatIDR(priceVal);
            }

            // Determine Button Label & Status
            let btnLabel = "";
            let btnDisabled = false;
            let ctaHref = "/auth/register";

            if (!session) {
              // Not logged in
              if (plan.id === "FREE") btnLabel = lang === "id" ? "Mulai Gratis" : "Start Free";
              else if (plan.id === "PRO") btnLabel = lang === "id" ? "Daftar Sekarang" : "Upgrade to Pro";
              else btnLabel = lang === "id" ? "Mulai Paket Bisnis" : "Upgrade to Business";
            } else {
              // Logged in
              ctaHref = `/dashboard/settings#subscription`;
              if (userPlan === plan.id) {
                btnLabel = lang === "id" ? "Paket Saat Ini" : "Current Plan";
                btnDisabled = true;
              } else {
                if (plan.id === "FREE") {
                  btnLabel = lang === "id" ? "Batas Gratis" : "Free Limits Included";
                  btnDisabled = true;
                } else if (plan.id === "PRO") {
                  if (userPlan === "BUSINESS") {
                    btnLabel = lang === "id" ? "Downgrade Tidak Tersedia" : "Downgrade Locked";
                    btnDisabled = true;
                  } else {
                    btnLabel = lang === "id" ? "Tingkatkan ke Pro" : "Upgrade to Pro";
                  }
                } else {
                  // BUSINESS
                  btnLabel = lang === "id" ? "Tingkatkan ke Bisnis" : "Upgrade to Business";
                }
              }
            }

            return (
              <div
                key={plan.id}
                className={`rounded-3xl p-8 flex flex-col relative transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
                  isHighlighted
                    ? "bg-bg-card border-2 border-brand-500 dark:border-brand-500 shadow-xl scale-[1.03] md:scale-[1.05] z-10"
                    : "card shadow-sm"
                }`}
              >
                {isHighlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-brand-500 text-white text-[10px] font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md flex items-center gap-1">
                      <Sparkle size={10} weight="fill" className="animate-spin-slow" />
                      {lang === "id" ? "Rekomendasi" : "Recommended"}
                    </span>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className={`font-black text-xl flex items-center gap-2 ${plan.id === "BUSINESS" ? "text-amber-500" : "text-ink-900 dark:text-white"}`}>
                      {plan.name}
                    </h3>
                    <p className="text-xs text-ink-450 dark:text-ink-500 mt-1 leading-relaxed min-h-[32px] font-medium">
                      {plan.description}
                    </p>
                  </div>

                  <div className="pt-2 border-b border-ink-100 dark:border-ink-800 pb-5">
                    <div>
                      <span className="font-sans text-3xl sm:text-4xl font-black text-ink-900 dark:text-white tracking-tight">
                        {priceText}
                      </span>
                      {plan.id !== "FREE" && (
                        <span className="text-xs text-ink-450 dark:text-ink-500 ml-1 font-bold">
                          {lang === "id" ? "/ bulan" : "/ month"}
                        </span>
                      )}
                    </div>
                    {yearly && plan.id !== "FREE" && (
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-450 font-bold mt-1">
                        {lang === "id" ? "Ditagih tahunan (Hemat 20%)" : "Billed annually (Save 20%)"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Features List */}
                <ul className="mt-6 space-y-3.5 flex-1">
                  {plan.features.map((feat, idx) => (
                    <li key={`${plan.id}-feat-${idx}`} className="flex items-start gap-2.5 text-xs font-semibold">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                        isHighlighted 
                          ? "bg-brand-50 text-brand-600 border-brand-100 dark:bg-brand-950/40 dark:text-brand-400 dark:border-brand-900" 
                          : "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900"
                      }`}>
                        <Check
                          size={10}
                          weight="bold"
                        />
                      </div>
                      <span className="text-ink-600 dark:text-ink-300 font-medium leading-normal">{feat}</span>
                    </li>
                  ))}
                </ul>

                {/* Call To Action */}
                {btnDisabled ? (
                  <button
                    disabled
                    className="mt-8 w-full text-center rounded-xl px-5 py-3.5 text-xs font-bold transition-all bg-ink-100 dark:bg-ink-800 text-ink-400 cursor-not-allowed border border-ink-200 dark:border-ink-750"
                  >
                    {btnLabel}
                  </button>
                ) : (
                  <Link
                    href={ctaHref}
                    onClick={(e) => handleCtaClick(plan.id as never, e)}
                    className={`mt-8 w-full text-center rounded-xl px-5 py-3.5 text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98] block ${
                      isHighlighted
                        ? "bg-brand-500 text-white hover:bg-brand-600 shadow-md shadow-brand-500/20"
                        : "bg-ink-50 dark:bg-ink-800 text-ink-700 dark:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-750 hover:text-ink-900 dark:hover:text-white border border-ink-150 dark:border-ink-700"
                    }`}
                  >
                    {btnLabel}
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-center text-xxs sm:text-xs text-ink-400 mt-10 font-bold">
          {lang === "id" 
            ? "* Seluruh harga belum termasuk pajak. Batalkan langganan kapan saja dari pengaturan akun." 
            : "* All prices exclude tax. Cancel subscription anytime in account settings."}
        </p>
      </div>
    </section>
  );
}
