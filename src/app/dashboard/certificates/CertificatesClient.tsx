"use client";

import { useState } from "react";
import { Certificate, Download, MagnifyingGlass, QrCode, FilePdf, Image, CircleNotch } from "@phosphor-icons/react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { generateCertificateCanvas, downloadCertificatePDF, downloadCertificatePNG, TemplateField } from "@/lib/certificateGenerator";

type SerializedCertificate = {
  id: string;
  serialNumber: string;
  fileUrl: string | null;
  verifyUrl: string | null;
  verifiedCount: number;
  issuedAt: Date;
  participantName: string;
  participantEmail: string;
  batchName: string;
  eventName: string;
  eventDate: Date | string;
  templateUrl: string;
  templateFields: TemplateField[];
};

export default function CertificatesClient({
  certificates,
}: {
  certificates: SerializedCertificate[];
}) {
  const [search, setSearch] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  async function handleDownloadPDF(c: SerializedCertificate) {
    setDownloadingId(c.id + "-pdf");
    try {
      const canvas = await generateCertificateCanvas(
        c.templateUrl,
        c.templateFields,
        {
          name: c.participantName,
          event: c.eventName,
          date: formatDate(c.eventDate),
          serial: c.serialNumber,
          verifyUrl: c.verifyUrl || "",
        }
      );
      downloadCertificatePDF(canvas, `${c.serialNumber}_${c.participantName.replace(/[^a-z0-9]/gi, "_").toLowerCase()}`);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      alert("Gagal mengunduh sertifikat PDF. Pastikan gambar template terpasang.");
    } finally {
      setDownloadingId(null);
    }
  }

  async function handleDownloadPNG(c: SerializedCertificate) {
    setDownloadingId(c.id + "-png");
    try {
      const canvas = await generateCertificateCanvas(
        c.templateUrl,
        c.templateFields,
        {
          name: c.participantName,
          event: c.eventName,
          date: formatDate(c.eventDate),
          serial: c.serialNumber,
          verifyUrl: c.verifyUrl || "",
        }
      );
      downloadCertificatePNG(canvas, `${c.serialNumber}_${c.participantName.replace(/[^a-z0-9]/gi, "_").toLowerCase()}`);
    } catch (err) {
      console.error("Failed to generate PNG:", err);
      alert("Gagal mengunduh sertifikat PNG. Pastikan gambar template terpasang.");
    } finally {
      setDownloadingId(null);
    }
  }

  const filtered = certificates.filter(
    (c) =>
      c.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.participantName.toLowerCase().includes(search.toLowerCase()) ||
      c.participantEmail.toLowerCase().includes(search.toLowerCase()) ||
      c.eventName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Sertifikat</h1>
          <p className="text-sm text-ink-500 mt-1">
            Daftar seluruh sertifikat yang telah berhasil diterbitkan.
          </p>
        </div>
        
        {/* Search */}
        <div className="relative max-w-xs w-full">
          <MagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari serial, nama, event..."
            className="input-field pl-10 py-2 text-sm"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
            <Certificate className="w-7 h-7 text-brand-400" weight="fill" />
          </div>
          <h2 className="font-semibold text-ink-900 mb-2">Sertifikat tidak ditemukan</h2>
          <p className="text-sm text-ink-400 mb-6 max-w-sm mx-auto">
            {certificates.length === 0
              ? "Anda belum melakukan generate sertifikat untuk event apapun."
              : "Tidak ada sertifikat yang cocok dengan pencarian Anda."}
          </p>
          {certificates.length === 0 && (
            <Link href="/dashboard/generator" className="btn-primary mx-auto">
              Mulai Generate
            </Link>
          )}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 bg-ink-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wide">
                    Nomor Serial
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wide">
                    Peserta
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wide">
                    Event / Batch
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wide">
                    Tgl Terbit
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-ink-500 uppercase tracking-wide">
                    Scan Count
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-ink-500 uppercase tracking-wide">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-ink-50/50 transition-colors">
                    <td className="px-5 py-4 font-semibold text-brand-600">
                      {c.serialNumber}
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-ink-900">{c.participantName}</p>
                      <p className="text-xs text-ink-400 mt-0.5">{c.participantEmail}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-ink-800">{c.eventName}</p>
                      <p className="text-xs text-ink-400 mt-0.5">{c.batchName}</p>
                    </td>
                    <td className="px-4 py-4 text-ink-600">
                      {formatDate(c.issuedAt)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-xs font-semibold">
                        <QrCode className="w-3.5 h-3.5" />
                        {c.verifiedCount}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Link
                          href={`/verify/${c.serialNumber}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-ink-400 hover:text-brand-600 hover:bg-brand-50 transition-all"
                          title="Halaman Verifikasi"
                        >
                          <QrCode className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDownloadPDF(c)}
                          disabled={downloadingId !== null}
                          className="p-1.5 rounded-lg text-ink-400 hover:text-rose-600 hover:bg-rose-50 transition-all disabled:opacity-50"
                          title="Unduh PDF"
                        >
                          {downloadingId === c.id + "-pdf" ? (
                            <CircleNotch className="w-4 h-4 animate-spin" />
                          ) : (
                            <FilePdf className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDownloadPNG(c)}
                          disabled={downloadingId !== null}
                          className="p-1.5 rounded-lg text-ink-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all disabled:opacity-50"
                          title="Unduh PNG"
                        >
                          {downloadingId === c.id + "-png" ? (
                            <CircleNotch className="w-4 h-4 animate-spin" />
                          ) : (
                            <Image className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
