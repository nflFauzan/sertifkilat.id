"use client";

import { useState, useTransition, useRef } from "react";
import {
  CaretLeft,
  Plus,
  Trash,
  UploadSimple,
  Warning,
  CircleNotch,
  User,
  Users,
  FileText,
  X,
  CheckCircle,
} from "@phosphor-icons/react";
import {
  createParticipantAction,
  deleteParticipantAction,
  batchImportParticipantsAction,
} from "@/app/actions/participants";
import Link from "next/link";

type Participant = {
  id: string;
  name: string;
  email: string;
  rowIndex: number;
  createdAt: Date;
};

const SAMPLE_CSV = `name,email
Bagas Santoso,bagas@kelasonline.id
Dini Rahmawati,dini@ngomestic.org
Putri Lestari,putri@skn.co.id`;

export default function ParticipantsClient({
  event,
  participants: initialParticipants,
}: {
  event: { id: string; name: string };
  participants: Participant[];
}) {
  const [participants, setParticipants] = useState<Participant[]>(initialParticipants);
  const [search, setSearch] = useState("");
  
  // Single Add form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState("");
  
  // Batch Upload states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [batchData, setBatchData] = useState<Array<{ name: string; email: string }>>([]);
  const [csvError, setCsvError] = useState("");
  
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  // Parse CSV
  function parseCsv(text: string) {
    const lines = text.trim().split("\n");
    if (lines.length < 2) {
      setCsvError("File CSV harus memiliki header dan minimal 1 baris data");
      return;
    }

    const headers = lines[0].toLowerCase().split(",").map((h) => h.trim());
    const nameIdx = headers.findIndex((h) => h.includes("name") || h === "nama");
    const emailIdx = headers.findIndex((h) => h.includes("email"));

    if (nameIdx === -1 || emailIdx === -1) {
      setCsvError("CSV harus memiliki kolom 'name' dan 'email'");
      return;
    }

    const parsed: Array<{ name: string; email: string }> = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
      if (cols[nameIdx] && cols[emailIdx]) {
        parsed.push({ name: cols[nameIdx], email: cols[emailIdx] });
      }
    }

    if (!parsed.length) {
      setCsvError("Tidak ada data peserta yang valid");
      return;
    }

    setCsvError("");
    setBatchData(parsed);
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      parseCsv(ev.target?.result as string);
    };
    reader.readAsText(file);
  }

  // Handle single submit
  function handleSingleAddSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email) {
      setFormError("Semua field wajib diisi");
      return;
    }

    setFormError("");
    startTransition(async () => {
      const res = await createParticipantAction(event.id, name, email);
      if (res.error) {
        setFormError(res.error);
      } else {
        // Manually reload page state or add locally
        window.location.reload();
      }
    });
  }

  // Handle batch import submit
  function handleBatchImportSubmit() {
    if (!batchData.length) return;

    startTransition(async () => {
      const res = await batchImportParticipantsAction(event.id, batchData);
      if (res.error) {
        setCsvError(res.error);
      } else {
        window.location.reload();
      }
    });
  }

  // Handle delete participant
  function handleDelete(id: string) {
    if (!confirm("Apakah Anda yakin ingin menghapus peserta ini?")) return;

    startTransition(async () => {
      const res = await deleteParticipantAction(id, event.id);
      if (res.error) {
        alert(res.error);
      } else {
        setParticipants((prev) => prev.filter((p) => p.id !== id));
      }
    });
  }

  // Filtered participants list
  const filteredParticipants = participants.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-ink-100">
        <Link
          href="/dashboard/events"
          className="p-2 rounded-xl text-ink-600 hover:bg-ink-150 transition-all"
        >
          <CaretLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-ink-900">{event.name}</h1>
          <p className="text-xs text-ink-400">Kelola daftar peserta yang akan menerima sertifikat event ini.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Forms */}
        <div className="space-y-6">
          {/* Add Single Participant Form */}
          <div className="card p-6">
            <h2 className="font-semibold text-ink-900 text-base mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-500" />
              Tambah Peserta Baru
            </h2>

            <form onSubmit={handleSingleAddSubmit} className="space-y-4">
              {formError && (
                <div className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
                  <Warning weight="fill" className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">
                  Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Bagas Santoso"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">
                  Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Contoh: bagas@kelasonline.id"
                  className="input-field"
                />
              </div>

              <button
                type="submit"
                disabled={isPending || !name || !email}
                className="btn-primary w-full justify-center"
              >
                {isPending ? (
                  <CircleNotch className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Tambah Peserta
              </button>
            </form>
          </div>

          {/* Import CSV Trigger */}
          <div className="card p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mx-auto">
              <UploadSimple className="w-6 h-6 text-brand-500" />
            </div>
            <div>
              <h3 className="font-semibold text-ink-900 text-sm">Impor Massal Peserta</h3>
              <p className="text-xs text-ink-400 mt-1">
                Upload daftar nama dan email peserta secara sekaligus via file CSV.
              </p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn-secondary w-full justify-center"
            >
              Impor File CSV
            </button>
          </div>
        </div>

        {/* Right Side: Participant Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <h2 className="font-semibold text-ink-900 text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-ink-400" />
              Daftar Peserta ({filteredParticipants.length})
            </h2>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau email..."
              className="input-field max-w-xs py-1.5 px-3 text-xs"
            />
          </div>

          <div className="card overflow-hidden">
            {filteredParticipants.length === 0 ? (
              <div className="p-8 text-center text-ink-400 text-sm">
                Belum ada peserta terdaftar. Tambah peserta di form sebelah kiri atau impor via CSV.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-ink-50 border-b border-ink-100 text-xs font-semibold text-ink-500 uppercase tracking-wide">
                      <th className="px-5 py-3 text-left">Nama</th>
                      <th className="px-5 py-3 text-left">Email</th>
                      <th className="px-5 py-3 text-right" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-50">
                    {filteredParticipants.map((p) => (
                      <tr key={p.id} className="hover:bg-ink-50">
                        <td className="px-5 py-3.5 font-medium text-ink-900">
                          {p.name}
                        </td>
                        <td className="px-5 py-3.5 text-ink-600">
                          {p.email}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-1 rounded-lg text-ink-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                            title="Hapus Peserta"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CSV Import Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-soft overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100">
              <h2 className="text-lg font-bold text-ink-900">Impor Massal Peserta</h2>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setBatchData([]);
                  setCsvError("");
                }}
                className="p-1 rounded-lg text-ink-400 hover:bg-ink-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {csvError && (
                <div className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
                  <Warning weight="fill" className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{csvError}</span>
                </div>
              )}

              {/* Upload Drop Zone */}
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-ink-200 rounded-xl p-8 text-center hover:border-brand-400 hover:bg-brand-50/20 transition-all cursor-pointer"
              >
                <UploadSimple className="w-10 h-10 text-ink-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-ink-700">
                  Klik untuk upload file CSV
                </p>
                <p className="text-xs text-ink-400 mt-1">
                  Format: harus memiliki kolom <code className="bg-ink-100 px-1 rounded">name</code> dan <code className="bg-ink-100 px-1 rounded">email</code>
                </p>
              </div>

              <input
                ref={fileRef}
                type="file"
                accept=".csv,.txt"
                className="hidden"
                onChange={handleFileUpload}
              />

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-ink-100" />
                <span className="text-xs text-ink-400">atau</span>
                <div className="flex-1 h-px bg-ink-100" />
              </div>

              <button
                onClick={() => parseCsv(SAMPLE_CSV)}
                className="btn-secondary w-full justify-center"
              >
                <FileText className="w-4 h-4" />
                Gunakan Data Contoh (3 peserta)
              </button>

              {/* Preview data */}
              {batchData.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-ink-500 uppercase tracking-wider">
                    Preview Data Impor ({batchData.length} peserta)
                  </h3>
                  <div className="max-h-40 overflow-y-auto border border-ink-100 rounded-xl divide-y divide-ink-50">
                    {batchData.map((d, idx) => (
                      <div key={idx} className="flex justify-between px-4 py-2 text-xs">
                        <span className="font-medium text-ink-900">{d.name}</span>
                        <span className="text-ink-600">{d.email}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer buttons */}
            <div className="flex justify-end gap-3 px-6 py-4 bg-ink-50 border-t border-ink-100">
              <button
                type="button"
                onClick={() => {
                  setShowUploadModal(false);
                  setBatchData([]);
                  setCsvError("");
                }}
                className="btn-secondary"
                disabled={isPending}
              >
                Batal
              </button>
              <button
                onClick={handleBatchImportSubmit}
                className="btn-primary"
                disabled={isPending || !batchData.length}
              >
                {isPending ? (
                  <>
                    <CircleNotch className="w-4 h-4 animate-spin" />
                    Mengimpor...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" weight="fill" />
                    Simpan & Impor
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
