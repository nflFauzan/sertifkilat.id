"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeSlash, Lightning, CircleNotch, Warning, CheckCircle } from "@phosphor-icons/react";
import { registerAction, getMissingGoogleConfig } from "@/app/actions/auth";
import { signIn } from "next-auth/react";
import { useTranslation } from "@/lib/hooks/useTranslation";

export default function RegisterPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [googleConfig, setGoogleConfig] = useState<{ isConfigured: boolean; missing: string[] } | null>(null);
  const { t, lang } = useTranslation();

  useEffect(() => {
    async function loadConfig() {
      const res = await getMissingGoogleConfig();
      setGoogleConfig(res);
    }
    loadConfig();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);

    if (fd.get("password") !== fd.get("confirmPassword")) {
      setError(t("auth.passwordMismatch"));
      return;
    }

    startTransition(async () => {
      const result = await registerAction(fd);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        // Do not auto-login, redirect to login page instead
        setTimeout(() => {
          router.push("/auth/login?registered=true");
        }, 1500);
      }
    });
  }

  return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center p-4 py-12">
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-brand-100/60 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-brand-50/80 blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
              <Lightning weight="fill" className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-ink-900">
              SertifKilat<span className="text-brand-500">.id</span>
            </span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-ink-900">{t("auth.registerTitle")}</h1>
          <p className="mt-1 text-sm text-ink-500">{t("auth.registerSubtitle")}</p>
        </div>

        {/* Card */}
        <div className="card p-8 shadow-soft bg-white">
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
              <Warning weight="fill" className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 flex items-start gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
              <CheckCircle weight="fill" className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{lang === "id" ? "Akun berhasil dibuat! Mengalihkan ke halaman login..." : "Account created successfully! Redirecting to login page..."}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-ink-700 mb-1.5">
                {t("auth.fullNameLabel")}
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                placeholder={lang === "id" ? "Nama lengkap kamu" : "Your full name"}
                className="input-field"
              />
            </div>

            {/* Gmail */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink-700 mb-1.5">
                {t("auth.emailLabel")}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="kamu@gmail.com"
                className="input-field"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink-700 mb-1.5">
                {t("auth.passwordLabel")}
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  placeholder={lang === "id" ? "Min. 8 karakter, huruf kapital & angka" : "Min. 8 characters, capital & number"}
                  className="input-field pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 transition-colors"
                  aria-label={showPassword ? (lang === "id" ? "Sembunyikan password" : "Hide password") : (lang === "id" ? "Tampilkan password" : "Show password")}
                >
                  {showPassword ? <EyeSlash className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-ink-400">
                {lang === "id" ? "Minimal 8 karakter, ada huruf kapital dan angka" : "Min. 8 characters, capital letter & number"}
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-ink-700 mb-1.5">
                {t("auth.confirmPasswordLabel")}
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                placeholder={lang === "id" ? "Ulangi password" : "Repeat password"}
                className="input-field"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending || success}
              className="btn-primary w-full justify-center py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <CircleNotch className="w-4 h-4 animate-spin" />
                  {t("common.loading")}
                </>
              ) : (
                t("auth.signUpBtn")
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-ink-100" />
            </div>
            <div className="relative flex justify-center text-xs text-ink-400 bg-white px-2">
              {lang === "id" ? "Atau daftarkan dengan" : "Or register with"}
            </div>
          </div>

          {/* Google Sign-in */}
          {googleConfig !== null && !googleConfig.isConfigured && (
            <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-amber-50 border border-amber-200 px-3.5 py-2.5 text-xs text-amber-800">
              <Warning weight="fill" className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
              <div>
                <span className="font-semibold block mb-0.5">
                  {lang === "id" ? "Google Sign-in Nonaktif" : "Google Sign-in Disabled"}
                </span>
                {lang === "id" ? "Variabel berikut belum dikonfigurasi di file .env:" : "The following variables have not been configured in the .env file:"}
                <ul className="list-disc list-inside mt-1 font-mono font-semibold">
                  {googleConfig.missing.map((v) => (
                    <li key={v}>{v}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={async () => {
              if (googleConfig?.isConfigured === false) return;
              setError("");
              try {
                await signIn("google", { callbackUrl: "/dashboard" });
              } catch (err) {
                console.error(err);
                setError(lang === "id" ? "Gagal mendaftar dengan Google" : "Google Registration Failed");
              }
            }}
            disabled={isPending || success || googleConfig?.isConfigured === false}
            className="btn-secondary w-full justify-center py-2.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            {t("auth.googleBtn")}
          </button>
        </div>

        {/* Login link */}
        <p className="text-center mt-6 text-sm text-ink-500">
          {t("auth.haveAccount") + " "}
          <Link href="/auth/login" className="text-brand-600 font-semibold hover:text-brand-700 transition-colors">
            {t("auth.signInBtn")}
          </Link>
        </p>
      </div>
    </div>
  );
}
