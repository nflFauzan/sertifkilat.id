"use client";

import { useState, useTransition } from "react";
import {
  CalendarBlank,
  Plus,
  PencilSimple,
  Trash,
  X,
  CircleNotch,
  Warning,
  Users,
  MapPin,
} from "@phosphor-icons/react";
import {
  createEventAction,
  updateEventAction,
  deleteEventAction,
} from "@/app/actions/events";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

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

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "badge-amber" },
  ACTIVE: { label: "Aktif", className: "badge-brand" },
  COMPLETED: { label: "Selesai", className: "badge-green" },
  ARCHIVED: { label: "Diarsipkan", className: "badge" },
};

const TYPE_LABELS: Record<string, string> = {
  WEBINAR: "Webinar",
  PELATIHAN: "Pelatihan",
  LOMBA: "Lomba",
  SEMINAR: "Seminar",
  WORKSHOP: "Workshop",
  LAINNYA: "Lainnya",
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
          <h1 className="text-2xl font-bold text-ink-900">Event</h1>
          <p className="text-sm text-ink-500 mt-1">
            Kelola semua event dan pesertamu di sini.
          </p>
        </div>
        <button id="btn-create-event" onClick={openCreate} className="btn-primary">
          <Plus className="w-4 h-4" />
          Buat Event
        </button>
      </div>

      {/* Table / List */}
      {events.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
            <CalendarBlank className="w-7 h-7 text-brand-400" weight="fill" />
          </div>
          <h2 className="font-semibold text-ink-900 mb-2">Belum ada event</h2>
          <p className="text-sm text-ink-400 mb-6 max-w-sm mx-auto">
            Mulai dengan membuat event pertamamu. Kamu bisa mengundang peserta dan generate sertifikat dari sini.
          </p>
          <button onClick={openCreate} className="btn-primary mx-auto">
            <Plus className="w-4 h-4" />
            Buat Event Pertama
          </button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 bg-ink-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wide">
                    Nama Event
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wide">
                    Tipe
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wide">
                    Tanggal
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wide">
                    Peserta
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {events.map((event) => {
                  const cfg =
                    STATUS_CONFIG[event.status] ?? STATUS_CONFIG.DRAFT;
                  return (
                    <tr
                      key={event.id}
                      className="hover:bg-ink-50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium text-ink-900 truncate max-w-xs">
                          {event.name}
                        </p>
                        {event.location && (
                          <p className="text-xs text-ink-400 mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4 text-ink-600">
                        {TYPE_LABELS[event.type] ?? event.type}
                      </td>
                      <td className="px-4 py-4 text-ink-600">
                        {formatDate(event.date)}
                      </td>
                      <td className="px-4 py-4">
                        <span className="flex items-center gap-1 text-ink-600">
                          <Users className="w-4 h-4 text-ink-400" />
                          {event._count.participants}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={cfg.className}>{cfg.label}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          <Link
                            href={`/dashboard/events/${event.id}/participants`}
                            className="p-1.5 rounded-lg text-ink-400 hover:text-brand-600 hover:bg-brand-50 transition-all"
                            title="Kelola Peserta"
                          >
                            <Users className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => openEdit(event)}
                            className="p-1.5 rounded-lg text-ink-400 hover:text-brand-600 hover:bg-brand-50 transition-all"
                            title="Edit"
                          >
                            <PencilSimple className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(event.id)}
                            className="p-1.5 rounded-lg text-ink-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                            title="Hapus"
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
          <div className="md:hidden divide-y divide-ink-50">
            {events.map((event) => {
              const cfg = STATUS_CONFIG[event.status] ?? STATUS_CONFIG.DRAFT;
              return (
                <div key={event.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-ink-900 text-sm truncate">
                        {event.name}
                      </p>
                      <p className="text-xs text-ink-400 mt-0.5">
                        {TYPE_LABELS[event.type]} · {formatDate(event.date)}
                      </p>
                    </div>
                    <span className={cfg.className}>{cfg.label}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-ink-500 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {event._count.participants} peserta
                    </span>
                    <div className="flex gap-2">
                      <Link
                        href={`/dashboard/events/${event.id}/participants`}
                        className="p-1.5 rounded-lg text-ink-400 hover:text-brand-600 hover:bg-brand-50 transition-all"
                      >
                        <Users className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => openEdit(event)}
                        className="p-1.5 rounded-lg text-ink-400 hover:text-brand-600 hover:bg-brand-50 transition-all"
                      >
                        <PencilSimple className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(event.id)}
                        className="p-1.5 rounded-lg text-ink-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
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
            className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100">
              <h2 className="font-semibold text-ink-900">
                {editingEvent ? "Edit Event" : "Buat Event Baru"}
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg text-ink-400 hover:text-ink-700 hover:bg-ink-50"
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
                <label className="block text-sm font-medium text-ink-700 mb-1.5">
                  Nama Event <span className="text-rose-500">*</span>
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
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">
                    Tipe <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="type"
                    required
                    defaultValue={editingEvent?.type ?? "WEBINAR"}
                    className="input-field"
                  >
                    {EVENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {TYPE_LABELS[t]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">
                    Tanggal <span className="text-rose-500">*</span>
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
                <label className="block text-sm font-medium text-ink-700 mb-1.5">
                  Lokasi
                </label>
                <input
                  name="location"
                  defaultValue={editingEvent?.location ?? ""}
                  placeholder="Online (Zoom) / Nama Gedung"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">
                  Deskripsi
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
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn-primary flex-1 justify-center disabled:opacity-60"
                >
                  {isPending ? (
                    <>
                      <CircleNotch className="w-4 h-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : editingEvent ? (
                    "Simpan Perubahan"
                  ) : (
                    "Buat Event"
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
            className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm"
            onClick={() => setDeleteId(null)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
              <Trash className="w-6 h-6 text-rose-600" weight="fill" />
            </div>
            <h2 className="font-semibold text-ink-900 mb-2">Hapus Event?</h2>
            <p className="text-sm text-ink-500 mb-6">
              Semua peserta dan sertifikat terkait akan ikut terhapus. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="btn-secondary flex-1 justify-center"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={isPending}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-rose-500 text-white px-5 py-2.5 text-sm font-semibold hover:bg-rose-600 transition-all disabled:opacity-60"
              >
                {isPending ? (
                  <CircleNotch className="w-4 h-4 animate-spin" />
                ) : (
                  "Hapus"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
