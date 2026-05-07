"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { isSameDay } from "../utils/patientHelpers";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export interface MiniCalendarProps {
  year: number;
  month: number;
  startDate: Date | null;
  endDate: Date | null;
  hoverDate: Date | null;
  onDateClick: (d: Date) => void;
  onDateHover: (d: Date | null) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  showNav: boolean;
}

export function MiniCalendar({
  year,
  month,
  startDate,
  endDate,
  hoverDate,
  onDateClick,
  onDateHover,
  onPrevMonth,
  onNextMonth,
  showNav,
}: MiniCalendarProps) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const effectiveEnd =
    endDate ??
    (startDate && hoverDate && hoverDate >= startDate ? hoverDate : null);

  return (
    <div style={{ width: 220 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        {showNav ? (
          <button
            onClick={onPrevMonth}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
              borderRadius: 4,
              color: "var(--foreground)",
            }}
          >
            <ChevronLeft size={16} />
          </button>
        ) : (
          <div style={{ width: 24 }} />
        )}
        <span
          className="text-foreground font-semibold"
          style={{ fontSize: 13 }}
        >
          {MONTH_NAMES[month]} {year}
        </span>
        {showNav ? (
          <button
            onClick={onNextMonth}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
              borderRadius: 4,
              color: "var(--foreground)",
            }}
          >
            <ChevronRight size={16} />
          </button>
        ) : (
          <div style={{ width: 24 }} />
        )}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7,1fr)",
          gap: "2px 0",
        }}
      >
        {DAY_NAMES.map((d) => (
          <div
            key={d}
            style={{
              textAlign: "center",
              fontSize: 11,
              fontWeight: 600,
              color: "var(--text-placeholder)",
              padding: "2px 0",
            }}
          >
            {d}
          </div>
        ))}
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const isStart = startDate && isSameDay(d, startDate);
          const isEnd = effectiveEnd && isSameDay(d, effectiveEnd);
          const inRange =
            startDate && effectiveEnd && d > startDate && d < effectiveEnd;
          const isSelected = isStart || isEnd;
          return (
            <div
              key={i}
              style={{ display: "flex", justifyContent: "center" }}
              onMouseEnter={() => onDateHover(d)}
              onMouseLeave={() => onDateHover(null)}
            >
              <button
                onClick={() => onDateClick(d)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  backgroundColor: isSelected
                    ? "var(--brand-primary)"
                    : inRange
                      ? "#dbeafe"
                      : "transparent",
                  color: isSelected
                    ? "#fff"
                    : inRange
                      ? "#1e40af"
                      : "var(--foreground)",
                  fontWeight: isSelected ? 700 : 400,
                  transition: "background 0.1s",
                }}
              >
                {d.getDate()}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
