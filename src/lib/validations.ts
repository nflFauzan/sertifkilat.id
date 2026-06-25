import { z } from "zod";

// ─── AUTH ────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(100),
  email: z.string().email("Email tidak valid"),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .regex(/[A-Z]/, "Harus ada huruf kapital")
    .regex(/[0-9]/, "Harus ada angka"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
});

// ─── EVENT ───────────────────────────────────────────────────────────────────

export const eventSchema = z.object({
  name: z.string().min(3, "Nama event minimal 3 karakter").max(200),
  description: z.string().max(2000).optional(),
  type: z.enum(["WEBINAR", "PELATIHAN", "LOMBA", "SEMINAR", "WORKSHOP", "LAINNYA"]),
  date: z.string().min(1, "Tanggal wajib diisi"),
  location: z.string().max(200).optional(),
});

// ─── TEMPLATE ─────────────────────────────────────────────────────────────────

export const templateFieldSchema = z.object({
  key: z.string(), // e.g. "name", "event", "date"
  x: z.number(),
  y: z.number(),
  fontSize: z.number().default(24),
  color: z.string().default("#000000"),
  fontWeight: z.enum(["normal", "bold"]).default("normal"),
  align: z.enum(["left", "center", "right"]).default("center"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type EventInput = z.infer<typeof eventSchema>;
export type TemplateField = z.infer<typeof templateFieldSchema>;
