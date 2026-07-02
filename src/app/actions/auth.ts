"use server";

import { prisma } from "@/lib/db";
import { registerSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";

export async function registerAction(formData: FormData) {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Gmail sudah terdaftar" };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: { name, email, password: hashedPassword },
  });

  return { success: true };
}

export async function checkGoogleConfig() {
  const id = process.env.GOOGLE_CLIENT_ID;
  const secret = process.env.GOOGLE_CLIENT_SECRET;
  if (!id || !secret) return false;
  const cleanId = id.trim().toLowerCase();
  const cleanSecret = secret.trim().toLowerCase();
  if (
    cleanId === "" ||
    cleanId === "missing-client-id" ||
    cleanId.includes("your-google-client-id") ||
    cleanId.includes("placeholder")
  ) {
    return false;
  }
  if (
    cleanSecret === "" ||
    cleanSecret === "missing-client-secret" ||
    cleanSecret.includes("your-google-client-secret") ||
    cleanSecret.includes("placeholder")
  ) {
    return false;
  }
  return true;
}

export async function getMissingGoogleConfig() {
  const missing: string[] = [];
  const id = process.env.GOOGLE_CLIENT_ID;
  const secret = process.env.GOOGLE_CLIENT_SECRET;

  const isInvalidId =
    !id ||
    id.trim() === "" ||
    id === "missing-client-id" ||
    id.includes("your-google-client-id") ||
    id.includes("placeholder");

  const isInvalidSecret =
    !secret ||
    secret.trim() === "" ||
    secret === "missing-client-secret" ||
    secret.includes("your-google-client-secret") ||
    secret.includes("placeholder");

  if (isInvalidId) missing.push("GOOGLE_CLIENT_ID");
  if (isInvalidSecret) missing.push("GOOGLE_CLIENT_SECRET");

  return {
    isConfigured: missing.length === 0,
    missing,
  };
}
