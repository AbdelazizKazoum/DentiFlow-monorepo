"use client";
import React from "react";
import {LandingNavigation} from "./sections/LandingNavigation";
import {LandingHero} from "./sections/LandingHero";
import {LandingAppointmentBar} from "./sections/LandingAppointmentBar";
import {LandingAboutUs} from "./sections/LandingAboutUs";
import {LandingBanner} from "./sections/LandingBanner";
import {LandingServices} from "./sections/LandingServices";
import {LandingWhyChooseUs} from "./sections/LandingWhyChooseUs";
import {LandingFooter} from "./sections/LandingFooter";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <LandingNavigation />
      <LandingHero />
      <LandingAppointmentBar />
      <LandingAboutUs />
      <LandingBanner />
      <LandingServices />
      <LandingWhyChooseUs />
      <LandingFooter />

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-bounce-slow {
          animation: bounce 3s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin 15s linear infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(-5%); }
          50% { transform: translateY(0); }
        }
      `,
        }}
      />
    </div>
  );
}
