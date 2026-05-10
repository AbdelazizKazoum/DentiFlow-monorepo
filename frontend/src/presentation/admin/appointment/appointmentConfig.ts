import type {
  AppointmentStatus,
  BookingChannel,
} from "@/domain/appointment/entities/appointment";

export interface AppointmentProvider {
  id: string;
  name: string;
  avatar: string;
  color: string;
}

export const APPOINTMENT_CLINIC_ID =
  process.env.NEXT_PUBLIC_DEFAULT_CLINIC_ID ??
  "00000000-0000-4000-8000-000000000001";

export const APPOINTMENT_PROVIDERS: AppointmentProvider[] = [
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
    color: "#334155",
    bg: "#e2e8f0",
    border: "#64748b",
    label: "No show",
  },
  COMPLETED: {
    color: "#075985",
    bg: "#e0f2fe",
    border: "#0284c7",
    label: "Completed",
  },
};

export const APPOINTMENT_LEGEND_STATUSES: AppointmentStatus[] = [
  "CONFIRMED",
  "PENDING",
  "CANCELLED",
];

export const APPOINTMENT_CHANNEL_LABELS: Record<BookingChannel, string> = {
  ONLINE: "Online",
  WALK_IN: "Walk-in",
  PHONE: "Phone",
};
