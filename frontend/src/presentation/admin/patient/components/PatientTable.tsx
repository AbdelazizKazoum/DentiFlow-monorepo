"use client";

import React from "react";
import { Checkbox } from "@mui/material";
import {
  PhoneCall,
  CalendarDays,
  MoreVertical,
  Mail,
  Phone,
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

interface PatientTableProps {
  patients: Patient[];
  selectedIds: Set<string>;
  allSelected: boolean;
  someSelected: boolean;
  currentPage: number;
  totalPages: number;
  onToggleAll: () => void;
  onToggleOne: (id: string) => void;
  onOpenMenu: (e: React.MouseEvent<HTMLButtonElement>, id: string) => void;
  onSetPage: (page: number) => void;
}

export function PatientTable({
  patients,
  selectedIds,
  allSelected,
  someSelected,
  currentPage,
  totalPages,
  onToggleAll,
  onToggleOne,
  onOpenMenu,
  onSetPage,
}: PatientTableProps) {
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
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{
                borderBottom: "1px solid var(--border-ui)",
                background: "var(--surface-page)",
              }}
            >
              <th style={{ padding: "10px 12px", width: 40 }}>
                <Checkbox
                  size="small"
                  checked={allSelected}
                  indeterminate={someSelected && !allSelected}
                  onChange={onToggleAll}
                  sx={{
                    padding: 0,
                    color: "var(--text-placeholder)",
                    "&.Mui-checked": { color: "var(--brand-primary)" },
                    "&.MuiCheckbox-indeterminate": {
                      color: "var(--brand-primary)",
                    },
                  }}
                />
              </th>
              {[
                "Patient",
                "Contact",
                "Personal",
                "Medical",
                "Status",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "10px 14px",
                    textAlign: "left",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--text-placeholder)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => {
              const cfg = STATUS_CONFIG[p.status];
              const isNew = isNewPatient(p.createdAt);
              const isChecked = selectedIds.has(p.id);
              const fullName = getFullName(p.firstName, p.lastName);
              return (
                <tr
                  key={p.id}
                  style={{
                    borderBottom: "1px solid var(--border-ui)",
                    background: isChecked
                      ? "rgba(30,86,208,0.05)"
                      : "transparent",
                    transition: "background 0.12s",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => {
                    if (!isChecked)
                      (e.currentTarget as HTMLElement).style.background =
                        "var(--surface-page)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      isChecked ? "rgba(30,86,208,0.05)" : "transparent";
                  }}
                >
                  <td style={{ padding: "12px 12px" }}>
                    <Checkbox
                      size="small"
                      checked={isChecked}
                      onChange={() => onToggleOne(p.id)}
                      sx={{
                        padding: 0,
                        color: "var(--text-placeholder)",
                        "&.Mui-checked": { color: "var(--brand-primary)" },
                      }}
                    />
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          fontWeight: 700,
                          fontSize: 13,
                          color: "#fff",
                          background: getAvatarColor(p.id),
                          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                        }}
                      >
                        {getInitials(p.firstName, p.lastName)}
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: "var(--foreground)",
                            letterSpacing: "-0.01em",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          {fullName}
                          {isNew && (
                            <span
                              style={{
                                fontSize: 9,
                                fontWeight: 700,
                                color: "#0891b2",
                                background: "#ecfeff",
                                border: "1px solid #a5f3fc",
                                borderRadius: 4,
                                padding: "1px 5px",
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                              }}
                            >
                              New
                            </span>
                          )}
                        </div>
                        <div
                          className="text-text-placeholder"
                          style={{ fontSize: 11 }}
                        >
                          Registered {formatRelativeDate(p.createdAt)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 3,
                      }}
                    >
                      {p.email && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            fontSize: 12,
                            color: "var(--text-muted)",
                          }}
                        >
                          <Mail size={11} />
                          <span
                            style={{
                              maxWidth: 160,
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
                            gap: 5,
                            fontSize: 12,
                            color: "var(--text-muted)",
                          }}
                        >
                          <Phone size={11} /> {p.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--foreground)",
                      }}
                    >
                      {p.dateOfBirth
                        ? `${calculateAge(p.dateOfBirth)} yr`
                        : "—"}
                    </div>
                    <div
                      className="text-text-placeholder"
                      style={{ fontSize: 12 }}
                    >
                      {p.gender
                        ? p.gender.charAt(0) + p.gender.slice(1).toLowerCase()
                        : "—"}
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    {p.allergies ? (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "3px 8px",
                          borderRadius: 6,
                          background: "#fff7ed",
                          color: "#c2410c",
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        <AlertCircle size={11} /> {p.allergies}
                      </span>
                    ) : (
                      <span
                        className="text-text-placeholder"
                        style={{ fontSize: 12 }}
                      >
                        No allergies
                      </span>
                    )}
                    {p.chronicConditions && (
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--text-muted)",
                          maxWidth: 130,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          marginTop: 2,
                        }}
                        title={p.chronicConditions}
                      >
                        {p.chronicConditions}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "4px 10px",
                        borderRadius: 20,
                        background: cfg.bg,
                        color: cfg.color,
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: "0.01em",
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: cfg.dot,
                          flexShrink: 0,
                        }}
                      />
                      {cfg.label}
                    </span>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <button
                        title="Call"
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 5,
                          borderRadius: 6,
                          color: "var(--text-muted)",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            "var(--surface-page)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "none")
                        }
                      >
                        <PhoneCall size={15} />
                      </button>
                      <button
                        title="Schedule"
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 5,
                          borderRadius: 6,
                          color: "var(--text-muted)",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            "var(--surface-page)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "none")
                        }
                      >
                        <CalendarDays size={15} />
                      </button>
                      <button
                        onClick={(e) => onOpenMenu(e, p.id)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 5,
                          borderRadius: 6,
                          color: "var(--text-muted)",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            "var(--surface-page)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "none")
                        }
                      >
                        <MoreVertical size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <PaginationBar
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={onSetPage}
      />
    </div>
  );
}
