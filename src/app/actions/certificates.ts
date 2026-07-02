"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { generateSerialNumber } from "@/lib/utils";

export async function generateCertificatesAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const eventId = formData.get("eventId") as string;
  const batchName = formData.get("batchName") as string;
  const csvData = formData.get("csvData") as string; // JSON string of participants
  const templateId = formData.get("templateId") as string | null;

  if (!eventId || !batchName || !csvData) {
    return { error: "Data tidak lengkap" };
  }

  // Verify event ownership
  const event = await prisma.event.findFirst({
    where: { id: eventId, userId: session.user.id },
  });
  if (!event) return { error: "Event tidak ditemukan" };

  let participants: Array<{ name: string; email: string }>;
  try {
    participants = JSON.parse(csvData);
  } catch {
    return { error: "Format data peserta tidak valid" };
  }

  if (!participants.length) return { error: "Tidak ada peserta" };

  // Get selected template, fallback to first user template, fallback to default template
  let template = null;
  if (templateId) {
    template = await prisma.template.findFirst({
      where: { id: templateId, userId: session.user.id },
    });
  }

  if (!template) {
    template = await prisma.template.findFirst({
      where: { userId: session.user.id },
    });
  }

  if (!template) {
    template = await prisma.template.create({
      data: {
        name: "Default Template",
        fileUrl: "/templates/default.png",
        userId: session.user.id,
      },
    });
  }

  // Get count of existing certificates to generate unique serial numbers
  const existingCertCount = await prisma.certificate.count();

  // Create batch
  const batch = await prisma.batch.create({
    data: {
      name: batchName,
      eventId,
      templateId: template.id,
      status: "PROCESSING",
      totalCount: participants.length,
    },
  });

  // Upsert participants and create certificates
  let successCount = 0;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  for (let i = 0; i < participants.length; i++) {
    const p = participants[i];
    if (!p.name || !p.email) continue;

    try {
      const participant = await prisma.participant.upsert({
        where: { eventId_email: { eventId, email: p.email } },
        update: { name: p.name },
        create: {
          name: p.name,
          email: p.email,
          eventId,
          rowIndex: i,
        },
      });

      const serial = generateSerialNumber(existingCertCount + i + 1);

      // Only create if serial doesn't exist
      const existingCert = await prisma.certificate.findUnique({
        where: { serialNumber: serial },
      });

      if (!existingCert) {
        await prisma.certificate.create({
          data: {
            serialNumber: serial,
            batchId: batch.id,
            participantId: participant.id,
            verifyUrl: `${appUrl}/verify/${serial}`,
            issuedAt: new Date(),
          },
        });
        successCount++;
      }
    } catch (e) {
      // Skip duplicates or errors
      console.error("Error creating certificate:", e);
    }
  }

  // Update batch status
  await prisma.batch.update({
    where: { id: batch.id },
    data: {
      status: successCount > 0 ? "DONE" : "FAILED",
      doneCount: successCount,
    },
  });

  revalidatePath("/dashboard/generator");
  revalidatePath("/dashboard");
  return { success: true, count: successCount, batchId: batch.id };
}

export async function getBatchCertificatesAction(batchId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
    include: {
      template: {
        select: {
          fileUrl: true,
          fields: true,
          width: true,
          height: true,
        },
      },
      event: {
        select: {
          name: true,
          date: true,
        },
      },
      certificates: {
        include: {
          participant: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!batch) return { error: "Batch tidak ditemukan" };

  return {
    success: true,
    batch: {
      name: batch.name,
      templateUrl: batch.template.fileUrl,
      templateFields: batch.template.fields || [],
      templateWidth: batch.template.width,
      templateHeight: batch.template.height,
      certificates: batch.certificates.map((c) => ({
        serial: c.serialNumber,
        name: c.participant.name,
        event: batch.event.name,
        date: batch.event.date.toISOString(),
        verifyUrl: c.verifyUrl || "",
      })),
    },
  };
}
