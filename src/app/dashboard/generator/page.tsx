import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import GeneratorClient from "./GeneratorClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Generator Sertifikat — SertifKilat.id",
};

const DEFAULT_TEMPLATES = [
  {
    name: "Luxury Certificate",
    fileUrl: "/templates/sertifikat1.svg",
    fields: [
      { key: "ornament", x: 561, y: 120, fontSize: 32, color: "#D4AF37", fontWeight: "normal", align: "center", text: "✦" },
      { key: "title", x: 561, y: 180, fontSize: 48, color: "#0D1B2A", fontWeight: "bold", align: "center", text: "SERTIFIKAT" },
      { key: "subtitle", x: 561, y: 240, fontSize: 18, color: "#D4AF37", fontWeight: "bold", align: "center", text: "DIBERIKAN KEPADA" },
      { key: "name", x: 561, y: 340, fontSize: 44, color: "#0D1B2A", fontWeight: "normal", align: "center", text: "Nama Peserta" },
      { key: "participation", x: 561, y: 410, fontSize: 14, color: "#475569", fontWeight: "normal", align: "center", text: "ATAS PARTISIPASINYA SEBAGAI" },
      { key: "event", x: 561, y: 460, fontSize: 24, color: "#0D1B2A", fontWeight: "bold", align: "center", text: "Webinar Nasional Desain UI/UX 2026" },
      { key: "divider", x: 561, y: 505, fontSize: 16, color: "#D4AF37", fontWeight: "normal", align: "center", text: "— — — — — — — — — — — — — — —" },
      { key: "date", x: 480, y: 540, fontSize: 14, color: "#475569", fontWeight: "normal", align: "right", text: "12 Juni 2026" },
      { key: "location", x: 640, y: 540, fontSize: 14, color: "#475569", fontWeight: "normal", align: "left", text: "Jakarta, Indonesia" },
      { key: "qr", x: 180, y: 645, fontSize: 80, color: "#000000", fontWeight: "normal", align: "center" },
      { key: "qrText", x: 180, y: 705, fontSize: 10, color: "#64748b", fontWeight: "normal", align: "center", text: "SCAN UNTUK VERIFIKASI" },
      { key: "signer1Name", x: 450, y: 670, fontSize: 16, color: "#0D1B2A", fontWeight: "bold", align: "center", text: "NAMA KETUA PANITIA" },
      { key: "signer1Title", x: 450, y: 695, fontSize: 14, color: "#475569", fontWeight: "normal", align: "center", text: "Jabatan" },
      { key: "signer2Name", x: 750, y: 670, fontSize: 16, color: "#0D1B2A", fontWeight: "bold", align: "center", text: "NAMA PIMPINAN INSTANSI" },
      { key: "signer2Title", x: 750, y: 695, fontSize: 14, color: "#475569", fontWeight: "normal", align: "center", text: "Jabatan" },
      { key: "serial", x: 1020, y: 730, fontSize: 12, color: "#64748b", fontWeight: "normal", align: "right", text: "SK-2026-0001" },
      { key: "logo", x: 970, y: 120, width: 80, height: 80, fileUrl: "", hidden: false },
    ]
  },
  {
    name: "Modern Appreciation",
    fileUrl: "/templates/sertifikat2.svg",
    fields: [
      { key: "ornament", x: 561, y: 120, fontSize: 32, color: "#D4AF37", fontWeight: "normal", align: "center", text: "✦" },
      { key: "title", x: 561, y: 180, fontSize: 48, color: "#FFFFFF", fontWeight: "bold", align: "center", text: "SERTIFIKAT" },
      { key: "subtitle", x: 561, y: 240, fontSize: 18, color: "#D4AF37", fontWeight: "bold", align: "center", text: "DIBERIKAN KEPADA" },
      { key: "name", x: 561, y: 340, fontSize: 44, color: "#D4AF37", fontWeight: "normal", align: "center", text: "Nama Peserta" },
      { key: "participation", x: 561, y: 410, fontSize: 14, color: "#E2E8F0", fontWeight: "normal", align: "center", text: "ATAS PARTISIPASINYA SEBAGAI" },
      { key: "event", x: 561, y: 460, fontSize: 24, color: "#FFFFFF", fontWeight: "bold", align: "center", text: "Webinar Nasional Desain UI/UX 2026" },
      { key: "divider", x: 561, y: 505, fontSize: 16, color: "#D4AF37", fontWeight: "normal", align: "center", text: "— — — — — — — — — — — — — — —" },
      { key: "date", x: 480, y: 540, fontSize: 14, color: "#E2E8F0", fontWeight: "normal", align: "right", text: "12 Juni 2026" },
      { key: "location", x: 640, y: 540, fontSize: 14, color: "#E2E8F0", fontWeight: "normal", align: "left", text: "Jakarta, Indonesia" },
      { key: "qr", x: 180, y: 645, fontSize: 80, color: "#000000", fontWeight: "normal", align: "center" },
      { key: "qrText", x: 180, y: 705, fontSize: 10, color: "#94A3B8", fontWeight: "normal", align: "center", text: "SCAN UNTUK VERIFIKASI" },
      { key: "signer1Name", x: 450, y: 670, fontSize: 16, color: "#FFFFFF", fontWeight: "bold", align: "center", text: "NAMA KETUA PANITIA" },
      { key: "signer1Title", x: 450, y: 695, fontSize: 14, color: "#E2E8F0", fontWeight: "normal", align: "center", text: "Jabatan" },
      { key: "signer2Name", x: 750, y: 670, fontSize: 16, color: "#FFFFFF", fontWeight: "bold", align: "center", text: "NAMA PIMPINAN INSTANSI" },
      { key: "signer2Title", x: 750, y: 695, fontSize: 14, color: "#E2E8F0", fontWeight: "normal", align: "center", text: "Jabatan" },
      { key: "serial", x: 1020, y: 730, fontSize: 12, color: "#E2E8F0", fontWeight: "normal", align: "right", text: "SK-2026-0001" },
      { key: "logo", x: 970, y: 120, width: 80, height: 80, fileUrl: "", hidden: false },
    ]
  },
  {
    name: "Elegan Navy Gold",
    fileUrl: "/templates/elegan-navy-gold.svg",
    fields: [
      { key: "name", x: 561, y: 350, fontSize: 38, color: "#D4AF37", fontWeight: "bold", align: "center" },
      { key: "event", x: 561, y: 530, fontSize: 24, color: "#0D1B2A", fontWeight: "bold", align: "center" },
      { key: "date", x: 561, y: 580, fontSize: 18, color: "#475569", fontWeight: "normal", align: "center" },
      { key: "serial", x: 120, y: 730, fontSize: 12, color: "#475569", fontWeight: "normal", align: "left" },
      { key: "qr", x: 1000, y: 680, fontSize: 80, color: "#000000", fontWeight: "normal", align: "center" }
    ]
  },
  {
    name: "Luxury Achievement",
    fileUrl: "/templates/luxury-achievement.svg",
    fields: [
      { key: "name", x: 561, y: 350, fontSize: 38, color: "#D4AF37", fontWeight: "bold", align: "center" },
      { key: "event", x: 561, y: 530, fontSize: 24, color: "#FFFFFF", fontWeight: "bold", align: "center" },
      { key: "date", x: 561, y: 580, fontSize: 18, color: "#D4AF37", fontWeight: "normal", align: "center" },
      { key: "serial", x: 120, y: 730, fontSize: 12, color: "#FFFFFF", fontWeight: "normal", align: "left" },
      { key: "qr", x: 1000, y: 680, fontSize: 80, color: "#000000", fontWeight: "normal", align: "center" }
    ]
  },
  {
    name: "Elegant Gold",
    fileUrl: "/templates/elegant-gold.svg",
    fields: [
      { key: "name", x: 561, y: 310, fontSize: 36, color: "#1E293F", fontWeight: "bold", align: "center" },
      { key: "event", x: 561, y: 380, fontSize: 18, color: "#5A6B8C", fontWeight: "normal", align: "center" },
      { key: "date", x: 561, y: 430, fontSize: 16, color: "#5A6B8C", fontWeight: "normal", align: "center" },
      { key: "serial", x: 150, y: 700, fontSize: 12, color: "#5A6B8C", fontWeight: "normal", align: "left" },
      { key: "qr", x: 972, y: 644, fontSize: 90, color: "#000000", fontWeight: "normal", align: "center" }
    ]
  },
  {
    name: "Modern Appreciation (Vector)",
    fileUrl: "/templates/modern-appreciation.svg",
    fields: [
      { key: "name", x: 561, y: 350, fontSize: 38, color: "#D4AF37", fontWeight: "bold", align: "center" },
      { key: "event", x: 561, y: 530, fontSize: 24, color: "#0D1B2A", fontWeight: "bold", align: "center" },
      { key: "date", x: 561, y: 580, fontSize: 18, color: "#475569", fontWeight: "normal", align: "center" },
      { key: "serial", x: 120, y: 730, fontSize: 12, color: "#475569", fontWeight: "normal", align: "left" },
      { key: "qr", x: 1000, y: 680, fontSize: 80, color: "#000000", fontWeight: "normal", align: "center" }
    ]
  }
];

export default async function GeneratorPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  // Fetch events, batches, user info
  const [events, recentBatches, user] = await Promise.all([
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
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    }),
  ]);

  // Fetch templates and ensure default templates exist
  let templates = await prisma.template.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });

  // Deduplicate securely, updating batch relationships to prevent foreign key errors
  const templatesByUrl = new Map<string, typeof templates>();
  for (const t of templates) {
    if (!templatesByUrl.has(t.fileUrl)) {
      templatesByUrl.set(t.fileUrl, []);
    }
    templatesByUrl.get(t.fileUrl)!.push(t);
  }

  let dbMutated = false;
  for (const [url, list] of templatesByUrl.entries()) {
    if (list.length > 1) {
      // Find how many batches reference each template
      const counts = await Promise.all(
        list.map(async (t) => {
          const batchCount = await prisma.batch.count({ where: { templateId: t.id } });
          return { template: t, batchCount };
        })
      );

      // Prioritize keeping the template with the most batches, then the oldest one
      counts.sort((a, b) => {
        if (b.batchCount !== a.batchCount) {
          return b.batchCount - a.batchCount;
        }
        return a.template.createdAt.getTime() - b.template.createdAt.getTime();
      });

      const survivor = counts[0].template;
      const duplicates = counts.slice(1);

      for (const dup of duplicates) {
        // Relocate batches from duplicate to survivor
        await prisma.batch.updateMany({
          where: { templateId: dup.template.id },
          data: { templateId: survivor.id }
        });

        // Safely delete duplicate
        await prisma.template.delete({
          where: { id: dup.template.id }
        });
      }
      dbMutated = true;
    }
  }

  if (dbMutated) {
    // Re-fetch templates
    templates = await prisma.template.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
    });
  }

  // Seed missing defaults
  const missingDefaults = DEFAULT_TEMPLATES.filter(
    def => !templates.some(t => t.fileUrl === def.fileUrl)
  );

  if (missingDefaults.length > 0) {
    for (const def of missingDefaults) {
      await prisma.template.create({
        data: {
          name: def.name,
          fileUrl: def.fileUrl,
          fields: def.fields,
          userId: session.user.id,
          width: 1122,
          height: 794
        }
      });
    }

    // Re-fetch clean list after seeding
    templates = await prisma.template.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
  } else {
    // Sort templates to newest first
    templates.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  const userPlan = user?.plan || "FREE";

  // Serialize to keep only necessary properties
  const serializedTemplates = templates.map(t => ({
    id: t.id,
    name: t.name,
    fileUrl: t.fileUrl,
  }));

  return (
    <GeneratorClient
      events={events}
      recentBatches={recentBatches}
      templates={serializedTemplates}
      userPlan={userPlan}
    />
  );
}
