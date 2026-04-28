"use client";

import React, { useState, useCallback, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type {
  DateSelectArg,
  EventClickArg,
  EventChangeArg,
  EventInput,
} from "@fullcalendar/core";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  IconButton,
  Typography,
} from "@mui/material";
import { X } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type AppointmentStatus = "confirmed" | "pending" | "cancelled";

interface AppointmentEvent extends EventInput {
  id: string;
  title: string;
  start: string;
  end: string;
  extendedProps: {
    status: AppointmentStatus;
  };
}

interface FormState {
  id: string;
  title: string;
  start: string;
  end: string;
  status: AppointmentStatus;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  AppointmentStatus,
  { color: string; bg: string; border: string; label: string }
> = {
  confirmed: {
    color: "#279C41", // Green for text
    bg: "#E8F8EC", // Pale green bg
    border: "#279C41", // Same green for left border
    label: "Confirmed",
  },
  pending: {
    color: "#2B6CB0", // Blue for text
    bg: "#E8F4FD", // Pale blue fill
    border: "#2B6CB0", // Same blue for left border
    label: "Pending",
  },
  cancelled: {
    color: "#6B46C1", // Purple for text
    bg: "#F3EBFA", // Pale purple fill
    border: "#6B46C1", // Same purple for left border
    label: "Cancelled",
  },
};

const INITIAL_EVENTS: AppointmentEvent[] = [
  {
    id: "1",
    title: "Alice Johnson — Checkup",
    start: (() => {
      const d = new Date();
      d.setHours(10, 0, 0, 0);
      return d.toISOString();
    })(),
    end: (() => {
      const d = new Date();
      d.setHours(10, 30, 0, 0);
      return d.toISOString();
    })(),
    extendedProps: { status: "confirmed" },
  },
  {
    id: "2",
    title: "Bob Smith — Scaling",
    start: (() => {
      const d = new Date();
      d.setHours(14, 0, 0, 0);
      return d.toISOString();
    })(),
    end: (() => {
      const d = new Date();
      d.setHours(15, 0, 0, 0);
      return d.toISOString();
    })(),
    extendedProps: { status: "pending" },
  },
  {
    id: "3",
    title: "Diana Lee — Root Canal",
    start: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(11, 0, 0, 0);
      return d.toISOString();
    })(),
    end: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(12, 0, 0, 0);
      return d.toISOString();
    })(),
    extendedProps: { status: "cancelled" },
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDatetimeLocal(date: string | Date): string {
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const EMPTY_FORM: FormState = {
  id: "",
  title: "",
  start: "",
  end: "",
  status: "pending",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AppointmentsPage() {
  const [events, setEvents] = useState<AppointmentEvent[]>(INITIAL_EVENTS);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState("");
  const calendarRef = useRef<FullCalendar>(null);

  // Check overlap
  const hasOverlap = useCallback(
    (start: string, end: string, excludeId = "") => {
      const s = new Date(start).getTime();
      const e = new Date(end).getTime();
      return events.some((evt) => {
        if (evt.id === excludeId) return false;
        const es = new Date(evt.start as string).getTime();
        const ee = new Date(evt.end as string).getTime();
        return s < ee && e > es;
      });
    },
    [events],
  );

  // Open modal for new appointment
  const openNew = useCallback((start?: string, end?: string) => {
    const now = new Date();
    now.setSeconds(0, 0);
    const later = new Date(now.getTime() + 30 * 60 * 1000);
    setForm({
      id: "",
      title: "",
      start: start ?? toDatetimeLocal(now),
      end: end ?? toDatetimeLocal(later),
      status: "pending",
    });
    setError("");
    setModalOpen(true);
  }, []);

  const handleDateSelect = useCallback(
    (info: DateSelectArg) => {
      openNew(toDatetimeLocal(info.start), toDatetimeLocal(info.end));
    },
    [openNew],
  );

  const handleEventClick = useCallback((info: EventClickArg) => {
    const { event } = info;
    setForm({
      id: event.id,
      title: event.title,
      start: toDatetimeLocal(event.start!),
      end: toDatetimeLocal(event.end ?? event.start!),
      status: event.extendedProps.status as AppointmentStatus,
    });
    setError("");
    setModalOpen(true);
  }, []);

  const handleEventChange = useCallback(
    (info: EventChangeArg) => {
      const { event } = info;
      if (
        hasOverlap(
          event.start!.toISOString(),
          event.end!.toISOString(),
          event.id,
        )
      ) {
        info.revert();
        return;
      }
      setEvents((prev) =>
        prev.map((e) =>
          e.id === event.id
            ? {
                ...e,
                start: event.start!.toISOString(),
                end: event.end!.toISOString(),
              }
            : e,
        ),
      );
    },
    [hasOverlap],
  );

  const handleSave = () => {
    if (!form.title.trim()) {
      setError("Patient name is required.");
      return;
    }
    if (new Date(form.end) <= new Date(form.start)) {
      setError("End time must be after start time.");
      return;
    }
    if (hasOverlap(form.start, form.end, form.id)) {
      setError("This time slot overlaps with an existing appointment.");
      return;
    }

    const updated: AppointmentEvent = {
      id: form.id || String(Date.now()),
      title: form.title,
      start: new Date(form.start).toISOString(),
      end: new Date(form.end).toISOString(),
      extendedProps: { status: form.status },
    };

    setEvents((prev) =>
      form.id
        ? prev.map((e) => (e.id === form.id ? updated : e))
        : [...prev, updated],
    );
    setModalOpen(false);
  };

  const handleDelete = () => {
    setEvents((prev) => prev.filter((e) => e.id !== form.id));
    setModalOpen(false);
  };

  const calendarEvents = events.map((e) => ({
    ...e,
    backgroundColor: STATUS_CONFIG[e.extendedProps.status].bg,
    borderColor: STATUS_CONFIG[e.extendedProps.status].border,
    textColor: STATUS_CONFIG[e.extendedProps.status].color,
  }));

  return (
    <>
      {/* ── FullCalendar global CSS overrides ── */}
      <style>{`
        .fc {
          --fc-border-color: #f1f5f9;
          --fc-today-bg-color: #fafafa;
          --fc-now-indicator-color: #1e56d0;
          font-family: inherit;
        }
        .dark .fc-theme-standard td, .dark .fc-theme-standard th, .dark .fc-theme-standard .fc-scrollgrid {
          border-color: rgba(255,255,255,0.06) !important;
        }

        /* ─── Toolbar ─── */
        .fc .fc-toolbar {
          align-items: center !important;
          padding: 10px 0 16px !important;
          gap: 10px !important;
          flex-wrap: wrap !important;
        }
        .fc .fc-toolbar-chunk {
          display: flex !important;
          align-items: center !important;
          gap: 6px !important;
        }
        .fc .fc-toolbar-title {
          font-size: 1.1rem !important;
          font-weight: 700 !important;
          color: var(--foreground) !important;
          letter-spacing: -0.01em !important;
        }

        /* ─── Base button ─── */
        .fc .fc-button {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          height: 36px !important;
          padding: 0 14px !important;
          font-size: 0.82rem !important;
          font-weight: 500 !important;
          border-radius: 8px !important;
          border: 1px solid #e2e8f0 !important;
          background: #ffffff !important;
          color: #475569 !important;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important;
          text-transform: none !important;
          transition: all 0.15s !important;
        }
        .fc .fc-button:hover {
          background: #f8fafc !important;
          border-color: #cbd5e1 !important;
          color: #1e293b !important;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08) !important;
        }
        .fc .fc-button:focus,
        .fc .fc-button:focus-visible { outline: none !important; box-shadow: 0 0 0 3px rgba(30,86,208,0.15) !important; }
        .dark .fc .fc-button {
          background: #252b45 !important;
          border-color: #3d4466 !important;
          color: #94a3b8 !important;
          box-shadow: none !important;
        }
        .dark .fc .fc-button:hover {
          background: #2f3757 !important;
          border-color: #4d5a80 !important;
          color: #e2e8f0 !important;
        }

        /* ─── Prev / Next ─── */
        .fc .fc-prev-button,
        .fc .fc-next-button {
          width: 36px !important;
          padding: 0 !important;
          background: #ffffff !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 8px !important;
          color: #64748b !important;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important;
        }
        .fc .fc-prev-button:hover,
        .fc .fc-next-button:hover {
          background: #f1f5f9 !important;
          border-color: #cbd5e1 !important;
          color: #1e293b !important;
        }
        .dark .fc .fc-prev-button,
        .dark .fc .fc-next-button {
          background: #252b45 !important;
          border-color: #3d4466 !important;
          color: #7a8499 !important;
        }
        .dark .fc .fc-prev-button:hover,
        .dark .fc .fc-next-button:hover {
          background: #2f3757 !important;
          color: #e2e8f0 !important;
        }

        /* ─── Today ─── */
        .fc .fc-today-button {
          background: #f0f4ff !important;
          border-color: #c7d7fa !important;
          color: #1e56d0 !important;
          font-weight: 600 !important;
          letter-spacing: 0.01em !important;
        }
        .fc .fc-today-button:hover {
          background: #e0eaff !important;
          border-color: #a5beef !important;
          color: #1748b8 !important;
        }
        .fc .fc-today-button:disabled { opacity: 0.38 !important; cursor: not-allowed !important; }
        .dark .fc .fc-today-button {
          background: rgba(30,86,208,0.12) !important;
          border-color: rgba(30,86,208,0.3) !important;
          color: #6395f5 !important;
        }
        .dark .fc .fc-today-button:hover {
          background: rgba(30,86,208,0.2) !important;
        }

        /* ─── View switcher: bordered segmented control ─── */
        .fc .fc-button-group {
          display: inline-flex !important;
          background: transparent !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 8px !important;
          padding: 0 !important;
          gap: 0 !important;
          overflow: hidden !important;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important;
        }
        .dark .fc .fc-button-group {
          border-color: #3d4466 !important;
          box-shadow: none !important;
        }
        .fc .fc-button-group .fc-button {
          border-radius: 0 !important;
          border: none !important;
          border-right: 1px solid #e2e8f0 !important;
          box-shadow: none !important;
          height: 36px !important;
          padding: 0 16px !important;
          color: #64748b !important;
          background: #ffffff !important;
        }
        .dark .fc .fc-button-group .fc-button {
          background: #252b45 !important;
          border-right-color: #3d4466 !important;
          color: #7a8499 !important;
        }
        .fc .fc-button-group .fc-button:last-child { border-right: none !important; }
        .fc .fc-button-group .fc-button:hover {
          background: #f1f5f9 !important;
          color: #1e293b !important;
        }
        .dark .fc .fc-button-group .fc-button:hover {
          background: #2f3757 !important;
          color: #e2e8f0 !important;
        }
        .fc .fc-button-group .fc-button-primary:not(:disabled).fc-button-active,
        .fc .fc-button-group .fc-button-primary:not(:disabled):active {
          background: #eff6ff !important;
          color: #1e56d0 !important;
          font-weight: 600 !important;
        }
        .dark .fc .fc-button-group .fc-button-primary:not(:disabled).fc-button-active,
        .dark .fc .fc-button-group .fc-button-primary:not(:disabled):active {
          background: rgba(30,86,208,0.18) !important;
          color: #6395f5 !important;
          font-weight: 600 !important;
        }

        /* ─── New Appointment button ─── */
        .fc .fc-addAppointment-button {
          height: 36px !important;
          padding: 0 16px !important;
          background: #1e56d0 !important;
          color: #ffffff !important;
          border: none !important;
          border-radius: 8px !important;
          font-weight: 600 !important;
          font-size: 0.82rem !important;
          letter-spacing: 0.01em !important;
          cursor: pointer !important;
          margin-left: 4px !important;
          box-shadow: 0 1px 3px rgba(30,86,208,0.3) !important;
          transition: background 0.15s, box-shadow 0.15s !important;
        }
        .fc .fc-addAppointment-button:hover {
          background: #1748b8 !important;
          box-shadow: 0 2px 6px rgba(30,86,208,0.4) !important;
          color: #fff !important;
        }

        /* ─── Grid & Events ─── */
          .fc-timegrid-slot { height: 3.5rem !important; }
        .fc-event {
            border-width: 0 !important; /* wipe out FullCalendar border thickness */
            border-left-width: 3px !important; /* apply left side */
            border-style: solid !important;
          border-radius: 0 !important; /* Sharp corners matching design */
          /* padding: 4px 6px !important; moved to eventContent */
          font-size: 0.72rem !important;
          font-weight: 600 !important;
          line-height: 1.2 !important;
          box-shadow: none !important;
          cursor: pointer;
          margin-bottom: 2px !important;
          margin-right: 0 !important; /* Full width up to grid line */
          transition: filter 0.15s !important;
        }
        .fc-event:hover {
          filter: brightness(0.96) !important;
        }
          .fc-v-event .fc-event-main { padding: 0 !important; }
          .fc-event .fc-event-main, .fc-event .fc-event-main-frame { background: transparent !important; }
        /* Overwrite dark mode specific event styles to keep legibility */
        .dark .fc-event {
          box-shadow: none !important;
          opacity: 0.9 !important;
        }
        /* Clean minimal grid */
        .fc-theme-standard td, .fc-theme-standard th, .fc-theme-standard .fc-scrollgrid {
          border-color: #f1f5f9 !important;
        }
        .fc-col-header-cell { padding: 4px 0 !important; background: transparent !important; }
        .fc-col-header-cell-cushion {
            font-size: 0.75rem !important;
            font-weight: 500 !important;
          text-transform: uppercase !important;
          color: var(--text-muted) !important;
          text-decoration: none !important;
          padding: 8px 0 !important;
        }
        .fc-day-today .fc-col-header-cell-cushion { color: #1e56d0 !important; }
        .fc-timegrid-axis-cushion,
        .fc-timegrid-slot-label-cushion { 
          font-size: 0.8rem !important;
            color: #64748b !important; 
          font-weight: 400 !important;
        }
        .fc-scrollgrid { border-radius: 0 !important; }
        .fc-scrollgrid-section > td { border: none !important; }
      `}</style>

      <div className="p-6 lg:p-8 space-y-6">
        {/* ── Header ── */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Appointments</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Manage your patient schedule
          </p>
        </div>

        {/* ── Calendar Card ── */}
        <div
          className="bg-card border rounded-lg overflow-hidden"
          style={{ borderColor: "var(--border-ui)" }}
        >
          {/* Legend bar */}
          <div
            className="px-6 py-3.5 border-b flex flex-wrap items-center gap-5"
            style={{ borderColor: "var(--border-ui)" }}
          >
            {(
              Object.entries(STATUS_CONFIG) as [
                AppointmentStatus,
                (typeof STATUS_CONFIG)[AppointmentStatus],
              ][]
            ).map(([key, cfg]) => (
              <div key={key} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: cfg.border }}
                />
                <span
                  className="text-xs font-semibold"
                  style={{ color: "var(--text-muted)" }}
                >
                  {cfg.label}
                </span>
              </div>
            ))}
            <span
              className="ml-auto text-xs hidden sm:inline"
              style={{ color: "var(--text-muted)" }}
            >
              Click a slot to book · Drag to reschedule
            </span>
          </div>

          {/* FullCalendar */}
          <div className="p-4">
            <FullCalendar
              ref={calendarRef}
              plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              customButtons={{
                addAppointment: {
                  text: "+ New Appointment",
                  click: () => openNew(),
                },
              }}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "timeGridWeek,timeGridDay,dayGridMonth addAppointment",
              }}
              buttonText={{
                today: "Today",
                week: "Week",
                day: "Day",
                month: "Month",
              }}
              editable
              selectable
              selectMirror
              weekends={false}
              slotMinTime="08:00:00"
              slotMaxTime="19:00:00"
              slotDuration="00:30:00"
              nowIndicator
              allDaySlot={false}
              events={calendarEvents}
              eventContent={(eventInfo) => {
                const status = eventInfo.event.extendedProps.status;
                const color = STATUS_CONFIG[status]?.color || "#000";
                return (
                  <div
                    style={{
                      color: color,
                      width: "100%",
                      height: "100%",
                      padding: "4px 6px",
                    }}
                  >
                    <div className="fc-event-title font-semibold text-sm leading-tight mb-0.5">
                      {eventInfo.event.title}
                    </div>
                    <div className="fc-event-time font-medium text-xs opacity-90">
                      {eventInfo.timeText}
                    </div>
                  </div>
                );
              }}
              select={handleDateSelect}
              eventClick={handleEventClick}
              eventChange={handleEventChange}
              eventDrop={handleEventChange}
              eventResize={handleEventChange}
              height="auto"
            />
          </div>
        </div>
      </div>

      {/* ── Appointment Modal ── */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: "16px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 0,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {form.id ? "Edit Appointment" : "Book Appointment"}
          </Typography>
          <IconButton size="small" onClick={() => setModalOpen(false)}>
            <X size={18} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 2, pb: 1 }}>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4 pt-1">
            <TextField
              label="Patient Name"
              fullWidth
              size="small"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Jane Doe — Checkup"
            />
            <TextField
              label="Start Time"
              type="datetime-local"
              fullWidth
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              value={form.start}
              onChange={(e) => setForm({ ...form, start: e.target.value })}
            />
            <TextField
              label="End Time"
              type="datetime-local"
              fullWidth
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              value={form.end}
              onChange={(e) => setForm({ ...form, end: e.target.value })}
            />
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value as AppointmentStatus,
                  })
                }
              >
                <MenuItem value="pending">⏳ Pending</MenuItem>
                <MenuItem value="confirmed">✅ Confirmed</MenuItem>
                <MenuItem value="cancelled">❌ Cancelled</MenuItem>
              </Select>
            </FormControl>
          </div>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, justifyContent: "space-between" }}>
          {form.id ? (
            <Button
              color="error"
              variant="outlined"
              size="small"
              onClick={handleDelete}
            >
              Delete
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={handleSave}
              sx={{
                backgroundColor: "var(--brand-primary)",
                "&:hover": { backgroundColor: "var(--brand-primary-dark)" },
                borderRadius: "8px",
              }}
            >
              Save
            </Button>
          </div>
        </DialogActions>
      </Dialog>
    </>
  );
}
