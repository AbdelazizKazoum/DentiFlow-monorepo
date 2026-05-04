"use client";

import React, { useState, useCallback, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import resourceTimeGridPlugin from "@fullcalendar/resource-timegrid";
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
  Avatar,
  Chip,
} from "@mui/material";
import { X } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type AppointmentStatus = "confirmed" | "pending" | "cancelled";

interface Dentist {
  id: string;
  name: string;
  avatar: string;
  color: string;
}

interface AppointmentEvent extends EventInput {
  id: string;
  title: string;
  start: string;
  end: string;
  resourceId: string;
  extendedProps: {
    status: AppointmentStatus;
    patientName: string;
    service: string;
    provider: string;
    notes: string;
    patientPhone: string;
    patientEmail: string;
  };
}

interface FormState {
  id: string;
  start: string;
  end: string;
  status: AppointmentStatus;
  patientName: string;
  service: string;
  provider: string;
  resourceId: string;
  notes: string;
  patientPhone: string;
  patientEmail: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

export const DENTISTS: Dentist[] = [
  {
    id: "d1",
    name: "Dr. Emily Carter",
    avatar: "https://i.pravatar.cc/150?img=47",
    color: "#1e56d0",
  },
  {
    id: "d2",
    name: "Dr. John Harris",
    avatar: "https://i.pravatar.cc/150?img=12",
    color: "#0891b2",
  },
  {
    id: "d3",
    name: "Dr. Sarah Chen",
    avatar: "https://i.pravatar.cc/150?img=25",
    color: "#9333ea",
  },
];

const STATUS_CONFIG: Record<
  AppointmentStatus,
  { color: string; bg: string; border: string; label: string }
> = {
  confirmed: {
    color: "#166534", // Deep green text
    bg: "#dcfce7", // Pale green bg
    border: "#22c55e", // Green left border
    label: "Confirmed",
  },
  pending: {
    color: "#92400e", // Amber/brown text
    bg: "#fef3c7", // Pale amber bg
    border: "#f59e0b", // Amber left border
    label: "Pending",
  },
  cancelled: {
    color: "#991b1b", // Deep red text
    bg: "#fee2e2", // Pale red bg
    border: "#ef4444", // Red left border
    label: "Cancelled",
  },
};

const INITIAL_EVENTS: AppointmentEvent[] = [
  {
    id: "1",
    title: "Alice Johnson — Checkup",
    resourceId: "d1",
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
    extendedProps: {
      status: "confirmed",
      patientName: "Alice Johnson",
      service: "Checkup",
      provider: "Dr. Emily Carter",
      notes: "Patient reports minor sensitivity on the upper left side.",
      patientPhone: "555-0101",
      patientEmail: "alice.j@example.com",
    },
  },
  {
    id: "2",
    title: "Bob Smith — Scaling",
    resourceId: "d2",
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
    extendedProps: {
      status: "pending",
      patientName: "Bob Smith",
      service: "Scaling",
      provider: "Dr. John Harris",
      notes: "New patient, requires full mouth x-ray.",
      patientPhone: "555-0102",
      patientEmail: "bob.smith@example.com",
    },
  },
  {
    id: "3",
    title: "Diana Lee — Root Canal",
    resourceId: "d1",
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
    extendedProps: {
      status: "cancelled",
      patientName: "Diana Lee",
      service: "Root Canal",
      provider: "Dr. Emily Carter",
      notes: "Patient cancelled, needs to reschedule.",
      patientPhone: "555-0103",
      patientEmail: "diana.l@example.com",
    },
  },
  {
    id: "4",
    title: "Mark Davis — Whitening",
    resourceId: "d3",
    start: (() => {
      const d = new Date();
      d.setHours(9, 0, 0, 0);
      return d.toISOString();
    })(),
    end: (() => {
      const d = new Date();
      d.setHours(9, 45, 0, 0);
      return d.toISOString();
    })(),
    extendedProps: {
      status: "confirmed",
      patientName: "Mark Davis",
      service: "Whitening",
      provider: "Dr. Sarah Chen",
      notes: "",
      patientPhone: "555-0104",
      patientEmail: "mark.d@example.com",
    },
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDatetimeLocal(date: string | Date): string {
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate(),
  )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const EMPTY_FORM: FormState = {
  id: "",
  start: "",
  end: "",
  status: "pending",
  patientName: "",
  service: "",
  provider: "Dr. Emily Carter",
  resourceId: "d1",
  notes: "",
  patientPhone: "",
  patientEmail: "",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AppointmentsPage() {
  const [events, setEvents] = useState<AppointmentEvent[]>(INITIAL_EVENTS);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState("");
  const [activeProviders, setActiveProviders] = useState<Set<string>>(
    () => new Set(DENTISTS.map((d) => d.id)),
  );
  const [currentView, setCurrentView] = useState("resourceTimeGridDay");
  const calendarRef = useRef<FullCalendar>(null);

  const isResourceView = currentView === "resourceTimeGridDay";

  // ── Resource-aware overlap check ──────────────────────────────────────────
  const hasOverlap = useCallback(
    (start: string, end: string, resourceId: string, excludeId = "") => {
      const s = new Date(start).getTime();
      const e = new Date(end).getTime();
      return events.some((evt) => {
        if (evt.id === excludeId) return false;
        if (evt.resourceId !== resourceId) return false;
        const es = new Date(evt.start as string).getTime();
        const ee = new Date(evt.end as string).getTime();
        return s < ee && e > es;
      });
    },
    [events],
  );

  // ── Toggle provider visibility ────────────────────────────────────────────
  const toggleProvider = useCallback((id: string) => {
    setActiveProviders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size === 1) return prev; // always keep at least one
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // ── Open modal ────────────────────────────────────────────────────────────
  const openNew = useCallback(
    (start?: string, end?: string, resourceId?: string) => {
      const now = new Date();
      now.setSeconds(0, 0);
      const later = new Date(now.getTime() + 30 * 60 * 1000);
      const defaultResource = [...activeProviders][0] ?? "d1";
      setForm({
        ...EMPTY_FORM,
        start: start ?? toDatetimeLocal(now),
        end: end ?? toDatetimeLocal(later),
        resourceId: resourceId ?? defaultResource,
        provider:
          DENTISTS.find((d) => d.id === (resourceId ?? defaultResource))
            ?.name ?? EMPTY_FORM.provider,
      });
      setError("");
      setModalOpen(true);
    },
    [activeProviders],
  );

  const handleDateSelect = useCallback(
    (info: DateSelectArg) => {
      info.view.calendar.unselect();
      // In resource view, `info.resource` is available
      const resId = (info as DateSelectArg & { resource?: { id: string } })
        .resource?.id;
      openNew(toDatetimeLocal(info.start), toDatetimeLocal(info.end), resId);
    },
    [openNew],
  );

  const handleEventClick = useCallback((info: EventClickArg) => {
    const { event } = info;
    const resId =
      (event as EventClickArg["event"] & { _def?: { resourceIds?: string[] } })
        ._def?.resourceIds?.[0] ?? "d1";
    setForm({
      id: event.id,
      start: toDatetimeLocal(event.start!),
      end: toDatetimeLocal(event.end ?? event.start!),
      status: event.extendedProps.status as AppointmentStatus,
      patientName: event.extendedProps.patientName,
      service: event.extendedProps.service,
      provider: event.extendedProps.provider,
      resourceId: resId,
      notes: event.extendedProps.notes,
      patientPhone: event.extendedProps.patientPhone,
      patientEmail: event.extendedProps.patientEmail,
    });
    setError("");
    setModalOpen(true);
  }, []);

  const handleEventChange = useCallback(
    (info: EventChangeArg) => {
      const { event, oldEvent } = info;
      const startStr = event.start ? event.start.toISOString() : "";
      let endStr = event.end ? event.end.toISOString() : "";

      if (!event.end && oldEvent?.start && oldEvent?.end && event.start) {
        const duration = oldEvent.end.getTime() - oldEvent.start.getTime();
        endStr = new Date(event.start.getTime() + duration).toISOString();
      } else if (!event.end && event.start) {
        endStr = new Date(event.start.getTime() + 30 * 60 * 1000).toISOString();
      }

      // Get new resourceId after drag (may have moved columns)
      const resources = event.getResources();
      const newResourceId = resources.length > 0 ? resources[0].id : undefined;

      // Find current resourceId from state
      const currentEvt = events.find((e) => e.id === event.id);
      const resourceId = newResourceId ?? currentEvt?.resourceId ?? "d1";

      if (
        startStr &&
        endStr &&
        hasOverlap(startStr, endStr, resourceId, event.id)
      ) {
        info.revert();
        return;
      }

      setEvents((prev) =>
        prev.map((e) =>
          e.id === event.id
            ? { ...e, start: startStr, end: endStr, resourceId }
            : e,
        ),
      );
    },
    [hasOverlap, events],
  );

  const handleSave = () => {
    if (!form.patientName.trim() || !form.service.trim()) {
      setError("Patient name and service are required.");
      return;
    }
    if (new Date(form.end) <= new Date(form.start)) {
      setError("End time must be after start time.");
      return;
    }
    if (hasOverlap(form.start, form.end, form.resourceId, form.id)) {
      setError("This time slot overlaps with an existing appointment.");
      return;
    }

    const updated: AppointmentEvent = {
      id: form.id || String(Date.now()),
      title: `${form.patientName} — ${form.service}`,
      start: new Date(form.start).toISOString(),
      end: new Date(form.end).toISOString(),
      resourceId: form.resourceId,
      extendedProps: {
        status: form.status,
        patientName: form.patientName,
        service: form.service,
        provider: form.provider,
        notes: form.notes,
        patientPhone: form.patientPhone,
        patientEmail: form.patientEmail,
      },
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

  // Filtered events & resources based on activeProviders
  const visibleEvents = events.filter((e) => activeProviders.has(e.resourceId));
  const visibleResources = DENTISTS.filter((d) =>
    activeProviders.has(d.id),
  ).map((d) => ({ id: d.id, title: d.name }));

  const calendarEvents = visibleEvents.map((e) => {
    const statusCfg = STATUS_CONFIG[e.extendedProps.status];
    return {
      ...e,
      backgroundColor: statusCfg.bg,
      borderColor: statusCfg.border,
      textColor: statusCfg.color,
    };
  });

  return (
    <>
      {/* ── FullCalendar global CSS overrides ── */}
      <style>{`
        .fc {
          --fc-border-color: #e2e8f0;
          --fc-today-bg-color: rgba(0,0,0,0.02);
          --fc-now-indicator-color: #1e56d0;
          font-family: inherit;
        }
        .dark .fc-theme-standard td, .dark .fc-theme-standard th, .dark .fc-theme-standard .fc-scrollgrid {
          border-color: rgba(255,255,255,0.08) !important;
          border-width: 1px !important;
        }

        /* ─── Toolbar ─── */
        .fc .fc-toolbar {
          align-items: center !important;
          padding: 10px 0 16px !important;
          gap: 10px !important;
          flex-wrap: wrap !important;
          background: var(--surface-card) !important;
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
          border-width: 0 !important;
          border-left-width: 3px !important;
          border-style: solid !important;
          border-radius: 4px !important;
          font-size: 0.72rem !important;
          font-weight: 600 !important;
          line-height: 1.2 !important;
          box-shadow: none !important;
          cursor: pointer;
          margin-bottom: 2px !important;
          /* DO NOT override margin-right — FullCalendar's harness uses right/left/width
             to distribute concurrent events side-by-side automatically */
          transition: filter 0.15s !important;
        }
        .fc-event:hover { filter: brightness(0.96) !important; }
        .fc-v-event .fc-event-main { padding: 0 !important; }
        .fc-event .fc-event-main, .fc-event .fc-event-main-frame { background: transparent !important; }
        .dark .fc-event { box-shadow: none !important; opacity: 0.9 !important; }

        /* ─── Side-by-side concurrent events: add inset gap between cards ─── */
        /* FullCalendar sets insetInlineStart/insetInlineEnd on .fc-timegrid-event-harness.
           We add a small horizontal padding so cards don't touch each other. */
        .fc-timegrid-event-harness {
          padding-inline: 1px !important;
        }

        /* ─── Month view: match left-border-only style of week/day cards ─── */
        .fc-daygrid-event {
          border-width: 0 !important;
          border-left-width: 3px !important;
          border-style: solid !important;
          border-radius: 4px !important;
        }

        /* ─── Resource header ─── */
        .fc-resource-timegrid-day .fc-col-header-cell { position: sticky; top: 0; z-index: 3; }
        .fc .fc-resource-timegrid .fc-col-header { position: sticky; top: 0; z-index: 3; }
        .fc-col-header-cell { background: var(--surface-card, #fff) !important; }

        /* ─── Clean minimal grid ─── */
        .fc-theme-standard td, .fc-theme-standard th, .fc-theme-standard .fc-scrollgrid {
          border-color: #e2e8f0 !important;
        }
        .fc-col-header-cell {
          padding: 4px 0 !important;
          border-style: solid !important;
          border-color: #e2e8f0 !important;
          border-width: 0 1px 1px 0 !important;
        }
        .fc-col-header-cell:last-child { border-right-width: 0 !important; }
        .dark .fc-col-header-cell { border-color: rgba(255,255,255,0.08) !important; }
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

        /* ─── Selection ─── */
        :root {
          --fc-highlight-color: rgba(30, 86, 208, 0.15);
          --fc-event-bg-color: rgba(30, 86, 208, 0.25);
          --fc-event-border-color: #1e56d0;
          --fc-event-text-color: #1e56d0;
          --fc-event-selected-overlay-color: rgba(0, 0, 0, 0);
        }
        .fc-timegrid-event.fc-v-event.fc-select-mirror,
        .fc-select-mirror {
          --fc-event-bg-color: rgba(30, 86, 208, 0.2) !important;
          --fc-event-border-color: #1e56d0 !important;
          --fc-event-text-color: #1e56d0 !important;
          background-color: rgba(30, 86, 208, 0.2) !important;
          border-left: 3px solid #1e56d0 !important;
          border-top: none !important;
          border-right: none !important;
          border-bottom: none !important;
          border-radius: 6px !important;
          box-shadow: none !important;
          opacity: 1 !important;
        }
        .fc-select-mirror .fc-event-main,
        .fc-select-mirror .fc-event-time,
        .fc-select-mirror .fc-event-title {
          color: #1e56d0 !important;
          font-weight: 600 !important;
          font-size: 0.75rem !important;
        }
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
          {/* ── Provider Filter Bar ── */}
          <div
            className="px-6 py-3.5 border-b flex flex-wrap items-center gap-3"
            style={{ borderColor: "var(--border-ui)" }}
          >
            <span
              className="text-xs font-semibold uppercase tracking-wide mr-1"
              style={{ color: "var(--text-muted)" }}
            >
              Providers
            </span>
            {DENTISTS.map((dentist) => {
              const active = activeProviders.has(dentist.id);
              return (
                <Chip
                  key={dentist.id}
                  onClick={() => toggleProvider(dentist.id)}
                  avatar={
                    <Avatar
                      src={dentist.avatar}
                      alt={dentist.name}
                      sx={{ width: 22, height: 22, fontSize: "0.6rem" }}
                    >
                      {dentist.name
                        .split(" ")
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((w) => w[0])
                        .join("")}
                    </Avatar>
                  }
                  label={dentist.name}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    height: 30,
                    border: `1.5px solid ${active ? dentist.color : "#e2e8f0"}`,
                    backgroundColor: active
                      ? `${dentist.color}18`
                      : "transparent",
                    color: active ? dentist.color : "var(--text-muted)",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    "& .MuiChip-avatar": { width: 22, height: 22 },
                    "&:hover": {
                      backgroundColor: `${dentist.color}25`,
                      borderColor: dentist.color,
                    },
                  }}
                />
              );
            })}

            {/* Status legend */}
            <div className="ml-auto flex flex-wrap items-center gap-4">
              {(
                Object.entries(STATUS_CONFIG) as [
                  AppointmentStatus,
                  (typeof STATUS_CONFIG)[AppointmentStatus],
                ][]
              ).map(([key, cfg]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: cfg.border }}
                  />
                  <span
                    className="text-xs font-medium hidden sm:inline"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {cfg.label}
                  </span>
                </div>
              ))}
              <span
                className="text-xs hidden lg:inline"
                style={{ color: "var(--text-muted)" }}
              >
                Click to book · Drag to reschedule
              </span>
            </div>
          </div>

          {/* FullCalendar */}
          <div className="p-4">
            <FullCalendar
              ref={calendarRef}
              plugins={[
                resourceTimeGridPlugin,
                timeGridPlugin,
                dayGridPlugin,
                interactionPlugin,
              ]}
              initialView="resourceTimeGridDay"
              schedulerLicenseKey="GPL-My-Project-Is-Open-Source"
              resources={visibleResources}
              resourceLabelContent={(arg) => {
                const dentist = DENTISTS.find((d) => d.id === arg.resource.id);
                if (!dentist) return <span>{arg.resource.title}</span>;
                return (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 6,
                      padding: "10px 4px",
                    }}
                  >
                    <Avatar
                      src={dentist.avatar}
                      alt={dentist.name}
                      sx={{
                        width: 38,
                        height: 38,
                        border: `2px solid ${dentist.color}`,
                        fontSize: "0.75rem",
                        backgroundColor: `${dentist.color}22`,
                        color: dentist.color,
                      }}
                    >
                      {dentist.name
                        .split(" ")
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((w) => w[0])
                        .join("")}
                    </Avatar>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        color: dentist.color,
                        textAlign: "center",
                        lineHeight: 1.3,
                        maxWidth: 90,
                      }}
                    >
                      {dentist.name}
                    </span>
                  </div>
                );
              }}
              customButtons={{
                addAppointment: {
                  text: "+ New Appointment",
                  click: () => openNew(),
                },
              }}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right:
                  "resourceTimeGridDay,timeGridWeek,dayGridMonth addAppointment",
              }}
              buttonText={{
                today: "Today",
                week: "Week",
                day: "Day",
                month: "Month",
                resourceTimeGridDay: "Day",
              }}
              viewDidMount={(arg) => setCurrentView(arg.view.type)}
              datesSet={(arg) => setCurrentView(arg.view.type)}
              editable={currentView !== "dayGridMonth"}
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
                const status = eventInfo.event.extendedProps
                  .status as AppointmentStatus;
                const statusColor = STATUS_CONFIG[status]?.color || "#000";
                const resId =
                  (
                    eventInfo.event as typeof eventInfo.event & {
                      _def?: { resourceIds?: string[] };
                    }
                  )._def?.resourceIds?.[0] ?? "";
                const dentist = DENTISTS.find((d) => d.id === resId);
                const showBadge = !isResourceView && dentist;

                return (
                  <div
                    style={{
                      color: statusColor,
                      width: "100%",
                      height: "100%",
                      padding: "4px 6px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        lineHeight: 1.25,
                      }}
                    >
                      {eventInfo.event.title}
                    </div>
                    <div
                      style={{
                        fontSize: "0.68rem",
                        fontWeight: 500,
                        opacity: 0.85,
                      }}
                    >
                      {eventInfo.timeText}
                    </div>
                    {showBadge && (
                      <div
                        style={{
                          marginTop: 2,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 3,
                          fontSize: "0.62rem",
                          fontWeight: 700,
                          color: "#fff",
                          backgroundColor: dentist.color,
                          borderRadius: 4,
                          padding: "1px 5px",
                          alignSelf: "flex-start",
                          letterSpacing: "0.02em",
                        }}
                      >
                        {dentist.name
                          .split(" ")
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((w) => w[0])
                          .join("")}
                      </div>
                    )}
                  </div>
                );
              }}
              select={handleDateSelect}
              eventClick={handleEventClick}
              eventChange={handleEventChange}
              height="auto"
            />
          </div>
        </div>
      </div>

      {/* ── Appointment Modal ── */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: "16px",
              boxShadow:
                "0 20px 40px -10px rgba(0, 0, 0, 0.15), 0 10px 20px -15px rgba(0, 0, 0, 0.1)",
              border: "1px solid var(--border-ui)",
              backgroundColor: "var(--surface-card)",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: "20px 24px",
            borderBottom: "1px solid var(--border-ui)",
          }}
        >
          <Typography
            variant="h6"
            component="div"
            sx={{ fontWeight: 700, color: "var(--foreground)" }}
          >
            {form.id ? "Edit Appointment" : "Book New Appointment"}
          </Typography>
          <IconButton
            size="small"
            onClick={() => setModalOpen(false)}
            sx={{ color: "var(--text-muted)" }}
          >
            <X size={20} />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            p: "24px",
            "& .MuiTextField-root": { mb: "16px" },
            "& .MuiInputLabel-root": { fontSize: "0.875rem" },
            "& .MuiInputBase-input": { fontSize: "0.875rem" },
          }}
        >
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1 pt-2">
            {/* Patient & Service */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
              <TextField
                label="Patient Name"
                fullWidth
                value={form.patientName}
                onChange={(e) =>
                  setForm({ ...form, patientName: e.target.value })
                }
                placeholder="e.g. Jane Doe"
                required
              />
              <TextField
                label="Service / Procedure"
                fullWidth
                value={form.service}
                onChange={(e) => setForm({ ...form, service: e.target.value })}
                placeholder="e.g. Annual Checkup"
                required
              />
            </div>

            {/* Time inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
              <TextField
                label="Start Time"
                type="datetime-local"
                fullWidth
                value={form.start}
                onChange={(e) => setForm({ ...form, start: e.target.value })}
              />
              <TextField
                label="End Time"
                type="datetime-local"
                fullWidth
                value={form.end}
                onChange={(e) => setForm({ ...form, end: e.target.value })}
              />
            </div>

            {/* Provider & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
              <FormControl fullWidth>
                <InputLabel>Provider</InputLabel>
                <Select
                  label="Provider"
                  value={form.resourceId}
                  onChange={(e) => {
                    const dentist = DENTISTS.find(
                      (d) => d.id === e.target.value,
                    );
                    setForm({
                      ...form,
                      resourceId: e.target.value,
                      provider: dentist?.name ?? form.provider,
                    });
                  }}
                  renderValue={(val) => {
                    const d = DENTISTS.find((x) => x.id === val);
                    return d ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <Avatar
                          src={d.avatar}
                          sx={{
                            width: 22,
                            height: 22,
                            fontSize: "0.6rem",
                            border: `1px solid ${d.color}`,
                          }}
                        >
                          {d.name
                            .split(" ")
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((w) => w[0])
                            .join("")}
                        </Avatar>
                        {d.name}
                      </div>
                    ) : (
                      val
                    );
                  }}
                >
                  {DENTISTS.map((d) => (
                    <MenuItem key={d.id} value={d.id}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <Avatar
                          src={d.avatar}
                          sx={{
                            width: 26,
                            height: 26,
                            fontSize: "0.65rem",
                            border: `1.5px solid ${d.color}`,
                          }}
                        >
                          {d.name
                            .split(" ")
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((w) => w[0])
                            .join("")}
                        </Avatar>
                        <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                          {d.name}
                        </span>
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            backgroundColor: d.color,
                            display: "inline-block",
                            marginLeft: "auto",
                          }}
                        />
                      </div>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
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
                  <MenuItem value="pending">⏳ Pending Confirmation</MenuItem>
                  <MenuItem value="confirmed">✅ Confirmed</MenuItem>
                  <MenuItem value="cancelled">❌ Cancelled</MenuItem>
                </Select>
              </FormControl>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
              <TextField
                label="Patient Phone"
                fullWidth
                value={form.patientPhone}
                onChange={(e) =>
                  setForm({ ...form, patientPhone: e.target.value })
                }
                placeholder="e.g. 555-0101"
              />
              <TextField
                label="Patient Email"
                type="email"
                fullWidth
                value={form.patientEmail}
                onChange={(e) =>
                  setForm({ ...form, patientEmail: e.target.value })
                }
                placeholder="e.g. jane.d@example.com"
              />
            </div>

            {/* Notes */}
            <TextField
              label="Notes / Comments"
              fullWidth
              multiline
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="e.g. Patient mentioned tooth sensitivity..."
            />
          </div>
        </DialogContent>

        <DialogActions
          sx={{
            p: "16px 24px",
            borderTop: "1px solid var(--border-ui)",
            justifyContent: "space-between",
          }}
        >
          <div>
            {form.id && (
              <Button
                color="error"
                variant="text"
                onClick={handleDelete}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: "8px",
                }}
              >
                Delete
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outlined"
              onClick={() => setModalOpen(false)}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "8px",
                padding: "8px 16px",
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "8px",
                padding: "8px 16px",
                boxShadow: "0 1px 3px rgba(30,86,208,0.3)",
                backgroundColor: "var(--brand-primary)",
                "&:hover": {
                  backgroundColor: "var(--brand-primary-dark)",
                  boxShadow: "0 2px 6px rgba(30,86,208,0.4)",
                },
              }}
            >
              {form.id ? "Save Changes" : "Create Appointment"}
            </Button>
          </div>
        </DialogActions>
      </Dialog>
    </>
  );
}
