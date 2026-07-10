import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import AnalyticsClient from "./AnalyticsClient";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  // 1. Total events count
  const totalEvents = await prisma.event.count({
    where: { userId: session.user.id },
  });

  // 2. Total participants count across all user's events
  const totalParticipants = await prisma.participant.count({
    where: {
      event: { userId: session.user.id },
    },
  });

  // 3. Total certificates generated across all user's events
  const totalCertificates = await prisma.certificate.count({
    where: {
      batch: {
        event: { userId: session.user.id },
      },
    },
  });

  // 4. Sum of verifiedCount (Total scans / verification)
  const verificationAggregate = await prisma.certificate.aggregate({
    where: {
      batch: {
        event: { userId: session.user.id },
      },
    },
    _sum: {
      verifiedCount: true,
    },
  });
  const totalVerifications = verificationAggregate._sum.verifiedCount ?? 0;

  // 5. Recent verification scans (scanned certificates)
  const recentVerifications = await prisma.certificate.findMany({
    where: {
      batch: {
        event: { userId: session.user.id },
      },
      verifiedCount: { gt: 0 },
      lastVerifiedAt: { not: null },
    },
    include: {
      participant: { select: { name: true } },
      batch: {
        select: {
          event: { select: { name: true } },
        },
      },
    },
    orderBy: { lastVerifiedAt: "desc" },
    take: 5,
  });

  // 6. Events summary list
  const events = await prisma.event.findMany({
    where: { userId: session.user.id },
    include: {
      _count: {
        select: {
          participants: true,
          batches: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const userId = session.user.id;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [
    validScansCount,
    invalidScansCount,
    todayScansCount,
    latestVerificationActivities,
  ] = await Promise.all([
    // 1. Valid scans (status: SUCCESS)
    prisma.verificationLog.count({
      where: {
        status: "SUCCESS",
        certificate: { batch: { event: { userId } } }
      }
    }),
    // 2. Invalid scans (status: FAILED)
    prisma.verificationLog.count({
      where: {
        status: "FAILED"
      }
    }),
    // 3. Today's scans count
    prisma.verificationLog.count({
      where: {
        OR: [
          {
            status: "SUCCESS",
            certificate: { batch: { event: { userId } } }
          },
          {
            status: "FAILED"
          }
        ],
        scannedAt: { gte: startOfToday }
      }
    }),
    // 4. Latest verification activities
    prisma.verificationLog.findMany({
      where: {
        OR: [
          {
            status: "SUCCESS",
            certificate: { batch: { event: { userId } } }
          },
          {
            status: "FAILED"
          }
        ]
      },
      include: {
        certificate: {
          include: {
            participant: { select: { name: true } },
            batch: { include: { event: { select: { name: true } } } }
          }
        }
      },
      orderBy: { scannedAt: "desc" },
      take: 5
    })
  ]);

  const serializedRecentVerifications = recentVerifications.map((c: typeof recentVerifications[number]) => ({
    id: c.id,
    serialNumber: c.serialNumber,
    participantName: c.participant.name,
    eventName: c.batch.event.name,
    verifiedCount: c.verifiedCount,
    lastVerifiedAt: c.lastVerifiedAt,
  }));

  const serializedEvents = events.map((e: typeof events[number]) => ({
    id: e.id,
    name: e.name,
    type: e.type,
    status: e.status,
    participantCount: e._count.participants,
    batchCount: e._count.batches,
  }));

  const serializedVerifications = latestVerificationActivities.map(v => ({
    id: v.id,
    serialNumber: v.serialNumber,
    scannedAt: v.scannedAt.toISOString(),
    status: v.status,
    participantName: v.certificate?.participant?.name || null,
    eventName: v.certificate?.batch?.event?.name || null,
  }));

  return (
    <AnalyticsClient
      stats={{
        totalEvents,
        totalParticipants,
        totalCertificates,
        totalVerifications,
      }}
      recentVerifications={serializedRecentVerifications}
      events={serializedEvents}
      qrStats={{
        validScansCount,
        invalidScansCount,
        todayScansCount,
        latestVerifications: serializedVerifications,
      }}
    />
  );
}
