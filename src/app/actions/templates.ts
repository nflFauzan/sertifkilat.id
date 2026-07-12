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

  // Get user plan from DB (Single Source of Truth)
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  });
  const userPlan = dbUser?.plan || "FREE";

  if (userPlan === "FREE") {
    return { error: "Paket FREE tidak mendukung unggah template kustom. Silakan upgrade paket Anda." };
  }

  if (userPlan === "PRO") {
    const customTemplatesCount = await prisma.template.count({
      where: {
        userId: session.user.id,
        NOT: {
          fileUrl: {
            startsWith: "/templates/",
          },
        },
      },
    });
    if (customTemplatesCount >= 5) {
      return { error: "Batas maksimal template kustom untuk paket PRO Anda adalah 5 template. Silakan upgrade ke paket BUSINESS untuk template kustom tak terbatas." };
    }
  }

  try {
    // 1. Define all default certificate fields (A4 Landscape 1122x794 coords)
    const defaultFields = [
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
    ];

    // 2. Create the template in the database first to get the ID
    const template = await prisma.template.create({
      data: {
        name,
        fileUrl: "", // temp
        eventId: eventId || undefined,
        userId: session.user.id,
        fields: defaultFields,
      },
    });

    // 3. Save uploaded file to: /public/uploads/templates/sertifikat/{userId}/{templateId}/background.png
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "templates",
      "sertifikat",
      session.user.id,
      template.id
    );
    
    // Ensure directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    // Use name background with original file extension
    const ext = path.extname(file.name) || ".png";
    const filename = `background${ext}`;
    const filePath = path.join(uploadDir, filename);

    // Write file
    await fs.writeFile(filePath, buffer);

    const fileUrl = `/uploads/templates/sertifikat/${session.user.id}/${template.id}/${filename}`;

    // 4. Update the template's fileUrl with the correct path
    await prisma.template.update({
      where: { id: template.id },
      data: { fileUrl },
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
