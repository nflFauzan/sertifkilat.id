import type { PricingTier } from "@/types";

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "free",
    name: "Free",
    priceMonthly: 0,
    priceYearly: 0,
    description: "Untuk mencoba dan proyek kecil",
    features: [
      "Maksimum 25 peserta per batch",
      "Maksimum 1 active template",
      "Basic certificate generation",
      "Standard QR verification",
      "Unduh sertifikat PDF",
    ],
    cta: "Start Free",
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    priceMonthly: 149000,
    priceYearly: 119200,
    description: "Untuk panitia aktif dan event menengah",
    features: [
      "Maksimum 150 peserta per batch",
      "Hingga 5 active template",
      "Premium Templates (Unlocked)",
      "Bulk Export ZIP",
      "Standard QR verification",
      "Email support",
    ],
    cta: "Upgrade to Pro",
    highlighted: true,
  },
  {
    id: "business",
    name: "Business",
    priceMonthly: 379000,
    priceYearly: 303200,
    description: "Untuk institusi dan event berskala besar",
    features: [
      "Unlimited participants",
      "Unlimited active templates",
      "Premium Templates (Unlocked)",
      "Bulk Export ZIP & Excel",
      "Verification QR + Analytics",
      "Priority Support (24/7)",
    ],
    cta: "Upgrade to Business",
    highlighted: false,
  },
];
