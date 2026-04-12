"use client";
import React from "react";
import {motion} from "framer-motion";
import {User, Play, Star} from "lucide-react";
import {LandingButton} from "./LandingButton";

export function LandingHero() {
  return (
    <motion.section
      className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-slate-50"
      initial={{opacity: 0, y: 20}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 1.0}}
    >
      <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-50/50 rounded-l-[100px] -z-10 hidden lg:block" />
      <div className="absolute top-20 left-10 w-12 h-12 bg-blue-100 rounded-full blur-xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
          <motion.div
            className="flex-1 text-center lg:text-left"
            initial={{opacity: 0, x: -40}}
            animate={{opacity: 1, x: 0}}
            transition={{
              duration: 1.2,
              type: "spring",
              bounce: 0.4,
              delay: 0.1,
            }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-semibold mb-6">
              <User size={16} />
              <span>Top-Notch Dental Care, Just For You</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] text-slate-900 mb-6">
              Your <span className="text-blue-600">Best Dental</span> Experience
              Awaits
            </h1>
            <p className="text-slate-500 text-lg lg:text-xl max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
              Experience high-quality dental care with our team of experts. We
              use the latest technology to ensure your smile is healthy and
              beautiful.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <LandingButton className="w-full sm:w-auto px-8 py-4">
                Explore Our Services
              </LandingButton>
              <button className="flex items-center gap-3 font-semibold text-slate-700 hover:text-blue-600 transition-colors group p-2">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                  <Play size={18} fill="currentColor" />
                </div>
                Watch Video
              </button>
            </div>
          </motion.div>

          <motion.div
            className="flex-1 relative"
            initial={{opacity: 0, x: 40}}
            animate={{opacity: 1, x: 0}}
            transition={{
              duration: 1.2,
              type: "spring",
              bounce: 0.4,
              delay: 0.3,
            }}
          >
            <div className="relative z-10 w-full max-w-lg mx-auto">
              <div className="absolute inset-0 bg-blue-600 rounded-[60px] translate-x-4 translate-y-4 -z-10 opacity-10" />
              <img
                src="https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=800"
                alt="Professional Dentist"
                className="rounded-[60px] w-full h-[500px] object-cover shadow-2xl"
              />

              <div className="absolute -bottom-10 -left-10 bg-white p-6 rounded-3xl shadow-xl border border-slate-100 max-w-[200px] hidden sm:block animate-bounce-slow">
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      size={14}
                      className="fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-xs font-bold text-slate-900">
                  &quot;The best dental care I&apos;ve ever received!&quot;
                </p>
                <p className="text-[10px] text-slate-400 mt-1">— Sarah J.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
