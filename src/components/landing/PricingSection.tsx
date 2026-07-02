"use client";

import { useState } from "react";
import { Check, Sparkle } from "@phosphor-icons/react";
import Link from "next/link";
import { PRICING_TIERS } from "@/lib/mock-data";

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

  return (
    <section id="harga" className="bg-gradient-to-b from-white to-blue-50/20 border-t border-ink-100 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-50/40 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-24">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xxs font-bold uppercase tracking-wider">
            Pricing Plans
          </div>
          <h2 className="font-sans text-3xl sm:text-4xl font-extrabold text-ink-900 tracking-tight">
            Pilih Paket yang Sesuai
          </h2>
          <p className="text-ink-500 text-sm sm:text-base leading-relaxed">
            Mulai gratis, upgrade kapan saja untuk membuka fitur premium & kuota tak terbatas.
          </p>

          {/* Monthly / Yearly Toggle */}
          <div className="flex items-center justify-center gap-3.5 pt-4">
            <span className={`text-xs font-semibold uppercase tracking-wider transition-colors ${!yearly ? "text-brand-600" : "text-ink-400"}`}>
              Bulanan
            </span>
            <button
              onClick={() => setYearly((y) => !y)}
              className={`relative w-12 h-6.5 rounded-full transition-all duration-300 ${yearly ? "bg-brand-500 shadow-inner" : "bg-ink-200"}`}
              aria-label="Toggle billing period"
            >
              <div
                className={`absolute top-1 left-1 w-4.5 h-4.5 bg-white rounded-full shadow-md transition-transform duration-300 ${
                  yearly ? "translate-x-5.5" : "translate-x-0"
                }`}
              />
            </button>
            <span className={`text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 ${yearly ? "text-brand-600" : "text-ink-400"}`}>
              Tahunan
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-100">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
          {PRICING_TIERS.map((tier) => {
            const price = yearly ? tier.priceYearly : tier.priceMonthly;
            const isHighlighted = tier.highlighted;

            return (
              <div
                key={tier.id}
                className={`rounded-3xl p-8 flex flex-col relative transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
                  isHighlighted
                    ? "bg-white border-2 border-brand-500 shadow-glow scale-[1.03] md:scale-[1.05] z-10"
                    : "card shadow-soft hover:border-ink-200"
                }`}
              >
                {isHighlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-brand-500 text-white text-[10px] font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md flex items-center gap-1">
                      <Sparkle size={10} weight="fill" className="animate-spin-slow" />
                      Paling Populer
                    </span>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-xl text-ink-900">
                      {tier.name}
                    </h3>
                    <p className="text-xs text-ink-400 mt-1 leading-relaxed">
                      {tier.description}
                    </p>
                  </div>

                  <div className="pt-2 border-b border-ink-50 pb-5">
                    {price !== null ? (
                      <div>
                        <span className="font-sans text-4xl font-extrabold text-ink-900 tracking-tight">
                          {price === 0 ? "Gratis" : formatIDR(price)}
                        </span>
                        {price > 0 && (
                          <span className="text-xs text-ink-450 ml-1 font-semibold">/ bulan</span>
                        )}
                      </div>
                    ) : (
                      <div>
                        <span className="font-sans text-4xl font-extrabold text-ink-900 tracking-tight">
                          Kustom
                        </span>
                      </div>
                    )}
                    {yearly && price !== null && price > 0 && (
                      <p className="text-xxs text-emerald-600 font-bold mt-1">Ditagih tahunan (Hemat 20%)</p>
                    )}
                  </div>
                </div>

                {/* Features List */}
                <ul className="mt-6 space-y-3.5 flex-1">
                  {tier.features.map((feat, idx) => (
                    <li key={`${tier.id}-feat-${idx}`} className="flex items-start gap-2.5 text-xs sm:text-sm">
                      <div className={`w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 ${
                        isHighlighted ? "bg-brand-50 text-brand-600" : "bg-emerald-50 text-emerald-600"
                      }`}>
                        <Check
                          size={10}
                          weight="bold"
                        />
                      </div>
                      <span className="text-ink-600 font-medium leading-normal">{feat}</span>
                    </li>
                  ))}
                </ul>

                {/* Call To Action */}
                <Link
                  href="/auth/register"
                  className={`mt-8 w-full text-center rounded-xl px-5 py-3 text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] block ${
                    isHighlighted
                      ? "bg-brand-500 text-white hover:bg-brand-600 shadow-md shadow-brand-500/20"
                      : "bg-ink-50 text-ink-700 hover:bg-ink-100 hover:text-ink-900 border border-ink-150"
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xxs sm:text-xs text-ink-400 mt-10 font-medium">
          * Seluruh harga belum termasuk pajak. Batalkan langganan kapan saja dari pengaturan akun.
        </p>
      </div>
    </section>
  );
}
