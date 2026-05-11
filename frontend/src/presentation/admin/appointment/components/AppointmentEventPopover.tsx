"use client";

import { Avatar, Button, Divider, Popover } from "@mui/material";
import { Calendar, Clock, Edit3, LogIn, Stethoscope, User } from "lucide-react";
import type { Appointment } from "@/domain/appointment/entities/appointment";
import { APPOINTMENT_STATUS_CONFIG } from "../appointmentConfig";
import type { AppointmentProvider } from "../appointmentConfig";

interface AppointmentEventPopoverProps {
  anchorEl: HTMLElement | null;
  appointment: Appointment | null;
  providers: AppointmentProvider[];
  onClose: () => void;
  onEdit: (appointment: Appointment) => void;
  onCheckIn: (appointment: Appointment) => void;
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function isEligibleForCheckIn(appointment: Appointment): boolean {
  if (
    appointment.status === "CANCELLED" ||
    appointment.status === "NO_SHOW" ||
    appointment.status === "COMPLETED"
  )
    return false;

  const today = new Date();
  const apptDate = new Date(appointment.startAt);
  return (
    apptDate.getFullYear() === today.getFullYear() &&
    apptDate.getMonth() === today.getMonth() &&
    apptDate.getDate() === today.getDate()
  );
}

export function AppointmentEventPopover({
  anchorEl,
  appointment,
  providers,
  onClose,
  onEdit,
  onCheckIn,
}: AppointmentEventPopoverProps) {
  if (!appointment) return null;

  const open = Boolean(anchorEl);
  const statusCfg = APPOINTMENT_STATUS_CONFIG[appointment.status];
  const provider = providers.find((p) => p.id === appointment.doctorId);
  const eligible = isEligibleForCheckIn(appointment);

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "center", horizontal: "right" }}
      transformOrigin={{ vertical: "center", horizontal: "left" }}
      slotProps={{
        paper: {
          sx: {
            borderRadius: "14px",
            boxShadow:
              "0 12px 40px -8px rgba(0,0,0,0.18), 0 4px 16px -4px rgba(0,0,0,0.1)",
            border: "1px solid var(--border-ui)",
            backgroundColor: "var(--surface-card)",
            width: 300,
            overflow: "visible",
            ml: "8px",
          },
        },
      }}
    >
      {/* Color accent bar */}
      <div
        style={{
          height: 4,
          borderRadius: "14px 14px 0 0",
          background: `linear-gradient(90deg, ${statusCfg.border}, ${statusCfg.border}88)`,
        }}
      />

      <div style={{ padding: "16px" }}>
        {/* Header: patient + status badge */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 8,
            marginBottom: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: `${statusCfg.border}18`,
                border: `1.5px solid ${statusCfg.border}44`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <User size={18} color={statusCfg.color} />
            </div>
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  color: "var(--foreground)",
                  lineHeight: 1.2,
                }}
              >
                {appointment.patientName}
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  marginTop: 2,
                }}
              >
                {appointment.type ?? "Visit"}
              </div>
            </div>
          </div>

          {/* Status badge */}
          <span
            style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              color: statusCfg.color,
              background: statusCfg.bg,
              border: `1px solid ${statusCfg.border}44`,
              borderRadius: 6,
              padding: "3px 8px",
              whiteSpace: "nowrap",
              letterSpacing: "0.03em",
              textTransform: "uppercase",
            }}
          >
            {statusCfg.label}
          </span>
        </div>

        <Divider sx={{ borderColor: "var(--border-ui)", mb: 1.5 }} />

        {/* Details rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {/* Time */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Clock size={13} color="var(--text-muted)" />
            <span
              style={{
                fontSize: "0.8rem",
                color: "var(--foreground)",
                fontWeight: 500,
              }}
            >
              {formatTime(appointment.startAt)} –{" "}
              {formatTime(appointment.endAt)}
            </span>
          </div>

          {/* Date */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Calendar size={13} color="var(--text-muted)" />
            <span
              style={{
                fontSize: "0.8rem",
                color: "var(--foreground)",
                fontWeight: 500,
              }}
            >
              {formatDate(appointment.startAt)}
            </span>
            {appointment.isEmergency && (
              <span
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  color: "#dc2626",
                  background: "#fee2e2",
                  borderRadius: 4,
                  padding: "1px 6px",
                  marginLeft: 4,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Emergency
              </span>
            )}
          </div>

          {/* Doctor */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Stethoscope size={13} color="var(--text-muted)" />
            {provider ? (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Avatar
                  src={provider.avatar}
                  sx={{
                    width: 18,
                    height: 18,
                    fontSize: "0.55rem",
                    border: `1.5px solid ${provider.color}`,
                  }}
                >
                  {initials(provider.name)}
                </Avatar>
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--foreground)",
                    fontWeight: 500,
                  }}
                >
                  {appointment.doctorName}
                </span>
              </div>
            ) : (
              <span
                style={{
                  fontSize: "0.8rem",
                  color: "var(--foreground)",
                  fontWeight: 500,
                }}
              >
                {appointment.doctorName}
              </span>
            )}
          </div>

          {/* Notes */}
          {appointment.notes && (
            <div
              style={{
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                background: "var(--surface-hover, #f8fafc)",
                borderRadius: 8,
                padding: "7px 10px",
                fontStyle: "italic",
                lineHeight: 1.4,
                marginTop: 2,
              }}
            >
              {appointment.notes}
            </div>
          )}
        </div>

        <Divider sx={{ borderColor: "var(--border-ui)", mt: 1.5, mb: 1.5 }} />

        {/* Actions */}
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Edit3 size={13} />}
            onClick={() => {
              onClose();
              onEdit(appointment);
            }}
            fullWidth
            sx={{
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.8rem",
              borderRadius: "8px",
              borderColor: "var(--border-ui)",
              color: "var(--foreground)",
              "&:hover": {
                borderColor: "var(--brand-primary)",
                color: "var(--brand-primary)",
                background: "#eff6ff",
              },
            }}
          >
            Edit
          </Button>

          {eligible && (
            <Button
              variant="contained"
              size="small"
              startIcon={<LogIn size={13} />}
              onClick={() => {
                onClose();
                onCheckIn(appointment);
              }}
              fullWidth
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.8rem",
                borderRadius: "8px",
                backgroundColor: "#279C41",
                boxShadow: "0 1px 4px rgba(39,156,65,0.3)",
                "&:hover": {
                  backgroundColor: "#1e7a32",
                  boxShadow: "0 2px 8px rgba(39,156,65,0.4)",
                },
              }}
            >
              Check In
            </Button>
          )}
        </div>
      </div>
    </Popover>
  );
}
