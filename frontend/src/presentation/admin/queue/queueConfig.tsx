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
  {color: string; bg: string; icon: ReactNode}
> = {
  ARRIVED: {
    color: "#0f8aa3",
    bg: "#e8f0fe",
    icon: <CheckCircle2 size={16} />,
  },
  WAITING: {
    color: "#f59e0b",
    bg: "#fef3c7",
    icon: <Clock size={16} />,
  },
  IN_CHAIR: {
    color: "#7c3aed",
    bg: "#f3e8ff",
    icon: <UserCheck size={16} />,
  },
  DONE: {
    color: "#279C41",
    bg: "#E8F8EC",
    icon: <CheckCircle2 size={16} />,
  },
};

export const QUEUE_PRIORITY_CONFIG: Record<
  QueuePriority,
  {color: string; bg: string; icon?: ReactNode}
> = {
  NORMAL: {
    color: "#475569",
    bg: "#f1f5f9",
  },
  URGENT: {
    color: "#b45309",
    bg: "#fef3c7",
    icon: <ShieldAlert size={13} />,
  },
  EMERGENCY: {
    color: "#b91c1c",
    bg: "#fee2e2",
    icon: <ShieldAlert size={13} />,
  },
};
