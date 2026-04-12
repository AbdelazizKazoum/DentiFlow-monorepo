"use client";
import React from "react";
import {motion} from "framer-motion";
import {Award, CheckCircle2} from "lucide-react";
import {LandingButton} from "./LandingButton";

export function LandingAboutUs() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          <motion.div
            className="flex-1 relative order-2 lg:order-1"
            initial={{opacity: 0, x: -40}}
            whileInView={{opacity: 1, x: 0}}
            viewport={{once: true, margin: "-100px"}}
            transition={{duration: 1.2, ease: [0.16, 1, 0.3, 1]}}
          >
            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=400"
                className="rounded-[40px] h-64 w-full object-cover mt-8"
                alt="Medical lab"
              />
              <img
                src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=400"
                className="rounded-[40px] h-64 w-full object-cover"
                alt="Dentist working"
              />
              <div className="col-span-2 relative">
                <img
                  src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800"
                  className="rounded-[40px] h-48 w-full object-cover"
                  alt="Happy patient"
                />
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white border-8 border-slate-50">
                  <Award size={40} />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="flex-1 order-1 lg:order-2"
            initial={{opacity: 0, x: 40}}
            whileInView={{opacity: 1, x: 0}}
            viewport={{once: true, margin: "-100px"}}
            transition={{
              duration: 1.2,
              type: "spring",
              bounce: 0.4,
              delay: 0.2,
            }}
          >
            <span className="text-blue-600 font-bold uppercase tracking-widest text-sm block mb-4">
              About Us
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
              15 Years of Expertise in Dental Care
            </h2>
            <p className="text-slate-500 text-lg mb-8 leading-relaxed">
              We believe everyone deserves a beautiful smile. Our clinic has
              been providing award-winning dental services with a patient-first
              approach for over a decade.
            </p>

            <ul className="space-y-4 mb-10">
              {[
                "Premium Dental Services You Can Trust",
                "Award-Winning Experts in Dental Care",
                "Dedicated Experts Behind Every Smile",
              ].map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-3 font-semibold text-slate-700"
                >
                  <CheckCircle2 className="text-blue-600" size={20} />
                  {item}
                </li>
              ))}
            </ul>

            <LandingButton variant="primary">Learn More</LandingButton>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
