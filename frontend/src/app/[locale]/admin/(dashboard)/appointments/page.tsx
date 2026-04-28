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
import { X, CalendarDays, Plus } from "lucide-react";

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
  { color: string; bg: string; label: string }
> = {
  confirmed: {
    color: "#22c55e",
    bg: "bg-green-100 text-green-700",
    label: "Confirmed",
  },
  pending: {
    color: "#f59e0b",
    bg: "bg-amber-100 text-amber-700",
    label: "Pending",
  },
  cancelled: {
    color: "#ef4444",
    bg: "bg-red-100 text-red-700",
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

  // Stats derived from events
  const today = new Date().toDateString();
  const todayEvents = events.filter(
    (e) => new Date(e.start).toDateString() === today,
  );
  const confirmed = todayEvents.filter(
    (e) => e.extendedProps.status === "confirmed",
  ).length;
  const pending = todayEvents.filter(
    (e) => e.extendedProps.status === "pending",
  ).length;
  const cancelled = todayEvents.filter(
    (e) => e.extendedProps.status === "cancelled",
  ).length;

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
    backgroundColor: STATUS_CONFIG[e.extendedProps.status].color,
    borderColor: STATUS_CONFIG[e.extendedProps.status].color,
  }));

  return (
    <>
      {/* ── FullCalendar global CSS overrides ── */}
      <style>{`
        .fc {
          --fc-border-color: var(--border-ui);
          --fc-today-bg-color: rgba(30,86,208,0.05);
          --fc-button-bg-color: #ffffff;
          --fc-button-border-color: var(--border-ui);
          --fc-button-text-color: #444050;
          --fc-button-hover-bg-color: #f1f5f9;
          --fc-button-active-bg-color: #e2e8f0;
          --fc-now-indicator-color: #1e56d0;
          font-family: inherit;
        }
        .dark .fc {
          --fc-border-color: var(--border-ui);
          --fc-today-bg-color: rgba(30,86,208,0.1);
          --fc-button-bg-color: #2f3349;
          --fc-button-border-color: #3d4466;
          --fc-button-text-color: #cdd0dd;
          --fc-button-hover-bg-color: #3a4060;
          --fc-button-active-bg-color: #1e56d0;
          --fc-page-bg-color: #2f3349;
        }
        .fc .fc-toolbar-title {
          font-size: 1.15rem !important;
          font-weight: 700 !important;
          color: var(--foreground);
        }
        .fc .fc-button {
          border-radius: 8px !important;
          font-size: 0.8rem !important;
          font-weight: 500 !important;
          padding: 6px 12px !important;
          box-shadow: none !important;
          text-transform: none !important;
          transition: all 0.15s ease !important;
        }
        .fc .fc-button:focus { box-shadow: none !important; }
        .fc .fc-button-primary:not(:disabled).fc-button-active,
        .fc .fc-button-primary:not(:disabled):active {
          background-color: #1e56d0 !important;
          border-color: #1e56d0 !important;
          color: #ffffff !important;
        }
        .fc-timegrid-slot { height: 3.5rem !important; }
        .fc-event {
          border: none !important;
          border-radius: 7px !important;
          padding: 2px 6px !important;
          font-size: 0.78rem !important;
          font-weight: 500 !important;
          box-shadow: 0 1px 3px rgba(0,0,0,0.12) !important;
          cursor: pointer;
        }
        .fc-v-event .fc-event-main { color: #fff !important; }
        .fc-col-header-cell {
          padding: 10px 0 !important;
          background: transparent !important;
        }
        .fc-col-header-cell-cushion {
          font-size: 0.72rem !important;
          font-weight: 600 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.06em !important;
          color: var(--text-muted) !important;
          text-decoration: none !important;
        }
        .fc-day-today .fc-col-header-cell-cushion {
          color: #1e56d0 !important;
        }
        .fc-timegrid-axis-cushion,
        .fc-timegrid-slot-label-cushion {
          font-size: 0.72rem !important;
          color: var(--text-muted) !important;
        }
        .fc-scrollgrid { border-radius: 0 !important; }
        .fc-scrollgrid-section > td { border: none !important; }
      `}</style>

      <div className="p-6 lg:p-8 space-y-6">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
              style={{ backgroundColor: "var(--brand-primary)" }}
            >
              <CalendarDays className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Appointments
              </h1>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Manage your patient schedule
              </p>
            </div>
          </div>
          <button
            onClick={() => openNew()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: "var(--brand-primary)" }}
          >
            <Plus size={16} />
            New Appointment
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: "Today",
              value: todayEvents.length,
              colorClass: "bg-blue-50 text-blue-600",
            },
            {
              label: "Confirmed",
              value: confirmed,
              colorClass: "bg-green-50 text-green-600",
            },
            {
              label: "Pending",
              value: pending,
              colorClass: "bg-amber-50 text-amber-600",
            },
            {
              label: "Cancelled",
              value: cancelled,
              colorClass: "bg-red-50 text-red-600",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-card border rounded-xl p-4 flex items-center gap-3"
              style={{ borderColor: "var(--border-ui)" }}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-base ${stat.colorClass}`}
              >
                {stat.value}
              </div>
              <span className="text-sm font-medium text-foreground">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* ── Calendar Card ── */}
        <div
          className="bg-card border rounded-2xl overflow-hidden shadow-sm"
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
                  style={{ backgroundColor: cfg.color }}
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
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "timeGridWeek,timeGridDay,dayGridMonth",
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
