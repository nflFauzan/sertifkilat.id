import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { CalendarBlank, Users, Certificate, ArrowLeft, MapPin } from "@phosphor-icons/react/dist/ssr";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id }, select: { name: true } });
  return { title: `${event?.name ?? "Event"} — SertifKilat.id` };
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const event = await prisma.event.findFirst({
    where: { id, userId: session.user.id },
    include: {
      _count: {
        select: { participants: true, batches: true },
      },
    },
  });

  if (!event) notFound();

  const recentParticipants = await prisma.participant.findMany({
    where: { eventId: id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const STATUS_LABELS: Record<string, string> = {
    DRAFT: "Draft",
    ACTIVE: "Aktif",
    COMPLETED: "Selesai",
    ARCHIVED: "Diarsipkan",
  };

  const TYPE_LABELS: Record<string, string> = {
    WEBINAR: "Webinar",
    PELATIHAN: "Pelatihan",
    LOMBA: "Lomba",
    SEMINAR: "Seminar",
    WORKSHOP: "Workshop",
    LAINNYA: "Lainnya",
  };

  return (
    <div className="space-y-6">
      {/* Back button + header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link
          href="/dashboard/events"
          className="inline-flex items-center gap-2 text-sm text-ink-500 hover:text-ink-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Events
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">{event.name}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-ink-500">
            <span className="flex items-center gap-1">
              <CalendarBlank className="w-4 h-4" />
              {formatDate(event.date)}
            </span>
            <span>{TYPE_LABELS[event.type] ?? event.type}</span>
            {event.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {event.location}
              </span>
            )}
          </div>
        </div>
        <span className={`badge ${event.status === "ACTIVE" ? "badge-brand" : event.status === "COMPLETED" ? "badge-green" : "badge-amber"} self-start`}>
          {STATUS_LABELS[event.status] ?? event.status}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="card p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-500" weight="fill" />
          </div>
          <div>
            <p className="text-2xl font-bold text-ink-900">{event._count.participants}</p>
            <p className="text-xs text-ink-400">Peserta</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
            <Certificate className="w-5 h-5 text-brand-500" weight="fill" />
          </div>
          <div>
            <p className="text-2xl font-bold text-ink-900">{event._count.batches}</p>
            <p className="text-xs text-ink-400">Batch Generate</p>
          </div>
        </div>
      </div>

      {/* Description */}
      {event.description && (
        <div className="card p-5">
          <h2 className="font-semibold text-ink-900 mb-2">Deskripsi</h2>
          <p className="text-sm text-ink-600 leading-relaxed">{event.description}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/dashboard/events/${id}/participants`}
          className="btn-primary"
        >
          <Users className="w-4 h-4" />
          Kelola Peserta
        </Link>
        <Link
          href="/dashboard/generate"
          className="btn-secondary"
        >
          <Certificate className="w-4 h-4" />
          Generate Sertifikat
        </Link>
      </div>

      {/* Recent participants */}
      {recentParticipants.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-ink-100 flex items-center justify-between">
            <h2 className="font-semibold text-ink-900">Peserta Terbaru</h2>
            <Link
              href={`/dashboard/events/${id}/participants`}
              className="text-sm text-brand-600 hover:text-brand-700 font-medium"
            >
              Lihat Semua →
            </Link>
          </div>
          <div className="divide-y divide-ink-50">
            {recentParticipants.map((p) => (
              <div key={p.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ink-900">{p.name}</p>
                  <p className="text-xs text-ink-400">{p.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
