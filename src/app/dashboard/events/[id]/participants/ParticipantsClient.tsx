"use client";

import { useState, useTransition, useRef, useCallback } from "react";
import {
  CaretLeft, Plus, Trash, UploadSimple, Warning,
  CircleNotch, User, Users, X, CheckCircle,
  MagnifyingGlass, DownloadSimple, CaretLeft as Prev, CaretRight as Next,
} from "@phosphor-icons/react";
import {
  createParticipantAction,
  deleteParticipantAction,
  bulkDeleteParticipantsAction,
  batchImportParticipantsAction,
  type ImportRow,
} from "@/app/actions/participants";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import * as XLSX from "xlsx";

type Participant = {
  id: string;
  name: string;
  email: string;
  rowIndex: number;
  institution: string;
  position: string;
  createdAt: Date;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateRows(raw: Array<Record<string, string>>): ImportRow[] {
  const seen = new Set<string>();
  return raw.map((r) => {
    const name = (r["full name"] || r["name"] || r["nama"] || "").trim();
    const email = (r["email"] || "").trim().toLowerCase();
    const institution = (r["institution"] || r["institusi"] || "").trim();
    const position = (r["position"] || r["jabatan"] || r["posisi"] || "").trim();
    const errors: string[] = [];
    if (!name) errors.push("Nama kosong");
    if (!email) errors.push("Gmail kosong");
    else if (!EMAIL_RE.test(email)) errors.push("Format Gmail tidak valid");
    else if (seen.has(email)) errors.push("Gmail duplikat di file");
    if (email) seen.add(email);
    return { name, email, institution, position, valid: errors.length === 0, errors };
  });
}

export default function ParticipantsClient({
  event,
  participants: initialParticipants,
  totalCount,
  page,
  totalPages,
  searchQuery,
}: {
  event: { id: string; name: string };
  participants: Participant[];
  totalCount: number;
  page: number;
  totalPages: number;
  searchQuery: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  // Single add
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [institution, setInstitution] = useState("");
  const [position, setPosition] = useState("");
  const [formError, setFormError] = useState("");

  // Import modal
  const [showImport, setShowImport] = useState(false);
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [parseError, setParseError] = useState("");
  const [importResult, setImportResult] = useState<{ count: number; skipped: number } | null>(null);

  // Bulk select
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<"single" | "bulk">("bulk");
  const [deleteSingleId, setDeleteSingleId] = useState("");

  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Search / pagination helpers ─────────────────────────────────
  const navigate = useCallback(
    (q: string, p: number) => {
      const sp = new URLSearchParams(params.toString());
      if (q) sp.set("q", q); else sp.delete("q");
      if (p > 1) sp.set("page", String(p)); else sp.delete("page");
      router.push(`${pathname}?${sp.toString()}`);
    },
    [params, pathname, router]
  );

  // ── Excel parse ─────────────────────────────────────────────────
  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setParseError("");
    setImportRows([]);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const raw = XLSX.utils.sheet_to_json<Record<string, string>>(ws, {
          defval: "",
          raw: false,
        });
        if (!raw.length) { setParseError("File kosong atau tidak memiliki baris data."); return; }
        const normalized = raw.map((r) => {
          const out: Record<string, string> = {};
          for (const k of Object.keys(r)) out[k.toLowerCase().trim()] = String(r[k]);
          return out;
        });
        if (!("email" in normalized[0]) && !("gmail" in normalized[0])) {
          setParseError("Kolom 'Email' tidak ditemukan. Pastikan file menggunakan template yang benar."); return;
        }
        setImportRows(validateRows(normalized));
      } catch {
        setParseError("Gagal membaca file. Pastikan format file adalah .xlsx atau .xls.");
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  }

  // ── Single add ──────────────────────────────────────────────────
  function handleSingleAdd(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    startTransition(async () => {
      const res = await createParticipantAction(event.id, name, email, institution, position);
      if (res.error) { setFormError(res.error); return; }
      setName(""); setEmail(""); setInstitution(""); setPosition("");
      router.refresh();
    });
  }

  // ── Batch import ────────────────────────────────────────────────
  function handleImport() {
    const validRows = importRows.filter((r) => r.valid);
    if (!validRows.length) return;
    startTransition(async () => {
      const res = await batchImportParticipantsAction(event.id, importRows);
      if (res.error) { setParseError(res.error); return; }
      setImportResult({ count: res.count ?? 0, skipped: res.skipped ?? 0 });
      router.refresh();
    });
  }

  function closeImport() {
    setShowImport(false);
    setImportRows([]);
    setParseError("");
    setImportResult(null);
  }

  // ── Delete ──────────────────────────────────────────────────────
  function confirmDelete(id: string) {
    setDeleteTarget("single");
    setDeleteSingleId(id);
    setShowDeleteConfirm(true);
  }

  function confirmBulkDelete() {
    setDeleteTarget("bulk");
    setShowDeleteConfirm(true);
  }

  function executeDelete() {
    setShowDeleteConfirm(false);
    startTransition(async () => {
      if (deleteTarget === "single") {
        await deleteParticipantAction(deleteSingleId, event.id);
      } else {
        await bulkDeleteParticipantsAction(Array.from(selected), event.id);
        setSelected(new Set());
      }
      router.refresh();
    });
  }

  // ── Select ──────────────────────────────────────────────────────
  function toggleAll() {
    if (selected.size === initialParticipants.length) setSelected(new Set());
    else setSelected(new Set(initialParticipants.map((p) => p.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const validCount = importRows.filter((r) => r.valid).length;
  const invalidCount = importRows.filter((r) => !r.valid).length;
  const dupCount = importRows.filter((r) => r.errors.some((e) => e.includes("duplikat"))).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-ink-100">
        <Link href="/dashboard/events" className="p-2 rounded-xl text-ink-600 hover:bg-ink-100 transition-all">
          <CaretLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-ink-900">{event.name}</h1>
          <p className="text-xs text-ink-400">Kelola daftar peserta yang akan menerima sertifikat.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Forms */}
        <div className="space-y-5">
          {/* Add single */}
          <div className="card p-5">
            <h2 className="font-semibold text-ink-900 text-sm mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-500" /> Tambah Peserta
            </h2>
            <form onSubmit={handleSingleAdd} className="space-y-3">
              {formError && (
                <div className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-700">
                  <Warning weight="fill" className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
              <input required value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Nama Lengkap *" className="input-field text-sm" />
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Gmail *" className="input-field text-sm" />
              <input value={institution} onChange={(e) => setInstitution(e.target.value)}
                placeholder="Institusi" className="input-field text-sm" />
              <input value={position} onChange={(e) => setPosition(e.target.value)}
                placeholder="Jabatan / Posisi" className="input-field text-sm" />
              <button type="submit" disabled={isPending || !name || !email}
                className="btn-primary w-full justify-center text-sm">
                {isPending ? <CircleNotch className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Tambah
              </button>
            </form>
          </div>

          {/* Import & Download */}
          <div className="card p-5 text-center space-y-3">
            <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center mx-auto">
              <UploadSimple className="w-5 h-5 text-brand-500" />
            </div>
            <div>
              <h3 className="font-semibold text-ink-900 text-sm">Impor Massal via Excel</h3>
              <p className="text-xs text-ink-400 mt-1">Upload file Excel berisi daftar peserta sekaligus.</p>
            </div>
            <button onClick={() => setShowImport(true)} className="btn-secondary w-full justify-center text-sm">
              Impor File Excel
            </button>
            <a href="/api/participants/template"
              className="inline-flex items-center gap-1.5 text-xs text-brand-600 font-medium hover:text-brand-700">
              <DownloadSimple className="w-3.5 h-3.5" /> Unduh Template Excel
            </a>
          </div>
        </div>

        {/* RIGHT: Table */}
        <div className="lg:col-span-2 space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <h2 className="font-semibold text-ink-900 text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-ink-400" />
              Daftar Peserta
              <span className="text-xs text-ink-400 font-normal">({totalCount} total)</span>
            </h2>
            <div className="flex items-center gap-2">
              {selected.size > 0 && (
                <button onClick={confirmBulkDelete} disabled={isPending}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 border border-rose-200 bg-rose-50 hover:bg-rose-100 rounded-lg px-3 py-1.5 transition-all">
                  <Trash className="w-3.5 h-3.5" /> Hapus ({selected.size})
                </button>
              )}
              <div className="relative">
                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-400" />
                <input
                  type="text"
                  defaultValue={searchQuery}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") navigate((e.target as HTMLInputElement).value, 1);
                  }}
                  placeholder="Cari nama, email..."
                  className="input-field pl-8 py-1.5 text-xs max-w-52"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="card overflow-hidden">
            {initialParticipants.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-ink-100 flex items-center justify-center mx-auto">
                  <Users className="w-7 h-7 text-ink-300" />
                </div>
                <p className="font-semibold text-ink-700">Belum ada peserta</p>
                <p className="text-xs text-ink-400 max-w-xs mx-auto">
                  {searchQuery
                    ? `Tidak ada peserta cocok dengan "${searchQuery}".`
                    : "Upload file Excel untuk menambahkan peserta secara massal, atau gunakan form di sebelah kiri."}
                </p>
                {searchQuery && (
                  <button onClick={() => navigate("", 1)}
                    className="text-xs text-brand-600 font-medium hover:underline">
                    Hapus pencarian
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-ink-50 border-b border-ink-100 text-xs font-semibold text-ink-500 uppercase tracking-wide">
                      <th className="px-4 py-3 text-left w-10">
                        <input type="checkbox"
                          checked={selected.size === initialParticipants.length && initialParticipants.length > 0}
                          onChange={toggleAll}
                          className="rounded border-ink-300" />
                      </th>
                      <th className="px-4 py-3 text-left">Nama</th>
                      <th className="px-4 py-3 text-left">Gmail</th>
                      <th className="px-4 py-3 text-left hidden md:table-cell">Institusi</th>
                      <th className="px-4 py-3 text-left hidden lg:table-cell">Jabatan</th>
                      <th className="px-4 py-3 w-12" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-50">
                    {initialParticipants.map((p) => (
                      <tr key={p.id} className={`hover:bg-ink-50 transition-colors ${selected.has(p.id) ? "bg-brand-50/50" : ""}`}>
                        <td className="px-4 py-3">
                          <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleOne(p.id)}
                            className="rounded border-ink-300" />
                        </td>
                        <td className="px-4 py-3 font-medium text-ink-900">{p.name}</td>
                        <td className="px-4 py-3 text-ink-600">{p.email}</td>
                        <td className="px-4 py-3 text-ink-500 hidden md:table-cell">{p.institution || "—"}</td>
                        <td className="px-4 py-3 text-ink-500 hidden lg:table-cell">{p.position || "—"}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => confirmDelete(p.id)}
                            className="p-1.5 rounded-lg text-ink-400 hover:text-rose-600 hover:bg-rose-50 transition-all">
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-xs text-ink-500">
              <span>Halaman {page} dari {totalPages} ({totalCount} peserta)</span>
              <div className="flex items-center gap-1">
                <button onClick={() => navigate(searchQuery, page - 1)} disabled={page <= 1}
                  className="p-1.5 rounded-lg hover:bg-ink-100 disabled:opacity-40 transition-all">
                  <Prev className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                  return (
                    <button key={p} onClick={() => navigate(searchQuery, p)}
                      className={`w-7 h-7 rounded-lg font-medium transition-all ${p === page ? "bg-brand-500 text-white" : "hover:bg-ink-100"}`}>
                      {p}
                    </button>
                  );
                })}
                <button onClick={() => navigate(searchQuery, page + 1)} disabled={page >= totalPages}
                  className="p-1.5 rounded-lg hover:bg-ink-100 disabled:opacity-40 transition-all">
                  <Next className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Delete Confirm Modal ───────────────────────────────────── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto">
              <Trash className="w-6 h-6 text-rose-600" weight="fill" />
            </div>
            <div>
              <h2 className="font-semibold text-ink-900">Hapus Peserta?</h2>
              <p className="text-sm text-ink-500 mt-1">
                {deleteTarget === "bulk"
                  ? `${selected.size} peserta akan dihapus permanen.`
                  : "Peserta ini akan dihapus permanen."}
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary flex-1 justify-center">
                Batal
              </button>
              <button onClick={executeDelete} disabled={isPending}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-rose-500 text-white px-5 py-2.5 text-sm font-semibold hover:bg-rose-600 disabled:opacity-60 transition-all">
                {isPending ? <CircleNotch className="w-4 h-4 animate-spin" /> : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Import Excel Modal ────────────────────────────────────── */}
      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100">
              <h2 className="text-base font-bold text-ink-900">Impor Massal Peserta</h2>
              <button onClick={closeImport} className="p-1 rounded-lg text-ink-400 hover:bg-ink-50">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6 space-y-4">
              {/* Success state */}
              {importResult ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-7 h-7 text-emerald-500" weight="fill" />
                  </div>
                  <h3 className="font-bold text-ink-900">Impor Berhasil!</h3>
                  <p className="text-sm text-ink-500">
                    <span className="font-semibold text-emerald-600">{importResult.count} peserta</span> berhasil diimpor.
                    {importResult.skipped > 0 && (
                      <span> {importResult.skipped} peserta dilewati (sudah terdaftar).</span>
                    )}
                  </p>
                  <button onClick={closeImport} className="btn-primary mx-auto">Selesai</button>
                </div>
              ) : (
                <>
                  {parseError && (
                    <div className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
                      <Warning weight="fill" className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{parseError}</span>
                    </div>
                  )}

                  {importRows.length === 0 ? (
                    <div
                      onClick={() => fileRef.current?.click()}
                      className="border-2 border-dashed border-ink-200 rounded-xl p-10 text-center hover:border-brand-400 hover:bg-brand-50/20 transition-all cursor-pointer space-y-2">
                      <UploadSimple className="w-10 h-10 text-ink-400 mx-auto" />
                      <p className="text-sm font-medium text-ink-700">Klik untuk upload file Excel (.xlsx)</p>
                      <p className="text-xs text-ink-400">Kolom wajib: <code className="bg-ink-100 px-1 rounded">Full Name</code> dan <code className="bg-ink-100 px-1 rounded">Email</code></p>
                      <a href="/api/participants/template" onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-xs text-brand-600 font-medium hover:underline">
                        <DownloadSimple className="w-3.5 h-3.5" /> Unduh Template Excel
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Summary badges */}
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3.5 h-3.5" weight="fill" /> {validCount} Valid
                        </span>
                        {invalidCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                            <Warning className="w-3.5 h-3.5" weight="fill" /> {invalidCount} Invalid
                          </span>
                        )}
                        {dupCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            {dupCount} Duplikat
                          </span>
                        )}
                        <button onClick={() => { setImportRows([]); setParseError(""); }}
                          className="ml-auto text-xs text-ink-400 hover:text-rose-600 flex items-center gap-1">
                          <X className="w-3 h-3" /> Ganti File
                        </button>
                      </div>

                      {/* Preview table */}
                      <div className="border border-ink-100 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
                        <table className="w-full text-xs">
                          <thead className="bg-ink-50 sticky top-0">
                            <tr className="text-ink-500 font-semibold uppercase tracking-wide">
                              <th className="px-3 py-2 text-left">Status</th>
                              <th className="px-3 py-2 text-left">Nama</th>
                              <th className="px-3 py-2 text-left">Gmail</th>
                              <th className="px-3 py-2 text-left hidden sm:table-cell">Institusi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-ink-50">
                            {importRows.map((row, i) => (
                              <tr key={`import-row-${i}`} className={row.valid ? "hover:bg-ink-50" : "bg-rose-50/50"}>
                                <td className="px-3 py-2">
                                  {row.valid
                                    ? <CheckCircle className="w-4 h-4 text-emerald-500" weight="fill" />
                                    : (
                                      <span className="inline-flex items-center gap-1 text-rose-600">
                                        <Warning className="w-4 h-4" weight="fill" />
                                        <span className="text-[10px]">{row.errors[0]}</span>
                                      </span>
                                    )}
                                </td>
                                <td className={`px-3 py-2 font-medium ${row.valid ? "text-ink-900" : "text-rose-700"}`}>{row.name || "—"}</td>
                                <td className="px-3 py-2 text-ink-600">{row.email || "—"}</td>
                                <td className="px-3 py-2 text-ink-500 hidden sm:table-cell">{row.institution || "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}

              <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFile} />
            </div>

            {/* Modal footer */}
            {!importResult && (
              <div className="flex justify-end gap-3 px-6 py-4 bg-ink-50 border-t border-ink-100">
                <button onClick={closeImport} disabled={isPending} className="btn-secondary">Batal</button>
                {importRows.length > 0 && (
                  <button onClick={handleImport} disabled={isPending || validCount === 0} className="btn-primary">
                    {isPending
                      ? <><CircleNotch className="w-4 h-4 animate-spin" /> Mengimpor...</>
                      : <><CheckCircle className="w-4 h-4" weight="fill" /> Impor {validCount} Peserta</>}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
