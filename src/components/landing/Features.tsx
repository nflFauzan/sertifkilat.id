"use client";

import { motion, useReducedMotion } from "motion/react";
import { Stack, ArrowsOut, QrCode, Image, ChartBar, DownloadSimple } from "@phosphor-icons/react";
import { useTranslation } from "@/lib/hooks/useTranslation";

export default function Features() {
  const reduce = useReducedMotion();
  const { t, lang } = useTranslation();

  const features = [
    {
      id: "feature-mass-gen",
      icon: Stack,
      title: t("landing.features.f1Title"),
      desc: t("landing.features.f1Desc"),
      color: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900",
    },
    {
      id: "feature-drag-drop",
      icon: ArrowsOut,
      title: t("landing.features.f3Title"),
      desc: t("landing.features.f3Desc"),
      color: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900",
    },
    {
      id: "feature-qr-verify",
      icon: QrCode,
      title: t("landing.features.f2Title"),
      desc: t("landing.features.f2Desc"),
      color: "bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900",
    },
    {
      id: "feature-templates",
      icon: Image,
      title: t("landing.features.f4Title"),
      desc: t("landing.features.f4Desc"),
      color: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900",
    },
    {
      id: "feature-export",
      icon: DownloadSimple,
      title: t("landing.features.f5Title"),
      desc: t("landing.features.f5Desc"),
      color: "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900",
    },
    {
      id: "feature-analytics",
      icon: ChartBar,
      title: t("landing.features.f6Title"),
      desc: t("landing.features.f6Desc"),
      color: "bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900",
    },
  ];

  return (
    <section id="fitur" className="bg-white dark:bg-ink-950 border-y border-ink-150 dark:border-ink-850 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-24">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900 text-brand-700 dark:text-brand-400 text-xxs font-bold uppercase tracking-wider">
            {t("landing.nav.features")}
          </div>
          <h2 className="font-sans text-3xl sm:text-4xl font-extrabold text-ink-900 dark:text-white tracking-tight">
            {t("landing.features.title")}
          </h2>
          <p className="text-ink-500 dark:text-ink-400 text-sm sm:text-base leading-relaxed">
            {t("landing.features.subtitle")}
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.id}
                className="bg-white dark:bg-ink-900 border border-ink-150 dark:border-ink-800 rounded-3xl p-6.5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 dark:hover:border-brand-900 group"
                initial={reduce ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.4, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 shrink-0 border ${feat.color} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={20} weight="bold" />
                </div>
                <h3 className="font-extrabold text-sm sm:text-base text-ink-900 dark:text-white mb-2 group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors">
                  {feat.title}
                </h3>
                <p className="text-xs sm:text-sm text-ink-500 dark:text-ink-400 leading-relaxed font-medium">
                  {feat.desc}
                </p>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
