"use client";

import {
  CalendarBlank,
  Users,
  Certificate,
  QrCode,
  ArrowUpRight,
  Sparkle,
  Clock,
} from "@phosphor-icons/react";
import { useTranslation } from "@/lib/hooks/useTranslation";

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
}: {
  stats: {
    totalEvents: number;
    totalParticipants: number;
    totalCertificates: number;
    totalVerifications: number;
  };
  recentVerifications: Verification[];
  events: EventSummary[];
}) {
  const { lang } = useTranslation();

  const cards: StatCard[] = [
    {
      label: { id: "Total Event", en: "Total Events" },
      value: stats.totalEvents,
      icon: CalendarBlank,
      className: "bg-gradient-to-br from-indigo-50 to-white border-indigo-100",
      iconClassName: "bg-indigo-500 text-white shadow-glow",
    },
    {
      label: { id: "Total Peserta", en: "Total Recipients" },
      value: stats.totalParticipants,
      icon: Users,
      className: "bg-gradient-to-br from-brand-50 to-white border-brand-100",
      iconClassName: "bg-brand-500 text-white shadow-glow",
    },
    {
      label: { id: "Sertifikat Digenerate", en: "Generated Certificates" },
      value: stats.totalCertificates,
      icon: Certificate,
      className: "bg-gradient-to-br from-emerald-50 to-white border-emerald-100",
      iconClassName: "bg-emerald-500 text-white shadow-glow",
    },
    {
      label: { id: "Total Verifikasi Publik", en: "Total Public Verifications" },
      value: stats.totalVerifications,
      icon: QrCode,
      className: "bg-gradient-to-br from-amber-50 to-white border-amber-100",
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Event Performance Table */}
        <div className="lg:col-span-2 card">
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

        {/* Real-time Verification Scan Stream */}
        <div className="card flex flex-col">
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
                    className="p-3 bg-ink-50 rounded-xl border border-ink-100 flex items-start justify-between gap-3 hover:border-brand-300 transition-all duration-200"
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
      </div>
    </div>
  );
}
