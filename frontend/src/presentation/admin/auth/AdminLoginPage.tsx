"use client";
import React, {useEffect} from "react";
import {motion} from "framer-motion";
import {AnimatedBlobs} from "./components/AnimatedBlobs";
import {BrandingPanel} from "./components/BrandingPanel";
import {AdminLoginForm} from "./components/AdminLoginForm";

export function AdminLoginPage() {
  // Inject Poppins font (same pattern as AdminLayout)
  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-slate-100 overflow-hidden relative"
      style={{fontFamily: "'Poppins', sans-serif"}}
    >
      {/* Medical cross SVG pattern overlay */}
      <div
        className="fixed inset-0 -z-10 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M15 0h10v15h15v10H25v15H15V25H0V15h15z' fill='%23cbd5e1' fill-opacity='0.4'/%3E%3C/svg%3E")`,
          backgroundSize: "40px 40px",
        }}
      />

      <AnimatedBlobs />

      <motion.div
        initial={{opacity: 0, y: 20}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.8, ease: "easeOut"}}
        className="max-w-5xl w-full flex flex-col md:flex-row shadow-2xl rounded-3xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.3)",
        }}
      >
        <BrandingPanel />
        <AdminLoginForm />
      </motion.div>
    </div>
  );
}
