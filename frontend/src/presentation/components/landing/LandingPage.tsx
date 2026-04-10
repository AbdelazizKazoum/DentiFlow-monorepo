import Header from "@/presentation/components/shell/Header";
import { HeroSection } from "./HeroSection";
import { FeaturesSection } from "./FeaturesSection";
import { TestimonialsSection } from "./TestimonialsSection";
import { PricingSection } from "./PricingSection";

/**
 * Presentation: Landing Page
 * Composes all public-facing landing sections.
 * Server component — sections that need interactivity are "use client".
 */
export function LandingPage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <TestimonialsSection />
        <PricingSection />
      </main>
    </>
  );
}
