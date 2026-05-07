"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationBarProps {
  totalPages: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  className?: string;
}

export function PaginationBar({
  totalPages,
  currentPage,
  setCurrentPage,
  className,
}: PaginationBarProps) {
  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    const st = Math.max(2, currentPage - 1);
    const en = Math.min(totalPages - 1, currentPage + 1);
    for (let i = st; i <= en; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }
  return (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        padding: "14px 20px",
      }}
    >
      <button
        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: "none",
          background: "transparent",
          cursor: currentPage === 1 ? "not-allowed" : "pointer",
          color:
            currentPage === 1 ? "var(--text-placeholder)" : "var(--foreground)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: currentPage === 1 ? 0.4 : 1,
        }}
      >
        <ChevronLeft size={18} strokeWidth={2} />
      </button>
      {pages.map((pg, idx) =>
        pg === "..." ? (
          <span
            key={`el-${idx}`}
            style={{
              width: 30,
              height: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              color: "var(--text-placeholder)",
              userSelect: "none",
            }}
          >
            ···
          </span>
        ) : (
          <button
            key={pg}
            onClick={() => setCurrentPage(pg as number)}
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              border: "none",
              background:
                pg === currentPage ? "var(--brand-primary)" : "transparent",
              color: pg === currentPage ? "#fff" : "var(--foreground)",
              fontSize: 13,
              fontWeight: pg === currentPage ? 700 : 400,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              if (pg !== currentPage)
                (e.currentTarget as HTMLButtonElement).style.background =
                  "var(--surface-page)";
            }}
            onMouseLeave={(e) => {
              if (pg !== currentPage)
                (e.currentTarget as HTMLButtonElement).style.background =
                  "transparent";
            }}
          >
            {pg}
          </button>
        ),
      )}
      <button
        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: "none",
          background: "transparent",
          cursor: currentPage === totalPages ? "not-allowed" : "pointer",
          color:
            currentPage === totalPages
              ? "var(--text-placeholder)"
              : "var(--foreground)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: currentPage === totalPages ? 0.4 : 1,
        }}
      >
        <ChevronRight size={18} strokeWidth={2} />
      </button>
    </div>
  );
}
