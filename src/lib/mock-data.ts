import type { Certificate, PricingTier, GenerationBatch } from "@/types";

export const VALID_CERTIFICATES: Record<string, Certificate> = {
  "SK-2026-0001": {
    id: "SK-2026-0001",
    recipientName: "Bagas Santoso",
    eventName: "Webinar Nasional Desain UI/UX 2026",
    issuer: "KelasOnline.id",
    date: "12 Juni 2026",
    issuedAt: "2026-06-12",
    templateName: "Elegant Gold",
    batchId: "batch-001",
  },
  "SK-2026-0002": {
    id: "SK-2026-0002",
    recipientName: "Dini Rahmawati",
    eventName: "Pelatihan Manajemen Talenta Digital",
    issuer: "Studio Kreatif Nusantara",
    date: "5 Mei 2026",
    issuedAt: "2026-05-05",
    templateName: "Classic Blue",
    batchId: "batch-002",
  },
  "SK-2026-0003": {
    id: "SK-2026-0003",
    recipientName: "Putri Lestari",
    eventName: "Lomba Karya Tulis Nasional 2026",
    issuer: "EduCamp Indonesia",
    date: "20 April 2026",
    issuedAt: "2026-04-20",
    templateName: "Minimal Mono",
    batchId: "batch-003",
  },
};

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "gratis",
    name: "Gratis",
    priceMonthly: 0,
    priceYearly: 0,
    description: "Untuk mencoba dan proyek kecil",
    features: [
      "25 sertifikat per bulan",
      "1 desain aktif",
      "QR verifikasi publik",
      "Unduh sebagai PNG",
      "Dukungan komunitas",
    ],
    cta: "Mulai Gratis",
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    priceMonthly: 149000,
    priceYearly: 119200,
    description: "Untuk tim event dan panitia aktif",
    features: [
      "500 sertifikat per bulan",
      "Semua template siap pakai",
      "QR verifikasi + analitik dasar",
      "Ekspor ZIP batch",
      "Branding khusus (logo & warna)",
      "Dukungan prioritas via email",
    ],
    cta: "Mulai Uji Coba 14 Hari",
    highlighted: true,
  },
  {
    id: "bisnis",
    name: "Bisnis",
    priceMonthly: 379000,
    priceYearly: 303200,
    description: "Untuk HR, divisi pelatihan, dan institusi",
    features: [
      "2.000 sertifikat per bulan",
      "Semua fitur Pro",
      "Kirim ke email peserta (blast)",
      "Analitik lanjutan & ekspor CSV",
      "Akses API & webhook",
      "Onboarding terdampingi",
    ],
    cta: "Hubungi Sales",
    highlighted: false,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    priceMonthly: null,
    priceYearly: null,
    description: "Skala penuh, kontrak kustom",
    features: [
      "Sertifikat tak terbatas",
      "Semua fitur Bisnis",
      "Custom domain verifikasi",
      "SLA 99.9% uptime",
      "Dedicated success manager",
      "Kontrak & faktur kustom",
    ],
    cta: "Jadwalkan Demo",
    highlighted: false,
    dark: true,
  },
];

export const RECENT_BATCHES: GenerationBatch[] = [
  {
    id: "batch-001",
    name: "Webinar Desain UI/UX",
    templateName: "Elegant Gold",
    participantCount: 248,
    status: "selesai",
    createdAt: "22 Jun 2026",
  },
  {
    id: "batch-002",
    name: "Lomba Karya Tulis Nasional",
    templateName: "Classic Blue",
    participantCount: 96,
    status: "diproses",
    createdAt: "21 Jun 2026",
  },
  {
    id: "batch-003",
    name: "Pelatihan Internal Q2",
    templateName: "Minimal Mono",
    participantCount: 54,
    status: "selesai",
    createdAt: "19 Jun 2026",
  },
];

export const MOCK_PARTICIPANTS = [
  { nama: "Bagas Santoso", email: "bagas@kelasonline.id", acara: "Webinar UI/UX", tanggal: "12 Jun 2026" },
  { nama: "Dini Rahmawati", email: "dini@ngomestic.org", acara: "Webinar UI/UX", tanggal: "12 Jun 2026" },
  { nama: "Putri Lestari", email: "putri@skn.co.id", acara: "Webinar UI/UX", tanggal: "12 Jun 2026" },
];
