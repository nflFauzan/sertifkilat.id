"use client";

import { useState, useTransition, useRef } from "react";
import {
  UploadSimple,
  Plus,
  Trash,
  Sliders,
  Warning,
  CircleNotch,
  Image as ImageIcon,
  CheckCircle,
  X,
} from "@phosphor-icons/react";
import { createTemplateAction, deleteTemplateAction } from "@/app/actions/templates";
import Image from "next/image";
import Link from "next/link";

import UpgradeModal from "@/components/UpgradeModal";

type Event = { id: string; name: string };
type Template = {
  id: string;
  name: string;
  fileUrl: string;
  eventId: string | null;
  createdAt: Date;
  event: { name: string } | null;
};

export default function TemplatesClient({
  events,
  templates: initialTemplates,
  userPlan,
}: {
  events: Event[];
  templates: Template[];
  userPlan: string;
}) {
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const limitTemplates = userPlan === "FREE" ? 1 : userPlan === "PRO" ? 5 : 999999;
  const isLocked = templates.length >= limitTemplates;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar (PNG/JPG)");
      return;
    }

    setSelectedFile(file);
    setError("");

    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreviewUrl(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handleUploadSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!templateName || !selectedFile) {
      setError("Nama template dan file gambar wajib diisi");
      return;
    }

    setError("");
    const fd = new FormData();
    fd.append("name", templateName);
    fd.append("file", selectedFile);
    if (selectedEventId) {
      fd.append("eventId", selectedEventId);
    }

    startTransition(async () => {
      const res = await createTemplateAction(fd);
      if (res.error) {
        setError(res.error);
      } else if (res.success) {
        // Reload page or manually update local state
        window.location.reload();
      }
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Apakah Anda yakin ingin menghapus template ini?")) return;

    startTransition(async () => {
      const res = await deleteTemplateAction(id);
      if (res.error) {
        alert(res.error);
      } else {
        setTemplates((prev) => prev.filter((t) => t.id !== id));
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Template Sertifikat</h1>
          <p className="text-sm text-ink-500 mt-1">
            Kelola template desain sertifikat Anda dan atur koordinat nama serta QR.
          </p>
        </div>
        <button
          onClick={() => {
            if (isLocked) setUpgradeOpen(true);
            else setShowUploadModal(true);
          }}
          className="btn-primary self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Upload Template Baru
        </button>
      </div>

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <div className="card p-12 text-center max-w-lg mx-auto mt-8">
          <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-6 h-6 text-brand-500" />
          </div>
          <h3 className="text-lg font-semibold text-ink-900">Belum Ada Template</h3>
          <p className="text-sm text-ink-500 mt-1 mb-6">
            Upload file gambar sertifikat kosong Anda (tanpa nama peserta dan QR) untuk mulai mendesain tata letak.
          </p>
          <button
            onClick={() => {
              if (isLocked) setUpgradeOpen(true);
              else setShowUploadModal(true);
            }}
            className="btn-primary mx-auto"
          >
            Upload Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className="card group overflow-hidden flex flex-col border border-ink-150 hover:shadow-soft hover:border-brand-300 transition-all duration-200"
            >
              {/* Image Preview Container */}
              <div className="relative aspect-[16/11] bg-ink-50 border-b border-ink-100 overflow-hidden">
                <Image
                  src={template.fileUrl}
                  alt={template.name}
                  fill
                  className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-ink-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity duration-200">
                  <Link
                    href={`/dashboard/templates/${template.id}`}
                    className="btn-primary py-2 px-3 text-xs bg-white text-ink-900 hover:bg-brand-50 hover:text-brand-600 shadow-lg border border-transparent"
                  >
                    <Sliders className="w-4 h-4" />
                    Atur Letak
                  </Link>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="btn-primary py-2 px-3 text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-lg border border-transparent"
                  >
                    <Trash className="w-4 h-4" />
                    Hapus
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-ink-900 text-base">{template.name}</h3>
                  <p className="text-xs text-ink-400 mt-1">
                    Dibuat pada {new Date(template.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>

                {template.event ? (
                  <div className="mt-4 pt-3 border-t border-ink-50 flex items-center gap-1.5 text-xs text-brand-600 font-medium">
                    <CheckCircle className="w-4 h-4 text-brand-500" weight="fill" />
                    <span>Dihubungkan ke: {template.event.name}</span>
                  </div>
                ) : (
                  <div className="mt-4 pt-3 border-t border-ink-50 text-xs text-ink-400">
                    Belum dihubungkan ke event
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal Overlay */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-sm">
          <div
            className="w-full max-w-lg bg-white rounded-2xl shadow-soft overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100">
              <h2 className="text-lg font-bold text-ink-900">Upload Template Baru</h2>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setTemplateName("");
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  setError("");
                }}
                className="p-1.5 rounded-lg text-ink-400 hover:bg-ink-50 hover:text-ink-700 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
              {error && (
                <div className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
                  <Warning weight="fill" className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">
                  Nama Template <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Contoh: Sertifikat Webinar UI/UX"
                  className="input-field"
                />
              </div>

              {/* Event Link Field */}
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">
                  Hubungkan dengan Event
                </label>
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="input-field"
                >
                  <option value="">— Opsional (Dapat dihubungkan nanti) —</option>
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* File Upload Field */}
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">
                  File Gambar Template <span className="text-rose-500">*</span>
                </label>
                
                {previewUrl ? (
                  <div className="relative aspect-[16/11] w-full rounded-xl overflow-hidden border border-ink-200 bg-ink-50">
                    <Image
                      src={previewUrl}
                      alt="Preview template"
                      fill
                      className="object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                      className="absolute top-2 right-2 p-1 bg-ink-900/60 hover:bg-ink-900/80 text-white rounded-full transition-all"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-ink-200 rounded-xl p-6 text-center hover:border-brand-400 hover:bg-brand-50/20 transition-all cursor-pointer"
                  >
                    <UploadSimple className="w-8 h-8 text-ink-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-ink-700">
                      Klik untuk memilih file gambar
                    </p>
                    <p className="text-xs text-ink-400 mt-1">PNG atau JPG (Disarankan resolusi lanskap A4)</p>
                  </div>
                )}
                
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="btn-secondary"
                  disabled={isPending}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isPending || !templateName || !selectedFile}
                >
                  {isPending ? (
                    <>
                      <CircleNotch className="w-4 h-4 animate-spin" />
                      Mengunggah...
                    </>
                  ) : (
                    "Simpan Template"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <UpgradeModal
        isOpen={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        currentPlan={userPlan}
      />
    </div>
  );
}
