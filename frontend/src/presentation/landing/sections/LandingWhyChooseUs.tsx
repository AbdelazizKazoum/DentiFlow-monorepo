"use client";
import React from "react";
import {motion} from "framer-motion";
import {CheckCircle2} from "lucide-react";
import {LandingButton} from "./LandingButton";

export function LandingWhyChooseUs() {
  const stats = [
    {label: "Skilled Doctors", value: "10+"},
    {label: "Patient Satisfaction", value: "99%"},
    {label: "Appointments Booked", value: "20K+"},
  ];

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          <motion.div
            className="flex-1 relative"
            initial={{opacity: 0, x: -40}}
            whileInView={{opacity: 1, x: 0}}
            viewport={{once: true, margin: "-100px"}}
            transition={{duration: 1.2, ease: [0.16, 1, 0.3, 1]}}
          >
            <div className="relative w-full max-w-md mx-auto aspect-square">
              {/* Circular Image and Stats */}
              <div className="absolute inset-0 border-2 border-dashed border-blue-200 rounded-full animate-spin-slow" />
              <div className="absolute inset-6 rounded-full overflow-hidden border-8 border-white shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=600"
                  alt="Consultation"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Decorative Dots */}
              <div className="absolute top-0 right-0 w-8 h-8 bg-blue-600 rounded-full border-4 border-white" />
              <div className="absolute bottom-10 left-0 w-6 h-6 bg-blue-400 rounded-full border-2 border-white" />
            </div>
          </motion.div>

          <motion.div
            className="flex-1"
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
              Why Choose Us
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-8 leading-tight">
              Benefits of Our Dental Services: Your Path to a Healthier Smile
            </h2>

            <div className="grid grid-cols-3 gap-8 mb-10 border-b border-slate-200 pb-10">
              {stats.map((stat, idx) => (
                <div key={idx}>
                  <div className="text-3xl font-black text-slate-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-tighter leading-tight">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            <ul className="space-y-4 mb-10">
              {[
                "Easy Online Appointment Booking",
                "Experienced and Caring Dentists",
                "Advanced Dental Equipment",
              ].map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-3 font-semibold text-slate-700"
                >
                  <CheckCircle2
                    className="text-blue-600"
                    size={20}
                    fill="currentColor"
                  />
                  {item}
                </li>
              ))}
            </ul>

            <LandingButton variant="primary" className="px-10">
              Book an Appointment
            </LandingButton>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
