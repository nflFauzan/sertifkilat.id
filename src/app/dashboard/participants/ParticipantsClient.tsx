"use client";

import Link from "next/link";
import { Users, CalendarBlank, ArrowSquareOut } from "@phosphor-icons/react";
import { useTranslation } from "@/lib/hooks/useTranslation";

type ParticipantWithEvent = {
  id: string;
  name: string;
  email: string;
  event: {
    id: string;
    name: string;
  };
};

export default function ParticipantsClient({
  participants,
}: {
  participants: ParticipantWithEvent[];
}) {
  const { t, lang } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink-900">{t("dashboard.sidebar.participants")}</h1>
        <p className="text-sm text-ink-500 mt-1">
          {t("dashboard.participants.subtitle")}
        </p>
      </div>

      {participants.length === 0 ? (
        <div className="card p-12 text-center max-w-xl mx-auto border-2 border-dashed border-ink-150 rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Users className="w-7 h-7 text-brand-500" weight="fill" />
          </div>
          <h2 className="font-bold text-ink-900 text-lg mb-2">
            {lang === "id" ? "Belum Ada Peserta" : "No Participants Yet"}
          </h2>
          <p className="text-sm text-ink-500 mb-6 max-w-sm mx-auto">
            {lang === "id" 
              ? "Silakan masuk ke menu Event lalu kelola peserta di event spesifik untuk menambahkan nama-nama peserta." 
              : "Please go to the Events page and manage participants for a specific event to add recipient names."}
          </p>
          <Link href="/dashboard/events" className="btn-primary mx-auto shadow-md">
            {lang === "id" ? "Pilih & Kelola Event" : "Select & Manage Events"}
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden shadow-md border border-ink-150 rounded-2xl">
          <div className="overflow-x-auto max-h-[600px] scrollbar-thin">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-ink-150 bg-ink-50/75 backdrop-blur-sm sticky top-0 z-10">
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-ink-600 uppercase tracking-wider">
                    {lang === "id" ? "Nama Peserta" : "Participant Name"}
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-bold text-ink-600 uppercase tracking-wider">
                    {lang === "id" ? "Gmail" : "Email"}
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-bold text-ink-600 uppercase tracking-wider">
                    {t("dashboard.participants.tableEvent")}
                  </th>
                  <th className="px-5 py-3.5 text-right text-xs font-bold text-ink-600 uppercase tracking-wider">
                    {t("common.action")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 bg-bg-card">
                {participants.map((p) => (
                  <tr key={p.id} className="hover:bg-brand-50/10 transition-colors duration-150">
                    <td className="px-5 py-4 font-semibold text-ink-900">
                      {p.name}
                    </td>
                    <td className="px-4 py-4 text-ink-600">
                      {p.email}
                    </td>
                    <td className="px-4 py-4 text-ink-600">
                      <span className="flex items-center gap-1.5 font-medium text-ink-700">
                        <CalendarBlank className="w-4 h-4 text-ink-400" />
                        {p.event.name}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/dashboard/events/${p.event.id}/participants`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-brand-600 hover:bg-brand-55/10 border border-transparent hover:border-brand-100 transition-all"
                      >
                        {lang === "id" ? "Kelola" : "Manage"}
                        <ArrowSquareOut className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
