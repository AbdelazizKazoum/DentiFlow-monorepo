"use client";
import React, {useState} from "react";
import {Stethoscope, Menu, X} from "lucide-react";
import {LandingButton} from "./LandingButton";

export function LandingNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Stethoscope className="text-white" size={24} />
              </div>
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                Smile<span className="text-blue-600">Care</span>
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
              <a href="#" className="hover:text-blue-600 transition-colors">
                Home
              </a>
              <a href="#" className="hover:text-blue-600 transition-colors">
                Services
              </a>
              <a href="#" className="hover:text-blue-600 transition-colors">
                About Us
              </a>
              <a href="#" className="hover:text-blue-600 transition-colors">
                Contact
              </a>
              <LandingButton variant="primary" className="text-sm px-5 py-2">
                Book Appointment
              </LandingButton>
            </div>

            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-24 px-6 md:hidden">
          <div className="flex flex-col gap-6 text-lg font-medium text-slate-800">
            <a href="#" onClick={() => setIsMenuOpen(false)}>
              Home
            </a>
            <a href="#" onClick={() => setIsMenuOpen(false)}>
              Services
            </a>
            <a href="#" onClick={() => setIsMenuOpen(false)}>
              About Us
            </a>
            <a href="#" onClick={() => setIsMenuOpen(false)}>
              Contact
            </a>
            <LandingButton className="w-full">Book Appointment</LandingButton>
          </div>
        </div>
      )}
    </>
  );
}
