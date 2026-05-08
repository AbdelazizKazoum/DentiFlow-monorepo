import React from "react";
import { Typography, Chip } from "@mui/material";
import { Check, ChevronDown, AlertCircle } from "lucide-react";

// ── Shared button styles ──────────────────────────────────────────────────────
export const primaryBtnSx = {
  textTransform: "none",
  fontWeight: 700,
  borderRadius: "10px",
  padding: "8px 20px",
  fontSize: "0.8125rem",
  backgroundColor: "var(--brand-primary)",
  boxShadow: "0 2px 8px rgba(30,86,208,0.25)",
  "&:hover": {
    backgroundColor: "var(--brand-primary-dark)",
    boxShadow: "0 4px 14px rgba(30,86,208,0.35)",
  },
  "&.Mui-disabled": { backgroundColor: "var(--brand-primary)", opacity: 0.5 },
} as const;

export const outlinedBtnSx = {
  textTransform: "none",
  fontWeight: 600,
  borderRadius: "10px",
  padding: "8px 18px",
  fontSize: "0.8125rem",
  borderColor: "var(--border-ui)",
  color: "var(--foreground)",
  "&:hover": {
    borderColor: "var(--text-muted)",
    background: "var(--surface-page)",
  },
} as const;

// ── DocumentType enum ────────────────────────────────────────────────────────
export enum DocumentType {
  GENERAL = "GENERAL",
  INSURANCE = "INSURANCE",
  MEDICAL = "MEDICAL",
  OTHER = "OTHER",
}

// ── InsuranceState type ──────────────────────────────────────────────────────
export interface InsuranceState {
  insuranceProviderId: string;
  isActive: boolean;
  policyNumber: string;
  memberId: string;
}

// ── SectionHeader ─────────────────────────────────────────────────────────────
export function SectionHeader({
  icon,
  title,
  iconColor,
}: {
  icon?: React.ReactNode;
  title: string;
  iconColor?: string;
  iconBg?: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {icon && iconColor && (
        <span style={{ color: iconColor, display: "flex", alignItems: "center" }}>
          {React.cloneElement(
            icon as React.ReactElement<{ size?: number; color?: string }>,
            { size: 14, color: iconColor }
          )}
        </span>
      )}
      <p
        className="text-xs font-semibold uppercase tracking-widest"
        style={{ color: "var(--text-muted)", margin: 0 }}
      >
        {title}
      </p>
    </div>
  );
}

// ── AccordionSection ──────────────────────────────────────────────────────────
export function AccordionSection({
  title,
  icon,
  iconColor,
  iconBg,
  summary,
  summaryMuted = false,
  savedBadge = false,
  open,
  onToggle,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
  summary?: string;
  summaryMuted?: boolean;
  savedBadge?: boolean;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      style={{
        border: open
          ? "1px solid var(--brand-primary)"
          : "1px solid var(--border-ui)",
        borderRadius: 14,
        overflow: "hidden",
        backgroundColor: "var(--surface-card)",
        boxShadow: open
          ? "0 4px 20px rgba(30,86,208,0.08)"
          : isHovered
          ? "0 4px 12px rgba(0,0,0,0.04)"
          : "0 1px 3px rgba(0,0,0,0.02)",
        transition: "all 0.2s ease-in-out",
        marginBottom: "12px",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          padding: "16px 20px",
          background: open
            ? "var(--surface-page)"
            : isHovered
            ? "var(--surface-page)"
            : "transparent",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 16,
          textAlign: "left",
          transition: "background 0.2s ease",
          outline: "none",
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 10,
            background: iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {React.cloneElement(
            icon as React.ReactElement<{ size?: number; color?: string }>,
            { size: 20, color: iconColor }
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{ fontSize: 15, fontWeight: 600, color: "var(--foreground)" }}
          >
            {title}
          </Typography>
          {summary && (
            <Typography
              sx={{
                fontSize: 13,
                color: summaryMuted
                  ? "var(--text-placeholder)"
                  : "var(--text-muted)",
                mt: "2px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontWeight: 400,
              }}
            >
              {summary}
            </Typography>
          )}
        </div>
        {savedBadge && (
          <Chip
            icon={<Check size={12} />}
            label="Saved"
            size="small"
            sx={{
              height: 24,
              fontSize: 11,
              fontWeight: 600,
              background: "#dcfce7",
              color: "#166534",
              "& .MuiChip-icon": { color: "#166534", ml: "6px" },
              flexShrink: 0,
            }}
          />
        )}
        <ChevronDown
          size={20}
          color={open ? "var(--brand-primary)" : "var(--text-placeholder)"}
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            flexShrink: 0,
          }}
        />
      </button>
      <div
        style={{
          maxHeight: open ? "3000px" : 0,
          overflow: "hidden",
          transition: open
            ? "max-height 0.4s cubic-bezier(0.0, 0, 0.2, 1)"
            : "max-height 0.25s cubic-bezier(0.4, 0, 1, 1)",
        }}
      >
        <div
          style={{
            padding: "24px 20px",
            borderTop: "1px solid var(--border-ui)",
            background: "var(--surface-card)",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Error Banner ────────────────────────────────────────────────────────────
export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 p-3 mb-5 rounded-xl text-sm text-red-700 bg-red-50 border border-red-200">
      <AlertCircle size={15} className="shrink-0" />
      {message}
    </div>
  );
}
