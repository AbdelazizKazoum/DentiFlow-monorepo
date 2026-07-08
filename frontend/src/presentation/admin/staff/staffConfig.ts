import {StaffRole, StaffStatus} from "@/domain/staff/entities/staff";

export const ROLE_CONFIG: Record<
  StaffRole,
  {color: string; bg: string}
> = {
  [StaffRole.DOCTOR]: {color: "#0f8aa3", bg: "#e3f6f8"},
  [StaffRole.SECRETARY]: {color: "#c05621", bg: "#fef3e8"},
  [StaffRole.DENTAL_ASSISTANT]: {
    color: "#6B46C1",
    bg: "#F3EBFA",
  },
  [StaffRole.ADMIN]: {color: "#279C41", bg: "#E8F8EC"},
};

export const STATUS_CONFIG: Record<
  StaffStatus,
  {color: string; bg: string; dot: string}
> = {
  [StaffStatus.ACTIVE]: {
    color: "#279C41",
    bg: "#E8F8EC",
    dot: "#279C41",
  },
  [StaffStatus.ON_LEAVE]: {
    color: "#c05621",
    bg: "#fef3e8",
    dot: "#f6ad55",
  },
  [StaffStatus.INACTIVE]: {
    color: "#64748b",
    bg: "#f1f5f9",
    dot: "#94a3b8",
  },
};
