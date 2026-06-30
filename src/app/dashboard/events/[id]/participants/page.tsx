import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import ParticipantsClient from "./ParticipantsClient";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string; q?: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
    select: { name: true },
  });
  return { title: `Peserta — ${event?.name ?? "Event"} — SertifKilat.id` };
}

export default async function EventParticipantsPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { page: pageStr, q: search } = await searchParams;

  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  // Ownership check
  const event = await prisma.event.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true, name: true },
  });
  if (!event) notFound();

  const page = Math.max(1, parseInt(pageStr ?? "1", 10));
  const skip = (page - 1) * PAGE_SIZE;

  // Build filter: support search across name, email
  const where = {
    eventId: id,
    ...(search?.trim()
      ? {
          OR: [
            { name: { contains: search.trim(), mode: "insensitive" as const } },
            { email: { contains: search.trim(), mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [participants, totalCount] = await Promise.all([
    prisma.participant.findMany({
      where,
      orderBy: { rowIndex: "asc" },
      skip,
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        email: true,
        rowIndex: true,
        extraData: true,
        createdAt: true,
      },
    }),
    prisma.participant.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const serialized = participants.map((p) => {
    const extra = (p.extraData ?? {}) as Record<string, string>;
    return {
      id: p.id,
      name: p.name,
      email: p.email,
      rowIndex: p.rowIndex,
      institution: extra.institution ?? "",
      position: extra.position ?? "",
      createdAt: p.createdAt,
    };
  });

  return (
    <ParticipantsClient
      event={event}
      participants={serialized}
      totalCount={totalCount}
      page={page}
      totalPages={totalPages}
      searchQuery={search ?? ""}
    />
  );
}
