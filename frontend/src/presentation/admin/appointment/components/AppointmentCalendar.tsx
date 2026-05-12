"use client";

import {useState} from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import resourceTimeGridPlugin from "@fullcalendar/resource-timegrid";
import type {
  DateSelectArg,
  DatesSetArg,
  EventChangeArg,
  EventClickArg,
  EventInput,
} from "@fullcalendar/core";
import {Avatar} from "@mui/material";
import type {Appointment} from "@/domain/appointment/entities/appointment";
import type {AppointmentProvider} from "../appointmentConfig";
import {APPOINTMENT_STATUS_CONFIG} from "../appointmentConfig";
import {AppointmentEventPopover} from "./AppointmentEventPopover";

interface AppointmentCalendarProps {
  appointments: Appointment[];
  providers: AppointmentProvider[];
  activeProviderIds: Set<string>;
  onAddRequested: (start: Date, end: Date, doctorId?: string) => void;
  onEditRequested: (appointment: Appointment) => void;
  onCheckInRequested: (appointment: Appointment) => void;
  onMoveRequested: (
    appointmentId: string,
    doctorId: string,
    doctorName: string | undefined,
    start: Date,
    end: Date,
  ) => Promise<boolean>;
  onRangeChange: (start: Date, end: Date) => void;
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("");
}

function toCalendarEvent(appointment: Appointment): EventInput {
  const cfg = APPOINTMENT_STATUS_CONFIG[appointment.status];
  return {
    id: appointment.id,
    title: `${appointment.patientName} — ${appointment.type ?? "Visit"}`,
    start: appointment.startAt.toISOString(),
    end: appointment.endAt.toISOString(),
    resourceId: appointment.doctorId,
    backgroundColor: cfg.bg,
    borderColor: cfg.border,
    textColor: cfg.color,
    extendedProps: {
      appointment,
      status: appointment.status,
      isEmergency: appointment.isEmergency,
    },
  };
}

export function AppointmentCalendar({
  appointments,
  providers,
  activeProviderIds,
  onAddRequested,
  onEditRequested,
  onCheckInRequested,
  onMoveRequested,
  onRangeChange,
}: AppointmentCalendarProps) {
  const [currentView, setCurrentView] = useState("resourceTimeGridDay");
  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null);
  const [popoverAppointment, setPopoverAppointment] =
    useState<Appointment | null>(null);
  const isResourceView = currentView === "resourceTimeGridDay";
  const visibleAppointments = appointments.filter((appointment) =>
    activeProviderIds.has(appointment.doctorId),
  );
  const visibleResources = providers
    .filter((provider) => activeProviderIds.has(provider.id))
    .map((provider) => ({id: provider.id, title: provider.name}));

  const handleSelect = (info: DateSelectArg) => {
    info.view.calendar.unselect();
    const doctorId = (info as DateSelectArg & {resource?: {id: string}})
      .resource?.id;
    onAddRequested(info.start, info.end, doctorId);
  };

  const handleEventClick = (info: EventClickArg) => {
    info.jsEvent.preventDefault();
    info.jsEvent.stopPropagation();
    const appointment = info.event.extendedProps.appointment as
      | Appointment
      | undefined;
    if (!appointment) return;
    setPopoverAppointment(appointment);
    setPopoverAnchor(info.el as HTMLElement);
  };

  const handleEventChange = async (info: EventChangeArg) => {
    const {event, oldEvent} = info;
    if (!event.start) {
      info.revert();
      return;
    }

    let end = event.end;
    if (!end && oldEvent?.start && oldEvent?.end) {
      end = new Date(
        event.start.getTime() +
          oldEvent.end.getTime() -
          oldEvent.start.getTime(),
      );
    }
    if (!end) end = new Date(event.start.getTime() + 30 * 60_000);

    const resources = event.getResources();
    const fallback = event.extendedProps.appointment as Appointment;
    const doctorId = resources[0]?.id ?? fallback.doctorId;
    const doctorName =
      providers.find((provider) => provider.id === doctorId)?.name ??
      fallback.doctorName;
    const moved = await onMoveRequested(
      event.id,
      doctorId,
      doctorName,
      event.start,
      end,
    );
    if (!moved) info.revert();
  };

  return (
    <div className="p-4">
      <FullCalendar
        plugins={[
          resourceTimeGridPlugin,
          timeGridPlugin,
          dayGridPlugin,
          interactionPlugin,
        ]}
        initialView="resourceTimeGridDay"
        schedulerLicenseKey="GPL-My-Project-Is-Open-Source"
        resources={visibleResources}
        customButtons={{
          addAppointment: {
            text: "+ New Appointment",
            click: () => {
              const now = new Date();
              now.setSeconds(0, 0);
              onAddRequested(now, new Date(now.getTime() + 30 * 60_000));
            },
          },
        }}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "resourceTimeGridDay,timeGridWeek,dayGridMonth addAppointment",
        }}
        buttonText={{
          today: "Today",
          week: "Week",
          day: "Day",
          month: "Month",
          resourceTimeGridDay: "Day",
        }}
        resourceLabelContent={(arg) => {
          const provider = providers.find(
            (item) => item.id === arg.resource.id,
          );
          if (!provider) return <span>{arg.resource.title}</span>;
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
                src={provider.avatar}
                alt={provider.name}
                sx={{
                  width: 38,
                  height: 38,
                  border: `2px solid ${provider.color}`,
                  fontSize: "0.75rem",
                  backgroundColor: `${provider.color}22`,
                  color: provider.color,
                }}
              >
                {initials(provider.name)}
              </Avatar>
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: provider.color,
                  textAlign: "center",
                  lineHeight: 1.3,
                  maxWidth: 90,
                }}
              >
                {provider.name}
              </span>
            </div>
          );
        }}
        events={visibleAppointments.map(toCalendarEvent)}
        eventContent={(eventInfo) => {
          const appointment = eventInfo.event.extendedProps.appointment as
            | Appointment
            | undefined;
          if (!appointment) {
            return (
              <div
                style={{
                  color: "#1e56d0",
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
                  {eventInfo.event.title || "New Appointment"}
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
              </div>
            );
          }

          const status = APPOINTMENT_STATUS_CONFIG[appointment.status];
          const provider = providers.find(
            (item) => item.id === appointment.doctorId,
          );
          const showBadge = !isResourceView && provider;

          return (
            <div
              style={{
                color: status.color,
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
                style={{fontSize: "0.68rem", fontWeight: 500, opacity: 0.85}}
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
                    backgroundColor: provider.color,
                    borderRadius: 4,
                    padding: "1px 5px",
                    alignSelf: "flex-start",
                    letterSpacing: "0.02em",
                  }}
                >
                  {initials(provider.name)}
                </div>
              )}
            </div>
          );
        }}
        viewDidMount={(arg) => setCurrentView(arg.view.type)}
        datesSet={(arg: DatesSetArg) => {
          setCurrentView(arg.view.type);
          onRangeChange(arg.start, arg.end);
        }}
        editable={currentView !== "dayGridMonth"}
        selectable
        selectMirror
        weekends={false}
        slotMinTime="08:00:00"
        slotMaxTime="19:00:00"
        slotDuration="00:30:00"
        nowIndicator
        allDaySlot={false}
        select={handleSelect}
        eventClick={handleEventClick}
        eventChange={handleEventChange}
        height="auto"
      />

      <AppointmentEventPopover
        anchorEl={popoverAnchor}
        appointment={popoverAppointment}
        providers={providers}
        onClose={() => {
          setPopoverAnchor(null);
          setPopoverAppointment(null);
        }}
        onEdit={onEditRequested}
        onCheckIn={onCheckInRequested}
      />
    </div>
  );
}
