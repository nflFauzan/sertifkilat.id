"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import fs from "fs/promises";
import path from "path";

// Helper to save uploaded file
async function saveUploadedFile(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Define upload path
  const uploadDir = path.join(process.cwd(), "public", "uploads", "templates");
  
  // Ensure directory exists
  await fs.mkdir(uploadDir, { recursive: true });

  // Generate unique filename
  const ext = path.extname(file.name) || ".png";
  const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;
  const filePath = path.join(uploadDir, filename);

  // Write file
  await fs.writeFile(filePath, buffer);

  // Return public URL path
  return `/uploads/templates/${filename}`;
}

export async function createTemplateAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const name = formData.get("name") as string;
  const eventId = formData.get("eventId") as string || null;
  const file = formData.get("file") as File;

  if (!name || !file || file.size === 0) {
    return { error: "Nama template dan file gambar wajib diisi" };
  }

  try {
    const fileUrl = await saveUploadedFile(file);

    // Default fields: name, event date, verify code/qr
    const defaultFields = [
      { key: "name", x: 400, y: 300, fontSize: 32, color: "#1e293b", fontWeight: "bold", align: "center" },
      { key: "event", x: 400, y: 380, fontSize: 18, color: "#475569", fontWeight: "normal", align: "center" },
      { key: "date", x: 400, y: 440, fontSize: 16, color: "#475569", fontWeight: "normal", align: "center" },
      { key: "serial", x: 100, y: 700, fontSize: 12, color: "#64748b", fontWeight: "normal", align: "left" },
      { key: "qr", x: 900, y: 650, fontSize: 100, color: "#000000", fontWeight: "normal", align: "center" }, // width/height is mapped to fontSize in QR
    ];

    const template = await prisma.template.create({
      data: {
        name,
        fileUrl,
        eventId: eventId || undefined,
        userId: session.user.id,
        fields: defaultFields,
      },
    });

    revalidatePath("/dashboard/templates");
    return { success: true, templateId: template.id };
  } catch (error) {
    console.error("Error creating template:", error);
    const err = error as { message?: string };
    return { error: err.message || "Gagal membuat template" };
  }
}

export async function updateTemplateFieldsAction(id: string, fields: unknown) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  try {
    // Verify ownership
    const template = await prisma.template.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!template) return { error: "Template tidak ditemukan" };

    await prisma.template.update({
      where: { id },
      data: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fields: fields as any,
      },
    });

    revalidatePath(`/dashboard/templates/${id}`);
    revalidatePath("/dashboard/templates");
    return { success: true };
  } catch (error) {
    console.error("Error updating template fields:", error);
    const err = error as { message?: string };
    return { error: err.message || "Gagal memperbarui tata letak template" };
  }
}

export async function deleteTemplateAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  try {
    // Verify ownership
    const template = await prisma.template.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!template) return { error: "Template tidak ditemukan" };

    // Delete record from database
    await prisma.template.delete({ where: { id } });

    // Optional: try to delete the physical file
    try {
      const filePath = path.join(process.cwd(), "public", template.fileUrl);
      await fs.unlink(filePath);
    } catch {
      // Ignore if file doesn't exist on disk
    }

    revalidatePath("/dashboard/templates");
    return { success: true };
  } catch (error) {
    console.error("Error deleting template:", error);
    const err = error as { message?: string };
    return { error: err.message || "Gagal menghapus template" };
  }
}
