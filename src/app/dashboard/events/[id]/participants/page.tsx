import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import ParticipantsClient from "./ParticipantsClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function EventParticipantsPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  // Fetch the event and check ownership
  const event = await prisma.event.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true, name: true },
  });

  if (!event) {
    notFound();
  }

  // Parse search query and page number
  const searchQuery = (resolvedSearchParams.q || "").trim();
  const page = Math.max(1, parseInt(resolvedSearchParams.page || "1", 10));
  const limit = 20;

  // Build the search condition
  const searchFilter = searchQuery
    ? {
        OR: [
          { name: { contains: searchQuery, mode: "insensitive" as const } },
          { email: { contains: searchQuery, mode: "insensitive" as const } },
          {
            extraData: {
              path: ["institution"],
              string_contains: searchQuery,
            },
          },
        ],
      }
    : {};

  const whereClause = {
    eventId: id,
    ...searchFilter,
  };

  // Get total count of filtered participants
  const totalCount = await prisma.participant.count({
    where: whereClause,
  });

  // Fetch paginated participants selecting only required columns
  const participants = await prisma.participant.findMany({
    where: whereClause,
    select: {
      id: true,
      name: true,
      email: true,
      extraData: true,
      rowIndex: true,
      createdAt: true,
    },
    orderBy: { rowIndex: "asc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / limit);

  // Safe serialization (ensure Date object is converted to ISO string or formatted)
  const serializedParticipants = participants.map((p) => {
    // Parse institution and position safely from extraData JSON
    const extra = (p.extraData as { institution?: string; position?: string }) || {};
    return {
      id: p.id,
      name: p.name,
      email: p.email,
      rowIndex: p.rowIndex,
      institution: extra.institution || "",
      position: extra.position || "",
      createdAt: p.createdAt.toISOString(),
    };
  });

  return (
    <ParticipantsClient
      event={event}
      participants={serializedParticipants}
      totalCount={totalCount}
      currentPage={page}
      totalPages={totalPages}
      searchQuery={searchQuery}
    />
  );
}
