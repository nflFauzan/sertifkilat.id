"use client";

import { useState, useTransition, useRef } from "react";
import {
  Certificate,
  UploadSimple,
  CheckCircle,
  CircleNotch,
  Warning,
  X,
  Download,
  Eye,
  ArrowLeft,
  ArrowRight,
  FileCsv,
  Check,
  Plus,
} from "@phosphor-icons/react";
import { generateCertificatesAction, getBatchCertificatesAction } from "@/app/actions/certificates";
import { formatDate } from "@/lib/utils";
import { downloadCertificatesZip, TemplateField } from "@/lib/certificateGenerator";
import { downloadExcelTemplate } from "@/lib/excelTemplate";
import Link from "next/link";
import * as XLSX from "xlsx";

type Event = { id: string; name: string; type: string };
type Batch = {
  id: string;
  name: string;
  status: string;
  totalCount: number;
  doneCount: number;
  createdAt: Date;
  event: { name: string };
  _count: { certificates: number };
};

const BATCH_STATUS: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Menunggu", className: "badge-amber" },
  PROCESSING: { label: "Diproses", className: "badge-brand" },
  DONE: { label: "Selesai", className: "badge-green" },
  FAILED: { label: "Gagal", className: "badge-rose" },
};

import UpgradeModal from "@/components/UpgradeModal";

type Template = { id: string; name: string };

export default function GeneratorClient({
  events,
  recentBatches,
  templates,
  userPlan,
}: {
  events: Event[];
  recentBatches: Batch[];
  templates: Template[];
  userPlan: string;
}) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [batchName, setBatchName] = useState("");
  const [participants, setParticipants] = useState<
    Array<{ name: string; email: string }>
  >([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [csvError, setCsvError] = useState("");
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [result, setResult] = useState<{
    count: number;
    batchId: string;
  } | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const [downloadingBatchId, setDownloadingBatchId] = useState<string | null>(null);

  async function handleDownloadZip(batchId: string, format: "pdf" | "png") {
    setDownloadingBatchId(batchId + "-" + format);
    try {
      const res = await getBatchCertificatesAction(batchId);
      if (res.error || !res.batch) {
        alert(res.error || "Gagal mengunduh ZIP. Batch tidak ditemukan.");
        return;
      }
      
      const { name, templateUrl, templateFields, certificates, templateWidth, templateHeight } = res.batch;
      
      const formattedCerts = certificates.map(c => ({
        ...c,
        date: formatDate(c.date),
        templateWidth,
        templateHeight,
      }));

      await downloadCertificatesZip({
        certificates: formattedCerts,
        templateUrl,
        fields: templateFields as unknown as TemplateField[],
        zipFilename: name.replace(/[^a-z0-9]/gi, "_").toLowerCase(),
        format
      });
    } catch (err) {
      console.error("ZIP Generation error:", err);
      alert("Terjadi kesalahan saat memproses file ZIP.");
    } finally {
      setDownloadingBatchId(null);
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv") && !file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      setCsvError("Format berkas harus berupa CSV atau Excel (.xlsx, .xls).");
      return;
    }

    setCsvError("");
    setValidationErrors([]);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const arrayBuffer = evt.target?.result as ArrayBuffer;
        const data = new Uint8Array(arrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];

        if (rows.length < 2) {
          setCsvError("File harus memiliki baris header dan minimal 1 baris data.");
          return;
        }

        const headers = rows[0].map(h => String(h || "").trim().toLowerCase());
        const nameIdx = headers.findIndex(h => h === "full name" || h === "nama lengkap" || h === "name" || h === "nama");
        const emailIdx = headers.findIndex(h => h === "email" || h === "gmail");

        if (nameIdx === -1 || emailIdx === -1) {
          setCsvError("Pastikan file memiliki kolom 'Full Name' dan 'Gmail'.");
          return;
        }

        const parsed: Array<{ name: string; email: string }> = [];
        const errorsList: string[] = [];
        const emailsSeen = new Set<string>();

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          // Check for empty row
          if (!row || row.every(val => val === null || val === undefined || String(val).trim() === "")) {
            continue;
          }

          const nameVal = nameIdx !== -1 && row[nameIdx] !== undefined ? String(row[nameIdx]).trim() : "";
          const emailVal = emailIdx !== -1 && row[emailIdx] !== undefined ? String(row[emailIdx]).trim() : "";
          const rowNum = i + 1;

          if (!nameVal) {
            errorsList.push(`Baris ${rowNum}: Nama Lengkap tidak boleh kosong.`);
          }

          if (!emailVal) {
            errorsList.push(`Baris ${rowNum}: Gmail tidak boleh kosong.`);
          } else {
            const emailLower = emailVal.toLowerCase();
            if (!emailLower.includes("@") || !emailLower.includes(".")) {
              errorsList.push(`Baris ${rowNum}: Format Gmail tidak valid (${emailVal}).`);
            }
            if (emailsSeen.has(emailLower)) {
              errorsList.push(`Baris ${rowNum}: Gmail duplikat ditemukan (${emailVal}).`);
            } else {
              emailsSeen.add(emailLower);
            }
          }

          parsed.push({ name: nameVal, email: emailVal });
        }

        if (!parsed.length) {
          setCsvError("Tidak ada data peserta yang ditemukan.");
          return;
        }

        const limit = userPlan === "FREE" ? 25 : userPlan === "PRO" ? 150 : 999999;
        if (parsed.length > limit) {
          setCsvError(`Batas maksimal peserta untuk paket ${userPlan} Anda adalah ${limit} orang per cetak. File Anda berisi ${parsed.length} peserta. Silakan upgrade untuk membuka kuota yang lebih besar.`);
          return;
        }

        setCsvError("");
        setParticipants(parsed);
        setValidationErrors(errorsList);
      } catch (err) {
        console.error(err);
        setCsvError("Gagal membaca file. Pastikan file valid.");
      }
    };
    reader.readAsArrayBuffer(file);
  }

  function handleGenerate() {
    if (!selectedEvent || !batchName || !participants.length) return;
    setError("");
    setStep(6); // Go to Step 6: Generating

    const fd = new FormData();
    fd.append("eventId", selectedEvent);
    fd.append("batchName", batchName);
    fd.append("csvData", JSON.stringify(participants));
    if (selectedTemplate) {
      fd.append("templateId", selectedTemplate);
    }

    startTransition(async () => {
      const res = await generateCertificatesAction(fd);
      if (res.error) {
        setError(res.error);
        setStep(5); // Go back to Step 5 if error occurs
      } else if (res.success) {
        setResult({ count: res.count!, batchId: res.batchId! });
        setStep(7); // Go to Step 7: Completed / Success Screen
      }
    });
  }

  function reset() {
    setStep(1);
    setSelectedEvent("");
    setSelectedTemplate("");
    setBatchName("");
    setParticipants([]);
    setCsvError("");
    setValidationErrors([]);
    setResult(null);
    setError("");
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Generator Sertifikat</h1>
        <p className="text-sm text-ink-500 mt-1">
          Alur pembuatan sertifikat massal yang terintegrasi dengan tanda tangan digital & QR verifikasi.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex flex-wrap items-center gap-y-3 gap-x-2 border-b border-ink-100 pb-4 select-none">
        {[
          { n: 1, label: "Pilih Event" },
          { n: 2, label: "Pilih Template" },
          { n: 3, label: "Unduh Excel" },
          { n: 4, label: "Unggah File" },
          { n: 5, label: "Review Data" },
          { n: 6, label: "Proses Cetak" },
          { n: 7, label: "Selesai" },
        ].map((s, i) => (
          <div key={s.n} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                step >= s.n
                  ? "bg-brand-500 text-white shadow-glow"
                  : "bg-ink-100 text-ink-400"
              }`}
            >
              {step > s.n ? "✓" : s.n}
            </div>
            <span
              className={`text-xs font-semibold ${
                step === s.n ? "text-brand-600 font-bold" : "text-ink-500"
              }`}
            >
              {s.label}
            </span>
            {i < 6 && (
              <div
                className={`h-px w-3 sm:w-6 mx-1 transition-all ${
                  step > s.n ? "bg-brand-500" : "bg-ink-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Wizard Panels */}
      {/* STEP 1: Pilih Event */}
      {step === 1 && (
        <div className="card p-6 space-y-5">
          <div className="space-y-1">
            <h2 className="font-semibold text-ink-900 text-base">Langkah 1: Pilih Event</h2>
            <p className="text-xs text-ink-500">Pilih salah satu event aktif Anda untuk mendaftarkan batch sertifikat baru.</p>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-ink-200 rounded-2xl bg-ink-50 space-y-3">
              <p className="text-sm text-ink-400 font-semibold">No events created yet.</p>
              <p className="text-xs text-ink-500 max-w-sm mx-auto">Anda harus memiliki setidaknya satu event sebelum dapat membuat sertifikat.</p>
              <Link href="/dashboard/events" className="btn-primary inline-flex items-center gap-1.5 text-xs py-2">
                <Plus size={14} /> Buat Event Baru
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">
                  Event <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedEvent}
                  onChange={(e) => {
                    setSelectedEvent(e.target.value);
                    // Pre-fill batch name automatically based on event name
                    const ev = events.find(event => event.id === e.target.value);
                    if (ev) {
                      setBatchName(`Batch Sertifikat ${ev.name}`);
                    }
                  }}
                  className="input-field"
                >
                  <option value="">— Pilih event —</option>
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.name} ({ev.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  disabled={!selectedEvent}
                  className="btn-primary text-xs flex items-center gap-1 disabled:opacity-60"
                >
                  Lanjut <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: Pilih Template */}
      {step === 2 && (
        <div className="card p-6 space-y-5">
          <div className="space-y-1">
            <h2 className="font-semibold text-ink-900 text-base">Langkah 2: Pilih Template Sertifikat</h2>
            <p className="text-xs text-ink-500">Tentukan desain latar belakang dan tata letak tulisan sertifikat.</p>
          </div>

          {templates.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-ink-200 rounded-2xl bg-ink-50 space-y-3">
              <p className="text-sm text-ink-400 font-semibold">No template created yet.</p>
              <p className="text-xs text-ink-500 max-w-sm mx-auto">Anda harus mengunggah template desain sertifikat terlebih dahulu.</p>
              <Link href="/dashboard/templates" className="btn-primary inline-flex items-center gap-1.5 text-xs py-2">
                <Plus size={14} /> Kelola Template
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">
                  Template Desain <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="input-field"
                >
                  <option value="">— Pilih template —</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-between">
                <button onClick={() => setStep(1)} className="btn-secondary text-xs flex items-center gap-1">
                  <ArrowLeft size={14} /> Kembali
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!selectedTemplate}
                  className="btn-primary text-xs flex items-center gap-1 disabled:opacity-60"
                >
                  Lanjut <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 3: Unduh Template Excel */}
      {step === 3 && (
        <div className="card p-6 space-y-5">
          <div className="space-y-1">
            <h2 className="font-semibold text-ink-900 text-base">Langkah 3: Unduh Template Berkas Excel</h2>
            <p className="text-xs text-ink-500">Gunakan format Excel standar untuk meminimalkan kegagalan impor data peserta.</p>
          </div>

          <div className="bg-ink-50 border border-ink-150 rounded-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
              <Download size={24} />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-sm font-bold text-ink-900">Template XLSX Resmi SertifKilat</h3>
              <p className="text-xs text-ink-500">
                File Excel ini memiliki 3 kolom terstruktur: <code className="bg-ink-100 px-1 py-0.5 rounded font-mono font-bold text-ink-800 text-[10px]">Full Name</code>, <code className="bg-ink-100 px-1 py-0.5 rounded font-mono font-bold text-ink-800 text-[10px]">Gmail</code>, dan <code className="bg-ink-100 px-1 py-0.5 rounded font-mono font-bold text-ink-800 text-[10px]">Certificate ID (optional)</code>.
              </p>
            </div>
            <button
              onClick={downloadExcelTemplate}
              className="btn-primary text-xs bg-emerald-600 hover:bg-emerald-700 inline-flex items-center gap-1.5"
            >
              <Download size={14} /> Unduh Template Excel (.xlsx)
            </button>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(2)} className="btn-secondary text-xs flex items-center gap-1">
              <ArrowLeft size={14} /> Kembali
            </button>
            <button
              onClick={() => setStep(4)}
              className="btn-primary text-xs flex items-center gap-1"
            >
              Lanjut <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Unggah Data Peserta */}
      {step === 4 && (
        <div className="card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="font-semibold text-ink-900 text-base">Langkah 4: Unggah File Data Peserta</h2>
              <p className="text-xs text-ink-500">Unggah berkas Excel yang sudah diisi lengkap sesuai format kolom template.</p>
            </div>
            <button
              onClick={() => setStep(3)}
              className="text-xs text-ink-400 hover:text-ink-700 flex items-center gap-1"
            >
              <ArrowLeft size={12} /> Kembali
            </button>
          </div>

          {csvError && (
            <div className="flex items-start gap-2.5 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-xs text-rose-700">
              <Warning weight="fill" className="w-4.5 h-4.5 mt-0.5 shrink-0" />
              <div className="flex-1 space-y-2">
                <p>{csvError}</p>
                {csvError.includes("upgrade") && (
                  <button
                    onClick={() => setUpgradeOpen(true)}
                    className="btn-primary text-xs bg-rose-600 hover:bg-rose-700 text-white inline-flex items-center gap-1.5 px-3 py-1.5 shadow-sm"
                  >
                    Upgrade Sekarang
                  </button>
                )}
              </div>
            </div>
          )}

          {participants.length === 0 ? (
            /* Empty State */
            <div className="border border-dashed border-ink-200 rounded-2xl p-8 text-center space-y-4 bg-ink-50">
              <div className="space-y-1">
                <p className="font-bold text-sm text-ink-800">No participants uploaded.</p>
                <p className="text-xs text-ink-400">Silakan unduh template atau langsung unggah berkas Excel Anda di bawah.</p>
              </div>
              <div className="flex justify-center gap-3">
                <button
                  onClick={downloadExcelTemplate}
                  className="btn-secondary text-xs flex items-center gap-1 bg-white"
                >
                  <Download size={14} /> Download Excel Template
                </button>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="btn-primary text-xs flex items-center gap-1"
                >
                  <UploadSimple size={14} /> Upload Excel File
                </button>
              </div>
            </div>
          ) : (
            /* Active Uploader / Drag Area & Preview */
            <div className="space-y-4">
              <div
                className="border-2 border-dashed border-ink-200 rounded-2xl p-6 text-center hover:border-brand-400 hover:bg-brand-50/10 transition-all cursor-pointer bg-white"
                onClick={() => fileRef.current?.click()}
              >
                <UploadSimple className="w-8 h-8 text-ink-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-ink-700">File berhasil terbaca! Klik untuk ganti file.</p>
                <p className="text-[10px] text-ink-400 mt-0.5">Mendukung format .xlsx, .xls, .csv</p>
              </div>

              {/* Table Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-ink-700">
                  <span>Pratinjau Data ({participants.length} Baris)</span>
                  <button
                    onClick={() => {
                      setParticipants([]);
                      setValidationErrors([]);
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                    className="text-rose-600 hover:underline flex items-center gap-1 font-normal font-sans"
                  >
                    <X size={12} /> Hapus File
                  </button>
                </div>

                <div className="overflow-hidden rounded-xl border border-ink-150">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-ink-50 border-b border-ink-150">
                      <tr>
                        <th className="px-3 py-2 font-semibold text-ink-500 w-12 text-center">#</th>
                        <th className="px-3 py-2 font-semibold text-ink-500">Nama</th>
                        <th className="px-3 py-2 font-semibold text-ink-500">Gmail</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-100 bg-white">
                      {participants.slice(0, 5).map((p, i) => (
                        <tr key={i} className="hover:bg-ink-50">
                          <td className="px-3 py-2 text-ink-400 text-center font-mono">{i + 1}</td>
                          <td className="px-3 py-2 font-medium text-ink-900">{p.name || <span className="text-rose-500 italic">[Kosong]</span>}</td>
                          <td className="px-3 py-2 text-ink-600">{p.email || <span className="text-rose-500 italic">[Kosong]</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {participants.length > 5 && (
                    <p className="px-3 py-2 text-[10px] text-ink-400 bg-ink-50 border-t border-ink-150">
                      +{participants.length - 5} peserta lainnya dalam berkas.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={handleFileUpload}
          />

          <div className="flex justify-between">
            <button onClick={() => setStep(3)} className="btn-secondary text-xs flex items-center gap-1">
              <ArrowLeft size={14} /> Kembali
            </button>
            <button
              onClick={() => setStep(5)}
              disabled={participants.length === 0}
              className="btn-primary text-xs flex items-center gap-1 disabled:opacity-60"
            >
              Lanjut ke Review <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Review & Validasi */}
      {step === 5 && (
        <div className="card p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="font-semibold text-ink-900 text-base">Langkah 5: Review & Validasi Data</h2>
            <p className="text-xs text-ink-500">Verifikasi seluruh konfigurasi project sebelum berkas sertifikat diproduksi.</p>
          </div>

          {/* Project Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl border border-ink-150 bg-ink-50 text-xs">
            <div>
              <p className="text-ink-400">Selected Event</p>
              <p className="font-bold text-ink-800 mt-0.5 truncate">
                {events.find(e => e.id === selectedEvent)?.name || selectedEvent}
              </p>
            </div>
            <div>
              <p className="text-ink-400">Selected Template</p>
              <p className="font-bold text-ink-800 mt-0.5 truncate">
                {templates.find(t => t.id === selectedTemplate)?.name || selectedTemplate}
              </p>
            </div>
            <div>
              <p className="text-ink-400">Jumlah Peserta</p>
              <p className="font-bold text-brand-600 mt-0.5">
                {participants.length} Orang
              </p>
            </div>
            <div>
              <p className="text-ink-400">Estimasi Sertifikat</p>
              <p className="font-bold text-emerald-600 mt-0.5">
                {participants.length} File PDF/PNG
              </p>
            </div>
          </div>

          {/* Validation Errors or Success */}
          {validationErrors.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-start gap-2.5 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-xs text-rose-700">
                <Warning weight="fill" className="w-4.5 h-4.5 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold">Ditemukan {validationErrors.length} kesalahan validasi data!</p>
                  <p className="text-xxs mt-0.5">Silakan perbaiki file Excel Anda dan upload ulang untuk melanjutkan.</p>
                </div>
              </div>

              <div className="max-h-48 overflow-y-auto border border-rose-150 rounded-xl divide-y divide-rose-100 bg-white">
                {validationErrors.map((err, idx) => (
                  <div key={idx} className="px-4 py-2 text-xxs text-rose-800 hover:bg-rose-50/50 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                    {err}
                  </div>
                ))}
              </div>

              <button
                onClick={() => setStep(4)}
                className="btn-secondary w-full justify-center text-xs py-2 text-rose-600 border-rose-200 hover:bg-rose-50"
              >
                Upload Ulang File Excel
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-2.5 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs text-emerald-800">
                <CheckCircle weight="fill" className="w-4.5 h-4.5 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold">✓ Seluruh data peserta valid!</p>
                  <p className="text-xxs mt-0.5">Format Gmail, nama lengkap, dan keunikan baris data telah terverifikasi aman.</p>
                </div>
              </div>

              {/* Batch Name Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-ink-700 mb-1">
                  Nama Batch <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  className="input-field"
                  placeholder="Contoh: Batch Webinar Nasional Juni 2026"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex justify-between">
            <button onClick={() => setStep(4)} className="btn-secondary text-xs flex items-center gap-1">
              <ArrowLeft size={14} /> Kembali
            </button>
            <button
              onClick={handleGenerate}
              disabled={validationErrors.length > 0 || !batchName || isPending}
              className="btn-primary text-xs flex items-center gap-1.5 disabled:opacity-60 bg-brand-500 text-white"
            >
              {isPending ? (
                <>
                  <CircleNotch className="w-4 h-4 animate-spin" />
                  Memulai Antrean...
                </>
              ) : (
                <>
                  <Certificate size={14} />
                  Mulai Generate Sertifikat
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: Proses Cetak */}
      {step === 6 && (
        <div className="card p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center mx-auto text-brand-500 animate-pulse">
            <CircleNotch size={32} className="animate-spin" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-ink-900">Sedang men-generate sertifikat...</h2>
            <p className="text-xs text-ink-500 max-w-sm mx-auto leading-relaxed">
              Sistem sedang memproses database sertifikat, menyematkan QR Code verifikasi unik, dan menyusun bundel dokumen Anda. Mohon tunggu sejenak.
            </p>
          </div>
        </div>
      )}

      {/* STEP 7: Selesai */}
      {step === 7 && result && (
        <div className="card p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-500 shadow-soft">
            <CheckCircle size={36} weight="fill" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold font-display text-ink-900">🎉 Generation Successful!</h2>
            <p className="text-sm text-emerald-600 font-semibold">{result.count} Certificates Generated</p>
            <p className="text-xs text-ink-400 max-w-md mx-auto leading-relaxed">
              Seluruh sertifikat peserta berhasil dibuat secara realtime dan disimpan ke dalam pangkalan data terverifikasi.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 justify-center max-w-md mx-auto pt-4 border-t border-ink-155">
            <button
              onClick={() => handleDownloadZip(result.batchId, "pdf")}
              disabled={downloadingBatchId !== null}
              className="btn-primary text-xs flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white"
            >
              {downloadingBatchId === result.batchId + "-pdf" ? (
                <CircleNotch className="w-4 h-4 animate-spin" />
              ) : (
                <Download size={14} />
              )}
              Download ZIP (PDF)
            </button>

            <button
              onClick={() => handleDownloadZip(result.batchId, "png")}
              disabled={downloadingBatchId !== null}
              className="btn-primary text-xs flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {downloadingBatchId === result.batchId + "-png" ? (
                <CircleNotch className="w-4 h-4 animate-spin" />
              ) : (
                <Download size={14} />
              )}
              Download ZIP (PNG)
            </button>
          </div>

          <div className="flex justify-center gap-4 pt-2">
            <button onClick={reset} className="text-xs font-semibold text-brand-600 hover:underline">
              Generate Lagi
            </button>
            <span className="text-ink-200">|</span>
            <Link href="/dashboard" className="text-xs font-semibold text-ink-500 hover:underline">
              Kembali ke Dashboard
            </Link>
          </div>
        </div>
      )}

      {/* Recent Batches */}
      {recentBatches.length > 0 && (
        <div className="card">
          <div className="px-5 py-4 border-b border-ink-100">
            <h2 className="font-semibold text-ink-900">Riwayat Generate</h2>
          </div>
          <div className="divide-y divide-ink-50">
            {recentBatches.map((batch) => {
              const cfg = BATCH_STATUS[batch.status] ?? BATCH_STATUS.PENDING;
              return (
                <div
                  key={batch.id}
                  className="flex items-center gap-4 px-5 py-3.5"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <Certificate className="w-4 h-4 text-amber-500" weight="fill" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-900 truncate">
                      {batch.name}
                    </p>
                    <p className="text-xs text-ink-400 mt-0.5 truncate">
                      {batch.event.name} · {batch._count.certificates} sertifikat
                      · {formatDate(batch.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {batch.status === "DONE" && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDownloadZip(batch.id, "pdf")}
                          disabled={downloadingBatchId !== null}
                          className="p-1.5 rounded-lg text-ink-400 hover:text-rose-600 hover:bg-rose-50 transition-all disabled:opacity-50"
                          title="Unduh ZIP (PDF)"
                        >
                          {downloadingBatchId === batch.id + "-pdf" ? (
                            <CircleNotch className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4 text-rose-500" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDownloadZip(batch.id, "png")}
                          disabled={downloadingBatchId !== null}
                          className="p-1.5 rounded-lg text-ink-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all disabled:opacity-50"
                          title="Unduh ZIP (PNG)"
                        >
                          {downloadingBatchId === batch.id + "-png" ? (
                            <CircleNotch className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4 text-emerald-500" />
                          )}
                        </button>
                      </div>
                    )}
                    <span className={cfg.className}>{cfg.label}</span>
                  </div>
                </div>
              );
            })}
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
