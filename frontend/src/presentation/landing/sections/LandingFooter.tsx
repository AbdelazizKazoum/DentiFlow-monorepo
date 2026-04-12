"use client";
import React from "react";
import {Stethoscope, MapPin, Phone, Mail} from "lucide-react";

const Facebook = ({
  size = 24,
  ...props
}: {size?: number} & React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const Twitter = ({
  size = 24,
  ...props
}: {size?: number} & React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const Instagram = ({
  size = 24,
  ...props
}: {size?: number} & React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export function LandingFooter() {
  return (
    <footer className="bg-slate-900 text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Stethoscope size={24} />
              </div>
              <span className="text-2xl font-bold">SmileCare</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Leading the way in modern dentistry with compassionate care and
              innovative solutions for every smile.
            </p>
            <div className="flex gap-4">
              {[Facebook, Instagram, Twitter].map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition-colors"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-8">Quick Links</h4>
            <ul className="space-y-4 text-slate-400">
              <li>
                <a href="#" className="hover:text-blue-500 transition-colors">
                  Our Services
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-500 transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-500 transition-colors">
                  Our Team
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-500 transition-colors">
                  Testimonials
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-8">Services</h4>
            <ul className="space-y-4 text-slate-400">
              <li>
                <a href="#" className="hover:text-blue-500 transition-colors">
                  General Dentistry
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-500 transition-colors">
                  Teeth Whitening
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-500 transition-colors">
                  Dental Implants
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-500 transition-colors">
                  Oral Surgery
                </a>
              </li>
            </ul>
          </div>

          <div className="bg-slate-800 p-8 rounded-3xl space-y-6">
            <h4 className="text-lg font-bold">Visit Our Office</h4>
            <div className="flex items-start gap-4 text-slate-400">
              <MapPin className="text-blue-500 shrink-0" size={20} />
              <p>123 Dental St, Wellness Suite 101, New York, NY 10001</p>
            </div>
            <div className="flex items-start gap-4 text-slate-400">
              <Phone className="text-blue-500 shrink-0" size={20} />
              <p>+1 (555) 000-1234</p>
            </div>
            <div className="flex items-start gap-4 text-slate-400">
              <Mail className="text-blue-500 shrink-0" size={20} />
              <p>hello@smilecare.com</p>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-slate-800 text-center text-slate-500 text-sm">
          <p>
            © {new Date().getFullYear()} SmileCare Dental Clinic. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
