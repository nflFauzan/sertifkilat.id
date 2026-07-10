"use client";

import { useState } from "react";
import {
  CalendarBlank,
  Users,
  Certificate,
  QrCode,
  ArrowUpRight,
  Sparkle,
  Clock,
  ShieldCheck,
} from "@phosphor-icons/react";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { formatDate } from "@/lib/utils";

type StatCard = {
  label: { id: string; en: string };
  value: number;
  icon: React.ElementType;
  className: string;
  iconClassName: string;
};

type Verification = {
  id: string;
  serialNumber: string;
  participantName: string;
  eventName: string;
  verifiedCount: number;
  lastVerifiedAt: Date | null;
};

type EventSummary = {
  id: string;
  name: string;
  type: string;
  status: string;
  participantCount: number;
  batchCount: number;
};

export default function AnalyticsClient({
  stats,
  recentVerifications,
  events,
  qrStats,
}: {
  stats: {
    totalEvents: number;
    totalParticipants: number;
    totalCertificates: number;
    totalVerifications: number;
  };
  recentVerifications: Verification[];
  events: EventSummary[];
  qrStats: {
    validScansCount: number;
    invalidScansCount: number;
    todayScansCount: number;
    latestVerifications: Array<{
      id: string;
      serialNumber: string;
      scannedAt: string;
      status: string;
      participantName: string | null;
      eventName: string | null;
    }>;
  };
}) {
  const { lang } = useTranslation();
  const [activeTab, setActiveTab] = useState<"overview" | "qr-verification" | "scan-history">("overview");

  const cards: StatCard[] = [
    {
      label: { id: "Total Event", en: "Total Events" },
      value: stats.totalEvents,
      icon: CalendarBlank,
      className: "bg-gradient-to-br from-indigo-50 to-bg-card dark:from-indigo-950/20 dark:to-bg-card border-indigo-100 dark:border-indigo-900/30",
      iconClassName: "bg-indigo-500 text-white shadow-glow",
    },
    {
      label: { id: "Total Peserta", en: "Total Recipients" },
      value: stats.totalParticipants,
      icon: Users,
      className: "bg-gradient-to-br from-brand-50 to-bg-card dark:from-brand-950/20 dark:to-bg-card border-brand-100 dark:border-brand-900/30",
      iconClassName: "bg-brand-500 text-white shadow-glow",
    },
    {
      label: { id: "Sertifikat Digenerate", en: "Generated Certificates" },
      value: stats.totalCertificates,
      icon: Certificate,
      className: "bg-gradient-to-br from-emerald-50 to-bg-card dark:from-emerald-950/20 dark:to-bg-card border-emerald-100 dark:border-emerald-900/30",
      iconClassName: "bg-emerald-500 text-white shadow-glow",
    },
    {
      label: { id: "Total Verifikasi Publik", en: "Total Public Verifications" },
      value: stats.totalVerifications,
      icon: QrCode,
      className: "bg-gradient-to-br from-amber-50 to-bg-card dark:from-amber-950/20 dark:to-bg-card border-amber-100 dark:border-amber-900/30",
      iconClassName: "bg-amber-500 text-white shadow-glow",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink-900">
          {lang === "id" ? "Analitik Platform" : "Platform Analytics"}
        </h1>
        <p className="text-sm text-ink-500 mt-1">
          {lang === "id"
            ? "Dapatkan statistik real-time dari performa event dan pemindaian sertifikat Anda."
            : "Get real-time statistics on your event performance and certificate verification scans."}
        </p>
      </div>

      {/* Tabs Internal Navigation */}
      <div className="flex border-b border-ink-100 dark:border-ink-800 gap-6">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-3 text-sm font-semibold border-b-2 -mb-px transition-colors duration-200 ${
            activeTab === "overview"
              ? "border-brand-500 text-brand-600 dark:text-brand-400 font-bold"
              : "border-transparent text-ink-500 hover:text-ink-900 dark:hover:text-ink-100"
          }`}
        >
          {lang === "id" ? "Ikhtisar" : "Overview"}
        </button>
        <button
          onClick={() => setActiveTab("qr-verification")}
          className={`pb-3 text-sm font-semibold border-b-2 -mb-px transition-colors duration-200 ${
            activeTab === "qr-verification"
              ? "border-brand-500 text-brand-600 dark:text-brand-400 font-bold"
              : "border-transparent text-ink-500 hover:text-ink-900 dark:hover:text-ink-100"
          }`}
        >
          {lang === "id" ? "Verifikasi QR" : "QR Verification"}
        </button>
        <button
          onClick={() => setActiveTab("scan-history")}
          className={`pb-3 text-sm font-semibold border-b-2 -mb-px transition-colors duration-200 ${
            activeTab === "scan-history"
              ? "border-brand-500 text-brand-600 dark:text-brand-400 font-bold"
              : "border-transparent text-ink-500 hover:text-ink-900 dark:hover:text-ink-100"
          }`}
        >
          {lang === "id" ? "Riwayat Pemindaian" : "Scan History"}
        </button>
      </div>

      {/* Overview Section */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Grid Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {cards.map((card, i) => {
              const Icon = card.icon;
              const labelText = lang === "id" ? card.label.id : card.label.en;
              return (
                <div
                  key={i}
                  className={`card p-5 border flex items-center gap-4 transition-all duration-300 hover:shadow-soft hover:-translate-y-0.5 ${card.className}`}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${card.iconClassName}`}
                  >
                    <Icon className="w-6 h-6" weight="fill" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-ink-500 uppercase tracking-wider">
                      {labelText}
                    </p>
                    <p className="text-2xl font-bold text-ink-900 mt-1">{card.value}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Event Performance Table */}
          <div className="card">
            <div className="px-5 py-4 border-b border-ink-100 flex items-center justify-between">
              <h2 className="font-semibold text-ink-900 text-base">
                {lang === "id" ? "Breakdown Kinerja Event" : "Event Performance Breakdown"}
              </h2>
              <Sparkle className="w-5 h-5 text-brand-500 animate-pulse" weight="fill" />
            </div>
            
            {events.length === 0 ? (
              <div className="p-8 text-center text-ink-400 text-sm">
                {lang === "id" ? "Belum ada data event yang tersedia." : "No event data available."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-ink-50 text-xs font-semibold text-ink-500 uppercase tracking-wide border-b border-ink-100">
                      <th className="px-5 py-3 text-left">{lang === "id" ? "Nama Event" : "Event Name"}</th>
                      <th className="px-5 py-3 text-center">{lang === "id" ? "Tipe" : "Type"}</th>
                      <th className="px-5 py-3 text-center">{lang === "id" ? "Peserta" : "Recipients"}</th>
                      <th className="px-5 py-3 text-center">{lang === "id" ? "Batch Generate" : "Generated Batches"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-50">
                    {events.map((e) => (
                      <tr key={e.id} className="hover:bg-ink-50/50 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-ink-900 max-w-xs truncate">
                          {e.name}
                        </td>
                        <td className="px-5 py-3.5 text-center text-ink-600 text-xs font-medium">
                          {e.type}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold">
                            {e.participantCount}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center text-ink-600 text-xs">
                          {e.batchCount} {lang === "id" ? "batch" : (e.batchCount === 1 ? "batch" : "batches")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Verifikasi QR Section */}
      {activeTab === "qr-verification" && (
        <div className="card p-5 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-ink-100 dark:border-ink-800">
            <div>
              <h2 className="font-extrabold text-ink-900 dark:text-ink-50 text-sm">
                {lang === "id" ? "Statistik Verifikasi QR" : "QR Verification Statistics"}
              </h2>
              <p className="text-[10px] text-ink-400">
                {lang === "id" ? "Statistik pemindaian QR sertifikat secara real-time." : "Real-time statistics of certificate QR code scans."}
              </p>
            </div>
            <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-lg border border-emerald-100 dark:border-emerald-900/30 text-[9px] font-bold">
              <ShieldCheck weight="fill" className="w-3.5 h-3.5" />
              <span>{lang === "id" ? "Terproteksi" : "Secured"}</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-ink-50 dark:bg-ink-900/30 border border-ink-100 dark:border-ink-800/40 rounded-xl p-3.5 text-center">
              <p className="text-[10px] font-bold text-ink-400 uppercase tracking-wider">
                {lang === "id" ? "Total Scan" : "Total Scans"}
              </p>
              <p className="text-2xl font-extrabold text-ink-900 dark:text-ink-50 mt-1 tabular-nums">
                {qrStats.validScansCount + qrStats.invalidScansCount}
              </p>
            </div>
            <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/20 rounded-xl p-3.5 text-center">
              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                {lang === "id" ? "Scan Valid" : "Valid Scans"}
              </p>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
                {qrStats.validScansCount}
              </p>
            </div>
            <div className="bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/20 rounded-xl p-3.5 text-center">
              <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                {lang === "id" ? "Scan Tidak Valid" : "Invalid Scans"}
              </p>
              <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1 tabular-nums">
                {qrStats.invalidScansCount}
              </p>
            </div>
            <div className="bg-brand-50/50 dark:bg-brand-950/10 border border-brand-100 dark:border-brand-900/20 rounded-xl p-3.5 text-center">
              <p className="text-[10px] font-bold text-brand-600 dark:text-brand-450 uppercase tracking-wider">
                {lang === "id" ? "Scan Hari Ini" : "Today's Scans"}
              </p>
              <p className="text-2xl font-extrabold text-brand-600 dark:text-brand-450 mt-1 tabular-nums">
                {qrStats.todayScansCount}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Riwayat Pemindaian Section */}
      {activeTab === "scan-history" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Pemindaian QR Terakhir */}
          <div className="card flex flex-col lg:col-span-1">
            <div className="px-5 py-4 border-b border-ink-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" weight="fill" />
              <h2 className="font-semibold text-ink-900 text-base">
                {lang === "id" ? "Pemindaian QR Terakhir" : "Latest QR Scans"}
              </h2>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-start">
              {recentVerifications.length === 0 ? (
                <div className="text-center text-ink-400 text-xs py-12 flex-1 flex flex-col items-center justify-center gap-2">
                  <QrCode className="w-8 h-8 text-ink-300" />
                  <p>{lang === "id" ? "Belum ada aktivitas pemindaian QR dari publik." : "No public QR scans recorded yet."}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentVerifications.map((v) => (
                    <div
                      key={v.id}
                      className="p-3 bg-ink-50/50 dark:bg-ink-900/30 rounded-xl border border-ink-100 dark:border-ink-800 flex items-start justify-between gap-3 hover:border-brand-300 transition-all duration-200"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xxs font-bold text-brand-600 uppercase tracking-wider bg-brand-50 px-1.5 py-0.5 rounded">
                            {v.serialNumber}
                          </span>
                          <span className="text-xxs text-ink-400">
                            {v.lastVerifiedAt
                              ? new Date(v.lastVerifiedAt).toLocaleTimeString(lang === "id" ? "id-ID" : "en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : ""}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-ink-900 mt-1 truncate">
                          {v.participantName}
                        </p>
                        <p className="text-xxs text-ink-400 truncate mt-0.5">{v.eventName}</p>
                      </div>
                      
                      <div className="text-right shrink-0">
                        <span className="inline-flex items-center gap-1 text-xxs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          {v.verifiedCount}{lang === "id" ? "x Scan" : "x Scans"}
                          <ArrowUpRight className="w-3 h-3 text-amber-600" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Aktivitas Verifikasi Terakhir */}
          <div className="card p-5 space-y-3 flex flex-col lg:col-span-2">
            <div className="pb-3 border-b border-ink-100 dark:border-ink-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-500" weight="fill" />
                <h2 className="font-semibold text-ink-900 dark:text-ink-50 text-base">
                  {lang === "id" ? "Aktivitas Verifikasi Terakhir" : "Latest Verification Activities"}
                </h2>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {qrStats.latestVerifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-ink-400 border border-dashed border-ink-150 dark:border-ink-800 rounded-xl">
                  {lang === "id" ? "Belum ada riwayat scan QR." : "No QR scan history recorded yet."}
                </div>
              ) : (
                <div className="divide-y divide-ink-50 dark:divide-ink-800 border border-ink-100 dark:border-ink-800 rounded-xl overflow-hidden">
                  {qrStats.latestVerifications.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3.5 hover:bg-ink-50/30 dark:hover:bg-ink-900/20 transition-colors">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-ink-900 dark:text-ink-300 text-xs">
                            {item.serialNumber}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            item.status === "SUCCESS" 
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-450 dark:border-emerald-900/30" 
                              : "bg-rose-50 text-rose-700 border border-rose-100 dark:bg-rose-950/30 dark:text-rose-450 dark:border-rose-900/30"
                          }`}>
                            {item.status === "SUCCESS" ? "VALID" : "INVALID"}
                          </span>
                        </div>
                        <p className="text-[10px] text-ink-500 truncate">
                          {item.status === "SUCCESS" 
                            ? `${item.participantName} (${item.eventName})` 
                            : (lang === "id" ? "Kode tidak terdaftar di sistem" : "Code not registered in the system")}
                        </p>
                      </div>
                      <span className="text-[10px] text-ink-400 whitespace-nowrap">
                        {formatDate(item.scannedAt)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
