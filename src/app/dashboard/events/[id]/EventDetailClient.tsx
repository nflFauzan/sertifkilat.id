"use client";

import { CalendarBlank, Users, Certificate, ArrowLeft, MapPin } from "@phosphor-icons/react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { useTranslation } from "@/lib/hooks/useTranslation";

type Participant = {
  id: string;
  name: string;
  email: string;
};

type EventDetailProps = {
  event: {
    id: string;
    name: string;
    description: string | null;
    type: string;
    date: Date | string;
    location: string | null;
    status: string;
    _count: { participants: number; batches: number };
  };
  recentParticipants: Participant[];
};

const STATUS_CONFIG: Record<
  string,
  { label: { id: string; en: string }; className: string }
> = {
  DRAFT: { label: { id: "Draft", en: "Draft" }, className: "badge-amber" },
  ACTIVE: { label: { id: "Aktif", en: "Active" }, className: "badge-brand" },
  COMPLETED: { label: { id: "Selesai", en: "Completed" }, className: "badge-green" },
  ARCHIVED: {
    label: { id: "Diarsipkan", en: "Archived" },
    className: "bg-ink-100 text-ink-500 inline-flex items-center gap-1.5 rounded-full text-xs font-semibold px-2.5 py-1",
  },
};

const TYPE_LABELS: Record<string, { id: string; en: string }> = {
  WEBINAR: { id: "Webinar", en: "Webinar" },
  PELATIHAN: { id: "Pelatihan", en: "Training" },
  LOMBA: { id: "Lomba", en: "Competition" },
  SEMINAR: { id: "Seminar", en: "Seminar" },
  WORKSHOP: { id: "Workshop", en: "Workshop" },
  LAINNYA: { id: "Lainnya", en: "Others" },
};

export default function EventDetailClient({ event, recentParticipants }: EventDetailProps) {
  const { t, lang } = useTranslation();

  const cfg = STATUS_CONFIG[event.status] ?? STATUS_CONFIG.DRAFT;
  const statusLabel = lang === "id" ? cfg.label.id : cfg.label.en;
  const typeLabel = TYPE_LABELS[event.type] ? (lang === "id" ? TYPE_LABELS[event.type].id : TYPE_LABELS[event.type].en) : event.type;

  return (
    <div className="space-y-6">
      {/* Back button + header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link
          href="/dashboard/events"
          className="inline-flex items-center gap-2 text-sm text-ink-500 hover:text-ink-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {lang === "id" ? "Kembali ke Events" : "Back to Events"}
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">{event.name}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-ink-500">
            <span className="flex items-center gap-1">
              <CalendarBlank className="w-4 h-4" />
              {formatDate(event.date)}
            </span>
            <span>{typeLabel}</span>
            {event.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {event.location}
              </span>
            )}
          </div>
        </div>
        <span className={`${cfg.className} self-start`}>
          {statusLabel}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="card p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-500" weight="fill" />
          </div>
          <div>
            <p className="text-2xl font-bold text-ink-900">{event._count.participants}</p>
            <p className="text-xs text-ink-400">{lang === "id" ? "Peserta" : "Participants"}</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
            <Certificate className="w-5 h-5 text-brand-500" weight="fill" />
          </div>
          <div>
            <p className="text-2xl font-bold text-ink-900">{event._count.batches}</p>
            <p className="text-xs text-ink-400">{lang === "id" ? "Batch Generate" : "Generate Batches"}</p>
          </div>
        </div>
      </div>

      {/* Description */}
      {event.description && (
        <div className="card p-5">
          <h2 className="font-semibold text-ink-900 mb-2">{lang === "id" ? "Deskripsi" : "Description"}</h2>
          <p className="text-sm text-ink-600 leading-relaxed">{event.description}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/dashboard/events/${event.id}/participants`}
          className="btn-primary"
        >
          <Users className="w-4 h-4" />
          {lang === "id" ? "Kelola Peserta" : "Manage Participants"}
        </Link>
        <Link
          href="/dashboard/generator"
          className="btn-secondary"
        >
          <Certificate className="w-4 h-4" />
          {lang === "id" ? "Generate Sertifikat" : "Generate Certificate"}
        </Link>
      </div>

      {/* Recent participants */}
      {recentParticipants.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-ink-100 flex items-center justify-between">
            <h2 className="font-semibold text-ink-900">{lang === "id" ? "Peserta Terbaru" : "Recent Participants"}</h2>
            <Link
              href={`/dashboard/events/${event.id}/participants`}
              className="text-sm text-brand-600 hover:text-brand-700 font-medium"
            >
              {lang === "id" ? "Lihat Semua →" : "View All →"}
            </Link>
          </div>
          <div className="divide-y divide-ink-50">
            {recentParticipants.map((p) => (
              <div key={p.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ink-900">{p.name}</p>
                  <p className="text-xs text-ink-400">{p.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
