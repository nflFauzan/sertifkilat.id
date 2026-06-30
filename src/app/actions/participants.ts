"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// ─── Create single participant ─────────────────────────────────────────────────
export async function createParticipantAction(
  eventId: string,
  name: string,
  email: string,
  institution?: string,
  position?: string
) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  if (!eventId || !name.trim() || !email.trim()) {
    return { error: "Nama dan Gmail wajib diisi" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { error: "Format Gmail tidak valid" };
  }

  try {
    const event = await prisma.event.findFirst({
      where: { id: eventId, userId: session.user.id },
    });
    if (!event) return { error: "Event tidak ditemukan" };

    const existingCount = await prisma.participant.count({ where: { eventId } });

    const extraData: Record<string, string> = {};
    if (institution?.trim()) extraData.institution = institution.trim();
    if (position?.trim()) extraData.position = position.trim();

    await prisma.participant.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        eventId,
        rowIndex: existingCount,
        extraData: Object.keys(extraData).length ? extraData : undefined,
      },
    });

    revalidatePath(`/dashboard/events/${eventId}/participants`);
    return { success: true };
  } catch (error) {
    const err = error as { code?: string; message?: string };
    if (err.code === "P2002") {
      return { error: "Gmail ini sudah terdaftar sebagai peserta di event ini" };
    }
    console.error("Error creating participant:", error);
    return { error: "Gagal menambah peserta" };
  }
}

// ─── Validated row from Excel parse ──────────────────────────────────────────
export type ImportRow = {
  name: string;
  email: string;
  institution: string;
  position: string;
  valid: boolean;
  errors: string[];
};

// ─── Batch import (only valid rows, transaction) ─────────────────────────────
export async function batchImportParticipantsAction(
  eventId: string,
  rows: ImportRow[]
) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  if (!eventId || !rows.length) {
    return { error: "Data tidak lengkap" };
  }

  const validRows = rows.filter((r) => r.valid);
  if (!validRows.length) {
    return { error: "Tidak ada baris data yang valid untuk diimpor" };
  }

  try {
    const event = await prisma.event.findFirst({
      where: { id: eventId, userId: session.user.id },
    });
    if (!event) return { error: "Event tidak ditemukan" };

    // Fetch existing emails to skip true duplicates already in DB
    const existingEmails = await prisma.participant.findMany({
      where: { eventId },
      select: { email: true, rowIndex: true },
    });
    const existingEmailSet = new Set(existingEmails.map((e) => e.email.toLowerCase()));
    const currentMaxIndex = existingEmails.reduce(
      (max, e) => Math.max(max, e.rowIndex),
      -1
    );

    const toInsert = validRows.filter(
      (r) => !existingEmailSet.has(r.email.toLowerCase())
    );

    if (!toInsert.length) {
      return { success: true, count: 0, skipped: validRows.length };
    }

    // Use a transaction to insert all new participants atomically
    await prisma.$transaction(
      toInsert.map((r, i) => {
        const extraData: Record<string, string> = {};
        if (r.institution) extraData.institution = r.institution;
        if (r.position) extraData.position = r.position;

        return prisma.participant.create({
          data: {
            name: r.name.trim(),
            email: r.email.trim().toLowerCase(),
            eventId,
            rowIndex: currentMaxIndex + 1 + i,
            extraData: Object.keys(extraData).length ? extraData : undefined,
          },
        });
      })
    );

    revalidatePath(`/dashboard/events/${eventId}/participants`);
    return {
      success: true,
      count: toInsert.length,
      skipped: validRows.length - toInsert.length,
    };
  } catch (error) {
    console.error("Error batch importing participants:", error);
    const err = error as { message?: string };
    return { error: err.message || "Gagal mengimpor data peserta" };
  }
}

// ─── Delete single participant ────────────────────────────────────────────────
export async function deleteParticipantAction(id: string, eventId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  try {
    const event = await prisma.event.findFirst({
      where: { id: eventId, userId: session.user.id },
    });
    if (!event) return { error: "Akses ditolak" };

    await prisma.participant.delete({ where: { id } });

    revalidatePath(`/dashboard/events/${eventId}/participants`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting participant:", error);
    return { error: "Gagal menghapus peserta" };
  }
}

// ─── Bulk delete participants ─────────────────────────────────────────────────
export async function bulkDeleteParticipantsAction(
  ids: string[],
  eventId: string
) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  if (!ids.length) return { error: "Tidak ada peserta yang dipilih" };

  try {
    const event = await prisma.event.findFirst({
      where: { id: eventId, userId: session.user.id },
    });
    if (!event) return { error: "Akses ditolak" };

    await prisma.participant.deleteMany({
      where: { id: { in: ids }, eventId },
    });

    revalidatePath(`/dashboard/events/${eventId}/participants`);
    return { success: true, count: ids.length };
  } catch (error) {
    console.error("Error bulk deleting participants:", error);
    return { error: "Gagal menghapus peserta yang dipilih" };
  }
}
