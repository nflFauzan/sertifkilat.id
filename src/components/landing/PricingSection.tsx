"use client";

import { useState } from "react";
import { Check } from "@phosphor-icons/react";
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
    <section id="harga" className="bg-white border-t border-ink-100">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-20">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-ink-900">
            Pilih paket yang sesuai
          </h2>
          <p className="text-ink-500 mt-3 text-base">
            Mulai gratis, upgrade kapan saja. Tidak ada biaya tersembunyi.
          </p>
          <div className="flex items-center justify-center gap-3 mt-8">
            <span className={`text-sm font-medium ${!yearly ? "text-ink-900" : "text-ink-400"}`}>
              Bulanan
            </span>
            <button
              onClick={() => setYearly((y) => !y)}
              className={`relative w-12 h-6 rounded-full transition-colors ${yearly ? "bg-brand-500" : "bg-ink-200"}`}
              aria-label="Toggle billing period"
            >
              <div
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  yearly ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
            <span className={`text-sm font-medium flex items-center gap-2 ${yearly ? "text-ink-900" : "text-ink-400"}`}>
              Tahunan
              <span className="badge badge-green text-[10px] py-0.5">Hemat 20%</span>
            </span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PRICING_TIERS.map((tier) => {
            const price = yearly ? tier.priceYearly : tier.priceMonthly;
            const isDark = tier.dark;
            const isHighlighted = tier.highlighted;

            return (
              <div
                key={tier.id}
                className={`rounded-2xl p-6 flex flex-col relative ${
                  isDark
                    ? "bg-ink-900 text-white"
                    : isHighlighted
                    ? "bg-white border-2 border-brand-500 shadow-glow"
                    : "card"
                }`}
              >
                {isHighlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="badge badge-brand text-[10px] px-3 py-1 shadow-soft whitespace-nowrap">
                      Paling Populer
                    </span>
                  </div>
                )}

                <div>
                  <h3 className={`font-semibold text-lg ${isDark ? "text-white" : "text-ink-900"}`}>
                    {tier.name}
                  </h3>
                  <p className={`text-xs mt-1 mb-4 ${isDark ? "text-ink-300" : "text-ink-400"}`}>
                    {tier.description}
                  </p>

                  {price !== null ? (
                    <div className="mb-1">
                      <span className={`font-display text-3xl font-semibold ${isDark ? "text-white" : "text-ink-900"}`}>
                        {price === 0 ? "Gratis" : formatIDR(price)}
                      </span>
                      {price > 0 && (
                        <span className={`text-xs ml-1 ${isDark ? "text-ink-400" : "text-ink-400"}`}>/bln</span>
                      )}
                    </div>
                  ) : (
                    <div className="mb-1">
                      <span className={`font-display text-3xl font-semibold ${isDark ? "text-white" : "text-ink-900"}`}>
                        Kustom
                      </span>
                    </div>
                  )}
                  {yearly && price !== null && price > 0 && (
                    <p className="text-xs text-emerald-500 mb-2">Hemat 20% vs bulanan</p>
                  )}
                </div>

                <ul className="mt-5 space-y-2.5 flex-1">
                  {tier.features.map((feat, idx) => (
                    <li key={`${tier.id}-feat-${idx}`} className="flex items-start gap-2 text-sm">
                      <Check
                        size={14}
                        weight="bold"
                        className={`mt-0.5 shrink-0 ${
                          isDark
                            ? "text-brand-400"
                            : isHighlighted
                            ? "text-brand-500"
                            : "text-emerald-500"
                        }`}
                      />
                      <span className={isDark ? "text-ink-300" : "text-ink-600"}>{feat}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/auth/register"
                  className={`mt-6 w-full text-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-all block ${
                    isDark
                      ? "bg-white text-ink-900 hover:bg-ink-50"
                      : isHighlighted
                      ? "bg-brand-500 text-white hover:bg-brand-600"
                      : "bg-ink-50 text-ink-700 hover:bg-ink-100 border border-ink-200"
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-ink-400 mt-8">
          Semua paket berbayar termasuk uji coba 14 hari gratis. Bisa batal kapan saja.
        </p>
      </div>
    </section>
  );
}
