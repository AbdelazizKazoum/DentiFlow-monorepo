"use client";
import React from "react";
import {Stethoscope, Star, Award, ShieldCheck} from "lucide-react";

export function LandingBanner() {
  return (
    <div className="bg-blue-600 py-6 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {[1, 2, 3, 4].map((_, i) => (
          <div key={i} className="flex items-center gap-10 mx-10">
            <span className="text-white text-xl font-bold uppercase flex items-center gap-4">
              <Stethoscope size={24} /> General Dentistry
            </span>
            <span className="text-white text-xl font-bold uppercase flex items-center gap-4">
              <Star size={24} /> Teeth Whitening
            </span>
            <span className="text-white text-xl font-bold uppercase flex items-center gap-4">
              <Award size={24} /> Dental Implant
            </span>
            <span className="text-white text-xl font-bold uppercase flex items-center gap-4">
              <ShieldCheck size={24} /> Dental Sealants
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
