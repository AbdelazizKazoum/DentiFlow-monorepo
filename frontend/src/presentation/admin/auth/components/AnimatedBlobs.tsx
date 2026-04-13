"use client";
import React from "react";
import {motion} from "framer-motion";

export function AnimatedBlobs() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Blob 1: DentiFlow primary blue — top-left */}
      <motion.div
        className="absolute rounded-full blur-[80px] opacity-40"
        style={{
          width: 500,
          height: 500,
          top: "-100px",
          left: "-100px",
          background: "#1e56d0",
        }}
        animate={{
          x: [0, 40, -20, 0],
          y: [0, -30, 20, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      />
      {/* Blob 2: Lighter blue — bottom-right */}
      <motion.div
        className="absolute rounded-full blur-[80px] opacity-40"
        style={{
          width: 500,
          height: 500,
          bottom: "-100px",
          right: "-100px",
          background: "#3b82f6",
        }}
        animate={{
          x: [0, -40, 20, 0],
          y: [0, 30, -20, 0],
          scale: [1, 0.95, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
          delay: 5,
        }}
      />
      {/* Blob 3: Slate — center */}
      <motion.div
        className="absolute rounded-full blur-[80px] opacity-20"
        style={{
          width: 300,
          height: 300,
          top: "40%",
          left: "40%",
          background: "#94a3b8",
        }}
        animate={{
          x: [0, 30, -30, 0],
          y: [0, -20, 20, 0],
          scale: [1, 1.05, 0.98, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
          delay: 10,
        }}
      />
    </div>
  );
}
