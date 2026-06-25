"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeSlash, Lightning, CircleNotch, Warning, CheckCircle } from "@phosphor-icons/react";
import { registerAction } from "@/app/actions/auth";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await registerAction(fd);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        // Auto-login after register
        await signIn("credentials", {
          email: fd.get("email"),
          password: fd.get("password"),
          redirect: false,
        });
        router.push("/dashboard");
        router.refresh();
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
          <h1 className="mt-6 text-2xl font-bold text-ink-900">Buat akun gratis</h1>
          <p className="mt-1 text-sm text-ink-500">Mulai generate sertifikat dalam hitungan menit</p>
        </div>

        {/* Card */}
        <div className="card p-8 shadow-soft">
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
              <Warning weight="fill" className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 flex items-start gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
              <CheckCircle weight="fill" className="w-4 h-4 mt-0.5 shrink-0" />
              <span>Akun berhasil dibuat! Mengalihkan ke dashboard...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-ink-700 mb-1.5">
                Nama Lengkap
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                placeholder="Nama lengkap kamu"
                className="input-field"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink-700 mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="kamu@email.com"
                className="input-field"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  placeholder="Min. 8 karakter, huruf kapital & angka"
                  className="input-field pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 transition-colors"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeSlash className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-ink-400">Minimal 8 karakter, ada huruf kapital dan angka</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-ink-700 mb-1.5">
                Konfirmasi Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                placeholder="Ulangi password"
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
                  Mendaftar...
                </>
              ) : (
                "Buat Akun Gratis"
              )}
            </button>
          </form>

          {/* Free plan note */}
          <p className="mt-5 text-center text-xs text-ink-400">
            Dengan mendaftar, kamu setuju dengan{" "}
            <span className="text-ink-600">Syarat & Ketentuan</span> kami.
            Mulai dengan 25 sertifikat gratis.
          </p>
        </div>

        {/* Login link */}
        <p className="text-center mt-6 text-sm text-ink-500">
          Sudah punya akun?{" "}
          <Link href="/auth/login" className="text-brand-600 font-semibold hover:text-brand-700 transition-colors">
            Masuk sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}
