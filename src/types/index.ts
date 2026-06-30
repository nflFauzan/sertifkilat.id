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
