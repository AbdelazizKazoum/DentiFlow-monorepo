"use client";
import React from "react";
import {motion} from "framer-motion";
import {User, Phone, Calendar, Clock} from "lucide-react";
import {LandingButton} from "./LandingButton";

export function LandingAppointmentBar() {
  return (
    <motion.section
      className="relative z-20 -mt-14 px-4"
      initial={{opacity: 0, y: 30}}
      whileInView={{opacity: 1, y: 0}}
      viewport={{once: true}}
      transition={{duration: 1.2}}
    >
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-[20px] shadow-2xl shadow-blue-900/10 p-4 lg:p-4 border border-blue-50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-8 items-end">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-4">
                Name
              </label>
              <div className="relative">
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full text-sm bg-slate-50 border-none rounded-2xl py-3 pl-11 focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 font-medium"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-4">
                Phone Number
              </label>
              <div className="relative">
                <Phone
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="tel"
                  placeholder="Your Phone"
                  className="w-full text-sm  bg-slate-50 border-none rounded-2xl py-3 pl-11 focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 font-medium"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-4">
                Preferred Date
              </label>
              <div className="relative">
                <Calendar
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="date"
                  className="w-full text-sm bg-slate-50 border-none rounded-2xl py-3 pl-11 focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 font-medium"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-4">
                Preferred Time
              </label>
              <div className="relative">
                <Clock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="time"
                  className="w-full text-sm bg-slate-50 border-none rounded-2xl py-3 pl-11 focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 font-medium"
                />
              </div>
            </div>
            <LandingButton className="h-[52px] text-sm w-full rounded-2xl">
              Book an Appointment
            </LandingButton>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
