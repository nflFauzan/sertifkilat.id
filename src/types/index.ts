export interface Certificate {
  id: string;
  recipientName: string;
  eventName: string;
  issuer: string;
  date: string;
  issuedAt: string;
  templateName?: string;
  batchId?: string;
}

export interface Event {
  id: string;
  name: string;
  type: "webinar" | "pelatihan" | "lomba" | "lainnya";
  date: string;
  organizer: string;
  description?: string;
  participantCount: number;
  status: "aktif" | "selesai" | "draft";
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  eventId: string;
  certificateId?: string;
}

export interface PricingTier {
  id: string;
  name: string;
  priceMonthly: number | null;
  priceYearly: number | null;
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
  dark?: boolean;
}

export interface GenerationBatch {
  id: string;
  name: string;
  templateName: string;
  participantCount: number;
  status: "selesai" | "diproses" | "gagal";
  createdAt: string;
}
