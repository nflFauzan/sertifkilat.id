import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
import { Gear, User, CreditCard, Sparkle } from "@phosphor-icons/react/dist/ssr";

export const metadata = {
  title: "Pengaturan — SertifKilat.id",
};

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) redirect("/auth/login");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Pengaturan</h1>
        <p className="text-sm text-ink-500 mt-1">
          Kelola informasi profil, keamanan, dan paket subscription Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-ink-900 text-base flex items-center gap-2">
            <User className="w-5 h-5 text-brand-500" />
            Informasi Profil
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-ink-500 uppercase tracking-wide mb-1">
                Nama Lengkap
              </label>
              <p className="text-sm font-medium text-ink-900">{user.name}</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-500 uppercase tracking-wide mb-1">
                Email
              </label>
              <p className="text-sm font-medium text-ink-900">{user.email}</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-500 uppercase tracking-wide mb-1">
                Role Akun
              </label>
              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-ink-100 text-ink-700 text-xs font-semibold">
                {user.role}
              </span>
            </div>
          </div>
        </div>

        {/* Plan / Subscription Card */}
        <div className="card p-6 space-y-4 md:col-span-2">
          <h2 className="font-semibold text-ink-900 text-base flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-brand-500" />
            Paket Layanan
          </h2>
          <div className="p-4 bg-gradient-to-r from-brand-50 to-indigo-50/30 rounded-2xl border border-brand-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 text-xxs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 border border-brand-100 px-2 py-0.5 rounded-full">
                <Sparkle className="w-3 h-3 text-brand-500 animate-pulse" weight="fill" />
                Active Plan
              </span>
              <h3 className="text-lg font-bold text-ink-900">
                SertifKilat {user.plan}
              </h3>
              <p className="text-xs text-ink-500">
                Akses generate sertifikat massal tanpa batasan kuota.
              </p>
            </div>
            <button className="btn-primary shrink-0 self-start sm:self-center">
              Upgrade ke Pro
            </button>
          </div>

          <div className="pt-2 text-xs text-ink-400">
            Butuh bantuan atau kustomisasi khusus institusi? Hubungi tim support kami di <a href="mailto:support@sertifkilat.id" className="text-brand-600 font-medium hover:underline">support@sertifkilat.id</a>
          </div>
        </div>
      </div>
    </div>
  );
}
