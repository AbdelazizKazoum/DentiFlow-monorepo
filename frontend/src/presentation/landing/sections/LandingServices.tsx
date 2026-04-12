"use client";
import React from "react";
import {motion} from "framer-motion";
import {ArrowRight, Stethoscope, ShieldCheck, Star} from "lucide-react";
import {LandingButton} from "./LandingButton";

export function LandingServices() {
  const services = [
    {
      title: "General Dentistry",
      icon: <Stethoscope size={24} />,
      img: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=400",
    },
    {
      title: "Dental Implant",
      icon: <ShieldCheck size={24} />,
      img: "https://images.unsplash.com/photo-1606811841660-1b51e9ed2751?auto=format&fit=crop&q=80&w=400",
    },
    {
      title: "Teeth Whitening",
      icon: <Star size={24} />,
      img: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&q=80&w=400",
    },
  ];

  return (
    <section className="py-24 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16"
          initial={{opacity: 0, x: -40}}
          whileInView={{opacity: 1, x: 0}}
          viewport={{once: true, margin: "-100px"}}
          transition={{duration: 1.2, ease: [0.16, 1, 0.3, 1]}}
        >
          <div className="max-w-xl">
            <span className="text-blue-600 font-bold uppercase tracking-widest text-sm block mb-4">
              Our Services
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
              A Wide Range of Services for Your Best Smile
            </h2>
          </div>
          <LandingButton variant="primary" className="hidden md:flex">
            Explore All Services
          </LandingButton>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, idx) => (
            <motion.div
              key={idx}
              initial={{opacity: 0, y: 30}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true, margin: "-50px"}}
              transition={{
                duration: 1.0,
                type: "spring",
                bounce: 0.4,
                delay: idx * 0.15,
              }}
              whileHover={{y: -10}}
              className="group bg-white rounded-[40px] overflow-hidden hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500 border border-slate-100"
            >
              <div className="h-64 overflow-hidden relative">
                <img
                  src={service.img}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute -bottom-6 left-8 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white border-4 border-slate-50 shadow-lg">
                  {service.icon}
                </div>
              </div>
              <div className="p-10 pt-12">
                <h3 className="text-2xl font-bold mb-4 text-slate-900">
                  {service.title}
                </h3>
                <p className="text-slate-500 mb-6 leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  do eiusmod tempor incididunt ut labore.
                </p>
                <button className="flex items-center gap-2 font-bold text-blue-600 hover:gap-4 transition-all">
                  Learn more <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <LandingButton variant="primary" className="md:hidden w-full mt-10">
          Explore All Services
        </LandingButton>
      </div>
    </section>
  );
}
