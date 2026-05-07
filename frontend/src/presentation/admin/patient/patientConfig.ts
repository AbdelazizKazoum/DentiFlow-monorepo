import {
  PatientStatus,
  PatientGender,
} from "@/domain/patient/entities/patient";
import { DocumentType } from "@/domain/patient/entities/patientDocument";

export const STATUS_CONFIG: Record<
  PatientStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  [PatientStatus.ACTIVE]: {
    label: "Active",
    color: "#279C41",
    bg: "#E8F8EC",
    dot: "#279C41",
  },
  [PatientStatus.INACTIVE]: {
    label: "Inactive",
    color: "#64748b",
    bg: "#f1f5f9",
    dot: "#94a3b8",
  },
  [PatientStatus.ARCHIVED]: {
    label: "Archived",
    color: "#9a3412",
    bg: "#fff7ed",
    dot: "#ea580c",
  },
};

export const GENDER_LABELS: Record<PatientGender, string> = {
  [PatientGender.MALE]: "Male",
  [PatientGender.FEMALE]: "Female",
  [PatientGender.OTHER]: "Other",
};

export const DOC_TYPE_CONFIG: Record<
  DocumentType,
  { label: string; color: string; bg: string }
> = {
  [DocumentType.GENERAL]: { label: "General", color: "#64748b", bg: "#f1f5f9" },
  [DocumentType.INSURANCE]: {
    label: "Insurance",
    color: "#0891b2",
    bg: "#ecfeff",
  },
  [DocumentType.MEDICAL]: { label: "Medical", color: "#dc2626", bg: "#fff5f5" },
  [DocumentType.OTHER]: { label: "Other", color: "#7c3aed", bg: "#f5f3ff" },
};

export type SortOption = "lastAdded" | "name" | "status" | "gender";

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "lastAdded", label: "Last Added" },
  { value: "name", label: "Name (A–Z)" },
  { value: "status", label: "Status" },
  { value: "gender", label: "Gender" },
];

export const PAGE_SIZE = 8;

export const AVATAR_COLORS = [
  "#1e56d0",
  "#279C41",
  "#d97706",
  "#7c3aed",
  "#db2777",
  "#0891b2",
  "#059669",
  "#dc2626",
  "#4f46e5",
  "#0284c7",
];

/** Shared MUI TextField styling */
export const TF_SX = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    "& fieldset": { borderColor: "var(--border-ui)" },
    "&:hover fieldset": { borderColor: "var(--brand-primary)" },
    "&.Mui-focused fieldset": {
      borderColor: "var(--brand-primary)",
      borderWidth: 2,
    },
  },
  "& .MuiInputLabel-root": { fontSize: "0.875rem" },
  "& .MuiInputLabel-root.Mui-focused": { color: "var(--brand-primary)" },
  "& .MuiInputBase-input": { fontSize: "0.875rem" },
  "& .MuiSelect-select": { fontSize: "0.875rem" },
  "& .MuiFormHelperText-root": { marginLeft: 0, fontSize: 11 },
};
