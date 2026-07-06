import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import EditorClient from "./EditorClient";

export const dynamic = "force-dynamic";

export default async function TemplateEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  // Fetch the template
  const template = await prisma.template.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!template) {
    notFound();
  }

  // Safe serialization of template data
  const serializedTemplate = {
    id: template.id,
    name: template.name,
    fileUrl: template.fileUrl,
    width: template.width,
    height: template.height,
    fields: template.fields as Array<{
      key: string;
      x: number;
      y: number;
      fontSize?: number;
      color?: string;
      fontWeight?: string;
      align?: string;
    }> || [],
  };

  // Fetch all templates for the user to support live template switching dropdown
  const templates = await prisma.template.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const serializedTemplates = templates.map(t => ({
    id: t.id,
    name: t.name,
    fileUrl: t.fileUrl,
    width: t.width,
    height: t.height,
    fields: t.fields as Array<{
      key: string;
      x: number;
      y: number;
      fontSize?: number;
      color?: string;
      fontWeight?: string;
      align?: string;
    }> || [],
  }));

  return <EditorClient template={serializedTemplate} templates={serializedTemplates} />;
}
