// ──────────────────────────────────────────────
// Domain: Landing Page Entities
// ──────────────────────────────────────────────

export interface Feature {
  id: string;
  icon: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  clinic: string;
  content: string;
  initials: string;
  rating: number;
}

export interface PricingPlan {
  id: string;
  nameKey: string;
  price: number | null;
  descriptionKey: string;
  featuresKeys: string[];
  highlighted: boolean;
  ctaKey: string;
}
