"use client";

import { useState, useTransition } from "react";
import {
  CalendarBlank, Plus, PencilSimple, Trash, X,
  CircleNotch, Warning, Users, MapPin
} from "@phosphor-icons/react";
import {
  createEventAction, updateEventAction, deleteEventAction,
} from "@/app/actions/events";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { useTranslation } from "@/lib/hooks/useTranslation";

type EventWithCount = {
  id: string;
  name: string;
  description: string | null;
  type: string;
  date: Date;
  location: string | null;
  status: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  _count: { participants: number; batches: number };
};

const EVENT_TYPES = [
  "WEBINAR",
  "PELATIHAN",
  "LOMBA",
  "SEMINAR",
  "WORKSHOP",
  "LAINNYA",
] as const;

const STATUS_CONFIG: Record<string, { label: { id: string; en: string }; className: string }> = {
  DRAFT: { label: { id: "Draft", en: "Draft" }, className: "badge-amber" },
  ACTIVE: { label: { id: "Aktif", en: "Active" }, className: "badge-brand" },
  COMPLETED: { label: { id: "Selesai", en: "Completed" }, className: "badge-green" },
  ARCHIVED: { label: { id: "Diarsipkan", en: "Archived" }, className: "badge" },
};

const TYPE_LABELS: Record<string, { id: string; en: string }> = {
  WEBINAR: { id: "Webinar", en: "Webinar" },
  PELATIHAN: { id: "Pelatihan", en: "Training" },
  LOMBA: { id: "Lomba", en: "Competition" },
  SEMINAR: { id: "Seminar", en: "Seminar" },
  WORKSHOP: { id: "Workshop", en: "Workshop" },
  LAINNYA: { id: "Lainnya", en: "Others" },
};

function toDateInputValue(date: Date) {
  return new Date(date).toISOString().split("T")[0];
}

export default function EventsClient({
  events,
}: {
  events: EventWithCount[];
}) {
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventWithCount | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const { t, lang } = useTranslation();

  function openCreate() {
    setEditingEvent(null);
    setError("");
    setShowModal(true);
  }

  function openEdit(event: EventWithCount) {
    setEditingEvent(event);
    setError("");
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingEvent(null);
    setError("");
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError("");

    startTransition(async () => {
      const result = editingEvent
        ? await updateEventAction(editingEvent.id, fd)
        : await createEventAction(fd);

      if (result.error) {
        setError(result.error);
      } else {
        closeModal();
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteEventAction(id);
      setDeleteId(null);
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">{t("dashboard.sidebar.events")}</h1>
          <p className="text-sm text-ink-500 mt-1">
            {t("dashboard.events.subtitle")}
          </p>
        </div>
        <button id="btn-create-event" onClick={openCreate} className="btn-primary shadow-sm">
          <Plus className="w-4 h-4" />
          {lang === "id" ? "Buat Event" : "Create Event"}
        </button>
      </div>

      {/* Table / List */}
      {events.length === 0 ? (
        <div className="card p-12 text-center max-w-xl mx-auto border-2 border-dashed border-ink-150 rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <CalendarBlank className="w-7 h-7 text-brand-500" weight="fill" />
          </div>
          <h2 className="font-bold text-ink-900 text-lg mb-2">
            {lang === "id" ? "Belum Ada Event" : "No Events Yet"}
          </h2>
          <p className="text-sm text-ink-500 mb-6 max-w-sm mx-auto">
            {t("dashboard.home.noEvents")}
          </p>
          <button onClick={openCreate} className="btn-primary mx-auto shadow-md">
            <Plus className="w-4 h-4" />
            {lang === "id" ? "Buat Event Pertama" : "Create First Event"}
          </button>
        </div>
      ) : (
        <div className="card overflow-hidden shadow-md border border-ink-150 rounded-2xl">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto max-h-[600px] scrollbar-thin">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-ink-150 bg-ink-50/75 backdrop-blur-sm sticky top-0 z-10">
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-ink-600 uppercase tracking-wider">
                    {lang === "id" ? "Nama Event" : "Event Name"}
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-bold text-ink-600 uppercase tracking-wider">
                    {lang === "id" ? "Tipe" : "Type"}
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-bold text-ink-600 uppercase tracking-wider">
                    {lang === "id" ? "Tanggal" : "Date"}
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-bold text-ink-600 uppercase tracking-wider">
                    {t("dashboard.sidebar.participants")}
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-bold text-ink-600 uppercase tracking-wider">
                    {t("common.status")}
                  </th>
                  <th className="px-5 py-3.5 text-right text-xs font-bold text-ink-600 uppercase tracking-wider" />
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 bg-bg-card">
                {events.map((event) => {
                  const cfg = STATUS_CONFIG[event.status] ?? STATUS_CONFIG.DRAFT;
                  const statusLabel = lang === "id" ? cfg.label.id : cfg.label.en;
                  const typeLabel = lang === "id" ? TYPE_LABELS[event.type]?.id : TYPE_LABELS[event.type]?.en;
                  return (
                    <tr key={event.id} className="hover:bg-brand-50/10 transition-colors duration-150">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-ink-900 truncate max-w-xs">
                          {event.name}
                        </p>
                        {event.location && (
                          <p className="text-xs text-ink-400 mt-1 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-ink-450" />
                            {event.location}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4 text-ink-600 font-medium">
                        {typeLabel ?? event.type}
                      </td>
                      <td className="px-4 py-4 text-ink-600">
                        {formatDate(event.date)}
                      </td>
                      <td className="px-4 py-4">
                        <span className="flex items-center gap-1.5 font-semibold text-ink-700">
                          <Users className="w-4 h-4 text-ink-400" />
                          {event._count.participants}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={cfg.className}>{statusLabel}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          <Link
                            href={`/dashboard/events/${event.id}/participants`}
                            className="p-2 rounded-xl text-ink-400 hover:text-brand-600 hover:bg-brand-50 border border-transparent hover:border-brand-100 shadow-sm transition-all"
                            title={lang === "id" ? "Kelola Peserta" : "Manage Participants"}
                          >
                            <Users className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => openEdit(event)}
                            className="p-2 rounded-xl text-ink-400 hover:text-brand-600 hover:bg-brand-50 border border-transparent hover:border-brand-100 shadow-sm transition-all"
                            title={t("common.edit")}
                          >
                            <PencilSimple className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(event.id)}
                            className="p-2 rounded-xl text-ink-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 shadow-sm transition-all"
                            title={t("common.delete")}
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile list */}
          <div className="md:hidden divide-y divide-ink-100 bg-bg-card">
            {events.map((event) => {
              const cfg = STATUS_CONFIG[event.status] ?? STATUS_CONFIG.DRAFT;
              const statusLabel = lang === "id" ? cfg.label.id : cfg.label.en;
              const typeLabel = lang === "id" ? TYPE_LABELS[event.type]?.id : TYPE_LABELS[event.type]?.en;
              return (
                <div key={event.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-ink-900 text-sm truncate">
                        {event.name}
                      </p>
                      <p className="text-xs text-ink-450 mt-1">
                        {typeLabel} · {formatDate(event.date)}
                      </p>
                    </div>
                    <span className={cfg.className}>{statusLabel}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-ink-500 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-ink-400" />
                      {event._count.participants} {lang === "id" ? "peserta" : "participants"}
                    </span>
                    <div className="flex gap-1.5">
                      <Link
                        href={`/dashboard/events/${event.id}/participants`}
                        className="p-2 rounded-xl text-ink-400 hover:text-brand-600 hover:bg-brand-50 border border-ink-100 transition-all"
                      >
                        <Users className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => openEdit(event)}
                        className="p-2 rounded-xl text-ink-400 hover:text-brand-600 hover:bg-brand-50 border border-ink-100 transition-all"
                      >
                        <PencilSimple className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(event.id)}
                        className="p-2 rounded-xl text-ink-400 hover:text-rose-600 hover:bg-rose-50 border border-ink-100 transition-all"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative w-full max-w-lg bg-bg-card border border-ink-150 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100">
              <h2 className="font-bold text-ink-900 text-base">
                {editingEvent 
                  ? (lang === "id" ? "Ubah Event" : "Edit Event") 
                  : t("dashboard.events.createTitle")}
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg text-ink-400 hover:text-ink-700 hover:bg-ink-50 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
                  <Warning weight="fill" className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-ink-700 mb-1.5">
                  {lang === "id" ? "Nama Event" : "Event Name"} <span className="text-rose-500">*</span>
                </label>
                <input
                  name="name"
                  required
                  defaultValue={editingEvent?.name ?? ""}
                  placeholder="Webinar Nasional ..."
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-ink-700 mb-1.5">
                    {lang === "id" ? "Tipe" : "Type"} <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="type"
                    required
                    defaultValue={editingEvent?.type ?? "WEBINAR"}
                    className="input-field"
                  >
                    {EVENT_TYPES.map((typeKey) => (
                      <option key={typeKey} value={typeKey}>
                        {lang === "id" ? TYPE_LABELS[typeKey]?.id : TYPE_LABELS[typeKey]?.en}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink-700 mb-1.5">
                    {lang === "id" ? "Tanggal" : "Date"} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    name="date"
                    type="date"
                    required
                    defaultValue={
                      editingEvent
                        ? toDateInputValue(editingEvent.date)
                        : ""
                    }
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink-700 mb-1.5">
                  {lang === "id" ? "Lokasi" : "Location"}
                </label>
                <input
                  name="location"
                  defaultValue={editingEvent?.location ?? ""}
                  placeholder="Online (Zoom) / Nama Gedung"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink-700 mb-1.5">
                  {lang === "id" ? "Deskripsi" : "Description"}
                </label>
                <textarea
                  name="description"
                  defaultValue={editingEvent?.description ?? ""}
                  placeholder="Deskripsi singkat event..."
                  rows={3}
                  className="input-field resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn-secondary flex-1 justify-center"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn-primary flex-1 justify-center disabled:opacity-60"
                >
                  {isPending ? (
                    <>
                      <CircleNotch className="w-4 h-4 animate-spin" />
                      {t("common.loading")}
                    </>
                  ) : editingEvent ? (
                    (lang === "id" ? "Simpan Perubahan" : "Save Changes")
                  ) : (
                    (lang === "id" ? "Buat Event" : "Create Event")
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDeleteId(null)}
          />
          <div className="relative w-full max-w-sm bg-bg-card border border-ink-150 rounded-2xl shadow-xl p-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
              <Trash className="w-6 h-6 text-rose-600" weight="fill" />
            </div>
            <h2 className="font-bold text-ink-900 text-lg mb-2">
              {lang === "id" ? "Hapus Event?" : "Delete Event?"}
            </h2>
            <p className="text-sm text-ink-500 mb-6 leading-relaxed">
              {t("dashboard.events.deleteConfirm")}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="btn-secondary flex-1 justify-center"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={isPending}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-rose-500 text-white px-5 py-2.5 text-sm font-semibold hover:bg-rose-600 transition-all disabled:opacity-60 cursor-pointer"
              >
                {isPending ? (
                  <CircleNotch className="w-4 h-4 animate-spin" />
                ) : (
                  t("common.delete")
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
