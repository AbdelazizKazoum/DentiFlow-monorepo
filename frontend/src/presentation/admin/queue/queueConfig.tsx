import {CheckCircle2, Clock, ShieldAlert, UserCheck} from "lucide-react";
import type {ReactNode} from "react";
import type {
  QueuePriority,
  QueueStatus,
} from "@/domain/queue/entities/queueEntry";

export const QUEUE_CLINIC_ID =
  process.env.NEXT_PUBLIC_DEFAULT_CLINIC_ID ??
  "00000000-0000-4000-8000-000000000001";

export const QUEUE_STATUS_CONFIG: Record<
  QueueStatus,
  {label: string; color: string; bg: string; icon: ReactNode}
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
    color: "#7c3aed",
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

export const QUEUE_PRIORITY_CONFIG: Record<
  QueuePriority,
  {label: string; color: string; bg: string; icon?: ReactNode}
> = {
  NORMAL: {
    label: "Normal",
    color: "#475569",
    bg: "#f1f5f9",
  },
  URGENT: {
    label: "Urgent",
    color: "#b45309",
    bg: "#fef3c7",
    icon: <ShieldAlert size={13} />,
  },
  EMERGENCY: {
    label: "Emergency",
    color: "#b91c1c",
    bg: "#fee2e2",
    icon: <ShieldAlert size={13} />,
  },
};
