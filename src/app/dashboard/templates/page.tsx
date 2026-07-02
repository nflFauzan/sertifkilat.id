import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import TemplatesClient from "./TemplatesClient";

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  // Fetch events for selection dropdown
  const events = await prisma.event.findMany({
    where: { userId: session.user.id },
    select: { id: true, name: true },
    orderBy: { createdAt: "desc" },
  });

  // Fetch existing templates for this user
  const templates = await prisma.template.findMany({
    where: { userId: session.user.id },
    include: {
      event: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Fetch user plan
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  });
  const userPlan = user?.plan || "FREE";

  // Safe serialization of templates (convert Date and JSON fields appropriately)
  const serializedTemplates = templates.map((t: typeof templates[number]) => ({
    id: t.id,
    name: t.name,
    fileUrl: t.fileUrl,
    eventId: t.eventId,
    fields: t.fields,
    createdAt: t.createdAt,
    event: t.event ? { name: t.event.name } : null,
  }));

  return <TemplatesClient events={events} templates={serializedTemplates} userPlan={userPlan} />;
}
