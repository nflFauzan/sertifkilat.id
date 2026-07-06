"use client";

import Link from "next/link";
import {
  CheckCircle,
  XCircle,
  Lightning,
  CalendarBlank,
  User,
  Hash,
  MapPin,
  Clock,
} from "@phosphor-icons/react";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { formatDate } from "@/lib/utils";

type CertificateData = {
  id: string;
  recipientName: string;
  eventName: string;
  issuer: string;
  date: string;
  issuedAt: string;
  templateName: string | null;
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
        <div className="card overflow-hidden shadow-soft bg-white">
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
                  ? (lang === "id" ? "✓ Sertifikat Valid & Terverifikasi" : "✓ Valid & Verified Certificate") 
                  : (lang === "id" ? "✗ Sertifikat Tidak Valid" : "✗ Invalid Certificate")}
              </h2>
              <p className="text-white/80 text-xs mt-0.5 font-medium">
                {isValid
                  ? (lang === "id" ? "Sertifikat diterbitkan secara sah melalui platform kami" : "Certificate was legitimately issued via our platform")
                  : (lang === "id" ? "Nomor sertifikat tidak terdaftar di sistem" : "Certificate number is not registered in our system")}
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
                  <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm border border-emerald-200">
                    <CheckCircle className="w-4 h-4 text-emerald-600" weight="fill" />
                    VALID
                  </span>
                </div>
              </div>

              {/* Certificate Metadata Details */}
              <div className="space-y-4">
                <DetailRow
                  icon={<Hash className="w-4 h-4" />}
                  label={lang === "id" ? "ID Sertifikat" : "Certificate ID"}
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
                {certificateData.templateName && (
                  <DetailRow
                    icon={<MapPin className="w-4 h-4" />}
                    label={lang === "id" ? "Desain Template" : "Template Design"}
                    value={certificateData.templateName}
                  />
                )}
              </div>

              {/* Trust Stamp Badge */}
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 py-3.5 px-4">
                <div className="flex items-center gap-2">
                  <CheckCircle weight="fill" className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span className="text-xs font-semibold text-emerald-700 text-center leading-normal">
                    {lang === "id" 
                      ? "Dokumen ini sah dan terdaftar secara resmi di SertifKilat.id." 
                      : "This document is valid and officially registered with SertifKilat.id."}
                  </span>
                </div>
                {isFromDatabase && (
                  <span className="text-[10px] text-emerald-600 font-medium">
                    {lang === "id" ? "(Diverifikasi real-time dari database)" : "(Verified real-time from database)"}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto">
                <XCircle className="w-8 h-8 text-rose-500" weight="fill" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-ink-800">
                  {lang === "id" 
                    ? <>Kode sertifikat <code className="bg-ink-100 font-mono font-bold text-rose-600 px-1.5 py-0.5 rounded text-xs">{decodedId}</code> tidak ditemukan.</>
                    : <>Certificate code <code className="bg-ink-100 font-mono font-bold text-rose-600 px-1.5 py-0.5 rounded text-xs">{decodedId}</code> not found.</>}
                </p>
                <p className="text-xs text-ink-500 leading-relaxed max-w-sm mx-auto">
                  {lang === "id" 
                    ? "Silakan periksa kembali ID sertifikat yang Anda masukkan atau scan QR code Anda kembali. Jika ini adalah kesalahan, harap hubungi panitia penyelenggara acara." 
                    : "Please check the certificate ID you entered or scan your QR code again. If you believe this is an error, please contact the event organizer."}
                </p>
              </div>
              <div className="pt-4 border-t border-ink-100">
                <Link href="/" className="btn-secondary w-full justify-center">
                  {lang === "id" ? "Kembali ke Beranda" : "Back to Home"}
                </Link>
              </div>
            </div>
          )}
        </div>

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
