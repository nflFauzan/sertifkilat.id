import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";
import { Users, CalendarBlank, ArrowSquareOut } from "@phosphor-icons/react/dist/ssr";

export default async function DashboardParticipantsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  // Fetch all participants for this user's events
  const participants = await prisma.participant.findMany({
    where: {
      event: { userId: session.user.id },
    },
    include: {
      event: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Peserta</h1>
        <p className="text-sm text-ink-500 mt-1">
          Daftar seluruh peserta yang terdaftar pada semua event Anda.
        </p>
      </div>

      {participants.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
            <Users className="w-7 h-7 text-brand-400" weight="fill" />
          </div>
          <h2 className="font-semibold text-ink-900 mb-2">Belum ada peserta</h2>
          <p className="text-sm text-ink-400 mb-6 max-w-sm mx-auto">
            Silakan masuk ke menu Event lalu kelola peserta di event spesifik untuk menambahkan nama-nama peserta.
          </p>
          <Link href="/dashboard/events" className="btn-primary mx-auto">
            Pilih & Kelola Event
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 bg-ink-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wide">
                    Nama Peserta
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wide">
                    Gmail
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wide">
                    Nama Event
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-ink-500 uppercase tracking-wide">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {participants.map((p) => (
                  <tr key={p.id} className="hover:bg-ink-50/50 transition-colors">
                    <td className="px-5 py-4 font-medium text-ink-900">
                      {p.name}
                    </td>
                    <td className="px-4 py-4 text-ink-600">
                      {p.email}
                    </td>
                    <td className="px-4 py-4 text-ink-600">
                      <span className="flex items-center gap-1.5">
                        <CalendarBlank className="w-4 h-4 text-ink-400" />
                        {p.event.name}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        href={`/dashboard/events/${p.event.id}/participants`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
                      >
                        Kelola
                        <ArrowSquareOut className="w-3.5 h-3.5" />
                      </Link>
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
