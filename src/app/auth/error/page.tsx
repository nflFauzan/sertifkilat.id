"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Lightning, Warning } from "@phosphor-icons/react";
import { useTranslation } from "@/lib/hooks/useTranslation";

const errorMessages: Record<string, { id: string; en: string }> = {
  Configuration: {
    id: "Terjadi kesalahan konfigurasi server.",
    en: "A server configuration error occurred."
  },
  AccessDenied: {
    id: "Akses ditolak.",
    en: "Access denied."
  },
  Verification: {
    id: "Link verifikasi tidak valid atau sudah kedaluwarsa.",
    en: "Verification link is invalid or has expired."
  },
  Default: {
    id: "Terjadi kesalahan. Silakan coba lagi.",
    en: "An error occurred. Please try again."
  },
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error") || "Default";
  const { lang } = useTranslation();
  
  const msgObj = errorMessages[errorCode] || errorMessages.Default;
  const message = lang === "id" ? msgObj.id : msgObj.en;

  return (
    <div className="card p-8 shadow-soft bg-white">
      <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
        <Warning weight="fill" className="w-6 h-6 text-rose-500" />
      </div>
      <h1 className="text-xl font-bold text-ink-900 mb-2">
        {lang === "id" ? "Terjadi Kesalahan" : "An Error Occurred"}
      </h1>
      <p className="text-sm text-ink-500 mb-6">{message}</p>
      <Link href="/auth/login" className="btn-primary w-full justify-center">
        {lang === "id" ? "Kembali ke Login" : "Back to Login"}
      </Link>
    </div>
  );
}

export default function AuthErrorPage() {
  const { lang } = useTranslation();

  return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center shadow-glow">
            <Lightning weight="fill" className="w-5 h-5 text-white" />
          </div>
          <span className="font-display text-xl font-bold text-ink-900">
            SertifKilat<span className="text-brand-500">.id</span>
          </span>
        </div>

        <Suspense
          fallback={
            <div className="card p-8 shadow-soft flex flex-col items-center justify-center bg-white">
              <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-ink-500 mt-4">
                {lang === "id" ? "Memuat..." : "Loading..."}
              </p>
            </div>
          }
        >
          <AuthErrorContent />
        </Suspense>
      </div>
    </div>
  );
}
