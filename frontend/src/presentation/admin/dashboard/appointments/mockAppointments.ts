import {Appointment} from "./types";

const today = new Date();
// Normalize to beginning of week (Monday)
const dayOfWeek = today.getDay();
const diffToMonday = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
const monday = new Date(today.setDate(diffToMonday));

function getDateForDay(
  dayOffset: number,
  hours: number,
  minutes: number = 0,
): string {
  const d = new Date(monday);
  d.setDate(monday.getDate() + dayOffset);
  d.setHours(hours, minutes, 0, 0);
  // Remove tz offset to pretend it's local time if needed, or just use ISO string natively.
  // Using simple ISO strings directly is best for FullCalendar:

  // adjust for local timezone offset so it looks correct
  const offset = d.getTimezoneOffset() * 60000;
  const localISOTime = new Date(d.getTime() - offset)
    .toISOString()
    .slice(0, -1);
  return localISOTime;
}

export const mockAppointments: Appointment[] = [
  {
    id: "1",
    title: "John Doe",
    start: getDateForDay(0, 9, 30), // Monday 09:30
    end: getDateForDay(0, 10, 0), // Monday 10:00
    status: "confirmed",
    patientName: "John Doe",
    service: "Consultation",
    notes: "First time patient",
  },
  {
    id: "2",
    title: "Jane Smith",
    start: getDateForDay(0, 11, 0), // Monday 11:00
    end: getDateForDay(0, 11, 30), // Monday 11:30
    status: "pending",
    patientName: "Jane Smith",
    service: "Teeth Cleaning",
  },
  {
    id: "3",
    title: "Michael Johnson",
    start: getDateForDay(1, 14, 0), // Tuesday 14:00
    end: getDateForDay(1, 15, 0), // Tuesday 15:00
    status: "cancelled",
    patientName: "Michael Johnson",
    service: "Root Canal",
    notes: "Patient called to reschedule",
  },
  {
    id: "4",
    title: "Emily Davis",
    start: getDateForDay(2, 9, 0), // Wednesday 09:00
    end: getDateForDay(2, 10, 0), // Wednesday 10:00
    status: "confirmed",
    patientName: "Emily Davis",
    service: "Filling",
  },
  {
    id: "5",
    title: "David Wilson",
    start: getDateForDay(3, 10, 30), // Thursday 10:30
    end: getDateForDay(3, 11, 0), // Thursday 11:00
    status: "confirmed",
    patientName: "David Wilson",
    service: "Orthodontic Check",
  },
  {
    id: "6",
    title: "Sarah Miller",
    start: getDateForDay(4, 16, 0), // Friday 16:00
    end: getDateForDay(4, 17, 0), // Friday 17:00
    status: "pending",
    patientName: "Sarah Miller",
    service: "Crown Fitting",
  },
];
