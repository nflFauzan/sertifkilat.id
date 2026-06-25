import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";
import {
  CalendarBlank,
  Users,
  Certificate,
  TrendUp,
  CheckCircle,
  Clock,
  ArrowRight,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard — SertifKilat.id",
};

async function getDashboardData(userId: string) {
  const [totalEvents, totalParticipants, totalCertificates, totalVerifications, recentEvents, recentCertificates] =
    await Promise.all([
      prisma.event.count({ where: { userId } }),
      prisma.participant.count({
        where: { event: { userId } },
      }),
      prisma.certificate.count({
        where: { batch: { event: { userId } } },
      }),
      prisma.verificationLog.count({
        where: {
          certificate: {
            batch: {
              event: { userId },
            },
          },
        },
      }),
      prisma.event.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { _count: { select: { participants: true } } },
      }),
      prisma.certificate.findMany({
        where: { batch: { event: { userId } } },
        orderBy: { issuedAt: "desc" },
        take: 5,
        include: {
          participant: true,
          batch: { include: { event: true } },
        },
      }),
    ]);

  // Hitung event yang dibuat bulan ini untuk trend yang akurat
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const eventsThisMonth = await prisma.event.count({
    where: { userId, createdAt: { gte: startOfMonth } },
  });

  return {
    totalEvents,
    totalParticipants,
    totalCertificates,
    totalVerifications,
    recentEvents,
    recentCertificates,
    eventsThisMonth,
  };
}

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  DRAFT: { label: "Draft", className: "badge-amber" },
  ACTIVE: { label: "Aktif", className: "badge-brand" },
  COMPLETED: { label: "Selesai", className: "badge-green" },
  ARCHIVED: { label: "Diarsipkan", className: "bg-ink-100 text-ink-500 inline-flex items-center gap-1.5 rounded-full text-xs font-semibold px-2.5 py-1" },
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const data = await getDashboardData(session.user.id);

  const stats = [
    {
      label: "Total Event",
      value: data.totalEvents,
      icon: CalendarBlank,
      color: "bg-brand-50 text-brand-600",
      trend: data.eventsThisMonth > 0 ? `+${data.eventsThisMonth} bulan ini` : "Total event Anda",
    },
    {
      label: "Total Peserta",
      value: data.totalParticipants,
      icon: Users,
      color: "bg-emerald-50 text-emerald-600",
      trend: "Terdaftar di semua event",
    },
    {
      label: "Total Sertifikat",
      value: data.totalCertificates,
      icon: Certificate,
      color: "bg-amber-50 text-amber-600",
      trend: "Diterbitkan",
    },
    {
      label: "Total Verifikasi",
      value: data.totalVerifications,
      icon: TrendUp,
      color: "bg-purple-50 text-purple-600",
      trend: "Scan QR (publik)",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Dashboard</h1>
        <p className="text-sm text-ink-500 mt-1">
          Selamat datang kembali,{" "}
          <span className="font-semibold text-ink-700">
            {session.user.name}
          </span>
          ! Berikut ringkasan aktivitas kamu.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-ink-500 uppercase tracking-wide">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-ink-900 mt-1.5 tabular-nums">
                    {stat.value}
                  </p>
                  <p className="text-xs text-ink-400 mt-1">{stat.trend}</p>
                </div>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.color}`}>
                  <Icon className="w-5 h-5" weight="fill" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Events */}
        <div className="card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
            <h2 className="font-semibold text-ink-900">Event Terbaru</h2>
            <Link
              href="/dashboard/events"
              className="text-xs text-brand-600 font-semibold hover:text-brand-700 flex items-center gap-1"
            >
              Lihat semua
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-ink-50">
            {data.recentEvents.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-ink-400">
                Belum ada event. Buat event pertamamu!
              </div>
            ) : (
              data.recentEvents.map((event) => {
                const cfg = STATUS_CONFIG[event.status] ?? STATUS_CONFIG.DRAFT;
                return (
                  <div
                    key={event.id}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-ink-50 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                      <CalendarBlank className="w-4 h-4 text-brand-500" weight="fill" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink-900 truncate">
                        {event.name}
                      </p>
                      <p className="text-xs text-ink-400 mt-0.5">
                        {event._count.participants} peserta ·{" "}
                        {formatDate(event.date)}
                      </p>
                    </div>
                    <span className={cfg.className}>{cfg.label}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Certificates */}
        <div className="card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
            <h2 className="font-semibold text-ink-900">Sertifikat Terbaru</h2>
            <Link
              href="/dashboard/generator"
              className="text-xs text-brand-600 font-semibold hover:text-brand-700 flex items-center gap-1"
            >
              Generator
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-ink-50">
            {data.recentCertificates.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-ink-400">
                Belum ada sertifikat yang di-generate.
              </div>
            ) : (
              data.recentCertificates.map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-ink-50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-emerald-500" weight="fill" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-900 truncate">
                      {cert.participant.name}
                    </p>
                    <p className="text-xs text-ink-400 mt-0.5 truncate">
                      {cert.batch.event.name}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-mono font-semibold text-ink-700">
                      {cert.serialNumber}
                    </p>
                    <p className="text-xs text-ink-400 mt-0.5">
                      {formatDate(cert.issuedAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-5">
        <h2 className="font-semibold text-ink-900 mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/dashboard/events?new=1"
            className="flex items-center gap-3 p-4 rounded-xl border border-ink-100 hover:border-brand-300 hover:bg-brand-50 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center group-hover:bg-brand-200 transition-colors">
              <CalendarBlank className="w-5 h-5 text-brand-600" weight="fill" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink-900">Buat Event</p>
              <p className="text-xs text-ink-400">Event baru</p>
            </div>
          </Link>
          <Link
            href="/dashboard/generator"
            className="flex items-center gap-3 p-4 rounded-xl border border-ink-100 hover:border-emerald-300 hover:bg-emerald-50 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
              <Certificate className="w-5 h-5 text-emerald-600" weight="fill" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink-900">Generate Sertifikat</p>
              <p className="text-xs text-ink-400">Upload & generate</p>
            </div>
          </Link>
          <Link
            href="/dashboard/certificates"
            className="flex items-center gap-3 p-4 rounded-xl border border-ink-100 hover:border-amber-300 hover:bg-amber-50 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
              <Clock className="w-5 h-5 text-amber-600" weight="fill" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink-900">Lihat Sertifikat</p>
              <p className="text-xs text-ink-400">Daftar & verifikasi</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
