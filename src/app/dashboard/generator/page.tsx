import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import GeneratorClient from "./GeneratorClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Generator Sertifikat — SertifKilat.id",
};

export default async function GeneratorPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const [events, recentBatches, templates, user] = await Promise.all([
    prisma.event.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, type: true },
    }),
    prisma.batch.findMany({
      where: { event: { userId: session.user.id } },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        event: { select: { name: true } },
        _count: { select: { certificates: true } },
      },
    }),
    prisma.template.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    }),
  ]);

  const userPlan = user?.plan || "FREE";

  return (
    <GeneratorClient
      events={events}
      recentBatches={recentBatches}
      templates={templates}
      userPlan={userPlan}
    />
  );
}
