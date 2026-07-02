import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import EventsClient from "./EventsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Event — SertifKilat.id",
};

export default async function EventsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const events = await prisma.event.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { participants: true, batches: true },
      },
    },
  });

  return <EventsClient events={events} />;
}
