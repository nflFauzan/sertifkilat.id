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
import { useTranslation } from "@/lib/hooks/useTranslation";

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
  const { t, lang } = useTranslation();

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
    XLSX.utils.book_append_sheet(wb, ws, lang === "id" ? "Template Peserta" : "Recipient Template");
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
          setExcelError(lang === "id" ? "File Excel/CSV harus memiliki baris header dan minimal 1 baris data." : "Excel/CSV file must have a header row and at least 1 data row.");
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
          setExcelError(lang === "id" ? "Format kolom tidak sesuai. Pastikan file memiliki kolom 'Full Name' (Nama) dan 'Email'." : "Invalid column format. Make sure the file has 'Full Name' and 'Email' columns.");
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
          setExcelError(lang === "id" ? "Tidak ada baris data peserta yang valid di dalam file." : "No valid participant data rows found in the file.");
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
        setExcelError(lang === "id" ? "Gagal membaca file. Pastikan format berkas valid." : "Failed to read file. Make sure the file format is valid.");
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
      setFormError(lang === "id" ? "Nama dan Gmail wajib diisi" : "Name and Email are required");
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
    if (!confirm(lang === "id" ? "Apakah Anda yakin ingin menghapus peserta ini?" : "Are you sure you want to delete this participant?")) return;

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
    if (!confirm(lang === "id" ? `Apakah Anda yakin ingin menghapus ${selectedIds.length} peserta terpilih?` : `Are you sure you want to delete ${selectedIds.length} selected participants?`)) return;

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
          <p className="text-xs text-ink-400">
            {lang === "id" ? "Kelola daftar peserta yang akan menerima sertifikat event ini." : "Manage the list of participants who will receive certificates for this event."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form Panel */}
        <div className="space-y-6">
          {/* Add Single Participant */}
          <div className="card p-6">
            <h2 className="font-semibold text-ink-900 text-base mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-500" />
              {lang === "id" ? "Tambah Peserta Baru" : "Add New Participant"}
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
                  {lang === "id" ? "Nama Lengkap" : "Full Name"} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={lang === "id" ? "Contoh: Bagas Santoso" : "Example: Bagas Santoso"}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">
                  {lang === "id" ? "Gmail" : "Email"} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={lang === "id" ? "Contoh: bagas@kelasonline.id" : "Example: bagas@kelasonline.id"}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">
                  {lang === "id" ? "Institusi" : "Institution"}
                </label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder={lang === "id" ? "Contoh: Universitas ABC" : "Example: ABC University"}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">
                  {lang === "id" ? "Posisi / Jabatan" : "Position / Role"}
                </label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder={lang === "id" ? "Contoh: Participant" : "Example: Participant"}
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
                {lang === "id" ? "Tambah Peserta" : "Add Participant"}
              </button>
            </form>
          </div>

          {/* Import Panel */}
          <div className="card p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mx-auto">
              <UploadSimple className="w-6 h-6 text-brand-500" />
            </div>
            <div>
              <h3 className="font-semibold text-ink-900 text-sm">
                {lang === "id" ? "Impor Massal Peserta" : "Bulk Import Recipients"}
              </h3>
              <p className="text-xs text-ink-400 mt-1">
                {lang === "id"
                  ? "Upload daftar nama, email, institusi, dan posisi peserta sekaligus via file Excel atau CSV."
                  : "Upload names, emails, institutions, and roles of recipients at once via Excel or CSV."}
              </p>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => setShowUploadModal(true)}
                className="btn-primary w-full justify-center"
              >
                {lang === "id" ? "Impor File Excel / CSV" : "Import Excel / CSV File"}
              </button>
              <button
                onClick={downloadExcelTemplate}
                className="btn-secondary w-full justify-center text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                {lang === "id" ? "Download Excel Template" : "Download Excel Template"}
              </button>
            </div>
          </div>
        </div>

        {/* Right Table Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <h2 className="font-semibold text-ink-900 text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-ink-400" />
              {lang === "id" ? `Daftar Peserta (${totalCount})` : `Participants List (${totalCount})`}
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
                placeholder={lang === "id" ? "Cari nama, email, institusi..." : "Search name, email, institution..."}
                className="input-field pl-9 pr-4 py-1.5 text-xs"
              />
            </div>
          </div>

          {/* Bulk Action Header Bar */}
          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50 border border-rose-200">
              <span className="text-xs font-semibold text-rose-700">
                {selectedIds.length} {lang === "id" ? "peserta terpilih" : "participants selected"}
              </span>
              <button
                onClick={handleBulkDelete}
                className="btn-secondary text-rose-600 hover:bg-rose-100 hover:text-rose-700 text-xs py-1.5 px-3"
              >
                <Trash className="w-3.5 h-3.5" />
                {lang === "id" ? "Hapus Terpilih" : "Delete Selected"}
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
                    {lang === "id" ? "Belum ada peserta." : "No participants yet."}
                  </p>
                  <p className="text-xs text-ink-400 mt-1">
                    {lang === "id" ? "Unggah berkas Excel untuk mulai generate sertifikat." : "Upload an Excel file to start generating certificates."}
                  </p>
                </div>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="btn-secondary text-xs mx-auto"
                >
                  {lang === "id" ? "Unggah File Excel" : "Upload Excel File"}
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[600px] scrollbar-thin">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-ink-50/75 backdrop-blur-sm sticky top-0 z-10 border-b border-ink-150 text-xs font-bold text-ink-600 uppercase tracking-wider">
                      <th className="px-5 py-3.5 text-left w-10">
                        <input
                           type="checkbox"
                           checked={selectedIds.length === participants.length && participants.length > 0}
                           onChange={(e) => handleSelectAll(e.target.checked)}
                           className="rounded border-ink-300 text-brand-500 focus:ring-brand-500 h-4 w-4 cursor-pointer"
                        />
                      </th>
                      <th className="px-5 py-3.5 text-left">{lang === "id" ? "Nama" : "Name"}</th>
                      <th className="px-5 py-3.5 text-left">{lang === "id" ? "Gmail" : "Email"}</th>
                      <th className="px-5 py-3.5 text-left">{lang === "id" ? "Institusi" : "Institution"}</th>
                      <th className="px-5 py-3.5 text-left">{lang === "id" ? "Posisi" : "Position"}</th>
                      <th className="px-5 py-3.5 text-right" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-100 bg-white">
                    {participants.map((p) => (
                      <tr key={p.id} className="hover:bg-brand-50/10 transition-colors duration-150">
                        <td className="px-5 py-3.5">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(p.id)}
                            onChange={(e) => handleSelectRow(p.id, e.target.checked)}
                            className="rounded border-ink-300 text-brand-500 focus:ring-brand-500 h-4 w-4 cursor-pointer"
                          />
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-ink-900">
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
                            className="p-2 rounded-xl text-ink-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 shadow-sm transition-all"
                            title={lang === "id" ? "Hapus Peserta" : "Delete Participant"}
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
                {lang === "id" ? `Halaman ${currentPage} dari ${totalPages}` : `Page ${currentPage} of ${totalPages}`}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="btn-secondary py-1 px-3 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> {lang === "id" ? "Sebelumnya" : "Previous"}
                </button>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="btn-secondary py-1 px-3 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {lang === "id" ? "Selanjutnya" : "Next"} <ArrowRight className="w-3.5 h-3.5" />
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
              <h2 className="text-lg font-bold text-ink-900">
                {lang === "id" ? "Impor Massal Peserta" : "Bulk Import Participants"}
              </h2>
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
                      <p className="text-sm font-semibold text-ink-900">
                        {lang === "id" ? "Upload file Excel (.xlsx) atau CSV" : "Upload Excel (.xlsx) or CSV file"}
                      </p>
                      <p className="text-xs text-ink-400 mt-1">
                        {lang === "id" ? "Seret berkas template Anda kemari atau cari dari folder." : "Drag your template file here or search from files."}
                      </p>
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
                  <p className="text-xs text-ink-500 font-medium">
                    {lang === "id" ? "Sedang memvalidasi baris data file..." : "Validating file data rows..."}
                  </p>
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
                    <h4 className="text-xs font-bold text-ink-800 uppercase tracking-wider">
                      {lang === "id" ? "Pratinjau Data Impor" : "Import Data Preview"}
                    </h4>
                    <div className="border border-ink-100 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-ink-50 sticky top-0 border-b border-ink-100">
                          <tr className="text-ink-500 font-semibold uppercase tracking-wide">
                            <th className="px-4 py-2.5 text-left">{lang === "id" ? "Nama" : "Name"}</th>
                            <th className="px-4 py-2.5 text-left">{lang === "id" ? "Email" : "Email"}</th>
                            <th className="px-4 py-2.5 text-left">{lang === "id" ? "Institusi" : "Institution"}</th>
                            <th className="px-4 py-2.5 text-left">{lang === "id" ? "Posisi" : "Position"}</th>
                            <th className="px-4 py-2.5 text-left">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-ink-50 bg-white">
                          {validatedData.map((d, idx) => (
                            <tr key={`excel-preview-${idx}-${d.email}`} className="hover:bg-ink-50">
                              <td className="px-4 py-2 font-medium text-ink-900">{d.name || <span className="text-rose-500 italic">{lang === "id" ? "[Kosong]" : "[Empty]"}</span>}</td>
                              <td className="px-4 py-2 text-ink-600">{d.email || <span className="text-rose-500 italic">{lang === "id" ? "[Kosong]" : "[Empty]"}</span>}</td>
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
                {lang === "id" ? "Batal" : "Cancel"}
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
                      {lang === "id" ? "Mengimpor..." : "Importing..."}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" weight="fill" />
                      {lang === "id" ? `Impor Peserta (${summary?.valid || 0})` : `Import Recipients (${summary?.valid || 0})`}
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
