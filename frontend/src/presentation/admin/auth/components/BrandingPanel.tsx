"use client";
import React from "react";
import {useTranslations} from "next-intl";
import {Users} from "lucide-react";

export function BrandingPanel() {
  const t = useTranslations("admin.auth");

  return (
    <div
      className="hidden md:flex md:w-1/2 flex-col justify-between p-10 relative overflow-hidden"
      style={{background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"}}
    >
      {/* Decorative circles */}
      <div
        className="absolute -top-20 -start-20 w-64 h-64 rounded-full opacity-10"
        style={{background: "#1e56d0"}}
      />
      <div
        className="absolute -bottom-16 -end-16 w-80 h-80 rounded-full opacity-10"
        style={{background: "#3b82f6"}}
      />

      {/* Logo block */}
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-10">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{background: "#1e56d0"}}
          >
            {/* Tooth SVG */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-7 h-7"
            >
              <path d="M12 2C9.5 2 7 4 7 6.5c0 1 .5 2 .5 3C7 12 6 14 6 16.5c0 2 1 3.5 2.5 3.5 1 0 1.5-1 2-2s1-2 1.5-2 1 1 1.5 2 1 2 2 2c1.5 0 2.5-1.5 2.5-3.5 0-2.5-1-4.5-1.5-7 0-1 .5-2 .5-3C17 4 14.5 2 12 2z" />
            </svg>
          </div>
          <div>
            <span className="text-white font-bold text-xl">
              Denti<span style={{color: "#2dd4bf"}}>Flow</span>
            </span>
            <span
              className="ms-1 text-xs font-semibold px-1.5 py-0.5 rounded"
              style={{background: "#2dd4bf20", color: "#2dd4bf"}}
            >
              Pro
            </span>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-4xl font-bold text-white leading-tight mb-4">
          {t("branding.tagline_1")}
          <br />
          {t("branding.tagline_2")}
        </h1>

        {/* Description */}
        <p className="text-slate-400 leading-relaxed text-sm">
          {t("branding.description")}
        </p>
      </div>

      {/* Stats widget */}
      <div className="relative z-10 mt-8">
        <div
          className="rounded-2xl p-5 border"
          style={{
            background: "rgba(255,255,255,0.05)",
            borderColor: "rgba(255,255,255,0.1)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{background: "rgba(30,86,208,0.3)"}}
            >
              <Users size={20} color="#2dd4bf" />
            </div>
            <div>
              <p className="text-slate-400 text-xs">
                {t("branding.stats_label")}
              </p>
              <p className="text-white font-bold text-2xl">142</p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <p className="text-slate-500 text-xs mt-6">{t("branding.copyright")}</p>
      </div>
    </div>
  );
}
