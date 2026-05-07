"use client";

import React, { useState } from "react";
import { Dialog } from "@mui/material";
import { X } from "lucide-react";
import { MiniCalendar } from "./MiniCalendar";
import { formatDateDisplay, buildPresets } from "../utils/patientHelpers";
import type { DateRange } from "../types";

interface DateRangeModalProps {
  open: boolean;
  dateRange: DateRange;
  onApply: (r: DateRange, preset?: string) => void;
  onClose: () => void;
}

export function DateRangeModal({
  open,
  dateRange,
  onApply,
  onClose,
}: DateRangeModalProps) {
  const presets = buildPresets();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [localStart, setLocalStart] = useState<Date | null>(dateRange.from);
  const [localEnd, setLocalEnd] = useState<Date | null>(dateRange.to);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  const rightYear = calMonth === 11 ? calYear + 1 : calYear;
  const rightMonth = calMonth === 11 ? 0 : calMonth + 1;

  const handleDateClick = (d: Date) => {
    if (!localStart || (localStart && localEnd)) {
      setLocalStart(d);
      setLocalEnd(null);
      setActivePreset(null);
    } else {
      if (d < localStart) {
        setLocalEnd(localStart);
        setLocalStart(d);
      } else setLocalEnd(d);
      setActivePreset(null);
    }
  };
  const handlePreset = (p: { label: string; range: DateRange }) => {
    setLocalStart(p.range.from);
    setLocalEnd(p.range.to);
    setActivePreset(p.label);
  };

  React.useEffect(() => {
    if (open) {
      setLocalStart(dateRange.from);
      setLocalEnd(dateRange.to);
      setActivePreset(null);
      const ref = dateRange.from ?? today;
      setCalYear(ref.getFullYear());
      setCalMonth(ref.getMonth());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      slotProps={{
        paper: {
          sx: {
            borderRadius: "16px",
            boxShadow: "0 20px 48px rgba(0,0,0,0.18)",
            p: 0,
            overflow: "hidden",
          },
        },
      }}
    >
      <div style={{ display: "flex", fontFamily: "inherit" }}>
        {/* Presets */}
        <div
          style={{
            width: 148,
            borderRight: "1px solid var(--border-ui)",
            padding: "16px 0",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <div
            style={{
              padding: "0 12px 10px",
              fontSize: 11,
              fontWeight: 700,
              color: "var(--text-placeholder)",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
            }}
          >
            Quick Select
          </div>
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => handlePreset(p)}
              style={{
                background: activePreset === p.label ? "#eff6ff" : "none",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                padding: "7px 16px",
                fontSize: 13,
                fontWeight: activePreset === p.label ? 600 : 400,
                color:
                  activePreset === p.label
                    ? "var(--brand-primary)"
                    : "var(--foreground)",
                borderRadius: 0,
                transition: "background 0.1s",
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
        {/* Calendars */}
        <div style={{ padding: "20px 24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <span
              className="text-foreground font-bold"
              style={{ fontSize: 15 }}
            >
              Select Date Range
            </span>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-muted)",
                padding: 4,
              }}
            >
              <X size={18} />
            </button>
          </div>
          <div style={{ display: "flex", gap: 32 }}>
            <MiniCalendar
              year={calYear}
              month={calMonth}
              startDate={localStart}
              endDate={localEnd}
              hoverDate={hoverDate}
              onDateClick={handleDateClick}
              onDateHover={setHoverDate}
              onPrevMonth={() => {
                if (calMonth === 0) {
                  setCalMonth(11);
                  setCalYear((y) => y - 1);
                } else setCalMonth((m) => m - 1);
              }}
              onNextMonth={() => {
                if (calMonth === 11) {
                  setCalMonth(0);
                  setCalYear((y) => y + 1);
                } else setCalMonth((m) => m + 1);
              }}
              showNav={true}
            />
            <MiniCalendar
              year={rightYear}
              month={rightMonth}
              startDate={localStart}
              endDate={localEnd}
              hoverDate={hoverDate}
              onDateClick={handleDateClick}
              onDateHover={setHoverDate}
              onPrevMonth={() => {}}
              onNextMonth={() => {}}
              showNav={false}
            />
          </div>
          <div
            style={{
              marginTop: 20,
              paddingTop: 16,
              borderTop: "1px solid var(--border-ui)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--border-ui)",
                  fontSize: 13,
                  minWidth: 90,
                  textAlign: "center",
                  color: "var(--foreground)",
                }}
              >
                {formatDateDisplay(localStart)}
              </div>
              <span className="text-text-placeholder" style={{ fontSize: 13 }}>
                &rarr;
              </span>
              <div
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--border-ui)",
                  fontSize: 13,
                  minWidth: 90,
                  textAlign: "center",
                  color: "var(--foreground)",
                }}
              >
                {formatDateDisplay(localEnd)}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={onClose}
                style={{
                  padding: "7px 20px",
                  borderRadius: 8,
                  border: "1px solid var(--border-ui)",
                  background: "var(--surface-card)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  color: "var(--foreground)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onApply(
                    { from: localStart, to: localEnd },
                    activePreset ?? undefined,
                  );
                  onClose();
                }}
                style={{
                  padding: "7px 20px",
                  borderRadius: 8,
                  border: "none",
                  background: "var(--brand-primary)",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
