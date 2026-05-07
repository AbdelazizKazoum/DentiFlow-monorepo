"use client";

import React from "react";
import {
  PhoneCall,
  CalendarDays,
  MoreVertical,
  Mail,
  Phone,
  Edit2,
  AlertCircle,
} from "lucide-react";
import { Patient } from "@/domain/patient/entities/patient";
import { STATUS_CONFIG } from "../patientConfig";
import {
  getFullName,
  getInitials,
  getAvatarColor,
  isNewPatient,
  calculateAge,
  formatRelativeDate,
} from "../utils/patientHelpers";
import { PaginationBar } from "./PaginationBar";

interface PatientGridProps {
  patients: Patient[];
  currentPage: number;
  totalPages: number;
  onOpenMenu: (e: React.MouseEvent<HTMLButtonElement>, id: string) => void;
  onEdit: (p: Patient) => void;
  onSetPage: (page: number) => void;
}

export function PatientGrid({
  patients,
  currentPage,
  totalPages,
  onOpenMenu,
  onEdit,
  onSetPage,
}: PatientGridProps) {
  return (
    <div
      style={{
        background: "var(--surface-card)",
        borderRadius: 12,
        border: "1px solid var(--border-ui)",
        overflow: "hidden",
        boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 16,
          padding: 20,
        }}
      >
        {patients.map((p) => {
          const cfg = STATUS_CONFIG[p.status];
          const isNew = isNewPatient(p.createdAt);
          const fullName = getFullName(p.firstName, p.lastName);
          return (
            <div
              key={p.id}
              style={{
                background: "var(--surface-card)",
                borderRadius: 12,
                borderTop: "3px solid " + getAvatarColor(p.id),
                borderRight: "1px solid var(--border-ui)",
                borderBottom: "1px solid var(--border-ui)",
                borderLeft: "1px solid var(--border-ui)",
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 10,
                position: "relative",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                transition: "box-shadow 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 8px 24px rgba(0,0,0,0.10)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 1px 4px rgba(0,0,0,0.06)";
              }}
            >
              <div style={{ position: "absolute", top: 10, right: 10 }}>
                <button
                  onClick={(e) => onOpenMenu(e, p.id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 4,
                    color: "var(--text-placeholder)",
                    borderRadius: 6,
                  }}
                >
                  <MoreVertical size={15} />
                </button>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: "50%",
                    background: getAvatarColor(p.id),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 16,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
                    flexShrink: 0,
                  }}
                >
                  {getInitials(p.firstName, p.lastName)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "var(--foreground)",
                      lineHeight: 1.2,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {fullName}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      marginTop: 4,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "2px 7px",
                        borderRadius: 20,
                        background: cfg.bg,
                        color: cfg.color,
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                    >
                      <span
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          background: cfg.dot,
                          flexShrink: 0,
                        }}
                      />
                      {cfg.label}
                    </span>
                    {isNew && (
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          color: "#0891b2",
                          background: "#ecfeff",
                          border: "1px solid #a5f3fc",
                          borderRadius: 4,
                          padding: "2px 5px",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        New
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 11,
                  color: "var(--text-muted)",
                }}
              >
                {p.dateOfBirth && (
                  <>
                    <span
                      style={{ fontWeight: 600, color: "var(--foreground)" }}
                    >
                      {calculateAge(p.dateOfBirth)} yr
                    </span>
                    <span
                      style={{
                        width: 3,
                        height: 3,
                        borderRadius: "50%",
                        background: "var(--border-ui)",
                        display: "inline-block",
                      }}
                    />
                  </>
                )}
                {p.gender && (
                  <span>
                    {p.gender.charAt(0) + p.gender.slice(1).toLowerCase()}
                  </span>
                )}
                {p.cnie && (
                  <>
                    <span
                      style={{
                        width: 3,
                        height: 3,
                        borderRadius: "50%",
                        background: "var(--border-ui)",
                        display: "inline-block",
                      }}
                    />
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "var(--text-placeholder)",
                      }}
                    >
                      {p.cnie}
                    </span>
                  </>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {p.email && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 12,
                      color: "var(--text-muted)",
                    }}
                  >
                    <Mail size={11} style={{ flexShrink: 0 }} />
                    <span
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {p.email}
                    </span>
                  </div>
                )}
                {p.phone && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 12,
                      color: "var(--text-muted)",
                    }}
                  >
                    <Phone size={11} /> {p.phone}
                  </div>
                )}
              </div>
              {p.allergies && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "5px 8px",
                    borderRadius: 7,
                    background: "#fff7ed",
                    border: "1px solid #fed7aa",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#c2410c",
                  }}
                >
                  <AlertCircle size={11} style={{ flexShrink: 0 }} />
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Allergy: {p.allergies}
                  </span>
                </div>
              )}
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-placeholder)",
                  paddingTop: 4,
                  borderTop: "1px solid var(--border-ui)",
                }}
              >
                Registered {formatRelativeDate(p.createdAt)}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  title="Call"
                  style={{
                    flex: 1,
                    padding: "7px 0",
                    borderRadius: 7,
                    border: "1px solid var(--border-ui)",
                    background: "var(--surface-card)",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <PhoneCall size={13} />
                </button>
                <button
                  title="Schedule"
                  style={{
                    flex: 1,
                    padding: "7px 0",
                    borderRadius: 7,
                    border: "1px solid var(--border-ui)",
                    background: "var(--surface-card)",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CalendarDays size={13} />
                </button>
                <button
                  onClick={() => onEdit(p)}
                  style={{
                    flex: 2,
                    padding: "7px 10px",
                    borderRadius: 7,
                    border: "none",
                    background: "var(--brand-primary)",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                  }}
                >
                  <Edit2 size={12} /> Edit
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <PaginationBar
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={onSetPage}
      />
    </div>
  );
}
