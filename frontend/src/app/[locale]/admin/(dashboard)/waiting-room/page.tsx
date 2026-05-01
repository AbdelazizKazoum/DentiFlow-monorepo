"use client";

import React, { useState, useCallback } from "react";
import {
  ClipboardList,
  Clock,
  User,
  Phone,
  Calendar,
  CheckCircle2,
  UserCheck,
  Timer,
  AlertCircle,
  MoreVertical,
  FileText,
} from "lucide-react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Chip,
} from "@mui/material";

// ─── Types ────────────────────────────────────────────────────────────────────

type QueueStatus = "ARRIVED" | "WAITING" | "IN_CHAIR" | "DONE";

interface QueueEntry {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string; // Snapshot from patient_service
  patientPhone: string; // Snapshot
  doctorId: string;
  doctorName: string; // Snapshot from clinic_service
  assistantId: string | null;
  assistantName: string | null; // Snapshot
  status: QueueStatus;
  arrivedAt: string; // ISO timestamp
  calledAt: string | null;
  seatedAt: string | null;
  completedAt: string | null;
  notes: string | null;
  scheduledTime: string; // The original appointment time
}

interface FormState {
  notes: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  QueueStatus,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  ARRIVED: {
    label: "Arrived",
    color: "#1e56d0",
    bg: "#e8f0fe",
    icon: <CheckCircle2 size={16} />,
  },
  WAITING: {
    label: "Waiting",
    color: "#f59e0b",
    bg: "#fef3c7",
    icon: <Clock size={16} />,
  },
  IN_CHAIR: {
    label: "In Chair",
    color: "#8b5cf6",
    bg: "#f3e8ff",
    icon: <UserCheck size={16} />,
  },
  DONE: {
    label: "Done",
    color: "#279C41",
    bg: "#E8F8EC",
    icon: <CheckCircle2 size={16} />,
  },
};

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INITIAL_QUEUE: QueueEntry[] = [
  {
    id: "q1",
    appointmentId: "apt1",
    patientId: "p1",
    patientName: "Sarah Johnson",
    patientPhone: "+213 555 0101",
    doctorId: "d1",
    doctorName: "Dr. Benali",
    assistantId: "a1",
    assistantName: "Amira Khedim",
    status: "IN_CHAIR",
    arrivedAt: "2026-05-01T09:15:00Z",
    calledAt: "2026-05-01T09:35:00Z",
    seatedAt: "2026-05-01T09:40:00Z",
    completedAt: null,
    notes: null,
    scheduledTime: "09:30",
  },
  {
    id: "q2",
    appointmentId: "apt2",
    patientId: "p2",
    patientName: "Ahmed Meziane",
    patientPhone: "+213 555 0102",
    doctorId: "d1",
    doctorName: "Dr. Benali",
    assistantId: null,
    assistantName: null,
    status: "WAITING",
    arrivedAt: "2026-05-01T09:50:00Z",
    calledAt: null,
    seatedAt: null,
    completedAt: null,
    notes: null,
    scheduledTime: "10:00",
  },
  {
    id: "q3",
    appointmentId: "apt3",
    patientId: "p3",
    patientName: "Fatima Bouaziz",
    patientPhone: "+213 555 0103",
    doctorId: "d1",
    doctorName: "Dr. Benali",
    assistantId: null,
    assistantName: null,
    status: "ARRIVED",
    arrivedAt: "2026-05-01T10:05:00Z",
    calledAt: null,
    seatedAt: null,
    completedAt: null,
    notes: "First-time patient",
    scheduledTime: "10:30",
  },
  {
    id: "q4",
    appointmentId: "apt4",
    patientId: "p4",
    patientName: "Karim Mansouri",
    patientPhone: "+213 555 0104",
    doctorId: "d1",
    doctorName: "Dr. Benali",
    assistantId: "a1",
    assistantName: "Amira Khedim",
    status: "DONE",
    arrivedAt: "2026-05-01T08:25:00Z",
    calledAt: "2026-05-01T08:30:00Z",
    seatedAt: "2026-05-01T08:35:00Z",
    completedAt: "2026-05-01T09:10:00Z",
    notes: null,
    scheduledTime: "08:30",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calculateWaitTime(arrivedAt: string, calledAt: string | null): string {
  if (!calledAt) {
    const arrived = new Date(arrivedAt);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - arrived.getTime()) / 60000);
    return `${diffMinutes} min`;
  }
  const arrived = new Date(arrivedAt);
  const called = new Date(calledAt);
  const diffMinutes = Math.floor(
    (called.getTime() - arrived.getTime()) / 60000,
  );
  return `${diffMinutes} min`;
}

function formatTime(isoString: string | null): string {
  if (!isoString) return "—";
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function getInitials(name: string) {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.charAt(0)?.toUpperCase() || "";
  const last =
    parts.length > 1 ? parts[parts.length - 1].charAt(0).toUpperCase() : "";
  return `${first}${last}`;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function WaitingRoomPage() {
  const [queue, setQueue] = useState<QueueEntry[]>(INITIAL_QUEUE);
  const [selectedEntry, setSelectedEntry] = useState<QueueEntry | null>(null);
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [formState, setFormState] = useState<FormState>({ notes: "" });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeMenuEntry, setActiveMenuEntry] = useState<QueueEntry | null>(
    null,
  );

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    entry: QueueEntry,
  ) => {
    setAnchorEl(event.currentTarget);
    setActiveMenuEntry(entry);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setActiveMenuEntry(null);
  };

  const handleOpenNotesDialog = (entry: QueueEntry) => {
    setSelectedEntry(entry);
    setFormState({ notes: entry.notes || "" });
    setIsNotesDialogOpen(true);
    handleMenuClose();
  };

  const handleCloseNotesDialog = () => {
    setIsNotesDialogOpen(false);
    setSelectedEntry(null);
    setFormState({ notes: "" });
  };

  const handleSaveNotes = useCallback(() => {
    if (!selectedEntry) return;
    setQueue((prev) =>
      prev.map((e) =>
        e.id === selectedEntry.id ? { ...e, notes: formState.notes } : e,
      ),
    );
    handleCloseNotesDialog();
  }, [selectedEntry, formState.notes]);

  const handleChangeStatus = useCallback(
    (entryId: string, newStatus: QueueStatus) => {
      const now = new Date().toISOString();
      setQueue((prev) =>
        prev.map((e) => {
          if (e.id !== entryId) return e;
          const updated = { ...e, status: newStatus };
          if (newStatus === "WAITING" && !e.calledAt) {
            updated.calledAt = now;
          }
          if (newStatus === "IN_CHAIR" && !e.seatedAt) {
            updated.seatedAt = now;
          }
          if (newStatus === "DONE" && !e.completedAt) {
            updated.completedAt = now;
          }
          return updated;
        }),
      );
      handleMenuClose();
    },
    [],
  );

  // ─── Filters ────────────────────────────────────────────────────────────────

  const activeQueue = queue.filter((e) => e.status !== "DONE");
  const completedToday = queue.filter((e) => e.status === "DONE");

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Waiting Room</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Manage real-time patient queue and status tracking
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold shadow-sm"
            style={{
              borderColor: "var(--border-ui)",
              backgroundColor: "var(--card-bg)",
              color: "var(--foreground)",
            }}
          >
            <Timer size={16} style={{ color: "var(--brand-primary)" }} />
            <span>{activeQueue.length} in queue</span>
          </div>
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold shadow-sm"
            style={{
              borderColor: "var(--border-ui)",
              backgroundColor: "var(--card-bg)",
              color: "var(--foreground)",
            }}
          >
            <CheckCircle2 size={16} className="text-green-600" />
            <span>{completedToday.length} completed</span>
          </div>
        </div>
      </div>

      {/* Active Queue */}
      <div
        className="bg-card border rounded-xl overflow-hidden shadow-sm"
        style={{ borderColor: "var(--border-ui)" }}
      >
        <div
          className="px-6 py-4 border-b flex items-center gap-2"
          style={{ borderColor: "var(--border-ui)" }}
        >
          <Clock size={18} style={{ color: "var(--brand-primary)" }} />
          <h2 className="text-base font-semibold text-foreground">
            Active Queue
          </h2>
        </div>

        {activeQueue.length === 0 ? (
          <div className="p-12 flex flex-col items-center gap-3">
            <ClipboardList size={40} style={{ color: "var(--text-muted)" }} />
            <p
              className="text-sm font-medium"
              style={{ color: "var(--text-muted)" }}
            >
              No patients in the queue right now
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr
                  className="border-b"
                  style={{ borderColor: "var(--border-ui)" }}
                >
                  <th
                    className="px-6 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Patient
                  </th>
                  <th
                    className="px-6 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Appointment
                  </th>
                  <th
                    className="px-6 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Wait Time
                  </th>
                  <th
                    className="px-6 py-3 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Status
                  </th>
                  <th
                    className="px-6 py-3 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {activeQueue.map((entry) => {
                  const config = STATUS_CONFIG[entry.status];
                  return (
                    <tr
                      key={entry.id}
                      className="transition-colors hover:bg-gray-50/50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium ring-2 ring-white/20 shrink-0 shadow-sm"
                            style={{
                              backgroundColor: "var(--brand-primary)",
                              color: "white",
                            }}
                          >
                            {getInitials(entry.patientName)}
                          </div>
                          <div>
                            <p className="font-medium text-sm text-foreground">
                              {entry.patientName}
                            </p>
                            <div
                              className="flex items-center gap-1.5 text-xs mt-0.5"
                              style={{ color: "var(--text-muted)" }}
                            >
                              <Phone size={12} />
                              <span>{entry.patientPhone}</span>
                            </div>
                            {entry.notes && (
                              <div className="flex items-center gap-1 text-[11px] mt-1 text-amber-600 font-medium">
                                <AlertCircle size={10} className="shrink-0" />
                                <span className="truncate max-w-37.5">
                                  {entry.notes}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                            <Calendar
                              size={12}
                              style={{ color: "var(--text-muted)" }}
                            />
                            <span>{entry.scheduledTime}</span>
                          </div>
                          <div
                            className="flex items-center gap-1.5 text-xs"
                            style={{ color: "var(--text-muted)" }}
                          >
                            <User size={12} />
                            <span>{entry.doctorName}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <p
                            className="text-xs font-semibold"
                            style={{ color: "var(--brand-primary)" }}
                          >
                            {calculateWaitTime(entry.arrivedAt, entry.calledAt)}{" "}
                            elapsed
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: "var(--text-muted)" }}
                          >
                            Arr: {formatTime(entry.arrivedAt)}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <Chip
                          label={config.label}
                          icon={config.icon as React.ReactElement}
                          size="small"
                          sx={{
                            backgroundColor: config.bg,
                            color: config.color,
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            border: "none",
                            "& .MuiChip-icon": {
                              color: config.color,
                            },
                          }}
                        />
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={(e) => handleMenuOpen(e, entry)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                          style={{ color: "var(--text-muted)" }}
                        >
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Completed Today */}
      {completedToday.length > 0 && (
        <div
          className="bg-card border rounded-xl overflow-hidden shadow-sm mt-8"
          style={{ borderColor: "var(--border-ui)" }}
        >
          <div
            className="px-6 py-4 border-b flex items-center gap-2"
            style={{ borderColor: "var(--border-ui)" }}
          >
            <CheckCircle2 size={18} className="text-green-600" />
            <h2 className="text-base font-semibold text-foreground">
              Completed Today
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {completedToday.map((entry) => (
                  <tr
                    key={entry.id}
                    className="transition-colors hover:bg-gray-50/50"
                  >
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ring-1 ring-white/10 shrink-0 text-green-700 bg-green-100">
                          {getInitials(entry.patientName)}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-foreground">
                            {entry.patientName}
                          </p>
                          <div
                            className="flex items-center gap-2 text-[11px] mt-0.5"
                            style={{ color: "var(--text-muted)" }}
                          >
                            <span>{entry.doctorName}</span>
                            <span>•</span>
                            <span>
                              {formatTime(entry.arrivedAt)} -{" "}
                              {formatTime(entry.completedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-right">
                      <Chip
                        label="Done"
                        icon={<CheckCircle2 size={14} />}
                        size="small"
                        sx={{
                          backgroundColor: STATUS_CONFIG.DONE.bg,
                          color: STATUS_CONFIG.DONE.color,
                          fontWeight: 600,
                          fontSize: "0.7rem",
                          border: "none",
                          "& .MuiChip-icon": {
                            color: STATUS_CONFIG.DONE.color,
                          },
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        slotProps={{
          paper: {
            elevation: 2,
            sx: {
              mt: 1,
              borderRadius: "12px",
              border: "1px solid var(--border-ui)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            },
          },
        }}
      >
        {activeMenuEntry && (
          <>
            {activeMenuEntry.status !== "WAITING" && (
              <MenuItem
                onClick={() =>
                  handleChangeStatus(activeMenuEntry.id, "WAITING")
                }
                sx={{ fontSize: "0.875rem", py: 1.5 }}
              >
                <Clock size={16} className="mr-3 text-amber-500" />
                Mark as Waiting
              </MenuItem>
            )}
            {activeMenuEntry.status !== "IN_CHAIR" && (
              <MenuItem
                onClick={() =>
                  handleChangeStatus(activeMenuEntry.id, "IN_CHAIR")
                }
                sx={{ fontSize: "0.875rem", py: 1.5 }}
              >
                <UserCheck size={16} className="mr-3 text-purple-500" />
                Mark as In Chair
              </MenuItem>
            )}
            {activeMenuEntry.status !== "DONE" && (
              <MenuItem
                onClick={() => handleChangeStatus(activeMenuEntry.id, "DONE")}
                sx={{ fontSize: "0.875rem", py: 1.5 }}
              >
                <CheckCircle2 size={16} className="mr-3 text-green-500" />
                Mark as Done
              </MenuItem>
            )}
            <MenuItem
              onClick={() => handleOpenNotesDialog(activeMenuEntry)}
              sx={{ fontSize: "0.875rem", py: 1.5 }}
            >
              <FileText size={16} className="mr-3 text-gray-500" />
              {activeMenuEntry.notes ? "Edit Notes" : "Add/View Notes"}
            </MenuItem>
          </>
        )}
      </Menu>

      {/* Notes Dialog */}
      <Dialog
        open={isNotesDialogOpen}
        onClose={handleCloseNotesDialog}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: "16px",
              p: 1,
            },
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <div className="flex items-center justify-between">
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, fontSize: "1.125rem" }}
            >
              Patient Notes
            </Typography>
            <IconButton
              onClick={handleCloseNotesDialog}
              size="small"
              sx={{ color: "var(--text-muted)" }}
            >
              <FileText size={18} />
            </IconButton>
          </div>
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={formState.notes}
            onChange={(e) =>
              setFormState((prev) => ({ ...prev, notes: e.target.value }))
            }
            placeholder="Add any notes or special instructions..."
            sx={{
              mt: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleCloseNotesDialog}
            sx={{
              color: "var(--text-muted)",
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveNotes}
            variant="contained"
            sx={{
              backgroundColor: "var(--brand-primary)",
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "8px",
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "var(--brand-primary-dark)",
                boxShadow: "none",
              },
            }}
          >
            Save Notes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
