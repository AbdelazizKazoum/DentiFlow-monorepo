import {
  AlertCircle,
  Anchor,
  CircleDot,
  Crown,
  GitCommitHorizontal,
  Sun,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type {TreatmentStatus} from "@/domain/treatment/entities/dentalAct";
import type {ActCatalogMeta} from "./types";

export const ACT_META: Record<string, ActCatalogMeta> = {
  caries: {code: "DIA-01", price: 180, duration: "15 min", surface: "Occlusal"},
  filling: {code: "RES-12", price: 520, duration: "35 min", surface: "O/M/D"},
  crown: {code: "PRO-40", price: 2400, duration: "2 visits", surface: "Full crown"},
  implant: {code: "SUR-90", price: 7800, duration: "3 visits", surface: "Root axis"},
  extraction: {code: "SUR-20", price: 650, duration: "30 min", surface: "Whole tooth"},
  root_canal: {code: "END-31", price: 1800, duration: "60 min", surface: "Canal"},
  whitening: {code: "COS-10", price: 1200, duration: "45 min", surface: "Facial"},
  orthodontics: {code: "ORT-70", price: 3200, duration: "Monthly", surface: "Arch"},
};

export const TREATMENT_ICONS: Record<string, LucideIcon> = {
  AlertCircle,
  Anchor,
  CircleDot,
  Crown,
  GitCommitHorizontal,
  Sun,
  X,
  Zap,
};

export const STATUS_CLASS: Record<TreatmentStatus, string> = {
  planned: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200",
  in_progress: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-200",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-200",
  cancelled: "border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300",
};

export const PREVIOUS_STATUS: Partial<Record<TreatmentStatus, TreatmentStatus>> = {
  in_progress: "planned",
  completed: "in_progress",
  cancelled: "planned",
};

export const UNFINISHED_TOOTH_COLOR: Record<"planned" | "in_progress", string> = {
  planned: "#f59e0b",
  in_progress: "#3b82f6",
};

export const UPPER_TEETH = [
  "tooth_18",
  "tooth_17",
  "tooth_16",
  "tooth_15",
  "tooth_14",
  "tooth_13",
  "tooth_12",
  "tooth_11",
  "tooth_21",
  "tooth_22",
  "tooth_23",
  "tooth_24",
  "tooth_25",
  "tooth_26",
  "tooth_27",
  "tooth_28",
];

export const LOWER_TEETH = [
  "tooth_48",
  "tooth_47",
  "tooth_46",
  "tooth_45",
  "tooth_44",
  "tooth_43",
  "tooth_42",
  "tooth_41",
  "tooth_31",
  "tooth_32",
  "tooth_33",
  "tooth_34",
  "tooth_35",
  "tooth_36",
  "tooth_37",
  "tooth_38",
];

export const currencyFormatter = new Intl.NumberFormat("fr-MA", {
  style: "currency",
  currency: "MAD",
  maximumFractionDigits: 0,
});
