import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import ParticipantsClient from "./ParticipantsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Peserta — SertifKilat.id",
};

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

  return <ParticipantsClient participants={participants} />;
}
