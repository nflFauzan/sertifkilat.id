import { type ClassValue, clsx } from "clsx";

// ─── cn() — conditional classnames ───────────────────────────────────────────
// Note: clsx is lightweight, no need for tailwind-merge with Tailwind v4
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// ─── Format currency IDR ──────────────────────────────────────────────────────
export function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

// ─── Format date ──────────────────────────────────────────────────────────────
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateShort(date: Date | string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

// ─── Generate serial number ───────────────────────────────────────────────────
export function generateSerialNumber(index: number): string {
  const year = new Date().getFullYear();
  const padded = String(index).padStart(4, "0");
  return `SK-${year}-${padded}`;
}

// ─── Truncate string ─────────────────────────────────────────────────────────
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

// ─── Get initials ────────────────────────────────────────────────────────────
export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

// ─── Event type label ─────────────────────────────────────────────────────────
export const EVENT_TYPE_LABELS: Record<string, string> = {
  WEBINAR: "Webinar",
  PELATIHAN: "Pelatihan",
  LOMBA: "Lomba",
  SEMINAR: "Seminar",
  WORKSHOP: "Workshop",
  LAINNYA: "Lainnya",
};

export const EVENT_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  ACTIVE: "Aktif",
  COMPLETED: "Selesai",
  ARCHIVED: "Diarsipkan",
};

export const BATCH_STATUS_LABELS: Record<string, string> = {
  PENDING: "Menunggu",
  PROCESSING: "Diproses",
  DONE: "Selesai",
  FAILED: "Gagal",
};
