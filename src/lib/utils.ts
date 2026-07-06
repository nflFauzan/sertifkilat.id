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
export function formatDate(
  date: Date | string,
  formatOverride?: string,
  timezoneOverride?: string,
  langOverride?: string
): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  let format = "DD Month YYYY";
  let tz = "Asia/Jakarta";
  let lang = "id";

  if (typeof window !== "undefined") {
    format = window.localStorage.getItem("settings_date_format") || format;
    tz = window.localStorage.getItem("settings_timezone") || tz;
    lang = window.localStorage.getItem("settings_lang") || lang;
  }

  if (formatOverride) format = formatOverride;
  if (timezoneOverride) tz = timezoneOverride;
  if (langOverride) lang = langOverride;

  const locale = lang === "en" ? "en-US" : "id-ID";

  try {
    const parts = new Intl.DateTimeFormat(locale, {
      timeZone: tz,
      year: "numeric",
      month: "long",
      day: "numeric",
    }).formatToParts(d);

    const yearVal = parts.find(p => p.type === "year")?.value || String(d.getFullYear());
    const monthName = parts.find(p => p.type === "month")?.value || "";
    const dayVal = parts.find(p => p.type === "day")?.value || String(d.getDate());

    if (format === "YYYY-MM-DD") {
      const numericParts = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).formatToParts(d);
      const y = numericParts.find(p => p.type === "year")?.value || String(d.getFullYear());
      const m = numericParts.find(p => p.type === "month")?.value || String(d.getMonth() + 1).padStart(2, "0");
      const day = numericParts.find(p => p.type === "day")?.value || String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    }

    if (format === "Month DD, YYYY") {
      return `${monthName} ${dayVal}, ${yearVal}`;
    }

    return `${dayVal} ${monthName} ${yearVal}`;
  } catch (e) {
    console.error("formatDate error:", e);
    return d.toDateString();
  }
}

export function formatDateShort(
  date: Date | string,
  formatOverride?: string,
  timezoneOverride?: string,
  langOverride?: string
): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  let format = "DD Month YYYY";
  let tz = "Asia/Jakarta";
  let lang = "id";

  if (typeof window !== "undefined") {
    format = window.localStorage.getItem("settings_date_format") || format;
    tz = window.localStorage.getItem("settings_timezone") || tz;
    lang = window.localStorage.getItem("settings_lang") || lang;
  }

  if (formatOverride) format = formatOverride;
  if (timezoneOverride) tz = timezoneOverride;
  if (langOverride) lang = langOverride;

  const locale = lang === "en" ? "en-US" : "id-ID";

  try {
    const parts = new Intl.DateTimeFormat(locale, {
      timeZone: tz,
      year: "numeric",
      month: "short",
      day: "numeric",
    }).formatToParts(d);

    const yearVal = parts.find(p => p.type === "year")?.value || String(d.getFullYear());
    const monthName = parts.find(p => p.type === "month")?.value || "";
    const dayVal = parts.find(p => p.type === "day")?.value || String(d.getDate());

    if (format === "YYYY-MM-DD") {
      const numericParts = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).formatToParts(d);
      const y = numericParts.find(p => p.type === "year")?.value || String(d.getFullYear());
      const m = numericParts.find(p => p.type === "month")?.value || String(d.getMonth() + 1).padStart(2, "0");
      const day = numericParts.find(p => p.type === "day")?.value || String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    }

    if (format === "Month DD, YYYY") {
      return `${monthName} ${dayVal}, ${yearVal}`;
    }

    return `${dayVal} ${monthName} ${yearVal}`;
  } catch (e) {
    console.error("formatDateShort error:", e);
    return d.toDateString();
  }
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
