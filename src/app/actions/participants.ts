"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createParticipantAction(
  eventId: string,
  name: string,
  email: string,
  institution?: string,
  position?: string
) {
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
        extraData: {
          institution: institution || "",
          position: position || "",
        },
      },
    });

    revalidatePath(`/dashboard/events/${eventId}/participants`);
    return { success: true, participantId: participant.id };
  } catch (error) {
    console.error("Error creating participant:", error);
    const err = error as { code?: string; message?: string };
    if (err.code === "P2002") {
      return { error: "Gmail ini sudah terdaftar sebagai peserta di event ini" };
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

// Bulk delete participants action
export async function deleteParticipantsAction(ids: string[], eventId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  if (!ids.length || !eventId) {
    return { error: "Pilih minimal satu peserta untuk dihapus" };
  }

  try {
    // Verify event ownership
    const event = await prisma.event.findFirst({
      where: { id: eventId, userId: session.user.id },
    });
    if (!event) return { error: "Akses ditolak" };

    await prisma.participant.deleteMany({
      where: {
        id: { in: ids },
        eventId,
      },
    });

    revalidatePath(`/dashboard/events/${eventId}/participants`);
    return { success: true };
  } catch (error) {
    console.error("Error bulk deleting participants:", error);
    const err = error as { message?: string };
    return { error: err.message || "Gagal menghapus peserta terpilih" };
  }
}

// Validation action to preview imported rows
export async function validateParticipantsAction(
  eventId: string,
  rows: Array<{ name?: string; email?: string; institution?: string; position?: string }>
) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  try {
    // Verify event ownership
    const event = await prisma.event.findFirst({
      where: { id: eventId, userId: session.user.id },
    });
    if (!event) return { error: "Event tidak ditemukan" };

    // Fetch existing participant emails for this event
    const existingParticipants = await prisma.participant.findMany({
      where: { eventId },
      select: { email: true },
    });
    const existingEmails = new Set(existingParticipants.map((p) => p.email.toLowerCase()));

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const seenEmailsInFile = new Set<string>();

    let validRowsCount = 0;
    let invalidRowsCount = 0;
    let duplicateRowsCount = 0;

    const validatedRows = rows.map((row) => {
      const name = (row.name || "").trim();
      const email = (row.email || "").trim();
      const institution = (row.institution || "").trim();
      const position = (row.position || "").trim();

      const errors: string[] = [];
      let isDuplicate = false;

      // 1. Required columns check
      if (!name) {
        errors.push("Nama wajib diisi");
      }
      if (!email) {
        errors.push("Email wajib diisi");
      } else if (!emailRegex.test(email)) {
        // 2. Email format check
        errors.push("Format email tidak valid");
      } else {
        const lowerEmail = email.toLowerCase();
        // 3. Duplicate check in file
        if (seenEmailsInFile.has(lowerEmail)) {
          errors.push("Email duplikat di dalam file");
          isDuplicate = true;
        } else {
          seenEmailsInFile.add(lowerEmail);
        }

        // 4. Duplicate check in DB
        if (existingEmails.has(lowerEmail)) {
          errors.push("Email sudah terdaftar di event ini");
          isDuplicate = true;
        }
      }

      const isValid = errors.length === 0;
      if (isValid) {
        validRowsCount++;
      } else if (isDuplicate) {
        duplicateRowsCount++;
      } else {
        invalidRowsCount++;
      }

      return {
        name,
        email,
        institution,
        position,
        isValid,
        status: isValid ? "valid" : isDuplicate ? "duplicate" : "invalid",
        message: errors.join(", "),
      };
    });

    return {
      success: true,
      validatedRows,
      summary: {
        valid: validRowsCount,
        invalid: invalidRowsCount,
        duplicate: duplicateRowsCount,
      },
    };
  } catch (error) {
    console.error("Error validating participants:", error);
    return { error: "Terjadi kesalahan saat memvalidasi data" };
  }
}

// Transaction-based save action for valid rows only
export async function importValidParticipantsAction(
  eventId: string,
  participants: Array<{ name: string; email: string; institution: string; position: string }>
) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  if (!eventId || !participants.length) {
    return { error: "Tidak ada data untuk diimpor" };
  }

  try {
    // Verify event ownership
    const event = await prisma.event.findFirst({
      where: { id: eventId, userId: session.user.id },
    });
    if (!event) return { error: "Event tidak ditemukan" };

    // Get current participant count to assign correct rowIndex
    const existingCount = await prisma.participant.count({
      where: { eventId },
    });

    // Execute in a transaction
    const result = await prisma.$transaction(async (tx) => {
      let insertedCount = 0;

      for (let i = 0; i < participants.length; i++) {
        const p = participants[i];

        // Double check uniqueness to prevent constraint violations
        const existing = await tx.participant.findUnique({
          where: { eventId_email: { eventId, email: p.email } },
        });

        if (existing) continue;

        await tx.participant.create({
          data: {
            name: p.name,
            email: p.email,
            eventId,
            rowIndex: existingCount + insertedCount,
            extraData: {
              institution: p.institution,
              position: p.position,
            },
          },
        });
        insertedCount++;
      }

      return insertedCount;
    });

    revalidatePath(`/dashboard/events/${eventId}/participants`);
    return { success: true, count: result };
  } catch (error) {
    console.error("Error importing participants in transaction:", error);
    return { error: "Gagal menyimpan data peserta ke database" };
  }
}
