"use client";

import React, {useRef} from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, {EventResizeDoneArg} from "@fullcalendar/interaction";
import {
  EventClickArg,
  EventDropArg,
  EventContentArg,
  DateSelectArg,
} from "@fullcalendar/core";
import {Appointment, AppointmentStatus} from "./types";

interface AppointmentCalendarProps {
  appointments: Appointment[];
  onSelectSlot: (start: Date, end: Date) => void;
  onSelectAppointment: (appointment: Appointment) => void;
  onUpdateAppointment: (updated: Appointment) => void;
}

const statusColors: Record<
  AppointmentStatus,
  {
    backgroundColor: string;
    borderColor: string;
    textColor: string;
  }
> = {
  confirmed: {
    backgroundColor: "#ecfdf5", // emerald-50
    borderColor: "#10b981", // emerald-500
    textColor: "#047857", // emerald-700
  },
  pending: {
    backgroundColor: "#fffbeb", // amber-50
    borderColor: "#f59e0b", // amber-500
    textColor: "#b45309", // amber-700
  },
  cancelled: {
    backgroundColor: "#fff1f2", // rose-50
    borderColor: "#f43f5e", // rose-500
    textColor: "#be123c", // rose-700
  },
};

export const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  appointments,
  onSelectSlot,
  onSelectAppointment,
  onUpdateAppointment,
}) => {
  const calendarRef = useRef<FullCalendar>(null);

  const handleSelect = (info: DateSelectArg) => {
    onSelectSlot(info.start, info.end);
  };

  const handleEventClick = (info: EventClickArg) => {
    const apt = appointments.find((a) => a.id === info.event.id);
    if (apt) {
      onSelectAppointment(apt);
    }
  };

  const handleEventDrop = (info: EventDropArg) => {
    const apt = appointments.find((a) => a.id === info.event.id);
    if (apt && info.event.start && info.event.end) {
      onUpdateAppointment({
        ...apt,
        start: info.event.start.toISOString(),
        end: info.event.end.toISOString(),
      });
    } else {
      info.revert();
    }
  };

  const handleEventResize = (info: EventResizeDoneArg) => {
    const apt = appointments.find((a) => a.id === info.event.id);
    if (apt && info.event.start && info.event.end) {
      onUpdateAppointment({
        ...apt,
        start: info.event.start.toISOString(),
        end: info.event.end.toISOString(),
      });
    } else {
      info.revert();
    }
  };

  function renderEventContent(eventInfo: EventContentArg) {
    const apt = eventInfo.event.extendedProps as Omit<
      Appointment,
      "id" | "title" | "start" | "end"
    >;
    const colors = statusColors[apt.status];

    return (
      <div
        className="w-full h-full px-2 py-1 flex flex-col justify-start overflow-hidden transition-all hover:brightness-[0.98] border-l-[3px] rounded-r-sm"
        style={{
          backgroundColor: colors.backgroundColor,
          borderLeftColor: colors.borderColor,
          color: colors.textColor,
        }}
      >
        <div className="flex flex-row items-center gap-1.5 opacity-90 mb-0.5">
          <span className="font-semibold text-xs truncate leading-tight tracking-tight">
            {eventInfo.event.title}
          </span>
          <span className="text-[10px] font-medium opacity-80 whitespace-nowrap shrink-0">
            {eventInfo.timeText}
          </span>
        </div>
        <div className="text-[11px] font-medium leading-tight truncate opacity-[0.85]">
          {apt.service}
        </div>
      </div>
    );
  }

  const events = appointments.map((apt) => ({
    id: apt.id,
    title: apt.patientName, // FullCalendar standard field
    start: apt.start,
    end: apt.end,
    extendedProps: {
      status: apt.status,
      patientName: apt.patientName,
      service: apt.service,
      notes: apt.notes,
    },
  }));

  return (
    <div className="flex-1 bg-card rounded-xl shadow-sm border border-ui-border w-full h-full overflow-hidden p-5 flex flex-col relative w-[100%] max-w-full">
      <style>{`
        .fc-theme-standard td, .fc-theme-standard th { 
          border-color: var(--color-ui-border, #f1f5f9) !important; 
        }
        .fc-theme-standard .fc-scrollgrid { 
          border-color: var(--color-ui-border, #f1f5f9) !important; 
          border-radius: 8px;
          overflow: hidden;
        }
        .fc-v-event .fc-event-main-frame {
          padding: 0 !important;
        }
        .fc-v-event {
          background: transparent !important;
          border: none !important;
        }
        .fc-event {
          box-shadow: 0 1px 3px 0 rgba(0,0,0,0.05), 0 1px 2px -1px rgba(0,0,0,0.05) !important;
          border-radius: 6px !important;
          overflow: hidden;
          margin: 1px 2px !important;
        }
        .fc .fc-button-primary {
          background-color: transparent !important;
          color: #475569 !important;
          border: 1px solid #cbd5e1 !important;
          border-radius: 8px !important;
          text-transform: capitalize !important;
          font-weight: 500 !important;
          font-size: 0.875rem !important;
          padding: 0.375rem 0.875rem !important;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
          margin: 0 4px !important;
          transition: all 0.15s ease-in-out;
        }
        .fc .fc-button-primary:hover {
          background-color: #f8fafc !important;
        }
        .fc .fc-button-primary:not(:disabled):active,
        .fc .fc-button-primary:not(:disabled).fc-button-active {
          background-color: #f1f5f9 !important;
          color: #0f172a !important;
          border-color: #cbd5e1 !important;
          box-shadow: inset 0 2px 4px 0 rgba(0,0,0,0.02) !important;
        }
        .fc-toolbar-title {
          font-size: 1.125rem !important;
          font-weight: 600 !important;
          color: #0f172a;
          letter-spacing: -0.015em;
        }
        .fc-timegrid-slot-label-cushion {
          font-size: 0.75rem !important;
          font-weight: 500;
          color: #64748b;
        }
        .fc-col-header-cell-cushion {
          font-weight: 600 !important;
          font-size: 0.875rem !important;
          color: #334155;
          padding: 10px 0 !important;
        }
        .fc-timegrid-now-indicator-line {
          border-color: #3b82f6 !important;
        }
        .fc-timegrid-now-indicator-arrow {
          border-color: #3b82f6 !important;
          border-width: 5px 0 5px 6px !important;
        }
        .fc-timegrid-slot {
          height: 3rem !important; /* Expand vertical slots dynamically to fit text */
        }
      `}</style>
      <div className="h-150 w-full flex-grow">
        <FullCalendar
          ref={calendarRef}
          plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "timeGridWeek,timeGridDay",
          }}
          businessHours={{
            daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
            startTime: "09:00", // 9am
            endTime: "18:00", // 6pm
          }}
          slotMinTime="09:00:00"
          slotMaxTime="18:00:00"
          slotDuration="00:30:00"
          slotLabelInterval="00:30:00"
          allDaySlot={false}
          selectable={true}
          editable={true}
          eventResizableFromStart={false}
          eventDurationEditable={true}
          selectConstraint="businessHours"
          eventConstraint="businessHours"
          nowIndicator={true}
          events={events}
          select={handleSelect}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          eventContent={renderEventContent}
          height="100%"
        />
      </div>
    </div>
  );
};
