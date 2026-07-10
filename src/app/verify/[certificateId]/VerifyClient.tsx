"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  CheckCircle,
  XCircle,
  Lightning,
  CalendarBlank,
  User,
  Hash,
  MapPin,
  Clock,
  Download,
  FilePdf,
  Image as ImageIcon,
  ShieldCheck,
} from "@phosphor-icons/react";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { formatDate } from "@/lib/utils";
import {
  generateCertificateCanvas,
  downloadCertificatePNG,
  downloadCertificatePDF,
  type TemplateField,
} from "@/lib/certificateGenerator";

type CertificateData = {
  id: string;
  recipientName: string;
  eventName: string;
  issuer: string;
  date: string;
  issuedAt: string;
  templateName: string | null;
  verifiedCount: number;
  templateUrl: string;
  templateFields: any;
  templateWidth?: number;
  templateHeight?: number;
  lastVerifiedAt: string | null;
};

interface VerifyClientProps {
  decodedId: string;
  certificateData: CertificateData | null;
  isFromDatabase: boolean;
}

export default function VerifyClient({
  decodedId,
  certificateData,
  isFromDatabase,
}: VerifyClientProps) {
  const { lang } = useTranslation();
  const isValid = !!certificateData;

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isValid || !certificateData) return;

    let active = true;
    async function loadPreview() {
      if (!certificateData) return;
      setLoadingPreview(true);
      try {
        const certData = {
          name: certificateData.recipientName,
          event: certificateData.eventName,
          date: formatDate(certificateData.date),
          serial: certificateData.id,
          verifyUrl: `${window.location.origin}/verify/${certificateData.id}`,
          templateWidth: certificateData.templateWidth,
          templateHeight: certificateData.templateHeight,
        };

        const canvas = await generateCertificateCanvas(
          certificateData.templateUrl,
          certificateData.templateFields as unknown as TemplateField[],
          certData
        );

        if (active) {
          canvasRef.current = canvas;
          setPreviewUrl(canvas.toDataURL("image/png"));
        }
      } catch (err) {
        console.error("Gagal memuat pratinjau sertifikat:", err);
      } finally {
        if (active) setLoadingPreview(false);
      }
    }

    loadPreview();
    return () => {
      active = false;
    };
  }, [isValid, certificateData]);

  const handleDownloadPNG = () => {
    if (!canvasRef.current || !certificateData) return;
    const cleanName = certificateData.recipientName.replace(/[^a-zA-Z0-9_\-]/g, "_").toLowerCase();
    downloadCertificatePNG(canvasRef.current, `${certificateData.id}_${cleanName}`);
  };

  const handleDownloadPDF = () => {
    if (!canvasRef.current || !certificateData) return;
    const cleanName = certificateData.recipientName.replace(/[^a-zA-Z0-9_\-]/g, "_").toLowerCase();
    downloadCertificatePDF(canvasRef.current, `${certificateData.id}_${cleanName}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ink-50 via-brand-50/20 to-ink-100 flex items-center justify-center p-4">
      {/* Decorative background gradients */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-brand-200/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-emerald-200/20 blur-3xl" />
      </div>

      <div className="w-full max-w-lg">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
              <Lightning weight="fill" className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-ink-900">
              SertifKilat<span className="text-brand-500">.id</span>
            </span>
          </Link>
          <p className="text-xs text-ink-400 mt-2 font-medium tracking-wide uppercase">
            {lang === "id" ? "Sistem Verifikasi Sertifikat Independen" : "Independent Certificate Verification System"}
          </p>
        </div>

        {/* Verification Card */}
        <div className="card overflow-hidden shadow-soft">
          {/* Status Bar */}
          <div
            className={`px-6 py-5 flex items-center gap-3 transition-colors ${
              isValid ? "bg-emerald-500" : "bg-rose-500"
            }`}
          >
            {isValid ? (
              <CheckCircle weight="fill" className="w-7 h-7 text-white flex-shrink-0" />
            ) : (
              <XCircle weight="fill" className="w-7 h-7 text-white flex-shrink-0" />
            )}
            <div>
              <h2 className="font-bold text-white text-lg leading-tight">
                {isValid 
                  ? "✓ VALID CERTIFICATE" 
                  : "✗ INVALID CERTIFICATE"}
              </h2>
              <p className="text-white/80 text-xs mt-0.5 font-medium">
                {isValid
                  ? (lang === "id" ? "Sertifikat ini valid dan terverifikasi secara resmi" : "This certificate is valid and officially verified")
                  : (lang === "id" ? "Sertifikat tidak ditemukan atau tidak valid" : "Certificate not found or invalid")}
              </p>
            </div>
          </div>

          {/* Card Content */}
          {isValid && certificateData ? (
            <div className="p-6 space-y-6">
              {/* Recipient Header */}
              <div className="flex items-center justify-between border-b border-ink-100 pb-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-display font-bold text-ink-900 leading-snug">
                    {certificateData.recipientName}
                  </h3>
                  <p className="text-xs text-ink-400 mt-1 uppercase tracking-wider font-semibold">
                    {lang === "id" ? "Penerima Penghargaan" : "Award Recipient"}
                  </p>
                </div>
                <div>
                  <span className="badge-green border border-emerald-200 dark:border-emerald-900/30 shadow-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" weight="fill" />
                    VALID
                  </span>
                </div>
              </div>

              {/* Certificate Metadata Details */}
              <div className="space-y-4">
                <DetailRow
                  icon={<Hash className="w-4 h-4" />}
                  label={lang === "id" ? "ID Sertifikat / Kode Verifikasi" : "Certificate ID / Verification Code"}
                  value={
                    <span className="font-mono font-bold text-brand-600 tracking-wider">
                      {certificateData.id}
                    </span>
                  }
                />
                <DetailRow
                  icon={<CalendarBlank className="w-4 h-4" />}
                  label={lang === "id" ? "Nama Acara" : "Event Name"}
                  value={certificateData.eventName}
                />
                <DetailRow
                  icon={<User className="w-4 h-4" />}
                  label={lang === "id" ? "Penyelenggara / Penerbit" : "Issuer / Organizer"}
                  value={certificateData.issuer}
                />
                <DetailRow
                  icon={<CalendarBlank className="w-4 h-4" />}
                  label={lang === "id" ? "Tanggal Acara" : "Event Date"}
                  value={formatDate(certificateData.date)}
                />
                <DetailRow
                  icon={<CalendarBlank className="w-4 h-4" />}
                  label={lang === "id" ? "Tanggal Diterbitkan" : "Date Issued"}
                  value={formatDate(certificateData.issuedAt)}
                />
                <DetailRow
                  icon={<Clock className="w-4 h-4" />}
                  label={lang === "id" ? "Waktu Verifikasi" : "Verification Time"}
                  value={new Date().toLocaleString(lang === "id" ? "id-ID" : "en-US", {
                    timeZone: (typeof window !== "undefined" && window.localStorage.getItem("settings_timezone")) || "Asia/Jakarta",
                    dateStyle: "medium",
                    timeStyle: "medium",
                  })}
                />
                <DetailRow
                  icon={<Clock className="w-4 h-4" />}
                  label={lang === "id" ? "Jumlah Pemindaian (Scan Count)" : "Verification Scan Count"}
                  value={
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-xs font-bold">
                      {certificateData.verifiedCount} {lang === "id" ? "x Diperiksa" : "x Scanned"}
                    </span>
                  }
                />
                {certificateData.templateName && (
                  <DetailRow
                    icon={<MapPin className="w-4 h-4" />}
                    label={lang === "id" ? "Desain Template" : "Template Design"}
                    value={certificateData.templateName}
                  />
                )}
              </div>

              {/* Trust Stamp Badge */}
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 py-3.5 px-4">
                <div className="flex items-center gap-2">
                  <CheckCircle weight="fill" className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 text-center leading-normal">
                    {lang === "id" 
                      ? "Dokumen ini sah dan terdaftar secara resmi di SertifKilat.id." 
                      : "This document is valid and officially registered with SertifKilat.id."}
                  </span>
                </div>
                {isFromDatabase && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    {lang === "id" ? "(Diverifikasi real-time dari database)" : "(Verified real-time from database)"}
                  </span>
                )}
              </div>

              {/* Compact Verification Summary Grid */}
              <div className="border-t border-ink-100 dark:border-ink-800 pt-5 mt-5">
                <h4 className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-3">
                  {lang === "id" ? "Ringkasan Verifikasi" : "Verification Summary"}
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-ink-50 dark:bg-ink-900/30 border border-ink-100 dark:border-ink-800/40 rounded-xl p-3 text-center">
                    <p className="text-xxs font-bold text-ink-400 uppercase tracking-wider">
                      {lang === "id" ? "Status" : "Status"}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs font-bold mt-1.5 text-emerald-600 dark:text-emerald-400">
                      VALID
                    </span>
                  </div>
                  <div className="bg-ink-50 dark:bg-ink-900/30 border border-ink-100 dark:border-ink-800/40 rounded-xl p-3 text-center">
                    <p className="text-xxs font-bold text-ink-400 uppercase tracking-wider">
                      {lang === "id" ? "Total Scan" : "Total Scans"}
                    </p>
                    <span className="inline-block text-xs font-bold text-ink-900 dark:text-ink-50 mt-1.5">
                      {certificateData.verifiedCount} {lang === "id" ? "Kali" : "Times"}
                    </span>
                  </div>
                  <div className="bg-ink-50 dark:bg-ink-900/30 border border-ink-100 dark:border-ink-800/40 rounded-xl p-3 text-center">
                    <p className="text-xxs font-bold text-ink-400 uppercase tracking-wider">
                      {lang === "id" ? "Scan Terakhir" : "Last Scan"}
                    </p>
                    <span className="inline-block text-xxs font-semibold text-ink-700 dark:text-ink-300 mt-2 truncate max-w-full">
                      {certificateData.lastVerifiedAt 
                        ? formatDate(certificateData.lastVerifiedAt) 
                        : (lang === "id" ? "Pertama Kali" : "First scan")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/30 flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-900/30">
                <XCircle className="w-8 h-8 text-rose-500 dark:text-rose-400" weight="fill" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">
                  {lang === "id" 
                    ? <>Kode sertifikat <code className="bg-ink-100 dark:bg-ink-900 font-mono font-bold text-rose-600 px-1.5 py-0.5 rounded text-xs">{decodedId}</code> tidak ditemukan.</>
                    : <>Certificate code <code className="bg-ink-100 dark:bg-ink-900 font-mono font-bold text-rose-600 px-1.5 py-0.5 rounded text-xs">{decodedId}</code> not found.</>}
                </p>
                <p className="text-xs text-ink-500 leading-relaxed max-w-sm mx-auto">
                  {lang === "id" 
                    ? "Silakan periksa kembali ID sertifikat yang Anda masukkan atau scan QR code Anda kembali. Jika ini adalah kesalahan, harap hubungi panitia penyelenggara acara." 
                    : "Please check the certificate ID you entered or scan your QR code again. If you believe this is an error, please contact the event organizer."}
                </p>
              </div>
              <div className="pt-4 border-t border-ink-100 dark:border-ink-800">
                <Link href="/" className="btn-secondary w-full justify-center">
                  {lang === "id" ? "Kembali ke Beranda" : "Back to Home"}
                </Link>
              </div>

              {/* Compact Verification Summary Grid for Invalid Case */}
              <div className="border-t border-ink-100 dark:border-ink-800 pt-5 mt-5">
                <h4 className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-3">
                  {lang === "id" ? "Ringkasan Verifikasi" : "Verification Summary"}
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-ink-50 dark:bg-ink-900/30 border border-ink-100 dark:border-ink-800/40 rounded-xl p-3 text-center">
                    <p className="text-xxs font-bold text-ink-400 uppercase tracking-wider">
                      {lang === "id" ? "Status" : "Status"}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs font-bold mt-1.5 text-rose-600 dark:text-rose-400">
                      INVALID
                    </span>
                  </div>
                  <div className="bg-ink-50 dark:bg-ink-900/30 border border-ink-100 dark:border-ink-800/40 rounded-xl p-3 text-center col-span-2">
                    <p className="text-xxs font-bold text-ink-400 uppercase tracking-wider">
                      {lang === "id" ? "Catatan" : "Notes"}
                    </p>
                    <span className="inline-block text-xxs font-semibold text-rose-600 dark:text-rose-400 mt-2 truncate max-w-full">
                      {lang === "id" ? "Kode tidak terdaftar" : "Code not registered"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Certificate Preview Card */}
        {isValid && certificateData && (
          <div className="card mt-6 p-6 shadow-soft space-y-4">
            <div className="flex items-center justify-between border-b border-ink-100 dark:border-ink-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck weight="fill" className="w-5 h-5 text-emerald-500" />
                <h4 className="font-display font-bold text-ink-900 dark:text-ink-50 text-sm">
                  {lang === "id" ? "Pratinjau & Unduh Sertifikat" : "Certificate Preview & Download"}
                </h4>
              </div>
            </div>

            {/* Thumbnail Preview */}
            <div className="relative aspect-[1.414] w-full rounded-lg overflow-hidden bg-ink-100 dark:bg-ink-900/50 border border-ink-200 dark:border-ink-800 flex items-center justify-center group">
              {loadingPreview ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xxs text-ink-400 font-medium">
                    {lang === "id" ? "Menyiapkan pratinjau..." : "Preparing preview..."}
                  </span>
                </div>
              ) : previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="Certificate Preview"
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-xxs text-ink-400">
                  {lang === "id" ? "Gagal memuat pratinjau" : "Failed to load preview"}
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleDownloadPDF}
                disabled={!previewUrl}
                className="btn-primary justify-center text-xs gap-1.5 py-2.5 shadow-sm disabled:opacity-50"
              >
                <FilePdf className="w-4 h-4" />
                {lang === "id" ? "Unduh PDF" : "Download PDF"}
              </button>
              <button
                onClick={handleDownloadPNG}
                disabled={!previewUrl}
                className="btn-secondary justify-center text-xs gap-1.5 py-2.5 shadow-sm disabled:opacity-50"
              >
                <ImageIcon className="w-4 h-4" />
                {lang === "id" ? "Unduh PNG" : "Download PNG"}
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-ink-400 mt-6">
          {lang === "id" ? "Sistem Verifikasi Keaslian Sertifikat Digital" : "Digital Certificate Authenticity Verification System"} ·{" "}
          <Link href="/" className="text-brand-600 hover:underline font-medium">
            SertifKilat.id
          </Link>
        </p>
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-ink-100 flex items-center justify-center flex-shrink-0 text-ink-500">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xxs font-bold text-ink-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-ink-900 mt-0.5 break-words">{value}</p>
      </div>
    </div>
  );
}
