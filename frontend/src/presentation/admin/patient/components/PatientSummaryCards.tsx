"use client";

import React from "react";
import { Users, Activity, UserPlus, Archive } from "lucide-react";
import { Patient, PatientStatus } from "@/domain/patient/entities/patient";
import { isNewPatient } from "../utils/patientHelpers";

interface PatientSummaryCardsProps {
  patients: Patient[];
}

export function PatientSummaryCards({ patients }: PatientSummaryCardsProps) {
  const cards = [
    {
      label: "Total Patients",
      value: patients.length,
      Icon: Users,
      color: "var(--brand-primary)",
      bg: "#eff6ff",
    },
    {
      label: "Active Patients",
      value: patients.filter((p) => p.status === PatientStatus.ACTIVE).length,
      Icon: Activity,
      color: "#279C41",
      bg: "#E8F8EC",
    },
    {
      label: "New This Month",
      value: patients.filter((p) => isNewPatient(p.createdAt)).length,
      Icon: UserPlus,
      color: "#7c3aed",
      bg: "#f5f3ff",
    },
    {
      label: "Inactive / Archived",
      value: patients.filter(
        (p) =>
          p.status === PatientStatus.INACTIVE ||
          p.status === PatientStatus.ARCHIVED,
      ).length,
      Icon: Archive,
      color: "#64748b",
      bg: "#f1f5f9",
    },
  ];

  return (
    <div
      style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}
    >
      {cards.map(({ label, value, Icon, color, bg }) => (
        <div
          key={label}
          style={{
            background: "var(--surface-card)",
            border: "1px solid var(--border-ui)",
            borderRadius: 14,
            padding: "18px 20px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            cursor: "default",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon size={22} color={color} />
          </div>
          <div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: "var(--foreground)",
                lineHeight: 1,
                letterSpacing: "-0.03em",
              }}
            >
              {value}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                marginTop: 3,
                fontWeight: 500,
              }}
            >
              {label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
