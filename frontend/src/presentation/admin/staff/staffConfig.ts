import {StaffRole, StaffStatus} from "@/domain/staff/entities/staff";

export const ROLE_CONFIG: Record<
  StaffRole,
  {label: string; color: string; bg: string}
> = {
  [StaffRole.DOCTOR]: {label: "Doctor", color: "#1e56d0", bg: "#e8f0fe"},
  [StaffRole.SECRETARY]: {label: "Secretary", color: "#c05621", bg: "#fef3e8"},
  [StaffRole.DENTAL_ASSISTANT]: {
    label: "Dental Assistant",
    color: "#6B46C1",
    bg: "#F3EBFA",
  },
  [StaffRole.ADMIN]: {label: "Admin", color: "#279C41", bg: "#E8F8EC"},
};

export const STATUS_CONFIG: Record<
  StaffStatus,
  {label: string; color: string; bg: string; dot: string}
> = {
  [StaffStatus.ACTIVE]: {
    label: "Active",
    color: "#279C41",
    bg: "#E8F8EC",
    dot: "#279C41",
  },
  [StaffStatus.ON_LEAVE]: {
    label: "On Leave",
    color: "#c05621",
    bg: "#fef3e8",
    dot: "#f6ad55",
  },
  [StaffStatus.INACTIVE]: {
    label: "Inactive",
    color: "#64748b",
    bg: "#f1f5f9",
    dot: "#94a3b8",
  },
};
