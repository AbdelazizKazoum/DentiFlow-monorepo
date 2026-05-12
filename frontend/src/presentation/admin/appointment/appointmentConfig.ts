import type {
  AppointmentStatus,
  BookingChannel,
} from "@/domain/appointment/entities/appointment";
import type { Staff } from "@/domain/staff/entities/staff";

export interface AppointmentProvider {
  id: string;
  name: string;
  avatar: string;
  color: string;
}

export const APPOINTMENT_CLINIC_ID =
  process.env.NEXT_PUBLIC_DEFAULT_CLINIC_ID ??
  "00000000-0000-4000-8000-000000000001";

// Removed mock data - now using real staff data from store
export const APPOINTMENT_PROVIDERS: AppointmentProvider[] = [];

// Function to convert staff to appointment providers
export function staffToAppointmentProviders(staff: Staff[]): AppointmentProvider[] {
  const colors = ["#1e56d0", "#0891b2", "#9333ea", "#dc2626", "#059669", "#7c3aed"];
  return staff.map((member, index) => ({
    id: member.id,
    name: member.fullName,
    avatar: member.avatar || `https://i.pravatar.cc/150?img=${index + 1}`,
    color: colors[index % colors.length],
  }));
}

export const APPOINTMENT_STATUS_CONFIG: Record<
  AppointmentStatus,
  {color: string; bg: string; border: string; label: string}
> = {
  PENDING: {
    color: "#92400e",
    bg: "#fef3c7",
    border: "#f59e0b",
    label: "Pending",
  },
  CONFIRMED: {
    color: "#166534",
    bg: "#dcfce7",
    border: "#22c55e",
    label: "Confirmed",
  },
  CANCELLED: {
    color: "#991b1b",
    bg: "#fee2e2",
    border: "#ef4444",
    label: "Cancelled",
  },
  NO_SHOW: {
    color: "#7c2d12",
    bg: "#fef2f2",
    border: "#dc2626",
    label: "No Show",
  },
  COMPLETED: {
    color: "#0f5132",
    bg: "#d1e7dd",
    border: "#198754",
    label: "Completed",
  },
};

export const APPOINTMENT_LEGEND_STATUSES: AppointmentStatus[] = [
  "CONFIRMED",
  "PENDING",
  "CANCELLED",
];

export const APPOINTMENT_CHANNEL_CONFIG: Record<
  BookingChannel,
  {label: string}
> = {
  ONLINE: { label: "Online" },
  WALK_IN: { label: "Walk-in" },
  PHONE: { label: "Phone" },
};