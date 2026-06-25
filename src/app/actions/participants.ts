"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createParticipantAction(eventId: string, name: string, email: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  if (!eventId || !name || !email) {
    return { error: "Semua field wajib diisi" };
  }

  try {
    // Verify event ownership
    const event = await prisma.event.findFirst({
      where: { id: eventId, userId: session.user.id },
    });
    if (!event) return { error: "Event tidak ditemukan" };

    // Get number of existing participants to assign rowIndex
    const existingCount = await prisma.participant.count({
      where: { eventId },
    });

    const participant = await prisma.participant.create({
      data: {
        name,
        email,
        eventId,
        rowIndex: existingCount,
      },
    });

    revalidatePath(`/dashboard/events/${eventId}/participants`);
    return { success: true, participantId: participant.id };
  } catch (error) {
    console.error("Error creating participant:", error);
    const err = error as { code?: string; message?: string };
    if (err.code === "P2002") {
      return { error: "Email ini sudah terdaftar sebagai peserta di event ini" };
    }
    return { error: err.message || "Gagal menambah peserta" };
  }
}

export async function deleteParticipantAction(id: string, eventId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  try {
    // Verify event ownership
    const event = await prisma.event.findFirst({
      where: { id: eventId, userId: session.user.id },
    });
    if (!event) return { error: "Akses ditolak" };

    await prisma.participant.delete({
      where: { id },
    });

    revalidatePath(`/dashboard/events/${eventId}/participants`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting participant:", error);
    const err = error as { message?: string };
    return { error: err.message || "Gagal menghapus peserta" };
  }
}

export async function batchImportParticipantsAction(
  eventId: string,
  participants: Array<{ name: string; email: string }>
) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  if (!eventId || !participants.length) {
    return { error: "Data tidak lengkap" };
  }

  try {
    // Verify event ownership
    const event = await prisma.event.findFirst({
      where: { id: eventId, userId: session.user.id },
    });
    if (!event) return { error: "Event tidak ditemukan" };

    const existingCount = await prisma.participant.count({
      where: { eventId },
    });

    let successCount = 0;
    for (let i = 0; i < participants.length; i++) {
      const p = participants[i];
      if (!p.name || !p.email) continue;

      try {
        await prisma.participant.upsert({
          where: { eventId_email: { eventId, email: p.email } },
          update: { name: p.name },
          create: {
            name: p.name,
            email: p.email,
            eventId,
            rowIndex: existingCount + i,
          },
        });
        successCount++;
      } catch (e) {
        console.error("Error importing batch participant:", e);
      }
    }

    revalidatePath(`/dashboard/events/${eventId}/participants`);
    return { success: true, count: successCount };
  } catch (error) {
    console.error("Error batch importing participants:", error);
    const err = error as { message?: string };
    return { error: err.message || "Gagal mengimpor data peserta" };
  }
}
