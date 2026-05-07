"use client";

import React, { useState } from "react";
import { Drawer } from "@mui/material";
import { X, ChevronDown } from "lucide-react";
import {
  PatientStatus,
  PatientGender,
} from "@/domain/patient/entities/patient";
import type { FilterState } from "../types";

interface FilterDrawerProps {
  open: boolean;
  filters: FilterState;
  onApply: (f: FilterState) => void;
  onClose: () => void;
}

export function FilterDrawer({
  open,
  filters,
  onApply,
  onClose,
}: FilterDrawerProps) {
  const [local, setLocal] = useState<FilterState>(filters);
  React.useEffect(() => {
    if (open) setLocal(filters);
  }, [open, filters]);

  const sel =
    (field: keyof FilterState) => (e: React.ChangeEvent<HTMLSelectElement>) =>
      setLocal((prev) => ({ ...prev, [field]: e.target.value }));

  const labelSty: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: "var(--text-muted)",
    marginBottom: 4,
    display: "block",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };
  const selSty: React.CSSProperties = {
    width: "100%",
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid var(--border-ui)",
    fontSize: 14,
    color: "var(--foreground)",
    background: "var(--surface-card)",
    outline: "none",
    appearance: "none",
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: 340,
            display: "flex",
            flexDirection: "column",
            fontFamily: "inherit",
          },
        },
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 20px 16px",
          borderBottom: "1px solid var(--border-ui)",
        }}
      >
        <span className="text-foreground font-bold" style={{ fontSize: 16 }}>
          Filters
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
          <X size={20} />
        </button>
      </div>
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 20,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <div>
          <label style={labelSty}>Status</label>
          <div style={{ position: "relative" }}>
            <select
              value={local.status}
              onChange={sel("status")}
              style={selSty}
            >
              <option value="all">All Statuses</option>
              <option value={PatientStatus.ACTIVE}>Active</option>
              <option value={PatientStatus.INACTIVE}>Inactive</option>
              <option value={PatientStatus.ARCHIVED}>Archived</option>
            </select>
            <ChevronDown
              size={14}
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                color: "var(--text-muted)",
              }}
            />
          </div>
        </div>
        <div>
          <label style={labelSty}>Gender</label>
          <div style={{ position: "relative" }}>
            <select
              value={local.gender}
              onChange={sel("gender")}
              style={selSty}
            >
              <option value="all">All Genders</option>
              <option value={PatientGender.MALE}>Male</option>
              <option value={PatientGender.FEMALE}>Female</option>
              <option value={PatientGender.OTHER}>Other</option>
            </select>
            <ChevronDown
              size={14}
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                color: "var(--text-muted)",
              }}
            />
          </div>
        </div>
        <div>
          <label style={labelSty}>Has Allergies</label>
          <div style={{ position: "relative" }}>
            <select style={selSty} defaultValue="all">
              <option value="all">Any</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
            <ChevronDown
              size={14}
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                color: "var(--text-muted)",
              }}
            />
          </div>
        </div>
        <div>
          <label style={labelSty}>Has Chronic Conditions</label>
          <div style={{ position: "relative" }}>
            <select style={selSty} defaultValue="all">
              <option value="all">Any</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
            <ChevronDown
              size={14}
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                color: "var(--text-muted)",
              }}
            />
          </div>
        </div>
      </div>
      <div
        style={{
          padding: 20,
          borderTop: "1px solid var(--border-ui)",
          display: "flex",
          gap: 10,
        }}
      >
        <button
          onClick={() => setLocal({ status: "all", gender: "all" })}
          style={{
            flex: 1,
            padding: "9px 0",
            borderRadius: 8,
            border: "1px solid var(--border-ui)",
            background: "var(--surface-card)",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            color: "var(--foreground)",
          }}
        >
          Clear All
        </button>
        <button
          onClick={() => {
            onApply(local);
            onClose();
          }}
          style={{
            flex: 2,
            padding: "9px 0",
            borderRadius: 8,
            border: "none",
            background: "var(--brand-primary)",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Apply Filters
        </button>
      </div>
    </Drawer>
  );
}
