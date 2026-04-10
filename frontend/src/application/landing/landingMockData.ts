// ──────────────────────────────────────────────
// Application: Landing Page Mock Data
// ──────────────────────────────────────────────
import type { Feature, Testimonial, PricingPlan } from "@/domain/landing/types";

export const FEATURES: Feature[] = [
  { id: "scheduling", icon: "CalendarMonth" },
  { id: "patients", icon: "People" },
  { id: "billing", icon: "Receipt" },
  { id: "analytics", icon: "BarChart" },
  { id: "security", icon: "Security" },
  { id: "notifications", icon: "NotificationsActive" },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    name: "Dr. Sarah Mitchell",
    role: "Clinic Director",
    clinic: "Bright Smile Dental",
    content:
      "DentiFlow completely transformed how we manage our clinic. Patient scheduling is now seamless, and our staff productivity has increased by 40%.",
    initials: "SM",
    rating: 5,
  },
  {
    id: "2",
    name: "Dr. Ahmed Hassan",
    role: "Owner & Dentist",
    clinic: "Cairo Dental Center",
    content:
      "The RTL support is excellent, and the Arabic interface is flawless. Our team adopted the system within a day — it's that intuitive.",
    initials: "AH",
    rating: 5,
  },
  {
    id: "3",
    name: "Dr. Marie Dubois",
    role: "Chief Dentist",
    clinic: "Cabinet Dentaire Lumière",
    content:
      "Depuis que nous utilisons DentiFlow, notre gestion administrative a été réduite de moitié. Je recommande vivement.",
    initials: "MD",
    rating: 5,
  },
  {
    id: "4",
    name: "Dr. James Carter",
    role: "Partner",
    clinic: "PearlWhite Group",
    content:
      "The billing and analytics features alone are worth it. We finally have real-time insight into our revenue and appointment trends.",
    initials: "JC",
    rating: 4,
  },
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "starter",
    nameKey: "landing.pricing.plans.starter.name",
    price: 29,
    descriptionKey: "landing.pricing.plans.starter.description",
    featuresKeys: [
      "landing.pricing.plans.starter.features.f1",
      "landing.pricing.plans.starter.features.f2",
      "landing.pricing.plans.starter.features.f3",
      "landing.pricing.plans.starter.features.f4",
    ],
    highlighted: false,
    ctaKey: "landing.pricing.get_started",
  },
  {
    id: "professional",
    nameKey: "landing.pricing.plans.professional.name",
    price: 79,
    descriptionKey: "landing.pricing.plans.professional.description",
    featuresKeys: [
      "landing.pricing.plans.professional.features.f1",
      "landing.pricing.plans.professional.features.f2",
      "landing.pricing.plans.professional.features.f3",
      "landing.pricing.plans.professional.features.f4",
      "landing.pricing.plans.professional.features.f5",
    ],
    highlighted: true,
    ctaKey: "landing.pricing.get_started",
  },
  {
    id: "enterprise",
    nameKey: "landing.pricing.plans.enterprise.name",
    price: null,
    descriptionKey: "landing.pricing.plans.enterprise.description",
    featuresKeys: [
      "landing.pricing.plans.enterprise.features.f1",
      "landing.pricing.plans.enterprise.features.f2",
      "landing.pricing.plans.enterprise.features.f3",
      "landing.pricing.plans.enterprise.features.f4",
      "landing.pricing.plans.enterprise.features.f5",
    ],
    highlighted: false,
    ctaKey: "landing.pricing.contact_sales",
  },
];
