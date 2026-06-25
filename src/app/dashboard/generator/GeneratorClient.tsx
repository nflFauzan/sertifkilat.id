"use client";

import { useState, useTransition, useRef } from "react";
import {
  Certificate,
  UploadSimple,
  FileText,
  CheckCircle,
  CircleNotch,
  Warning,
  X,
  Download,
  Eye,
} from "@phosphor-icons/react";
import { generateCertificatesAction, getBatchCertificatesAction } from "@/app/actions/certificates";
import { formatDate } from "@/lib/utils";
import { downloadCertificatesZip, TemplateField } from "@/lib/certificateGenerator";
import Link from "next/link";

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

const SAMPLE_CSV = `name,email
Bagas Santoso,bagas@example.com
Dini Rahmawati,dini@example.com
Putri Lestari,putri@example.com`;

export default function GeneratorClient({
  events,
  recentBatches,
}: {
  events: Event[];
  recentBatches: Batch[];
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [batchName, setBatchName] = useState("");
  const [participants, setParticipants] = useState<
    Array<{ name: string; email: string }>
  >([]);
  const [csvError, setCsvError] = useState("");
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
      
      const { name, templateUrl, templateFields, certificates } = res.batch;
      
      const formattedCerts = certificates.map(c => ({
        ...c,
        date: formatDate(c.date)
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
    setParticipants(parsed);
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

  function handleSampleData() {
    parseCsv(SAMPLE_CSV);
  }

  function handleGenerate() {
    if (!selectedEvent || !batchName || !participants.length) return;
    setError("");

    const fd = new FormData();
    fd.append("eventId", selectedEvent);
    fd.append("batchName", batchName);
    fd.append("csvData", JSON.stringify(participants));

    startTransition(async () => {
      const res = await generateCertificatesAction(fd);
      if (res.error) {
        setError(res.error);
      } else if (res.success) {
        setResult({ count: res.count!, batchId: res.batchId! });
        setStep(3);
      }
    });
  }

  function reset() {
    setStep(1);
    setSelectedEvent("");
    setBatchName("");
    setParticipants([]);
    setCsvError("");
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
          Upload data peserta dan generate sertifikat dengan QR verifikasi otomatis.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {[
          { n: 1, label: "Pilih Event" },
          { n: 2, label: "Upload Data" },
          { n: 3, label: "Selesai" },
        ].map((s, i) => (
          <div key={s.n} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step >= s.n
                  ? "bg-brand-500 text-white"
                  : "bg-ink-100 text-ink-400"
              }`}
            >
              {step > s.n ? <CheckCircle className="w-4 h-4" weight="fill" /> : s.n}
            </div>
            <span
              className={`text-sm font-medium hidden sm:block ${
                step >= s.n ? "text-ink-900" : "text-ink-400"
              }`}
            >
              {s.label}
            </span>
            {i < 2 && (
              <div
                className={`h-px w-8 sm:w-16 mx-1 transition-all ${
                  step > s.n ? "bg-brand-500" : "bg-ink-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Select event */}
      {step === 1 && (
        <div className="card p-6 space-y-5">
          <h2 className="font-semibold text-ink-900">Pilih Event & Nama Batch</h2>

          {events.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-ink-400 mb-3">
                Belum ada event. Buat event terlebih dahulu.
              </p>
              <Link href="/dashboard/events" className="btn-primary">
                Buat Event
              </Link>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">
                  Event <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                  className="input-field"
                >
                  <option value="">— Pilih event —</option>
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">
                  Nama Batch <span className="text-rose-500">*</span>
                </label>
                <input
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  placeholder="Batch Sertifikat Juni 2026"
                  className="input-field"
                />
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!selectedEvent || !batchName}
                className="btn-primary disabled:opacity-60"
              >
                Lanjut →
              </button>
            </>
          )}
        </div>
      )}

      {/* Step 2: Upload CSV */}
      {step === 2 && (
        <div className="card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-ink-900">Upload Data Peserta</h2>
            <button
              onClick={() => setStep(1)}
              className="text-xs text-ink-400 hover:text-ink-700"
            >
              ← Kembali
            </button>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
              <Warning weight="fill" className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Upload area */}
          <div
            className="border-2 border-dashed border-ink-200 rounded-2xl p-8 text-center hover:border-brand-400 hover:bg-brand-50/30 transition-all cursor-pointer"
            onClick={() => fileRef.current?.click()}
          >
            <UploadSimple className="w-10 h-10 text-ink-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-ink-700">
              Klik untuk upload file CSV
            </p>
            <p className="text-xs text-ink-400 mt-1">
              Format: kolom <code className="bg-ink-100 px-1 rounded">name</code> dan{" "}
              <code className="bg-ink-100 px-1 rounded">email</code>
            </p>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.txt"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {csvError && (
            <p className="text-sm text-rose-600 flex items-center gap-1">
              <Warning className="w-4 h-4" weight="fill" />
              {csvError}
            </p>
          )}

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-ink-100" />
            <span className="text-xs text-ink-400">atau</span>
            <div className="flex-1 h-px bg-ink-100" />
          </div>

          <button
            onClick={handleSampleData}
            className="btn-secondary w-full justify-center"
          >
            <FileText className="w-4 h-4" />
            Gunakan Data Contoh (3 peserta)
          </button>

          {/* Preview */}
          {participants.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-ink-900">
                  Preview Peserta ({participants.length})
                </p>
                <button
                  onClick={() => setParticipants([])}
                  className="text-xs text-ink-400 hover:text-rose-600 flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Hapus
                </button>
              </div>
              <div className="overflow-hidden rounded-xl border border-ink-100">
                <table className="w-full text-xs">
                  <thead className="bg-ink-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-ink-500">#</th>
                      <th className="px-3 py-2 text-left font-semibold text-ink-500">Nama</th>
                      <th className="px-3 py-2 text-left font-semibold text-ink-500">Email</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-50">
                    {participants.slice(0, 5).map((p, i) => (
                      <tr key={i} className="hover:bg-ink-50">
                        <td className="px-3 py-2 text-ink-400">{i + 1}</td>
                        <td className="px-3 py-2 font-medium text-ink-900">{p.name}</td>
                        <td className="px-3 py-2 text-ink-600">{p.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {participants.length > 5 && (
                  <p className="px-3 py-2 text-xs text-ink-400 bg-ink-50 border-t border-ink-100">
                    +{participants.length - 5} peserta lainnya
                  </p>
                )}
              </div>

              <button
                onClick={handleGenerate}
                disabled={isPending}
                className="btn-primary w-full justify-center"
              >
                {isPending ? (
                  <>
                    <CircleNotch className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Certificate className="w-4 h-4" weight="fill" />
                    Generate {participants.length} Sertifikat
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Success */}
      {step === 3 && result && (
        <div className="card p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-emerald-500" weight="fill" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-ink-900">
              🎉 {result.count} Sertifikat Berhasil!
            </h2>
            <p className="text-sm text-ink-500 mt-2">
              Semua sertifikat telah di-generate dan tersimpan di database.
              QR code verifikasi otomatis dibuat.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-2">
            <button onClick={reset} className="btn-secondary">
              Generate Lagi
            </button>
            <button
              onClick={() => handleDownloadZip(result.batchId, "pdf")}
              disabled={downloadingBatchId !== null}
              className="btn-secondary text-rose-600 border-rose-200 hover:bg-rose-50"
            >
              {downloadingBatchId === result.batchId + "-pdf" ? (
                <CircleNotch className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              ZIP PDF
            </button>
            <button
              onClick={() => handleDownloadZip(result.batchId, "png")}
              disabled={downloadingBatchId !== null}
              className="btn-secondary text-emerald-600 border-emerald-200 hover:bg-emerald-50"
            >
              {downloadingBatchId === result.batchId + "-png" ? (
                <CircleNotch className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              ZIP PNG
            </button>
            <Link href="/dashboard" className="btn-primary">
              <Eye className="w-4 h-4" />
              Lihat Dashboard
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
    </div>
  );
}
