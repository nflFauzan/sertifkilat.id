"use client";

import { useState } from "react";
import { User as UserIcon, CreditCard, Sparkle } from "@phosphor-icons/react";
import UpgradeModal from "@/components/UpgradeModal";

type UserType = {
  name: string;
  email: string;
  role: string;
  plan: string;
};

export default function SettingsClient({ user }: { user: UserType }) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Pengaturan</h1>
        <p className="text-sm text-ink-500 mt-1">
          Kelola informasi profil, keamanan, dan paket subscription Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-ink-900 text-base flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-brand-500" />
            Informasi Profil
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-ink-500 uppercase tracking-wide mb-1">
                Nama Lengkap
              </label>
              <p className="text-sm font-medium text-ink-900">{user.name}</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-500 uppercase tracking-wide mb-1">
                Gmail
              </label>
              <p className="text-sm font-medium text-ink-900">{user.email}</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-500 uppercase tracking-wide mb-1">
                Role Akun
              </label>
              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-ink-100 text-ink-700 text-xs font-semibold">
                {user.role}
              </span>
            </div>
          </div>
        </div>

        {/* Plan / Subscription Card */}
        <div className="card p-6 space-y-4 md:col-span-2">
          <h2 className="font-semibold text-ink-900 text-base flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-brand-500" />
            Paket Layanan
          </h2>
          <div className="p-4 bg-gradient-to-r from-brand-50 to-indigo-50/30 rounded-2xl border border-brand-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 text-xxs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 border border-brand-100 px-2 py-0.5 rounded-full">
                <Sparkle className="w-3 h-3 text-brand-500 animate-pulse" weight="fill" />
                Active Plan
              </span>
              <h3 className="text-lg font-bold text-ink-900">
                SertifKilat {user.plan}
              </h3>
              <p className="text-xs text-ink-500">
                {user.plan === "FREE" 
                  ? "Coba fitur dasar sertifikat dengan kuota terbatas." 
                  : "Akses generate sertifikat massal tanpa batasan kuota."}
              </p>
            </div>
            {user.plan !== "BUSINESS" && (
              <button 
                onClick={() => setShowUpgradeModal(true)}
                className="btn-primary shrink-0 self-start sm:self-center"
              >
                Upgrade Paket
              </button>
            )}
          </div>

          <div className="pt-2 text-xs text-ink-400">
            Butuh bantuan atau kustomisasi khusus institusi? Hubungi tim support kami di <a href="mailto:support@sertifkilat.id" className="text-brand-600 font-medium hover:underline">support@sertifkilat.id</a>
          </div>
        </div>
      </div>

      {/* Payment History Section */}
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-ink-900 text-base flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-brand-500" />
          Riwayat Pembayaran
        </h2>
        <div className="overflow-x-auto rounded-xl border border-ink-150">
          <table className="w-full text-xs text-left">
            <thead className="bg-ink-50 border-b border-ink-150">
              <tr>
                <th className="px-4 py-3 font-semibold text-ink-500">Nomor Invoice</th>
                <th className="px-4 py-3 font-semibold text-ink-500">Tanggal</th>
                <th className="px-4 py-3 font-semibold text-ink-500">Paket</th>
                <th className="px-4 py-3 font-semibold text-ink-500">Jumlah</th>
                <th className="px-4 py-3 font-semibold text-ink-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 bg-white">
              {user.plan === "FREE" ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-ink-400">
                    Belum ada riwayat transaksi pembayaran.
                  </td>
                </tr>
              ) : (
                <>
                  <tr className="hover:bg-ink-50">
                    <td className="px-4 py-3 font-mono font-semibold text-ink-800">INV/20260701/SK/0981</td>
                    <td className="px-4 py-3 text-ink-600">01 Juli 2026</td>
                    <td className="px-4 py-3 font-medium text-ink-900">SertifKilat {user.plan}</td>
                    <td className="px-4 py-3 font-medium text-ink-900">
                      {user.plan === "PRO" ? "Rp 149.000" : "Rp 379.000"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        Paid
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-ink-50 opacity-60">
                    <td className="px-4 py-3 font-mono font-semibold text-ink-800">INV/20260615/SK/0842</td>
                    <td className="px-4 py-3 text-ink-600">15 Juni 2026</td>
                    <td className="px-4 py-3 font-medium text-ink-900">SertifKilat Free</td>
                    <td className="px-4 py-3 font-medium text-ink-900">Rp 0</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        Paid
                      </span>
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={user.plan}
      />
    </div>
  );
}
