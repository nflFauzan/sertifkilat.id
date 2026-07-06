"use client";

import { useState } from "react";
import { Certificate, MagnifyingGlass, QrCode, FilePdf, Image as ImageIcon, CircleNotch, ArrowSquareOut } from "@phosphor-icons/react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { generateCertificateCanvas, downloadCertificatePDF, downloadCertificatePNG, TemplateField } from "@/lib/certificateGenerator";
import { useTranslation } from "@/lib/hooks/useTranslation";

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
  templateWidth?: number;
  templateHeight?: number;
};

export default function CertificatesClient({
  certificates,
}: {
  certificates: SerializedCertificate[];
}) {
  const [search, setSearch] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const { t, lang } = useTranslation();

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
          templateWidth: c.templateWidth,
          templateHeight: c.templateHeight,
        }
      );
      downloadCertificatePDF(canvas, `${c.serialNumber}_${c.participantName.replace(/[^a-z0-9]/gi, "_").toLowerCase()}`);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      alert(lang === "id" ? "Gagal mengunduh sertifikat PDF. Pastikan gambar template terpasang." : "Failed to download PDF certificate. Make sure the template image is loaded.");
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
          templateWidth: c.templateWidth,
          templateHeight: c.templateHeight,
        }
      );
      downloadCertificatePNG(canvas, `${c.serialNumber}_${c.participantName.replace(/[^a-z0-9]/gi, "_").toLowerCase()}`);
    } catch (err) {
      console.error("Failed to generate PNG:", err);
      alert(lang === "id" ? "Gagal mengunduh sertifikat PNG. Pastikan gambar template terpasang." : "Failed to download PNG certificate. Make sure the template image is loaded.");
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
          <h1 className="text-2xl font-bold text-ink-900">
            {lang === "id" ? "Sertifikat" : "Certificates"}
          </h1>
          <p className="text-sm text-ink-500 mt-1">
            {lang === "id"
              ? "Daftar seluruh sertifikat yang telah berhasil diterbitkan."
              : "List of all certificates successfully issued."}
          </p>
        </div>
 
        {/* Search */}
        <div className="relative max-w-xs w-full">
          <MagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === "id" ? "Cari serial, nama, event..." : "Search serial, name, event..."}
            className="input-field pl-10 py-2 text-sm shadow-sm"
          />
        </div>
      </div>
 
      {filtered.length === 0 ? (
        <div className="card p-12 text-center max-w-xl mx-auto border-2 border-dashed border-ink-150 rounded-2xl bg-white">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Certificate className="w-7 h-7 text-brand-500" weight="fill" />
          </div>
          <h2 className="font-bold text-ink-900 text-lg mb-2">
            {lang === "id" ? "Sertifikat Tidak Ditemukan" : "No Certificates Found"}
          </h2>
          <p className="text-sm text-ink-500 mb-6 max-w-sm mx-auto">
            {certificates.length === 0
              ? (lang === "id"
                  ? "Anda belum melakukan generate sertifikat untuk event apapun."
                  : "You have not generated certificates for any event yet.")
              : (lang === "id"
                  ? "Tidak ada sertifikat yang cocok dengan kata kunci pencarian Anda."
                  : "No certificates matched your search query.")}
          </p>
          {certificates.length === 0 && (
            <Link href="/dashboard/generator" className="btn-primary mx-auto shadow-md">
              {lang === "id" ? "Mulai Generate Sekarang" : "Start Generating Now"}
            </Link>
          )}
        </div>
      ) : (
        <div className="card overflow-hidden shadow-md border border-ink-150 rounded-2xl bg-white">
          <div className="overflow-x-auto max-h-[600px] scrollbar-thin">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-ink-150 bg-ink-50/75 backdrop-blur-sm sticky top-0 z-10">
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-ink-600 uppercase tracking-wider">
                    {lang === "id" ? "Nomor Serial" : "Serial Number"}
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-bold text-ink-600 uppercase tracking-wider">
                    {lang === "id" ? "Peserta" : "Participant"}
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-bold text-ink-600 uppercase tracking-wider">
                    Event / Batch
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-bold text-ink-600 uppercase tracking-wider">
                    {lang === "id" ? "Tgl Terbit" : "Issued Date"}
                  </th>
                  <th className="px-4 py-3.5 text-center text-xs font-bold text-ink-600 uppercase tracking-wider">
                    {lang === "id" ? "Jumlah Scan" : "Scan Count"}
                  </th>
                  <th className="px-5 py-3.5 text-right text-xs font-bold text-ink-600 uppercase tracking-wider">
                    {t("common.action")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 bg-white">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-brand-50/10 transition-colors duration-150">
                    <td className="px-5 py-4 font-semibold text-brand-600 font-mono">
                      {c.serialNumber}
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-ink-900">{c.participantName}</p>
                      <p className="text-xs text-ink-400 mt-0.5">{c.participantEmail}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-ink-800">{c.eventName}</p>
                      <p className="text-xs text-ink-400 mt-0.5">{c.batchName}</p>
                    </td>
                    <td className="px-4 py-4 text-ink-600">
                      {formatDate(c.issuedAt)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-xs font-bold">
                        <QrCode className="w-3.5 h-3.5" />
                        {c.verifiedCount}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center gap-2.5 justify-end">
                        <Link
                          href={`/verify/${c.serialNumber}`}
                          target="_blank"
                          className="p-2 rounded-xl text-ink-400 hover:text-brand-600 hover:bg-brand-50 border border-transparent hover:border-brand-100 shadow-sm transition-all"
                          title={lang === "id" ? "Halaman Verifikasi" : "Verification Page"}
                        >
                          <ArrowSquareOut className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDownloadPDF(c)}
                          disabled={downloadingId !== null}
                          className="p-2 rounded-xl text-ink-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 shadow-sm transition-all disabled:opacity-50"
                          title={lang === "id" ? "Unduh PDF" : "Download PDF"}
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
                          className="p-2 rounded-xl text-ink-400 hover:text-emerald-600 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 shadow-sm transition-all disabled:opacity-50"
                          title={lang === "id" ? "Unduh PNG" : "Download PNG"}
                        >
                          {downloadingId === c.id + "-png" ? (
                            <CircleNotch className="w-4 h-4 animate-spin" />
                          ) : (
                            <ImageIcon className="w-4 h-4" />
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
