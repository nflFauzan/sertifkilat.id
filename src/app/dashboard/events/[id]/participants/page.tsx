import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import ParticipantsClient from "./ParticipantsClient";

export const dynamic = "force-dynamic";

export default async function EventParticipantsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  // Fetch the event and check ownership
  const event = await prisma.event.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!event) {
    notFound();
  }

  // Fetch participants for this event
  const participants = await prisma.participant.findMany({
    where: { eventId: id },
    orderBy: { rowIndex: "asc" },
  });

  // Safe serialization
  const serializedEvent = {
    id: event.id,
    name: event.name,
  };

  const serializedParticipants = participants.map((p: typeof participants[number]) => ({
    id: p.id,
    name: p.name,
    email: p.email,
    rowIndex: p.rowIndex,
    createdAt: p.createdAt,
  }));

  return (
    <ParticipantsClient
      event={serializedEvent}
      participants={serializedParticipants}
    />
  );
}
