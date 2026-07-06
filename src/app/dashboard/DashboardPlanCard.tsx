"use client";

import { useState } from "react";
import { Sparkle, Crown } from "@phosphor-icons/react";
import UpgradeModal from "@/components/UpgradeModal";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface DashboardPlanCardProps {
  plan: string;
  templatesCount: number;
  certificatesCount: number;
  participantsCount: number;
}

export default function DashboardPlanCard({
  plan,
  templatesCount,
  certificatesCount,
  participantsCount,
}: DashboardPlanCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const { lang } = useTranslation();

  const limitTemplates = plan === "FREE" ? 1 : plan === "PRO" ? 5 : 999999;
  const limitParticipants = plan === "FREE" ? 25 : plan === "PRO" ? 150 : 999999;

  const isFree = plan === "FREE";
  const isPro = plan === "PRO";
  const isBusiness = plan === "BUSINESS";

  return (
    <div className="card p-6 bg-gradient-to-br from-brand-50/50 to-indigo-50/10 border border-brand-100/50 relative overflow-hidden flex flex-col justify-between gap-6">
      <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-8 -translate-y-8 select-none">
        <Sparkle size={140} weight="fill" className="text-brand-500" />
      </div>

      <div className="space-y-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isBusiness ? (
              <Crown className="w-5 h-5 text-amber-500" weight="fill" />
            ) : (
              <Sparkle className="w-5 h-5 text-brand-500" weight="fill" />
            )}
            <span className="font-bold text-ink-900 text-base">{lang === "id" ? "Detail Langganan" : "Subscription Details"}</span>
          </div>
          <span className={`badge uppercase tracking-wider text-[10px] font-bold ${
            isBusiness ? "bg-amber-100 text-amber-800 border-amber-200" :
            isPro ? "bg-brand-100 text-brand-800 border-brand-200" :
            "bg-ink-100 text-ink-700"
          }`}>
            SertifKilat {plan}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Templates Usage */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xxs font-semibold uppercase tracking-wider text-ink-400">
              <span>{lang === "id" ? "Template Aktif" : "Active Templates"}</span>
              <span>{templatesCount} / {limitTemplates === 999999 ? "∞" : limitTemplates}</span>
            </div>
            <div className="h-2 w-full bg-ink-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand-500 rounded-full" 
                style={{ width: `${Math.min(100, (templatesCount / limitTemplates) * 100)}%` }}
              />
            </div>
          </div>

          {/* Participants Quota */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xxs font-semibold uppercase tracking-wider text-ink-400">
              <span>{lang === "id" ? "Maks Peserta / Batch" : "Max Participants / Batch"}</span>
              <span>{limitParticipants === 999999 ? "∞" : limitParticipants}</span>
            </div>
            <div className="h-2 w-full bg-ink-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full" 
                style={{ width: `${limitParticipants === 999999 ? 100 : Math.min(100, (25 / limitParticipants) * 100)}%` }}
              />
            </div>
          </div>

          {/* Certificates Generated */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xxs font-semibold uppercase tracking-wider text-ink-400">
              <span>{lang === "id" ? "Total Diterbitkan" : "Total Issued"}</span>
              <span>{certificatesCount} {lang === "id" ? "sertifikat" : "certificates"}</span>
            </div>
            <div className="h-2 w-full bg-ink-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-500 rounded-full" 
                style={{ width: "100%" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Locked Premium Features for non-Business accounts */}
      {!isBusiness && (
        <div className="border-t border-ink-150/85 pt-3 space-y-2 relative z-10">
          <span className="text-[10px] font-bold text-ink-400 uppercase tracking-wider block">
            {lang === "id" ? "Fitur Premium Terkunci" : "Locked Premium Features"}
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {isFree && (
              <div 
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-1.5 p-2 rounded-xl bg-ink-100/50 hover:bg-ink-150 border border-ink-200/60 cursor-pointer transition-all text-ink-600 text-[10px] font-medium"
                title="Desain template premium modern"
              >
                <span>🔒 Premium Templates</span>
              </div>
            )}
            <div 
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 p-2 rounded-xl bg-ink-100/50 hover:bg-ink-150 border border-ink-200/60 cursor-pointer transition-all text-ink-600 text-[10px] font-medium"
              title="Cetak tanpa batasan peserta"
            >
              <span>🔒 Unlimited Quota</span>
            </div>
            {isFree && (
              <div 
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-1.5 p-2 rounded-xl bg-ink-100/50 hover:bg-ink-150 border border-ink-200/60 cursor-pointer transition-all text-ink-600 text-[10px] font-medium"
                title="Ekspor ZIP batch PDF/PNG & Excel"
              >
                <span>🔒 Bulk Export</span>
              </div>
            )}
            <div 
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 p-2 rounded-xl bg-ink-100/50 hover:bg-ink-150 border border-ink-200/60 cursor-pointer transition-all text-ink-600 text-[10px] font-medium"
              title="Layanan bantuan prioritas 24/7"
            >
              <span>🔒 Priority Support</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-ink-150/80 pt-4 relative z-10">
        <p className="text-[11px] text-ink-500">
          {isFree 
            ? (lang === "id" ? "Upgrade ke Pro/Business untuk fitur tak terbatas." : "Upgrade to Pro/Business for unlimited features.") 
            : (lang === "id" ? "Anda telah membuka fitur-fitur premium." : "You have unlocked premium features.")}
        </p>
        {plan !== "BUSINESS" && (
          <button 
            onClick={() => setModalOpen(true)}
            className="btn-primary text-xs py-2 px-4 shadow-sm"
          >
            {lang === "id" ? "Upgrade Paket" : "Upgrade Plan"}
          </button>
        )}
      </div>

      <UpgradeModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        currentPlan={plan}
      />
    </div>
  );
}
