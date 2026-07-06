import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import EventDetailClient from "./EventDetailClient";

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
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  return (
    <EventDetailClient
      event={event}
      recentParticipants={recentParticipants}
    />
  );
}
