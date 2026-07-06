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
import { generateCertificatesAction, getBatchCertificatesAction, saveGeneratedCertificateAction } from "@/app/actions/certificates";
import { formatDate } from "@/lib/utils";
import { downloadCertificatesZip, TemplateField } from "@/lib/certificateGenerator";
import { downloadExcelTemplate } from "@/lib/excelTemplate";
import Link from "next/link";
import * as XLSX from "xlsx";
import { useTranslation } from "@/lib/hooks/useTranslation";
import UpgradeModal from "@/components/UpgradeModal";

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

const BATCH_STATUS: Record<string, { label: { id: string; en: string }; className: string }> = {
  PENDING: { label: { id: "Menunggu", en: "Pending" }, className: "badge-amber" },
  PROCESSING: { label: { id: "Diproses", en: "Processing" }, className: "badge-brand" },
  DONE: { label: { id: "Selesai", en: "Completed" }, className: "badge-green" },
  FAILED: { label: { id: "Gagal", en: "Failed" }, className: "badge-rose" },
};

type Template = { id: string; name: string; fileUrl: string };

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
  const { t, lang } = useTranslation();

  async function handleDownloadZip(batchId: string, format: "pdf" | "png") {
    setDownloadingBatchId(batchId + "-" + format);
    try {
      const res = await getBatchCertificatesAction(batchId);
      if (res.error || !res.batch) {
        alert(res.error || (lang === "id" ? "Gagal mengunduh ZIP. Batch tidak ditemukan." : "Failed to download ZIP. Batch not found."));
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
        format,
        onSaveFile: async (filename, base64) => {
          await saveGeneratedCertificateAction({
            batchId,
            filename,
            base64Data: base64,
          });
        }
      });
    } catch (err) {
      console.error("ZIP Generation error:", err);
      alert(lang === "id" ? "Terjadi kesalahan saat memproses file ZIP." : "An error occurred while processing the ZIP file.");
    } finally {
      setDownloadingBatchId(null);
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv") && !file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      setCsvError(lang === "id" ? "Format berkas harus berupa CSV atau Excel (.xlsx, .xls)." : "File format must be CSV or Excel (.xlsx, .xls).");
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
          setCsvError(lang === "id" ? "File harus memiliki baris header dan minimal 1 baris data." : "File must have a header row and at least 1 data row.");
          return;
        }

        const headers = rows[0].map(h => String(h || "").trim().toLowerCase());
        const nameIdx = headers.findIndex(h => h === "full name" || h === "nama lengkap" || h === "name" || h === "nama");
        const emailIdx = headers.findIndex(h => h === "email" || h === "gmail");

        if (nameIdx === -1 || emailIdx === -1) {
          setCsvError(lang === "id" ? "Pastikan file memiliki kolom 'Full Name' dan 'Gmail'." : "Please make sure the file contains 'Full Name' and 'Gmail' columns.");
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
            errorsList.push(lang === "id" ? `Baris ${rowNum}: Nama Lengkap tidak boleh kosong.` : `Row ${rowNum}: Full Name cannot be empty.`);
          }

          if (!emailVal) {
            errorsList.push(lang === "id" ? `Baris ${rowNum}: Gmail tidak boleh kosong.` : `Row ${rowNum}: Gmail cannot be empty.`);
          } else {
            const emailLower = emailVal.toLowerCase();
            if (!emailLower.includes("@") || !emailLower.includes(".")) {
              errorsList.push(lang === "id" ? `Baris ${rowNum}: Format Gmail tidak valid (${emailVal}).` : `Row ${rowNum}: Gmail format is invalid (${emailVal}).`);
            }
            if (emailsSeen.has(emailLower)) {
              errorsList.push(lang === "id" ? `Baris ${rowNum}: Gmail duplikat ditemukan (${emailVal}).` : `Row ${rowNum}: Duplicate Gmail found (${emailVal}).`);
            } else {
              emailsSeen.add(emailLower);
            }
          }

          parsed.push({ name: nameVal, email: emailVal });
        }

        if (!parsed.length) {
          setCsvError(lang === "id" ? "Tidak ada data peserta yang ditemukan." : "No participant data found.");
          return;
        }

        const limit = userPlan === "FREE" ? 25 : userPlan === "PRO" ? 150 : 999999;
        if (parsed.length > limit) {
          setCsvError(
            lang === "id"
              ? `Batas maksimal peserta untuk paket ${userPlan} Anda adalah ${limit} orang per cetak. File Anda berisi ${parsed.length} peserta. Silakan upgrade untuk membuka kuota yang lebih besar.`
              : `The maximum participant limit for your ${userPlan} plan is ${limit} recipients per run. Your file contains ${parsed.length} recipients. Please upgrade to unlock a higher quota.`
          );
          return;
        }

        setCsvError("");
        setParticipants(parsed);
        setValidationErrors(errorsList);
      } catch (err) {
        console.error(err);
        setCsvError(lang === "id" ? "Gagal membaca file. Pastikan file valid." : "Failed to read file. Make sure the file is valid.");
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

  const stepsList = [
    { n: 1, label: lang === "id" ? "Pilih Event" : "Select Event" },
    { n: 2, label: lang === "id" ? "Pilih Template" : "Select Template" },
    { n: 3, label: lang === "id" ? "Unduh Excel" : "Download Excel" },
    { n: 4, label: lang === "id" ? "Unggah File" : "Upload File" },
    { n: 5, label: lang === "id" ? "Review Data" : "Review Data" },
    { n: 6, label: lang === "id" ? "Proses Cetak" : "Processing" },
    { n: 7, label: t("common.completed") },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink-900">{lang === "id" ? "Generator Sertifikat" : "Certificate Generator"}</h1>
        <p className="text-sm text-ink-500 mt-1">
          {t("dashboard.generate.subtitle")}
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex flex-wrap items-center gap-y-3 gap-x-2 border-b border-ink-100 pb-4 select-none">
        {stepsList.map((s, i) => (
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
            <h2 className="font-semibold text-ink-900 text-base">{t("dashboard.generate.selectEventLabel")}</h2>
            <p className="text-xs text-ink-500">{lang === "id" ? "Pilih salah satu event aktif Anda untuk mendaftarkan batch sertifikat baru." : "Choose one of your active events to register a new certificate batch."}</p>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-ink-200 rounded-2xl bg-ink-50 space-y-3">
              <p className="text-sm text-ink-400 font-semibold">{lang === "id" ? "Belum ada event yang dibuat." : "No events created yet."}</p>
              <p className="text-xs text-ink-500 max-w-sm mx-auto">{lang === "id" ? "Anda harus memiliki setidaknya satu event sebelum dapat membuat sertifikat." : "You must have at least one event before you can generate certificates."}</p>
              <Link href="/dashboard/events" className="btn-primary inline-flex items-center gap-1.5 text-xs py-2">
                <Plus size={14} /> {t("dashboard.events.createTitle")}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">
                  {lang === "id" ? "Event" : "Event"} <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedEvent}
                  onChange={(e) => {
                    setSelectedEvent(e.target.value);
                    // Pre-fill batch name automatically based on event name
                    const ev = events.find(event => event.id === e.target.value);
                    if (ev) {
                      setBatchName(lang === "id" ? `Batch Sertifikat ${ev.name}` : `Certificate Batch ${ev.name}`);
                    }
                  }}
                  className="input-field"
                >
                  <option value="">{lang === "id" ? "— Pilih event —" : "— Select event —"}</option>
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
                  {t("common.next")} <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: Pilih Template */}
      {step === 2 && (
        <div className="card p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="font-semibold text-ink-900 text-base">{t("dashboard.generate.selectTemplateLabel")}</h2>
            <p className="text-xs text-ink-500">{lang === "id" ? "Tentukan desain latar belakang dan tata letak tulisan sertifikat." : "Determine the background design and certificate text layout."}</p>
          </div>

          {templates.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-ink-200 rounded-2xl bg-ink-50 space-y-3">
              <p className="text-sm text-ink-400 font-semibold">{lang === "id" ? "Belum ada template yang dibuat." : "No templates created yet."}</p>
              <p className="text-xs text-ink-500 max-w-sm mx-auto">{lang === "id" ? "Anda harus mengunggah template desain sertifikat terlebih dahulu." : "You must upload a certificate design template first."}</p>
              <Link href="/dashboard/templates" className="btn-primary inline-flex items-center gap-1.5 text-xs py-2">
                <Plus size={14} /> {lang === "id" ? "Kelola Template" : "Manage Templates"}
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {templates.map((t) => {
                  const isPremium = t.fileUrl.includes("elegan-navy-gold") || t.fileUrl.includes("luxury-achievement");
                  const isGratis = t.fileUrl.includes("minimal-white-gold") || t.fileUrl.includes("modern-appreciation");
                  const isSelected = selectedTemplate === t.id;
                  
                  const badgeText = isPremium ? "PREMIUM" : isGratis ? (lang === "id" ? "GRATIS" : "FREE") : (lang === "id" ? "KUSTOM" : "CUSTOM");
                  const badgeClass = isPremium
                    ? "bg-amber-100 text-amber-800 border-amber-200"
                    : isGratis
                      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                      : "bg-blue-100 text-blue-800 border-blue-200";

                  const handleSelect = () => {
                    if (isPremium && userPlan === "FREE") {
                      setUpgradeOpen(true);
                    } else {
                      setSelectedTemplate(t.id);
                    }
                  };

                  return (
                    <div
                      key={t.id}
                      onClick={handleSelect}
                      className={`card flex flex-col justify-between overflow-hidden border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer ${
                        isSelected
                          ? "border-brand-500 ring-2 ring-brand-500/20"
                          : "border-ink-150 hover:border-brand-300"
                      }`}
                    >
                      {/* Image Preview Container */}
                      <div className="relative aspect-[16/11] bg-ink-50 border-b border-ink-100 overflow-hidden flex items-center justify-center p-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={t.fileUrl}
                          alt={t.name}
                          className="w-full h-full object-contain"
                        />
                        {isPremium && userPlan === "FREE" && (
                          <div className="absolute inset-0 bg-ink-950/60 flex items-center justify-center backdrop-blur-[1px]">
                            <span className="px-2.5 py-1 bg-amber-500 text-white rounded text-[10px] font-bold shadow-sm">
                              🔒 Upgrade Pro
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Card Body */}
                      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold tracking-wider border ${badgeClass}`}>
                              {badgeText}
                            </span>
                            <span className="text-[9px] text-ink-400">A4 Landscape</span>
                          </div>
                          <h3 className="font-bold text-ink-900 text-xs sm:text-sm line-clamp-1 mt-1">{t.name}</h3>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelect();
                          }}
                          className={`w-full py-1.5 px-3 rounded-lg text-xxs sm:text-xs font-semibold transition-all ${
                            isSelected
                              ? "bg-brand-600 text-white shadow-glow"
                              : isPremium && userPlan === "FREE"
                                ? "bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200"
                                : "bg-ink-100 hover:bg-brand-50 hover:text-brand-600 text-ink-700"
                          }`}
                        >
                          {isSelected
                            ? `✓ ${lang === "id" ? "Terpilih" : "Selected"}`
                            : isPremium && userPlan === "FREE"
                              ? (lang === "id" ? "Upgrade ke Pro" : "Upgrade to Pro")
                              : (lang === "id" ? "Gunakan Template" : "Use Template")}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between border-t border-ink-100 pt-4">
                <button onClick={() => setStep(1)} className="btn-secondary text-xs flex items-center gap-1">
                  <ArrowLeft size={14} /> {t("common.back")}
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!selectedTemplate}
                  className="btn-primary text-xs flex items-center gap-1 disabled:opacity-60"
                >
                  {t("common.next")} <ArrowRight size={14} />
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
            <h2 className="font-semibold text-ink-900 text-base">{lang === "id" ? "Langkah 3: Unduh Template Berkas Excel" : "Step 3: Download Excel File Template"}</h2>
            <p className="text-xs text-ink-500">{lang === "id" ? "Gunakan format Excel standar untuk meminimalkan kegagalan impor data peserta." : "Use the standard Excel format to minimize recipient import issues."}</p>
          </div>

          <div className="bg-ink-50 border border-ink-150 rounded-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
              <Download size={24} />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-sm font-bold text-ink-900">{lang === "id" ? "Template XLSX Resmi SertifKilat" : "Official SertifKilat XLSX Template"}</h3>
              <p className="text-xs text-ink-500">
                {lang === "id" 
                  ? "File Excel ini memiliki 3 kolom terstruktur: Full Name, Gmail, dan Certificate ID (optional)." 
                  : "This Excel file has 3 structured columns: Full Name, Gmail, and Certificate ID (optional)."}
              </p>
            </div>
            <button
              onClick={downloadExcelTemplate}
              className="btn-primary text-xs bg-emerald-600 hover:bg-emerald-700 inline-flex items-center gap-1.5"
            >
              <Download size={14} /> {lang === "id" ? "Unduh Template Excel (.xlsx)" : "Download Excel Template (.xlsx)"}
            </button>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(2)} className="btn-secondary text-xs flex items-center gap-1">
              <ArrowLeft size={14} /> {t("common.back")}
            </button>
            <button
              onClick={() => setStep(4)}
              className="btn-primary text-xs flex items-center gap-1"
            >
              {t("common.next")} <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Unggah Data Peserta */}
      {step === 4 && (
        <div className="card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="font-semibold text-ink-900 text-base">{lang === "id" ? "Langkah 4: Unggah File Data Peserta" : "Step 4: Upload Participant Data File"}</h2>
              <p className="text-xs text-ink-500">{lang === "id" ? "Unggah berkas Excel yang sudah diisi lengkap sesuai format kolom template." : "Upload the completed Excel file following the template columns format."}</p>
            </div>
            <button
              onClick={() => setStep(3)}
              className="text-xs text-ink-400 hover:text-ink-700 flex items-center gap-1"
            >
              <ArrowLeft size={12} /> {t("common.back")}
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
                    {lang === "id" ? "Upgrade Sekarang" : "Upgrade Now"}
                  </button>
                )}
              </div>
            </div>
          )}

          {participants.length === 0 ? (
            /* Empty State */
            <div className="border border-dashed border-ink-200 rounded-2xl p-8 text-center space-y-4 bg-ink-50">
              <div className="space-y-1">
                <p className="font-bold text-sm text-ink-800">{lang === "id" ? "Belum ada peserta yang diunggah." : "No participants uploaded."}</p>
                <p className="text-xs text-ink-400">{lang === "id" ? "Silakan unduh template atau langsung unggah berkas Excel Anda di bawah." : "Please download the template or upload your Excel file directly below."}</p>
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
                <p className="text-xs font-semibold text-ink-700">{lang === "id" ? "File berhasil terbaca! Klik untuk ganti file." : "File read successfully! Click to change file."}</p>
                <p className="text-[10px] text-ink-400 mt-0.5">{lang === "id" ? "Mendukung format .xlsx, .xls, .csv" : "Supports .xlsx, .xls, .csv formats"}</p>
              </div>

              {/* Table Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-ink-700">
                  <span>{lang === "id" ? `Pratinjau Data (${participants.length} Baris)` : `Data Preview (${participants.length} Rows)`}</span>
                  <button
                    onClick={() => {
                      setParticipants([]);
                      setValidationErrors([]);
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                    className="text-rose-600 hover:underline flex items-center gap-1 font-normal font-sans"
                  >
                    <X size={12} /> {lang === "id" ? "Hapus File" : "Remove File"}
                  </button>
                </div>

                <div className="overflow-hidden rounded-xl border border-ink-150">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-ink-50 border-b border-ink-150">
                      <tr>
                        <th className="px-3 py-2 font-semibold text-ink-500 w-12 text-center">#</th>
                        <th className="px-3 py-2 font-semibold text-ink-500">{lang === "id" ? "Nama" : "Name"}</th>
                        <th className="px-3 py-2 font-semibold text-ink-500">Gmail</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-100 bg-white">
                      {participants.slice(0, 5).map((p, i) => (
                        <tr key={i} className="hover:bg-ink-50">
                          <td className="px-3 py-2 text-ink-400 text-center font-mono">{i + 1}</td>
                          <td className="px-3 py-2 font-medium text-ink-900">{p.name || <span className="text-rose-500 italic">{lang === "id" ? "[Kosong]" : "[Empty]"}</span>}</td>
                          <td className="px-3 py-2 text-ink-600">{p.email || <span className="text-rose-500 italic">{lang === "id" ? "[Kosong]" : "[Empty]"}</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {participants.length > 5 && (
                    <p className="px-3 py-2 text-[10px] text-ink-400 bg-ink-50 border-t border-ink-150">
                      {lang === "id" 
                        ? `+${participants.length - 5} peserta lainnya dalam berkas.` 
                        : `+${participants.length - 5} other participants in file.`}
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
              <ArrowLeft size={14} /> {t("common.back")}
            </button>
            <button
              onClick={() => setStep(5)}
              disabled={participants.length === 0}
              className="btn-primary text-xs flex items-center gap-1 disabled:opacity-60"
            >
              {lang === "id" ? "Lanjut ke Review" : "Continue to Review"} <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Review & Validasi */}
      {step === 5 && (
        <div className="card p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="font-semibold text-ink-900 text-base">{lang === "id" ? "Langkah 5: Review & Validasi Data" : "Step 5: Review & Validate Data"}</h2>
            <p className="text-xs text-ink-500">{lang === "id" ? "Verifikasi seluruh konfigurasi project sebelum berkas sertifikat diproduksi." : "Verify all project configurations before certificates are generated."}</p>
          </div>

          {/* Project Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl border border-ink-150 bg-ink-50 text-xs">
            <div>
              <p className="text-ink-400">{lang === "id" ? "Event Terpilih" : "Selected Event"}</p>
              <p className="font-bold text-ink-800 mt-0.5 truncate">
                {events.find(e => e.id === selectedEvent)?.name || selectedEvent}
              </p>
            </div>
            <div>
              <p className="text-ink-400">{lang === "id" ? "Template Terpilih" : "Selected Template"}</p>
              <p className="font-bold text-ink-800 mt-0.5 truncate">
                {templates.find(t => t.id === selectedTemplate)?.name || selectedTemplate}
              </p>
            </div>
            <div>
              <p className="text-ink-400">{lang === "id" ? "Jumlah Peserta" : "Total Recipients"}</p>
              <p className="font-bold text-brand-600 mt-0.5">
                {participants.length} {lang === "id" ? "Orang" : "Recipients"}
              </p>
            </div>
            <div>
              <p className="text-ink-400">{lang === "id" ? "Estimasi Sertifikat" : "Estimated Certificates"}</p>
              <p className="font-bold text-emerald-600 mt-0.5">
                {participants.length} {lang === "id" ? "File PDF/PNG" : "PDF/PNG Files"}
              </p>
            </div>
          </div>

          {/* Validation Errors or Success */}
          {validationErrors.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-start gap-2.5 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-xs text-rose-700">
                <Warning weight="fill" className="w-4.5 h-4.5 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold">
                    {lang === "id" 
                      ? `Ditemukan ${validationErrors.length} kesalahan validasi data!` 
                      : `Found ${validationErrors.length} data validation errors!`}
                  </p>
                  <p className="text-xxs mt-0.5">{lang === "id" ? "Silakan perbaiki file Excel Anda dan upload ulang untuk melanjutkan." : "Please correct your Excel file and re-upload to continue."}</p>
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
                {lang === "id" ? "Upload Ulang File Excel" : "Re-upload Excel File"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-2.5 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs text-emerald-800">
                <CheckCircle weight="fill" className="w-4.5 h-4.5 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold">{lang === "id" ? "✓ Seluruh data peserta valid!" : "✓ All participant data is valid!"}</p>
                  <p className="text-xxs mt-0.5">{lang === "id" ? "Format Gmail, nama lengkap, dan keunikan baris data telah terverifikasi aman." : "Gmail format, full name, and row uniqueness have been successfully verified."}</p>
                </div>
              </div>

              {/* Batch Name Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-ink-700 mb-1">
                  {lang === "id" ? "Nama Batch" : "Batch Name"} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  className="input-field"
                  placeholder={lang === "id" ? "Contoh: Batch Webinar Nasional Juni 2026" : "Example: National Webinar June 2026 Batch"}
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
              <ArrowLeft size={14} /> {t("common.back")}
            </button>
            <button
              onClick={handleGenerate}
              disabled={validationErrors.length > 0 || !batchName || isPending}
              className="btn-primary text-xs flex items-center gap-1.5 disabled:opacity-60 bg-brand-500 text-white"
            >
              {isPending ? (
                <>
                  <CircleNotch className="w-4 h-4 animate-spin" />
                  {lang === "id" ? "Memulai Antrean..." : "Starting Queue..."}
                </>
              ) : (
                <>
                  <Certificate size={14} />
                  {lang === "id" ? "Mulai Generate Sertifikat" : "Start Generating Certificates"}
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
            <h2 className="text-lg font-bold text-ink-900">{lang === "id" ? "Sedang men-generate sertifikat..." : "Generating certificates..."}</h2>
            <p className="text-xs text-ink-500 max-w-sm mx-auto leading-relaxed">
              {lang === "id" 
                ? "Sistem sedang memproses database sertifikat, menyematkan QR Code verifikasi unik, dan menyusun bundel dokumen Anda. Mohon tunggu sejenak." 
                : "The system is processing the certificate database, embedding unique verification QR Codes, and compiling your document bundle. Please wait."}
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
              {lang === "id" 
                ? "Seluruh sertifikat peserta berhasil dibuat secara realtime dan disimpan ke dalam pangkalan data terverifikasi." 
                : "All participant certificates have been generated in real-time and saved to the verified database."}
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
              {lang === "id" ? "Generate Lagi" : "Generate Again"}
            </button>
            <span className="text-ink-200">|</span>
            <Link href="/dashboard" className="text-xs font-semibold text-ink-500 hover:underline">
              {lang === "id" ? "Kembali ke Dashboard" : "Back to Dashboard"}
            </Link>
          </div>
        </div>
      )}

      {/* Recent Batches */}
      {recentBatches.length > 0 && (
        <div className="card">
          <div className="px-5 py-4 border-b border-ink-100">
            <h2 className="font-semibold text-ink-900">{lang === "id" ? "Riwayat Generate" : "Generation History"}</h2>
          </div>
          <div className="divide-y divide-ink-50">
            {recentBatches.map((batch) => {
              const cfg = BATCH_STATUS[batch.status] ?? BATCH_STATUS.PENDING;
              const statusLabel = lang === "id" ? cfg.label.id : cfg.label.en;
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
                      {batch.event.name} · {batch._count.certificates} {lang === "id" ? "sertifikat" : "certificates"}{" "}
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
                          title={lang === "id" ? "Unduh ZIP (PDF)" : "Download ZIP (PDF)"}
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
                          title={lang === "id" ? "Unduh ZIP (PNG)" : "Download ZIP (PNG)"}
                        >
                          {downloadingBatchId === batch.id + "-png" ? (
                            <CircleNotch className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4 text-emerald-500" />
                          )}
                        </button>
                      </div>
                    )}
                    <span className={cfg.className}>{statusLabel}</span>
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
