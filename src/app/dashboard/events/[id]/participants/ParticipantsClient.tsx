"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import {
  CaretLeft,
  Plus,
  Trash,
  UploadSimple,
  Warning,
  CircleNotch,
  User,
  Users,
  X,
  CheckCircle,
  Download,
  MagnifyingGlass,
  ArrowLeft,
  ArrowRight,
} from "@phosphor-icons/react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  createParticipantAction,
  deleteParticipantAction,
  deleteParticipantsAction,
  validateParticipantsAction,
  importValidParticipantsAction,
} from "@/app/actions/participants";
import Link from "next/link";
import * as XLSX from "xlsx";

type Participant = {
  id: string;
  name: string;
  email: string;
  rowIndex: number;
  institution: string;
  position: string;
  createdAt: string;
};

type ValidatedParticipant = {
  name: string;
  email: string;
  institution: string;
  position: string;
  isValid: boolean;
  status: string;
  message: string;
};

export default function ParticipantsClient({
  event,
  participants,
  totalCount,
  currentPage,
  totalPages,
  searchQuery: initialSearch,
}: {
  event: { id: string; name: string };
  participants: Participant[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  searchQuery: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Search state
  const [search, setSearch] = useState(initialSearch);

  // Single Add form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [institution, setInstitution] = useState("");
  const [position, setPosition] = useState("");
  const [formError, setFormError] = useState("");

  // Batch Upload states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [excelError, setExcelError] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validatedData, setValidatedData] = useState<ValidatedParticipant[]>([]);
  const [summary, setSummary] = useState<{ valid: number; invalid: number; duplicate: number } | null>(null);

  // Bulk Delete selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  // Keep search input synced with url
  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  // Handle Search Input
  const triggerSearch = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val.trim()) {
      params.set("q", val.trim());
    } else {
      params.delete("q");
    }
    params.set("page", "1"); // Reset to first page
    router.push(`${pathname}?${params.toString()}`);
  };

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  // Download Excel template
  const downloadExcelTemplate = () => {
    const headers = [["Full Name", "Email", "Institution", "Position"]];
    const data = [
      ["Rahma Fitria", "rahma@example.com", "Universitas ABC", "Participant"],
    ];
    const ws = XLSX.utils.aoa_to_sheet([...headers, ...data]);
    
    // Auto-fit column widths
    const maxCols = [15, 25, 20, 15];
    ws["!cols"] = maxCols.map(w => ({ wch: w }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template Peserta");
    XLSX.writeFile(wb, "template_peserta.xlsx");
  };

  // Parse Excel file upload
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExcelError("");
    setIsValidating(true);
    setValidatedData([]);
    setSummary(null);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const arrayBuffer = evt.target?.result as ArrayBuffer;
        const data = new Uint8Array(arrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Parse rows as raw array of arrays to handle headers custom mapping
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];

        if (rows.length < 2) {
          setExcelError("File Excel/CSV harus memiliki baris header dan minimal 1 baris data.");
          setIsValidating(false);
          return;
        }

        // Normalize header row
        const headers = rows[0].map(h => String(h || "").trim().toLowerCase());
        const nameIdx = headers.findIndex(h => h === "full name" || h === "nama lengkap" || h === "name" || h === "nama");
        const emailIdx = headers.findIndex(h => h === "email" || h === "gmail");
        const instIdx = headers.findIndex(h => h === "institution" || h === "instansi" || h === "lembaga" || h === "organisasi");
        const posIdx = headers.findIndex(h => h === "position" || h === "jabatan" || h === "role" || h === "peran");

        if (nameIdx === -1 || emailIdx === -1) {
          setExcelError("Format kolom tidak sesuai. Pastikan file memiliki kolom 'Full Name' (Nama) dan 'Email'.");
          setIsValidating(false);
          return;
        }

        // Extract raw data from worksheet rows (skipping header)
        const collectedData: Array<{ name: string; email: string; institution: string; position: string }> = [];
        
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          // Skip entirely empty rows
          if (!row || row.every(val => val === null || val === undefined || String(val).trim() === "")) {
            continue;
          }

          const rawName = nameIdx !== -1 && row[nameIdx] !== undefined ? String(row[nameIdx]) : "";
          const rawEmail = emailIdx !== -1 && row[emailIdx] !== undefined ? String(row[emailIdx]) : "";
          const rawInst = instIdx !== -1 && row[instIdx] !== undefined ? String(row[instIdx]) : "";
          const rawPos = posIdx !== -1 && row[posIdx] !== undefined ? String(row[posIdx]) : "";

          collectedData.push({
            name: rawName.trim(),
            email: rawEmail.trim(),
            institution: rawInst.trim(),
            position: rawPos.trim(),
          });
        }

        if (collectedData.length === 0) {
          setExcelError("Tidak ada baris data peserta yang valid di dalam file.");
          setIsValidating(false);
          return;
        }

        // Call validation server action to double check inputs & look up DB duplicates
        const res = await validateParticipantsAction(event.id, collectedData);
        if (res.error) {
          setExcelError(res.error);
        } else if (res.success && res.validatedRows && res.summary) {
          setValidatedData(res.validatedRows);
          setSummary(res.summary);
        }
      } catch (err) {
        console.error("Error reading file:", err);
        setExcelError("Gagal membaca file. Pastikan format berkas valid.");
      } finally {
        setIsValidating(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Submit valid participants
  const handleConfirmImport = () => {
    const validRows = validatedData.filter(d => d.isValid);
    if (!validRows.length) return;

    startTransition(async () => {
      const res = await importValidParticipantsAction(event.id, validRows);
      if (res.error) {
        setExcelError(res.error);
      } else {
        setShowUploadModal(false);
        setValidatedData([]);
        setSummary(null);
        router.refresh();
      }
    });
  };

  // Single Add submit
  const handleSingleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setFormError("Nama dan Gmail wajib diisi");
      return;
    }
    setFormError("");

    startTransition(async () => {
      const res = await createParticipantAction(event.id, name, email, institution, position);
      if (res.error) {
        setFormError(res.error);
      } else {
        setName("");
        setEmail("");
        setInstitution("");
        setPosition("");
        router.refresh();
      }
    });
  };

  // Single delete
  const handleDelete = (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus peserta ini?")) return;

    startTransition(async () => {
      const res = await deleteParticipantAction(id, event.id);
      if (res.error) {
        alert(res.error);
      } else {
        setSelectedIds(prev => prev.filter(item => item !== id));
        router.refresh();
      }
    });
  };

  // Bulk delete
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Apakah Anda yakin ingin menghapus ${selectedIds.length} peserta terpilih?`)) return;

    startTransition(async () => {
      const res = await deleteParticipantsAction(selectedIds, event.id);
      if (res.error) {
        alert(res.error);
      } else {
        setSelectedIds([]);
        router.refresh();
      }
    });
  };

  // Select all checkbox handler
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(participants.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  // Individual checkbox handler
  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

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
        {/* Left Form Panel */}
        <div className="space-y-6">
          {/* Add Single Participant */}
          <div className="card p-6">
            <h2 className="font-semibold text-ink-900 text-base mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-500" />
              Tambah Peserta Baru
            </h2>

            <form onSubmit={handleSingleAdd} className="space-y-4">
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
                  Gmail <span className="text-rose-500">*</span>
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

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">
                  Institusi
                </label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="Contoh: Universitas ABC"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">
                  Posisi / Jabatan
                </label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="Contoh: Participant"
                  className="input-field"
                />
              </div>

              <button
                type="submit"
                disabled={isPending || !name.trim() || !email.trim()}
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

          {/* Import Panel */}
          <div className="card p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mx-auto">
              <UploadSimple className="w-6 h-6 text-brand-500" />
            </div>
            <div>
              <h3 className="font-semibold text-ink-900 text-sm">Impor Massal Peserta</h3>
              <p className="text-xs text-ink-400 mt-1">
                Upload daftar nama, email, institusi, dan posisi peserta sekaligus via file Excel atau CSV.
              </p>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => setShowUploadModal(true)}
                className="btn-primary w-full justify-center"
              >
                Impor File Excel / CSV
              </button>
              <button
                onClick={downloadExcelTemplate}
                className="btn-secondary w-full justify-center text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                Download Excel Template
              </button>
            </div>
          </div>
        </div>

        {/* Right Table Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <h2 className="font-semibold text-ink-900 text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-ink-400" />
              Daftar Peserta ({totalCount})
            </h2>

            {/* Search Input */}
            <div className="relative max-w-xs w-full">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-ink-400">
                <MagnifyingGlass className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  triggerSearch(e.target.value);
                }}
                placeholder="Cari nama, email, institusi..."
                className="input-field pl-9 pr-4 py-1.5 text-xs"
              />
            </div>
          </div>

          {/* Bulk Action Header Bar */}
          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50 border border-rose-200">
              <span className="text-xs font-semibold text-rose-700">
                {selectedIds.length} peserta terpilih
              </span>
              <button
                onClick={handleBulkDelete}
                className="btn-secondary text-rose-600 hover:bg-rose-100 hover:text-rose-700 text-xs py-1.5 px-3"
              >
                <Trash className="w-3.5 h-3.5" />
                Hapus Terpilih
              </button>
            </div>
          )}

          {/* Table / Empty State */}
          <div className="card overflow-hidden">
            {participants.length === 0 ? (
              <div className="p-12 text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-ink-50 flex items-center justify-center mx-auto">
                  <Users className="w-10 h-10 text-ink-300" />
                </div>
                <div className="max-w-sm mx-auto">
                  <p className="text-base font-semibold text-ink-900">
                    No participants yet.
                  </p>
                  <p className="text-xs text-ink-400 mt-1">
                    Upload an Excel file to start generating certificates.
                  </p>
                </div>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="btn-secondary text-xs mx-auto"
                >
                  Upload Excel File
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-ink-50 border-b border-ink-100 text-xs font-semibold text-ink-500 uppercase tracking-wide">
                      <th className="px-5 py-3 text-left w-10">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === participants.length && participants.length > 0}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="rounded border-ink-300 text-brand-500 focus:ring-brand-500 h-4 w-4"
                        />
                      </th>
                      <th className="px-5 py-3 text-left">Nama</th>
                      <th className="px-5 py-3 text-left">Gmail</th>
                      <th className="px-5 py-3 text-left">Institusi</th>
                      <th className="px-5 py-3 text-left">Posisi</th>
                      <th className="px-5 py-3 text-right" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-50">
                    {participants.map((p) => (
                      <tr key={p.id} className="hover:bg-ink-50">
                        <td className="px-5 py-3.5">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(p.id)}
                            onChange={(e) => handleSelectRow(p.id, e.target.checked)}
                            className="rounded border-ink-300 text-brand-500 focus:ring-brand-500 h-4 w-4"
                          />
                        </td>
                        <td className="px-5 py-3.5 font-medium text-ink-900">
                          {p.name}
                        </td>
                        <td className="px-5 py-3.5 text-ink-600">
                          {p.email}
                        </td>
                        <td className="px-5 py-3.5 text-ink-500">
                          {p.institution || "-"}
                        </td>
                        <td className="px-5 py-3.5 text-ink-500">
                          {p.position || "-"}
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-ink-400">
                Halaman {currentPage} dari {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="btn-secondary py-1 px-3 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Sebelumnya
                </button>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="btn-secondary py-1 px-3 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Selanjutnya <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Excel Import Dialog Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-soft overflow-hidden flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100 flex-shrink-0">
              <h2 className="text-lg font-bold text-ink-900">Impor Massal Peserta</h2>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setValidatedData([]);
                  setSummary(null);
                  setExcelError("");
                }}
                className="p-1 rounded-lg text-ink-400 hover:bg-ink-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {excelError && (
                <div className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
                  <Warning weight="fill" className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{excelError}</span>
                </div>
              )}

              {/* File Drop area */}
              {validatedData.length === 0 && !isValidating && (
                <div className="space-y-4">
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-ink-200 rounded-2xl p-10 text-center hover:border-brand-500 hover:bg-brand-50/10 transition-all cursor-pointer space-y-3"
                  >
                    <UploadSimple className="w-12 h-12 text-ink-300 mx-auto" />
                    <div>
                      <p className="text-sm font-semibold text-ink-900">Upload file Excel (.xlsx) atau CSV</p>
                      <p className="text-xs text-ink-400 mt-1">Seret berkas template Anda kemari atau cari dari folder.</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <button
                      onClick={downloadExcelTemplate}
                      className="btn-secondary text-xs mx-auto"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Excel Template
                    </button>
                  </div>
                </div>
              )}

              {/* Validation Progress */}
              {isValidating && (
                <div className="flex flex-col items-center justify-center py-10 space-y-3">
                  <CircleNotch className="w-8 h-8 text-brand-500 animate-spin" />
                  <p className="text-xs text-ink-500 font-medium">Sedang memvalidasi baris data file...</p>
                </div>
              )}

              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleExcelUpload}
              />

              {/* Validation Summary & Preview Table */}
              {validatedData.length > 0 && summary && (
                <div className="space-y-4">
                  {/* Summary row */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
                      <p className="text-xl font-bold text-emerald-600">{summary.valid}</p>
                      <p className="text-[10px] text-emerald-500 font-semibold uppercase tracking-wider">Valid Rows</p>
                    </div>
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-center">
                      <p className="text-xl font-bold text-rose-600">{summary.invalid}</p>
                      <p className="text-[10px] text-rose-500 font-semibold uppercase tracking-wider">Invalid Rows</p>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-center">
                      <p className="text-xl font-bold text-amber-600">{summary.duplicate}</p>
                      <p className="text-[10px] text-amber-500 font-semibold uppercase tracking-wider">Duplicate Rows</p>
                    </div>
                  </div>

                  {/* Preview Table */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-ink-800 uppercase tracking-wider">Pratinjau Data Impor</h4>
                    <div className="border border-ink-100 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-ink-50 sticky top-0 border-b border-ink-100">
                          <tr className="text-ink-500 font-semibold uppercase tracking-wide">
                            <th className="px-4 py-2.5 text-left">Nama</th>
                            <th className="px-4 py-2.5 text-left">Email</th>
                            <th className="px-4 py-2.5 text-left">Institusi</th>
                            <th className="px-4 py-2.5 text-left">Posisi</th>
                            <th className="px-4 py-2.5 text-left">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-ink-50 bg-white">
                          {validatedData.map((d, idx) => (
                            <tr key={`excel-preview-${idx}-${d.email}`} className="hover:bg-ink-50">
                              <td className="px-4 py-2 font-medium text-ink-900">{d.name || <span className="text-rose-500 italic">[Kosong]</span>}</td>
                              <td className="px-4 py-2 text-ink-600">{d.email || <span className="text-rose-500 italic">[Kosong]</span>}</td>
                              <td className="px-4 py-2 text-ink-500">{d.institution || "-"}</td>
                              <td className="px-4 py-2 text-ink-500">{d.position || "-"}</td>
                              <td className="px-4 py-2">
                                {d.isValid ? (
                                  <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                                    ✓ Valid
                                  </span>
                                ) : (
                                  <span className="text-rose-600 font-semibold flex items-center gap-0.5" title={d.message}>
                                    ✗ {d.status === "duplicate" ? "Duplicate" : "Invalid"}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 px-6 py-4 bg-ink-50 border-t border-ink-100 flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowUploadModal(false);
                  setValidatedData([]);
                  setSummary(null);
                  setExcelError("");
                }}
                className="btn-secondary"
                disabled={isPending}
              >
                Batal
              </button>
              {validatedData.length > 0 && (
                <button
                  onClick={handleConfirmImport}
                  className="btn-primary"
                  disabled={isPending || !summary || summary.valid === 0}
                >
                  {isPending ? (
                    <>
                      <CircleNotch className="w-4 h-4 animate-spin" />
                      Mengimpor...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" weight="fill" />
                      Import Participants ({summary?.valid || 0})
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
