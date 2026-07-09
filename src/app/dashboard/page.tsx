import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
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
  const now = new Date();
  const [
    totalEvents,
    totalParticipants,
    totalCertificates,
    verificationAggregate,
    recentEvents,
    recentCertificates,
    recentParticipants,
    upcomingEvents,
  ] = await Promise.all([
    prisma.event.count({ where: { userId } }),
    prisma.participant.count({
      where: { event: { userId } },
    }),
    prisma.certificate.count({
      where: { batch: { event: { userId } } },
    }),
    // Sum verifiedCount on all certificates owned by this user (total QR scans)
    prisma.certificate.aggregate({
      where: { batch: { event: { userId } } },
      _sum: { verifiedCount: true },
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
        participant: { select: { name: true, email: true } },
        batch: { include: { event: { select: { name: true } } } },
      },
    }),
    prisma.participant.findMany({
      where: { event: { userId } },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { event: { select: { name: true } } },
    }),
    prisma.event.findMany({
      where: { userId, date: { gte: now } },
      orderBy: { date: "asc" },
      take: 5,
      include: { _count: { select: { participants: true } } },
    }),
  ]);

  const totalVerifications = verificationAggregate._sum.verifiedCount ?? 0;

  // Hitung event yang dibuat bulan ini untuk trend yang akurat
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
    recentParticipants,
    upcomingEvents,
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

import DashboardPlanCard from "./DashboardPlanCard";
import DashboardClient from "./DashboardClient";
 
export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");
 
  const [data, userPlanData, totalTemplates] = await Promise.all([
    getDashboardData(session.user.id),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    }),
    prisma.template.count({
      where: {
        userId: session.user.id,
        NOT: {
          fileUrl: {
            startsWith: "/templates/",
          },
        },
      },
    }),
  ]);
 
  const userPlan = userPlanData?.plan || "FREE";
 
  return (
    <DashboardClient
      sessionUser={session.user}
      totalTemplates={totalTemplates}
      userPlan={userPlan}
      data={data}
    />
  );
}
