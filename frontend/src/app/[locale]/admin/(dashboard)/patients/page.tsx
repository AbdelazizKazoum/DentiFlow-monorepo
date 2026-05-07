"use client";

import React, {useState, useCallback, useMemo, useRef} from "react";
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  MoreVertical,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  SlidersHorizontal,
  Download,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LayoutList,
  LayoutGrid,
  RefreshCw,
  PhoneCall,
  UserPlus,
  Activity,
  Heart,
  User,
  MapPin,
  FileText,
  Archive,
  Shield,
  FolderOpen,
  Upload,
  Check,
} from "lucide-react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  IconButton,
  Typography,
  Menu,
  Drawer,
  Checkbox,
} from "@mui/material";

// ─── Domain Entity Types (aligned to domain/patient/entities/patient.ts) ─────

enum PatientStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  ARCHIVED = "ARCHIVED",
}

enum PatientGender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

/** Matches domain DocumentType enum */
enum DocumentType {
  GENERAL = "GENERAL",
  INSURANCE = "INSURANCE",
  MEDICAL = "MEDICAL",
  OTHER = "OTHER",
}

interface InsuranceState {
  insuranceProviderId: string;
  isActive: boolean;
  policyNumber: string;
  memberId: string;
}

interface DocumentItem {
  id: string;
  type: DocumentType;
  fileUrl: string;
  title: string;
  createdAt: string;
}

type SortOption = "lastAdded" | "name" | "status" | "gender";

interface DateRange {
  from: Date | null;
  to: Date | null;
}

interface FilterState {
  status: PatientStatus | "all";
  gender: PatientGender | "all";
}

/** Matches domain Patient entity */
interface Patient {
  id: string;
  clinicId: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
  status: PatientStatus;
  userId?: string;
  phone?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: PatientGender;
  address?: string;
  notes?: string;
  allergies?: string;
  chronicConditions?: string;
  currentMedications?: string;
  medicalNotes?: string;
  cnie?: string;
  deletedAt?: string;
}

interface FormState {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: PatientGender | "";
  address: string;
  status: PatientStatus;
  notes: string;
  allergies: string;
  chronicConditions: string;
  currentMedications: string;
  medicalNotes: string;
  cnie: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  PatientStatus,
  {label: string; color: string; bg: string; dot: string}
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
const SORT_OPTIONS: {value: SortOption; label: string}[] = [
  {value: "lastAdded", label: "Last Added"},
  {value: "name", label: "Name (A\u2013Z)"},
  {value: "status", label: "Status"},
  {value: "gender", label: "Gender"},
];
const PAGE_SIZE = 8;
const AVATAR_COLORS = [
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
const TF_SX = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    background: "var(--surface-page)",
    "& fieldset": {borderColor: "var(--border-ui)"},
    "&:hover fieldset": {borderColor: "var(--brand-primary)"},
    "&.Mui-focused fieldset": {
      borderColor: "var(--brand-primary)",
      borderWidth: 2,
    },
  },
  "& .MuiInputLabel-root.Mui-focused": {color: "var(--brand-primary)"},
  "& .MuiFormHelperText-root": {marginLeft: 0, fontSize: 11},
};

const MOCK_INSURANCE_PROVIDERS: {id: string; name: string}[] = [
  {id: "prov-cnops", name: "CNOPS"},
  {id: "prov-cnss", name: "CNSS"},
  {id: "prov-rma", name: "RMA Watanya"},
  {id: "prov-saham", name: "Saham Assurance"},
  {id: "prov-axa", name: "AXA Assurance"},
  {id: "prov-allianz", name: "Allianz Maroc"},
  {id: "prov-wafa", name: "Wafa Assurance"},
  {id: "prov-atlanta", name: "Atlanta Assurance"},
];

const DOC_TYPE_CONFIG: Record<
  DocumentType,
  {label: string; color: string; bg: string}
> = {
  [DocumentType.GENERAL]: {label: "General", color: "#64748b", bg: "#f1f5f9"},
  [DocumentType.INSURANCE]: {
    label: "Insurance",
    color: "#0891b2",
    bg: "#ecfeff",
  },
  [DocumentType.MEDICAL]: {label: "Medical", color: "#dc2626", bg: "#fff5f5"},
  [DocumentType.OTHER]: {label: "Other", color: "#7c3aed", bg: "#f5f3ff"},
};

const INITIAL_PATIENTS: Patient[] = [
  {
    id: "1",
    clinicId: "clinic-1",
    firstName: "Alice",
    lastName: "Johnson",
    createdAt: "2026-04-15T10:00:00Z",
    updatedAt: "2026-04-15T10:00:00Z",
    status: PatientStatus.ACTIVE,
    email: "alice.j@example.com",
    phone: "555-0101",
    dateOfBirth: "1985-06-15",
    gender: PatientGender.FEMALE,
    address: "123 Main St, Springfield",
    allergies: "Penicillin",
    chronicConditions: "Hypertension",
  },
  {
    id: "2",
    clinicId: "clinic-1",
    firstName: "Michael",
    lastName: "Chen",
    createdAt: "2026-04-25T09:30:00Z",
    updatedAt: "2026-04-25T09:30:00Z",
    status: PatientStatus.ACTIVE,
    email: "m.chen@example.com",
    phone: "555-0203",
    dateOfBirth: "1992-11-22",
    gender: PatientGender.MALE,
  },
  {
    id: "3",
    clinicId: "clinic-1",
    firstName: "Sarah",
    lastName: "Williams",
    createdAt: "2025-12-20T14:00:00Z",
    updatedAt: "2025-12-20T14:00:00Z",
    status: PatientStatus.INACTIVE,
    email: "sarah.w@example.com",
    phone: "555-0305",
    dateOfBirth: "1978-03-08",
    gender: PatientGender.FEMALE,
    allergies: "Latex",
    chronicConditions: "Diabetes Type 2",
  },
  {
    id: "4",
    clinicId: "clinic-1",
    firstName: "David",
    lastName: "Martinez",
    createdAt: "2026-04-28T11:00:00Z",
    updatedAt: "2026-04-28T11:00:00Z",
    status: PatientStatus.ACTIVE,
    email: "d.martinez@example.com",
    phone: "555-0407",
    dateOfBirth: "2000-09-30",
    gender: PatientGender.MALE,
  },
  {
    id: "5",
    clinicId: "clinic-1",
    firstName: "Emma",
    lastName: "Thompson",
    createdAt: "2026-04-20T10:30:00Z",
    updatedAt: "2026-04-20T10:30:00Z",
    status: PatientStatus.ACTIVE,
    email: "emma.t@example.com",
    phone: "555-0509",
    dateOfBirth: "1995-12-12",
    gender: PatientGender.FEMALE,
    allergies: "Aspirin",
    chronicConditions: "Asthma",
    currentMedications: "Salbutamol inhaler",
  },
  {
    id: "6",
    clinicId: "clinic-1",
    firstName: "Omar",
    lastName: "Al-Rashid",
    createdAt: "2026-05-01T08:00:00Z",
    updatedAt: "2026-05-01T08:00:00Z",
    status: PatientStatus.ACTIVE,
    email: "omar.r@example.com",
    phone: "555-0611",
    dateOfBirth: "1988-07-03",
    gender: PatientGender.MALE,
    cnie: "MR-11234",
  },
  {
    id: "7",
    clinicId: "clinic-1",
    firstName: "Priya",
    lastName: "Sharma",
    createdAt: "2026-04-10T13:00:00Z",
    updatedAt: "2026-04-10T13:00:00Z",
    status: PatientStatus.ACTIVE,
    email: "priya.s@example.com",
    phone: "555-0713",
    dateOfBirth: "1997-02-18",
    gender: PatientGender.FEMALE,
    allergies: "Sulfa drugs",
  },
  {
    id: "8",
    clinicId: "clinic-1",
    firstName: "James",
    lastName: "Carter",
    createdAt: "2026-03-12T09:00:00Z",
    updatedAt: "2026-03-12T09:00:00Z",
    status: PatientStatus.ACTIVE,
    email: "j.carter@example.com",
    phone: "555-0815",
    dateOfBirth: "1983-04-22",
    gender: PatientGender.MALE,
  },
  {
    id: "9",
    clinicId: "clinic-1",
    firstName: "Aisha",
    lastName: "Patel",
    createdAt: "2026-04-05T10:00:00Z",
    updatedAt: "2026-04-05T10:00:00Z",
    status: PatientStatus.ACTIVE,
    email: "aisha.p@example.com",
    phone: "555-0917",
    dateOfBirth: "2001-08-14",
    gender: PatientGender.FEMALE,
    allergies: "Penicillin",
  },
  {
    id: "10",
    clinicId: "clinic-1",
    firstName: "Lucas",
    lastName: "Fernandez",
    createdAt: "2026-02-28T11:00:00Z",
    updatedAt: "2026-02-28T11:00:00Z",
    status: PatientStatus.INACTIVE,
    email: "l.fernandez@example.com",
    phone: "555-1019",
    dateOfBirth: "1990-12-03",
    gender: PatientGender.MALE,
    chronicConditions: "High cholesterol",
    currentMedications: "Atorvastatin 20mg",
  },
  {
    id: "11",
    clinicId: "clinic-1",
    firstName: "Yuki",
    lastName: "Tanaka",
    createdAt: "2026-05-02T09:00:00Z",
    updatedAt: "2026-05-02T09:00:00Z",
    status: PatientStatus.ACTIVE,
    email: "yuki.t@example.com",
    phone: "555-1121",
    dateOfBirth: "1996-06-18",
    gender: PatientGender.FEMALE,
  },
  {
    id: "12",
    clinicId: "clinic-1",
    firstName: "Fatima",
    lastName: "Nour",
    createdAt: "2026-04-18T10:00:00Z",
    updatedAt: "2026-04-18T10:00:00Z",
    status: PatientStatus.ACTIVE,
    email: "fatima.n@example.com",
    phone: "555-1223",
    dateOfBirth: "1987-09-29",
    gender: PatientGender.FEMALE,
    allergies: "Ibuprofen",
    chronicConditions: "Migraine",
    currentMedications: "Sumatriptan",
  },
  {
    id: "13",
    clinicId: "clinic-1",
    firstName: "Ethan",
    lastName: "Brooks",
    createdAt: "2026-04-30T10:00:00Z",
    updatedAt: "2026-04-30T10:00:00Z",
    status: PatientStatus.ACTIVE,
    email: "e.brooks@example.com",
    phone: "555-1325",
    dateOfBirth: "1994-01-07",
    gender: PatientGender.MALE,
  },
  {
    id: "14",
    clinicId: "clinic-1",
    firstName: "Nina",
    lastName: "Kowalski",
    createdAt: "2026-01-15T09:30:00Z",
    updatedAt: "2026-01-15T09:30:00Z",
    status: PatientStatus.INACTIVE,
    email: "nina.k@example.com",
    phone: "555-1427",
    dateOfBirth: "1980-11-25",
    gender: PatientGender.FEMALE,
    allergies: "Sulfa drugs",
    chronicConditions: "Arthritis",
  },
  {
    id: "15",
    clinicId: "clinic-1",
    firstName: "Carlos",
    lastName: "Mendez",
    createdAt: "2026-04-22T10:00:00Z",
    updatedAt: "2026-04-22T10:00:00Z",
    status: PatientStatus.ACTIVE,
    email: "c.mendez@example.com",
    phone: "555-1529",
    dateOfBirth: "1975-05-11",
    gender: PatientGender.MALE,
    chronicConditions: "Type 1 Diabetes",
    currentMedications: "Insulin",
  },
  {
    id: "16",
    clinicId: "clinic-1",
    firstName: "Sophie",
    lastName: "Laurent",
    createdAt: "2026-04-29T11:00:00Z",
    updatedAt: "2026-04-29T11:00:00Z",
    status: PatientStatus.ACTIVE,
    email: "sophie.l@example.com",
    phone: "555-1631",
    dateOfBirth: "1999-03-16",
    gender: PatientGender.FEMALE,
    allergies: "Latex",
  },
  {
    id: "17",
    clinicId: "clinic-1",
    firstName: "Amir",
    lastName: "Hassan",
    createdAt: "2026-03-25T09:00:00Z",
    updatedAt: "2026-03-25T09:00:00Z",
    status: PatientStatus.ACTIVE,
    email: "amir.h@example.com",
    phone: "555-1733",
    dateOfBirth: "1986-10-08",
    gender: PatientGender.MALE,
    chronicConditions: "Hypertension",
    currentMedications: "Lisinopril 10mg",
    cnie: "MR-98765",
  },
  {
    id: "18",
    clinicId: "clinic-1",
    firstName: "Mia",
    lastName: "Johansson",
    createdAt: "2026-04-12T10:00:00Z",
    updatedAt: "2026-04-12T10:00:00Z",
    status: PatientStatus.ACTIVE,
    email: "mia.j@example.com",
    phone: "555-1835",
    dateOfBirth: "2003-07-20",
    gender: PatientGender.FEMALE,
    allergies: "Aspirin",
  },
];
const EMPTY_FORM: FormState = {
  id: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  gender: "",
  address: "",
  status: PatientStatus.ACTIVE,
  notes: "",
  allergies: "",
  chronicConditions: "",
  currentMedications: "",
  medicalNotes: "",
  cnie: "",
};
// ─── Calendar Helpers ─────────────────────────────────────────────────────────

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function formatDateDisplay(d: Date | null): string {
  if (!d) return "DD/MM/YY";
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getFullYear()).slice(-2)}`;
}
function startOfWeek(d: Date): Date {
  const r = new Date(d);
  r.setDate(d.getDate() - d.getDay());
  return r;
}
function endOfWeek(d: Date): Date {
  const r = new Date(d);
  r.setDate(d.getDate() + (6 - d.getDay()));
  return r;
}
function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function buildPresets(): {label: string; range: DateRange}[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const lastYear = new Date(today);
  lastYear.setFullYear(today.getFullYear() - 1);
  return [
    {label: "Today", range: {from: today, to: today}},
    {label: "Yesterday", range: {from: yesterday, to: yesterday}},
    {
      label: "This week",
      range: {from: startOfWeek(today), to: endOfWeek(today)},
    },
    {
      label: "Last week",
      range: {from: startOfWeek(yesterday), to: endOfWeek(yesterday)},
    },
    {
      label: "This month",
      range: {from: startOfMonth(today), to: endOfMonth(today)},
    },
    {
      label: "Last month",
      range: {from: startOfMonth(yesterday), to: endOfMonth(yesterday)},
    },
    {
      label: "This year",
      range: {
        from: new Date(today.getFullYear(), 0, 1),
        to: new Date(today.getFullYear(), 11, 31),
      },
    },
    {
      label: "Last year",
      range: {
        from: new Date(lastYear.getFullYear(), 0, 1),
        to: new Date(lastYear.getFullYear(), 11, 31),
      },
    },
    {label: "All time", range: {from: null, to: null}},
  ];
}

// ─── MiniCalendar ─────────────────────────────────────────────────────────────

interface MiniCalendarProps {
  year: number;
  month: number;
  startDate: Date | null;
  endDate: Date | null;
  hoverDate: Date | null;
  onDateClick: (d: Date) => void;
  onDateHover: (d: Date | null) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  showNav: boolean;
}
function MiniCalendar({
  year,
  month,
  startDate,
  endDate,
  hoverDate,
  onDateClick,
  onDateHover,
  onPrevMonth,
  onNextMonth,
  showNav,
}: MiniCalendarProps) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const effectiveEnd =
    endDate ??
    (startDate && hoverDate && hoverDate >= startDate ? hoverDate : null);

  return (
    <div style={{width: 220}}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        {showNav ? (
          <button
            onClick={onPrevMonth}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
              borderRadius: 4,
              color: "var(--foreground)",
            }}
          >
            <ChevronLeft size={16} />
          </button>
        ) : (
          <div style={{width: 24}} />
        )}
        <span className="text-foreground font-semibold" style={{fontSize: 13}}>
          {MONTH_NAMES[month]} {year}
        </span>
        {showNav ? (
          <button
            onClick={onNextMonth}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
              borderRadius: 4,
              color: "var(--foreground)",
            }}
          >
            <ChevronRight size={16} />
          </button>
        ) : (
          <div style={{width: 24}} />
        )}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7,1fr)",
          gap: "2px 0",
        }}
      >
        {DAY_NAMES.map((d) => (
          <div
            key={d}
            style={{
              textAlign: "center",
              fontSize: 11,
              fontWeight: 600,
              color: "var(--text-placeholder)",
              padding: "2px 0",
            }}
          >
            {d}
          </div>
        ))}
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const isStart = startDate && isSameDay(d, startDate);
          const isEnd = effectiveEnd && isSameDay(d, effectiveEnd);
          const inRange =
            startDate && effectiveEnd && d > startDate && d < effectiveEnd;
          const isSelected = isStart || isEnd;
          return (
            <div
              key={i}
              style={{display: "flex", justifyContent: "center"}}
              onMouseEnter={() => onDateHover(d)}
              onMouseLeave={() => onDateHover(null)}
            >
              <button
                onClick={() => onDateClick(d)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  backgroundColor: isSelected
                    ? "var(--brand-primary)"
                    : inRange
                      ? "#dbeafe"
                      : "transparent",
                  color: isSelected
                    ? "#fff"
                    : inRange
                      ? "#1e40af"
                      : "var(--foreground)",
                  fontWeight: isSelected ? 700 : 400,
                  transition: "background 0.1s",
                }}
              >
                {d.getDate()}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── DateRangeModal ───────────────────────────────────────────────────────────

interface DateRangeModalProps {
  open: boolean;
  dateRange: DateRange;
  onApply: (r: DateRange, preset?: string) => void;
  onClose: () => void;
}
function DateRangeModal({
  open,
  dateRange,
  onApply,
  onClose,
}: DateRangeModalProps) {
  const presets = buildPresets();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [localStart, setLocalStart] = useState<Date | null>(dateRange.from);
  const [localEnd, setLocalEnd] = useState<Date | null>(dateRange.to);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  const rightYear = calMonth === 11 ? calYear + 1 : calYear;
  const rightMonth = calMonth === 11 ? 0 : calMonth + 1;

  const handleDateClick = (d: Date) => {
    if (!localStart || (localStart && localEnd)) {
      setLocalStart(d);
      setLocalEnd(null);
      setActivePreset(null);
    } else {
      if (d < localStart) {
        setLocalEnd(localStart);
        setLocalStart(d);
      } else {
        setLocalEnd(d);
      }
      setActivePreset(null);
    }
  };
  const handlePreset = (p: {label: string; range: DateRange}) => {
    setLocalStart(p.range.from);
    setLocalEnd(p.range.to);
    setActivePreset(p.label);
  };

  React.useEffect(() => {
    if (open) {
      setLocalStart(dateRange.from);
      setLocalEnd(dateRange.to);
      setActivePreset(null);
      const ref = dateRange.from ?? today;
      setCalYear(ref.getFullYear());
      setCalMonth(ref.getMonth());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      slotProps={{
        paper: {
          sx: {
            borderRadius: "16px",
            boxShadow: "0 20px 48px rgba(0,0,0,0.18)",
            p: 0,
            overflow: "hidden",
          },
        },
      }}
    >
      <div style={{display: "flex", fontFamily: "inherit"}}>
        {/* Presets */}
        <div
          style={{
            width: 148,
            borderRight: "1px solid var(--border-ui)",
            padding: "16px 0",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <div
            style={{
              padding: "0 12px 10px",
              fontSize: 11,
              fontWeight: 700,
              color: "var(--text-placeholder)",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
            }}
          >
            Quick Select
          </div>
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => handlePreset(p)}
              style={{
                background: activePreset === p.label ? "#eff6ff" : "none",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                padding: "7px 16px",
                fontSize: 13,
                fontWeight: activePreset === p.label ? 600 : 400,
                color:
                  activePreset === p.label
                    ? "var(--brand-primary)"
                    : "var(--foreground)",
                borderRadius: 0,
                transition: "background 0.1s",
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
        {/* Calendars */}
        <div style={{padding: "20px 24px"}}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <span className="text-foreground font-bold" style={{fontSize: 15}}>
              Select Date Range
            </span>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-muted)",
                padding: 4,
              }}
            >
              <X size={18} />
            </button>
          </div>
          <div style={{display: "flex", gap: 32}}>
            <MiniCalendar
              year={calYear}
              month={calMonth}
              startDate={localStart}
              endDate={localEnd}
              hoverDate={hoverDate}
              onDateClick={handleDateClick}
              onDateHover={setHoverDate}
              onPrevMonth={() => {
                if (calMonth === 0) {
                  setCalMonth(11);
                  setCalYear((y) => y - 1);
                } else setCalMonth((m) => m - 1);
              }}
              onNextMonth={() => {
                if (calMonth === 11) {
                  setCalMonth(0);
                  setCalYear((y) => y + 1);
                } else setCalMonth((m) => m + 1);
              }}
              showNav={true}
            />
            <MiniCalendar
              year={rightYear}
              month={rightMonth}
              startDate={localStart}
              endDate={localEnd}
              hoverDate={hoverDate}
              onDateClick={handleDateClick}
              onDateHover={setHoverDate}
              onPrevMonth={() => {}}
              onNextMonth={() => {}}
              showNav={false}
            />
          </div>
          <div
            style={{
              marginTop: 20,
              paddingTop: 16,
              borderTop: "1px solid var(--border-ui)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{display: "flex", gap: 8, alignItems: "center"}}>
              <div
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--border-ui)",
                  fontSize: 13,
                  minWidth: 90,
                  textAlign: "center",
                  color: "var(--foreground)",
                }}
              >
                {formatDateDisplay(localStart)}
              </div>
              <span className="text-text-placeholder" style={{fontSize: 13}}>
                &rarr;
              </span>
              <div
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--border-ui)",
                  fontSize: 13,
                  minWidth: 90,
                  textAlign: "center",
                  color: "var(--foreground)",
                }}
              >
                {formatDateDisplay(localEnd)}
              </div>
            </div>
            <div style={{display: "flex", gap: 8}}>
              <button
                onClick={onClose}
                style={{
                  padding: "7px 20px",
                  borderRadius: 8,
                  border: "1px solid var(--border-ui)",
                  background: "var(--surface-card)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  color: "var(--foreground)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onApply(
                    {from: localStart, to: localEnd},
                    activePreset ?? undefined,
                  );
                  onClose();
                }}
                style={{
                  padding: "7px 20px",
                  borderRadius: 8,
                  border: "none",
                  background: "var(--brand-primary)",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

// ─── FilterDrawer ─────────────────────────────────────────────────────────────

interface FilterDrawerProps {
  open: boolean;
  filters: FilterState;
  onApply: (f: FilterState) => void;
  onClose: () => void;
}
function FilterDrawer({open, filters, onApply, onClose}: FilterDrawerProps) {
  const [local, setLocal] = useState<FilterState>(filters);
  React.useEffect(() => {
    if (open) setLocal(filters);
  }, [open, filters]);
  const sel =
    (field: keyof FilterState) => (e: React.ChangeEvent<HTMLSelectElement>) =>
      setLocal((prev) => ({...prev, [field]: e.target.value}));
  const labelSty: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: "var(--text-muted)",
    marginBottom: 4,
    display: "block",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };
  const selSty: React.CSSProperties = {
    width: "100%",
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid var(--border-ui)",
    fontSize: 14,
    color: "var(--foreground)",
    background: "var(--surface-card)",
    outline: "none",
    appearance: "none",
  };
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: 340,
            display: "flex",
            flexDirection: "column",
            fontFamily: "inherit",
          },
        },
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 20px 16px",
          borderBottom: "1px solid var(--border-ui)",
        }}
      >
        <span className="text-foreground font-bold" style={{fontSize: 16}}>
          Filters
        </span>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-muted)",
            padding: 4,
          }}
        >
          <X size={20} />
        </button>
      </div>
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 20,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <div>
          <label style={labelSty}>Status</label>
          <div style={{position: "relative"}}>
            <select
              value={local.status}
              onChange={sel("status")}
              style={selSty}
            >
              <option value="all">All Statuses</option>
              <option value={PatientStatus.ACTIVE}>Active</option>
              <option value={PatientStatus.INACTIVE}>Inactive</option>
              <option value={PatientStatus.ARCHIVED}>Archived</option>
            </select>
            <ChevronDown
              size={14}
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                color: "var(--text-muted)",
              }}
            />
          </div>
        </div>
        <div>
          <label style={labelSty}>Gender</label>
          <div style={{position: "relative"}}>
            <select
              value={local.gender}
              onChange={sel("gender")}
              style={selSty}
            >
              <option value="all">All Genders</option>
              <option value={PatientGender.MALE}>Male</option>
              <option value={PatientGender.FEMALE}>Female</option>
              <option value={PatientGender.OTHER}>Other</option>
            </select>
            <ChevronDown
              size={14}
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                color: "var(--text-muted)",
              }}
            />
          </div>
        </div>
        <div>
          <label style={labelSty}>Has Allergies</label>
          <div style={{position: "relative"}}>
            <select style={selSty} defaultValue="all">
              <option value="all">Any</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
            <ChevronDown
              size={14}
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                color: "var(--text-muted)",
              }}
            />
          </div>
        </div>
        <div>
          <label style={labelSty}>Has Chronic Conditions</label>
          <div style={{position: "relative"}}>
            <select style={selSty} defaultValue="all">
              <option value="all">Any</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
            <ChevronDown
              size={14}
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                color: "var(--text-muted)",
              }}
            />
          </div>
        </div>
      </div>
      <div
        style={{
          padding: 20,
          borderTop: "1px solid var(--border-ui)",
          display: "flex",
          gap: 10,
        }}
      >
        <button
          onClick={() => {
            setLocal({status: "all", gender: "all"});
          }}
          style={{
            flex: 1,
            padding: "9px 0",
            borderRadius: 8,
            border: "1px solid var(--border-ui)",
            background: "var(--surface-card)",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            color: "var(--foreground)",
          }}
        >
          Clear All
        </button>
        <button
          onClick={() => {
            onApply(local);
            onClose();
          }}
          style={{
            flex: 2,
            padding: "9px 0",
            borderRadius: 8,
            border: "none",
            background: "var(--brand-primary)",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Apply Filters
        </button>
      </div>
    </Drawer>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getFullName(p: Patient): string {
  return `${p.firstName} ${p.lastName}`.trim();
}
function isNewPatient(createdAt: string): boolean {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return new Date(createdAt) >= thirtyDaysAgo;
}
function calculateAge(dob?: string): string | number {
  if (!dob) return "—";
  const today = new Date();
  const bd = new Date(dob);
  let age = today.getFullYear() - bd.getFullYear();
  const m = today.getMonth() - bd.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age--;
  return age;
}
function getInitials(firstName: string, lastName: string): string {
  return (
    (firstName.charAt(0) || "").toUpperCase() +
    (lastName.charAt(0) || "").toUpperCase()
  );
}
function formatRelativeDate(dateStr: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  const today = new Date();
  d.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diff = Math.round(
    (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
function getAvatarColor(id: string): string {
  const n = parseInt(id, 10) || id.charCodeAt(0);
  return AVATAR_COLORS[n % AVATAR_COLORS.length];
}
function getActiveFilterCount(
  filters: FilterState,
  dateRange: DateRange,
): number {
  let n = 0;
  if (filters.status !== "all") n++;
  if (filters.gender !== "all") n++;
  if (dateRange.from || dateRange.to) n++;
  return n;
}

// ─── PatientFormDrawer ────────────────────────────────────────────────────────

interface PatientFormDrawerProps {
  open: boolean;
  form: FormState;
  formError: string;
  isEdit: boolean;
  onClose: () => void;
  onSave: () => void;
  onDelete: () => void;
  onChange: (form: FormState) => void;
}

function SectionHeader({
  icon,
  title,
  iconColor,
  iconBg,
}: {
  icon: React.ReactNode;
  title: string;
  iconColor: string;
  iconBg: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 16,
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          background: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {React.cloneElement(
          icon as React.ReactElement<{size?: number; color?: string}>,
          {
            size: 15,
            color: iconColor,
          },
        )}
      </div>
      <span
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: "var(--foreground)",
          letterSpacing: "0.01em",
        }}
      >
        {title}
      </span>
      <div
        style={{
          flex: 1,
          height: 1,
          background: "var(--border-ui)",
          marginLeft: 2,
        }}
      />
    </div>
  );
}

// ─── Accordion Section (Edit Mode) ───────────────────────────────────────────
function AccordionSection({
  title,
  icon,
  iconColor,
  iconBg,
  summary,
  summaryMuted = false,
  savedBadge = false,
  open,
  onToggle,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
  summary?: string;
  summaryMuted?: boolean;
  savedBadge?: boolean;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        border: "1px solid var(--border-ui)",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: open
          ? "0 4px 20px rgba(0,0,0,0.08)"
          : "0 1px 3px rgba(0,0,0,0.04)",
        transition: "box-shadow 0.2s",
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          padding: "14px 16px",
          background: open ? "var(--surface-page)" : "var(--surface-card)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 12,
          textAlign: "left",
          transition: "background 0.15s",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {React.cloneElement(
            icon as React.ReactElement<{size?: number; color?: string}>,
            {size: 16, color: iconColor},
          )}
        </div>
        <div style={{flex: 1, minWidth: 0}}>
          <div
            style={{fontSize: 13, fontWeight: 700, color: "var(--foreground)"}}
          >
            {title}
          </div>
          {summary && (
            <div
              style={{
                fontSize: 11,
                color: summaryMuted
                  ? "var(--text-placeholder)"
                  : "var(--text-muted)",
                marginTop: 2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {summary}
            </div>
          )}
        </div>
        {savedBadge && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "3px 9px",
              borderRadius: 20,
              background: "#E8F8EC",
              color: "#279C41",
              fontSize: 10,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            <Check size={10} /> Saved
          </span>
        )}
        <ChevronDown
          size={16}
          color="var(--text-placeholder)"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
            flexShrink: 0,
          }}
        />
      </button>
      <div
        style={{
          maxHeight: open ? "3000px" : 0,
          overflow: "hidden",
          transition: open
            ? "max-height 0.4s cubic-bezier(0.0, 0, 0.2, 1)"
            : "max-height 0.25s cubic-bezier(0.4, 0, 1, 1)",
        }}
      >
        <div
          style={{
            padding: "20px",
            borderTop: "1px solid var(--border-ui)",
            background: "var(--surface-card)",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function PatientFormDrawer({
  open,
  form,
  formError,
  isEdit,
  onClose,
  onSave,
  onDelete,
  onChange,
}: PatientFormDrawerProps) {
  const inp =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange({...form, [field]: e.target.value});

  const avatarInitials = isEdit
    ? getInitials(form.firstName, form.lastName)
    : "";

  // ── Create wizard step ──
  const [createStep, setCreateStep] = useState<1 | 2 | 3>(1);
  const [stepError, setStepError] = useState("");

  // ── Insurance state ──
  const [insurance, setInsurance] = useState<InsuranceState>({
    insuranceProviderId: "",
    isActive: true,
    policyNumber: "",
    memberId: "",
  });
  const [insuranceSaved, setInsuranceSaved] = useState(false);

  // ── Documents state ──
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [docForm, setDocForm] = useState<{
    type: DocumentType;
    title: string;
    fileName: string;
    fileUrl: string;
  }>({type: DocumentType.GENERAL, title: "", fileName: "", fileUrl: ""});
  const [showDocForm, setShowDocForm] = useState(false);

  // ── Edit mode accordion ──
  const [openAccordion, setOpenAccordion] = useState<string | null>("patient");
  const [savedSection, setSavedSection] = useState<string | null>(null);

  // Reset on close
  React.useEffect(() => {
    if (!open) {
      setCreateStep(1);
      setStepError("");
      setInsurance({
        insuranceProviderId: "",
        isActive: true,
        policyNumber: "",
        memberId: "",
      });
      setInsuranceSaved(false);
      setDocuments([]);
      setDocForm({
        type: DocumentType.GENERAL,
        title: "",
        fileName: "",
        fileUrl: "",
      });
      setShowDocForm(false);
      setOpenAccordion("patient");
      setSavedSection(null);
    }
  }, [open]);

  const handleRegisterPatient = () => {
    setStepError("");
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setStepError("First and last name are required.");
      return;
    }
    if (!form.email.trim()) {
      setStepError("Email address is required.");
      return;
    }
    onSave();
    setCreateStep(2);
  };

  const handleSavePatientSection = () => {
    onSave();
    setOpenAccordion(null);
    setSavedSection("patient");
    setTimeout(() => setSavedSection(null), 3000);
  };

  const handleSaveInsurance = () => {
    if (!insurance.insuranceProviderId) return;
    setInsuranceSaved(true);
    if (isEdit) {
      setSavedSection("insurance");
      setTimeout(() => setSavedSection(null), 3000);
    }
  };

  const handleRemoveInsurance = () => {
    setInsurance({
      insuranceProviderId: "",
      isActive: true,
      policyNumber: "",
      memberId: "",
    });
    setInsuranceSaved(false);
  };

  const handleAddDocument = () => {
    if (!docForm.fileName && !docForm.fileUrl) return;
    setDocuments((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        type: docForm.type,
        fileUrl: docForm.fileUrl || docForm.fileName,
        title: docForm.title,
        createdAt: new Date().toISOString(),
      },
    ]);
    setDocForm({
      type: DocumentType.GENERAL,
      title: "",
      fileName: "",
      fileUrl: "",
    });
    setShowDocForm(false);
  };

  const handleRemoveDocument = (id: string) =>
    setDocuments((prev) => prev.filter((d) => d.id !== id));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file)
      setDocForm((f) => ({
        ...f,
        fileName: file.name,
        fileUrl: URL.createObjectURL(file),
      }));
  };

  const CREATE_STEPS = [
    {id: 1 as const, label: "Patient Record"},
    {id: 2 as const, label: "Insurance"},
    {id: 3 as const, label: "Documents"},
  ];

  // Shared JSX fragments
  const patientFormFields = (
    <div style={{display: "flex", flexDirection: "column", gap: 20}}>
      <div>
        <SectionHeader
          icon={<User />}
          title="Personal Information"
          iconColor="#1e56d0"
          iconBg="#eff6ff"
        />
        <div style={{display: "flex", flexDirection: "column", gap: 14}}>
          <div
            style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14}}
          >
            <TextField
              label="First Name"
              fullWidth
              required
              value={form.firstName}
              onChange={inp("firstName")}
              size="small"
              sx={TF_SX}
            />
            <TextField
              label="Last Name"
              fullWidth
              required
              value={form.lastName}
              onChange={inp("lastName")}
              size="small"
              sx={TF_SX}
            />
          </div>
          <div
            style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14}}
          >
            <TextField
              label="Date of Birth"
              type="date"
              fullWidth
              value={form.dateOfBirth}
              onChange={inp("dateOfBirth")}
              size="small"
              sx={TF_SX}
              slotProps={{inputLabel: {shrink: true}}}
            />
            <FormControl fullWidth size="small" sx={TF_SX}>
              <InputLabel>Gender</InputLabel>
              <Select
                label="Gender"
                value={form.gender}
                onChange={(e) =>
                  onChange({
                    ...form,
                    gender: e.target.value as PatientGender | "",
                  })
                }
              >
                <MenuItem value="">Not specified</MenuItem>
                <MenuItem value={PatientGender.MALE}>Male</MenuItem>
                <MenuItem value={PatientGender.FEMALE}>Female</MenuItem>
                <MenuItem value={PatientGender.OTHER}>Other</MenuItem>
              </Select>
            </FormControl>
          </div>
          <TextField
            label="CNIE (National Identity Number)"
            fullWidth
            value={form.cnie}
            onChange={inp("cnie")}
            size="small"
            sx={TF_SX}
            placeholder="e.g. MR-12345"
          />
        </div>
      </div>
      <div>
        <SectionHeader
          icon={<Phone />}
          title="Contact Details"
          iconColor="#0891b2"
          iconBg="#ecfeff"
        />
        <div style={{display: "flex", flexDirection: "column", gap: 14}}>
          <div
            style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14}}
          >
            <TextField
              label="Email Address"
              type="email"
              fullWidth
              required
              value={form.email}
              onChange={inp("email")}
              size="small"
              sx={TF_SX}
            />
            <TextField
              label="Phone Number"
              fullWidth
              value={form.phone}
              onChange={inp("phone")}
              size="small"
              sx={TF_SX}
              placeholder="+212 6XX-XXXXXX"
            />
          </div>
          <TextField
            label="Address"
            fullWidth
            value={form.address}
            onChange={inp("address")}
            size="small"
            sx={TF_SX}
            placeholder="Street, City, Postal Code"
            slotProps={{
              input: {
                startAdornment: (
                  <MapPin
                    size={14}
                    color="var(--text-placeholder)"
                    style={{marginRight: 6}}
                  />
                ),
              },
            }}
          />
        </div>
      </div>
      <div>
        <SectionHeader
          icon={<Activity />}
          title="Patient Status"
          iconColor="#279C41"
          iconBg="#E8F8EC"
        />
        <FormControl fullWidth size="small" sx={TF_SX}>
          <InputLabel>Status</InputLabel>
          <Select
            label="Status"
            value={form.status}
            onChange={(e) =>
              onChange({...form, status: e.target.value as PatientStatus})
            }
          >
            <MenuItem value={PatientStatus.ACTIVE}>
              <span style={{display: "flex", alignItems: "center", gap: 8}}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#279C41",
                    display: "inline-block",
                  }}
                />
                Active — Patient is actively receiving care
              </span>
            </MenuItem>
            <MenuItem value={PatientStatus.INACTIVE}>
              <span style={{display: "flex", alignItems: "center", gap: 8}}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#94a3b8",
                    display: "inline-block",
                  }}
                />
                Inactive — Patient is temporarily inactive
              </span>
            </MenuItem>
            <MenuItem value={PatientStatus.ARCHIVED}>
              <span style={{display: "flex", alignItems: "center", gap: 8}}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#ea580c",
                    display: "inline-block",
                  }}
                />
                Archived — Record is archived (soft-deleted)
              </span>
            </MenuItem>
          </Select>
        </FormControl>
      </div>
      <div>
        <SectionHeader
          icon={<Heart />}
          title="Medical Information"
          iconColor="#dc2626"
          iconBg="#fff5f5"
        />
        <div style={{display: "flex", flexDirection: "column", gap: 14}}>
          <TextField
            label="Known Allergies"
            fullWidth
            value={form.allergies}
            onChange={inp("allergies")}
            size="small"
            sx={TF_SX}
            placeholder="e.g. Penicillin, Latex, Aspirin"
            helperText="List all known allergies, separated by commas"
          />
          <TextField
            label="Chronic Conditions"
            fullWidth
            value={form.chronicConditions}
            onChange={inp("chronicConditions")}
            size="small"
            sx={TF_SX}
            placeholder="e.g. Diabetes Type 2, Hypertension"
          />
          <TextField
            label="Current Medications"
            fullWidth
            value={form.currentMedications}
            onChange={inp("currentMedications")}
            size="small"
            sx={TF_SX}
            placeholder="e.g. Metformin 500mg, Salbutamol inhaler"
          />
          <TextField
            label="Medical Notes"
            fullWidth
            multiline
            rows={2}
            value={form.medicalNotes}
            onChange={inp("medicalNotes")}
            size="small"
            sx={TF_SX}
            placeholder="Additional medical notes from doctors..."
          />
        </div>
      </div>
      <div>
        <SectionHeader
          icon={<FileText />}
          title="Administrative Notes"
          iconColor="#7c3aed"
          iconBg="#f5f3ff"
        />
        <TextField
          label="Notes"
          fullWidth
          multiline
          rows={2}
          value={form.notes}
          onChange={inp("notes")}
          size="small"
          sx={TF_SX}
          placeholder="Administrative notes (non-medical)..."
        />
      </div>
    </div>
  );

  const insuranceFormFields = (
    <div style={{display: "flex", flexDirection: "column", gap: 14}}>
      <FormControl fullWidth size="small" sx={TF_SX}>
        <InputLabel>Insurance Provider *</InputLabel>
        <Select
          label="Insurance Provider *"
          value={insurance.insuranceProviderId}
          onChange={(e) =>
            setInsurance((s) => ({...s, insuranceProviderId: e.target.value}))
          }
        >
          <MenuItem value="">
            <em style={{fontSize: 13, color: "var(--text-placeholder)"}}>
              Select a provider
            </em>
          </MenuItem>
          {MOCK_INSURANCE_PROVIDERS.map((p) => (
            <MenuItem key={p.id} value={p.id} sx={{fontSize: "0.875rem"}}>
              {p.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14}}>
        <TextField
          label="Policy Number"
          fullWidth
          value={insurance.policyNumber}
          onChange={(e) =>
            setInsurance((s) => ({...s, policyNumber: e.target.value}))
          }
          size="small"
          sx={TF_SX}
          placeholder="e.g. POL-12345"
        />
        <TextField
          label="Member ID"
          fullWidth
          value={insurance.memberId}
          onChange={(e) =>
            setInsurance((s) => ({...s, memberId: e.target.value}))
          }
          size="small"
          sx={TF_SX}
          placeholder="e.g. MBR-67890"
        />
      </div>
      <button
        type="button"
        onClick={() => setInsurance((s) => ({...s, isActive: !s.isActive}))}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
          borderRadius: 8,
          border: `1px solid ${insurance.isActive ? "#86efac" : "var(--border-ui)"}`,
          background: insurance.isActive ? "#f0fdf4" : "var(--surface-page)",
          cursor: "pointer",
          textAlign: "left",
          width: "100%",
        }}
      >
        <Checkbox
          checked={insurance.isActive}
          size="small"
          onChange={(e) =>
            setInsurance((s) => ({...s, isActive: e.target.checked}))
          }
          onClick={(e) => e.stopPropagation()}
          sx={{
            padding: 0,
            color: "var(--text-placeholder)",
            "&.Mui-checked": {color: "#279C41"},
          }}
        />
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: insurance.isActive ? "#279C41" : "var(--foreground)",
            }}
          >
            Coverage is Active
          </div>
          <div style={{fontSize: 11, color: "var(--text-muted)"}}>
            Insurance is currently valid and accepted for billing
          </div>
        </div>
      </button>
    </div>
  );

  const insuranceSavedCard = (
    <div
      style={{
        border: "1px solid var(--border-ui)",
        borderRadius: 10,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #ecfeff 0%, #e0f2fe 100%)",
          borderBottom: "1px solid var(--border-ui)",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{display: "flex", alignItems: "center", gap: 8}}>
          <Shield size={14} color="#0891b2" />
          <span style={{fontSize: 13, fontWeight: 700, color: "#0891b2"}}>
            {
              MOCK_INSURANCE_PROVIDERS.find(
                (p) => p.id === insurance.insuranceProviderId,
              )?.name
            }
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "2px 8px",
              borderRadius: 20,
              fontSize: 10,
              fontWeight: 700,
              background: insurance.isActive ? "#E8F8EC" : "#f1f5f9",
              color: insurance.isActive ? "#279C41" : "#64748b",
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: insurance.isActive ? "#279C41" : "#94a3b8",
              }}
            />
            {insurance.isActive ? "Active" : "Inactive"}
          </span>
        </div>
        <button
          onClick={handleRemoveInsurance}
          style={{
            padding: "4px 10px",
            borderRadius: 6,
            border: "1px solid var(--border-ui)",
            background: "var(--surface-card)",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 600,
            color: "var(--foreground)",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <Edit2 size={11} /> Change
        </button>
      </div>
      {(insurance.policyNumber || insurance.memberId) && (
        <div
          style={{
            padding: "12px 16px",
            display: "flex",
            gap: 28,
            background: "var(--surface-card)",
          }}
        >
          {insurance.policyNumber && (
            <div>
              <div
                style={{
                  fontSize: 10,
                  color: "var(--text-placeholder)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 3,
                }}
              >
                Policy Number
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--foreground)",
                }}
              >
                {insurance.policyNumber}
              </div>
            </div>
          )}
          {insurance.memberId && (
            <div>
              <div
                style={{
                  fontSize: 10,
                  color: "var(--text-placeholder)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 3,
                }}
              >
                Member ID
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--foreground)",
                }}
              >
                {insurance.memberId}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const documentsContent = (
    <div style={{display: "flex", flexDirection: "column", gap: 10}}>
      {documents.length === 0 && !showDocForm && (
        <div
          style={{
            textAlign: "center",
            padding: "24px 16px",
            color: "var(--text-placeholder)",
            fontSize: 13,
          }}
        >
          No documents uploaded yet
        </div>
      )}
      {documents.length > 0 && (
        <div style={{display: "flex", flexDirection: "column", gap: 8}}>
          {documents.map((doc) => {
            const dtCfg = DOC_TYPE_CONFIG[doc.type];
            return (
              <div
                key={doc.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "1px solid var(--border-ui)",
                  background: "var(--surface-page)",
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    background: dtCfg.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <FileText size={15} color={dtCfg.color} />
                </div>
                <div style={{flex: 1, minWidth: 0}}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--foreground)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {doc.title || doc.fileUrl.split("/").pop() || "Document"}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginTop: 3,
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "1px 7px",
                        borderRadius: 20,
                        fontSize: 10,
                        fontWeight: 700,
                        background: dtCfg.bg,
                        color: dtCfg.color,
                      }}
                    >
                      {dtCfg.label}
                    </span>
                    <span
                      style={{fontSize: 10, color: "var(--text-placeholder)"}}
                    >
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveDocument(doc.id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 5,
                    borderRadius: 6,
                    color: "var(--text-placeholder)",
                    display: "flex",
                    alignItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
      {showDocForm ? (
        <div
          style={{
            border: "1px solid var(--border-ui)",
            borderRadius: 10,
            padding: 16,
            background: "var(--surface-page)",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div
            style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14}}
          >
            <FormControl fullWidth size="small" sx={TF_SX}>
              <InputLabel>Document Type</InputLabel>
              <Select
                label="Document Type"
                value={docForm.type}
                onChange={(e) =>
                  setDocForm((f) => ({
                    ...f,
                    type: e.target.value as DocumentType,
                  }))
                }
              >
                {Object.values(DocumentType).map((t) => (
                  <MenuItem key={t} value={t} sx={{fontSize: "0.875rem"}}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 7,
                      }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: DOC_TYPE_CONFIG[t].color,
                          flexShrink: 0,
                        }}
                      />
                      {DOC_TYPE_CONFIG[t].label}
                    </span>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Title (optional)"
              fullWidth
              value={docForm.title}
              onChange={(e) =>
                setDocForm((f) => ({...f, title: e.target.value}))
              }
              size="small"
              sx={TF_SX}
              placeholder="e.g. Insurance Card"
            />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            style={{display: "none"}}
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: "100%",
              padding: "20px 16px",
              borderRadius: 8,
              border: `2px dashed ${docForm.fileName ? "var(--brand-primary)" : "var(--border-ui)"}`,
              background: docForm.fileName ? "#eff6ff" : "var(--surface-card)",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Upload
              size={20}
              color={
                docForm.fileName
                  ? "var(--brand-primary)"
                  : "var(--text-placeholder)"
              }
            />
            {docForm.fileName ? (
              <>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--brand-primary)",
                    maxWidth: "100%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {docForm.fileName}
                </span>
                <span style={{fontSize: 11, color: "var(--text-muted)"}}>
                  Click to change file
                </span>
              </>
            ) : (
              <>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--foreground)",
                  }}
                >
                  Click to upload a file
                </span>
                <span style={{fontSize: 11, color: "var(--text-muted)"}}>
                  PDF, JPG, PNG, DOC — up to 10 MB
                </span>
              </>
            )}
          </button>
          <div style={{display: "flex", justifyContent: "flex-end", gap: 8}}>
            <button
              onClick={() => {
                setShowDocForm(false);
                setDocForm({
                  type: DocumentType.GENERAL,
                  title: "",
                  fileName: "",
                  fileUrl: "",
                });
              }}
              style={{
                padding: "7px 16px",
                borderRadius: 8,
                border: "1px solid var(--border-ui)",
                background: "var(--surface-card)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                color: "var(--foreground)",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleAddDocument}
              disabled={!docForm.fileName && !docForm.fileUrl}
              style={{
                padding: "7px 18px",
                borderRadius: 8,
                border: "none",
                background:
                  docForm.fileName || docForm.fileUrl
                    ? "var(--brand-primary)"
                    : "var(--border-ui)",
                color:
                  docForm.fileName || docForm.fileUrl
                    ? "#fff"
                    : "var(--text-placeholder)",
                fontSize: 13,
                fontWeight: 700,
                cursor:
                  docForm.fileName || docForm.fileUrl
                    ? "pointer"
                    : "not-allowed",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Upload size={13} /> Upload Document
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowDocForm(true)}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px dashed var(--border-ui)",
            background: "var(--surface-card)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            fontSize: 13,
            fontWeight: 600,
            color: "var(--text-muted)",
          }}
        >
          <Plus size={14} /> Add Document
        </button>
      )}
    </div>
  );

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: {xs: "100vw", sm: 620},
            display: "flex",
            flexDirection: "column",
            fontFamily: "inherit",
            backgroundColor: "var(--surface-card)",
          },
        },
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          background:
            "linear-gradient(135deg, var(--brand-primary) 0%, #1338a0 100%)",
          padding: "22px 24px 18px",
          flexShrink: 0,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -40,
            top: -40,
            width: 160,
            height: 160,
            borderRadius: "50%",
            border: "32px solid rgba(255,255,255,0.07)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div style={{display: "flex", alignItems: "center", gap: 14}}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: "rgba(255,255,255,0.18)",
                border: "2px solid rgba(255,255,255,0.28)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                backdropFilter: "blur(4px)",
              }}
            >
              {isEdit && avatarInitials ? (
                <span
                  style={{
                    fontSize: 19,
                    fontWeight: 800,
                    color: "#fff",
                    letterSpacing: "-0.03em",
                  }}
                >
                  {avatarInitials}
                </span>
              ) : (
                <UserPlus size={24} color="#fff" />
              )}
            </div>
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.6)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: 2,
                }}
              >
                {isEdit
                  ? "Patient Record"
                  : createStep === 1
                    ? "Step 1 of 3 — Patient Info"
                    : createStep === 2
                      ? "Step 2 of 3 — Insurance"
                      : "Step 3 of 3 — Documents"}
              </div>
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#fff",
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                {isEdit && (form.firstName || form.lastName)
                  ? `${form.firstName} ${form.lastName}`.trim()
                  : "New Patient Registration"}
              </h2>
              {isEdit && form.id && (
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.55)",
                    marginTop: 2,
                  }}
                >
                  ID #{form.id}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.22)",
              borderRadius: 8,
              padding: "6px 7px",
              cursor: "pointer",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <X size={17} />
          </button>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            background:
              "linear-gradient(90deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.1) 100%)",
          }}
        />
      </div>

      {/* ── Step Indicator (create mode only) ── */}
      {!isEdit && (
        <div
          style={{
            padding: "14px 24px 13px",
            borderBottom: "1px solid var(--border-ui)",
            background: "var(--surface-card)",
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          {CREATE_STEPS.map((step, i) => (
            <React.Fragment key={step.id}>
              <div style={{display: "flex", alignItems: "center", gap: 8}}>
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    background:
                      createStep > step.id
                        ? "#279C41"
                        : createStep === step.id
                          ? "var(--brand-primary)"
                          : "var(--surface-page)",
                    border:
                      createStep > step.id
                        ? "none"
                        : createStep === step.id
                          ? "2px solid var(--brand-primary)"
                          : "2px solid var(--border-ui)",
                    color:
                      createStep >= step.id
                        ? "#fff"
                        : "var(--text-placeholder)",
                    fontSize: 11,
                    fontWeight: 700,
                    transition: "all 0.2s",
                  }}
                >
                  {createStep > step.id ? <Check size={12} /> : step.id}
                </div>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: createStep === step.id ? 700 : 400,
                    whiteSpace: "nowrap",
                    transition: "color 0.2s",
                    color:
                      createStep > step.id
                        ? "#279C41"
                        : createStep === step.id
                          ? "var(--foreground)"
                          : "var(--text-placeholder)",
                  }}
                >
                  {step.label}
                </span>
              </div>
              {i < CREATE_STEPS.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: 2,
                    minWidth: 16,
                    margin: "0 8px",
                    borderRadius: 2,
                    background:
                      createStep > step.id ? "#279C41" : "var(--border-ui)",
                    transition: "background 0.3s",
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* ── Scrollable Body ── */}
      <div style={{flex: 1, overflowY: "auto", padding: "24px"}}>
        {!isEdit ? (
          // ── Create Wizard ──
          <>
            {createStep === 1 && (
              <>
                {(stepError || formError) && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "11px 14px",
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      borderRadius: 10,
                      fontSize: 13,
                      color: "#dc2626",
                      marginBottom: 20,
                    }}
                  >
                    <AlertCircle size={15} style={{flexShrink: 0}} />
                    {stepError || formError}
                  </div>
                )}
                {patientFormFields}
              </>
            )}
            {createStep === 2 && (
              <div style={{display: "flex", flexDirection: "column", gap: 20}}>
                <div
                  style={{
                    padding: "14px 16px",
                    borderRadius: 10,
                    background:
                      "linear-gradient(135deg, #ecfeff 0%, #eff6ff 100%)",
                    border: "1px solid #bae6fd",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: "rgba(8,145,178,0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Shield size={18} color="#0891b2" />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "var(--foreground)",
                        marginBottom: 2,
                      }}
                    >
                      Insurance Coverage
                    </div>
                    <div style={{fontSize: 12, color: "var(--text-muted)"}}>
                      Optionally link a health insurance provider for billing
                      and claims processing.
                    </div>
                  </div>
                </div>
                {insuranceSaved ? insuranceSavedCard : insuranceFormFields}
                {!insuranceSaved && (
                  <div style={{display: "flex", justifyContent: "flex-end"}}>
                    <button
                      onClick={handleSaveInsurance}
                      disabled={!insurance.insuranceProviderId}
                      style={{
                        padding: "7px 18px",
                        borderRadius: 8,
                        border: "none",
                        background: insurance.insuranceProviderId
                          ? "var(--brand-primary)"
                          : "var(--border-ui)",
                        color: insurance.insuranceProviderId
                          ? "#fff"
                          : "var(--text-placeholder)",
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: insurance.insuranceProviderId
                          ? "pointer"
                          : "not-allowed",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Shield size={13} /> Save Insurance
                    </button>
                  </div>
                )}
              </div>
            )}
            {createStep === 3 && (
              <div style={{display: "flex", flexDirection: "column", gap: 20}}>
                <div
                  style={{
                    padding: "14px 16px",
                    borderRadius: 10,
                    background:
                      "linear-gradient(135deg, #f5f3ff 0%, #faf5ff 100%)",
                    border: "1px solid #ddd6fe",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: "rgba(124,58,237,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <FolderOpen size={18} color="#7c3aed" />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "var(--foreground)",
                        marginBottom: 2,
                      }}
                    >
                      Patient Documents
                    </div>
                    <div style={{fontSize: 12, color: "var(--text-muted)"}}>
                      Upload ID cards, insurance policies, medical records, or
                      any relevant documents.
                    </div>
                  </div>
                </div>
                {documentsContent}
              </div>
            )}
          </>
        ) : (
          // ── Edit Mode Accordions ──
          <div style={{display: "flex", flexDirection: "column", gap: 10}}>
            <AccordionSection
              title="Patient Record"
              icon={<User />}
              iconColor="#1e56d0"
              iconBg="#eff6ff"
              savedBadge={savedSection === "patient"}
              summary={
                form.firstName || form.lastName
                  ? `${form.firstName} ${form.lastName}`.trim() +
                    (form.email ? ` · ${form.email}` : "")
                  : "No info recorded"
              }
              summaryMuted={!form.firstName && !form.lastName}
              open={openAccordion === "patient"}
              onToggle={() =>
                setOpenAccordion((p) => (p === "patient" ? null : "patient"))
              }
            >
              {(stepError || formError) && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "11px 14px",
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: 10,
                    fontSize: 13,
                    color: "#dc2626",
                    marginBottom: 20,
                  }}
                >
                  <AlertCircle size={15} style={{flexShrink: 0}} />
                  {stepError || formError}
                </div>
              )}
              {patientFormFields}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: 20,
                  paddingTop: 16,
                  borderTop: "1px solid var(--border-ui)",
                }}
              >
                <button
                  onClick={handleSavePatientSection}
                  style={{
                    padding: "8px 22px",
                    borderRadius: 8,
                    border: "none",
                    background:
                      "linear-gradient(135deg, var(--brand-primary) 0%, #1338a0 100%)",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    boxShadow: "0 4px 14px rgba(30,86,208,0.25)",
                  }}
                >
                  <Edit2 size={13} /> Save Patient Record
                </button>
              </div>
            </AccordionSection>

            <AccordionSection
              title="Insurance Coverage"
              icon={<Shield />}
              iconColor="#0891b2"
              iconBg="#ecfeff"
              savedBadge={savedSection === "insurance"}
              summary={
                insuranceSaved
                  ? (MOCK_INSURANCE_PROVIDERS.find(
                      (p) => p.id === insurance.insuranceProviderId,
                    )?.name ?? "Insurance on file") +
                    (insurance.isActive ? " · Active" : " · Inactive")
                  : "No insurance on file"
              }
              summaryMuted={!insuranceSaved}
              open={openAccordion === "insurance"}
              onToggle={() =>
                setOpenAccordion((p) =>
                  p === "insurance" ? null : "insurance",
                )
              }
            >
              {insuranceSaved ? (
                <div
                  style={{display: "flex", flexDirection: "column", gap: 14}}
                >
                  {insuranceSavedCard}
                  <div style={{display: "flex", justifyContent: "flex-end"}}>
                    <button
                      onClick={handleRemoveInsurance}
                      style={{
                        padding: "7px 18px",
                        borderRadius: 8,
                        border: "none",
                        background: "var(--brand-primary)",
                        color: "#fff",
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Edit2 size={13} /> Change Insurance
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  style={{display: "flex", flexDirection: "column", gap: 14}}
                >
                  {insuranceFormFields}
                  <div style={{display: "flex", justifyContent: "flex-end"}}>
                    <button
                      onClick={handleSaveInsurance}
                      disabled={!insurance.insuranceProviderId}
                      style={{
                        padding: "7px 18px",
                        borderRadius: 8,
                        border: "none",
                        background: insurance.insuranceProviderId
                          ? "var(--brand-primary)"
                          : "var(--border-ui)",
                        color: insurance.insuranceProviderId
                          ? "#fff"
                          : "var(--text-placeholder)",
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: insurance.insuranceProviderId
                          ? "pointer"
                          : "not-allowed",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Shield size={13} /> Save Insurance
                    </button>
                  </div>
                </div>
              )}
            </AccordionSection>

            <AccordionSection
              title="Documents"
              icon={<FolderOpen />}
              iconColor="#7c3aed"
              iconBg="#f5f3ff"
              summary={
                documents.length > 0
                  ? `${documents.length} document${documents.length > 1 ? "s" : ""} on file`
                  : "No documents uploaded"
              }
              summaryMuted={documents.length === 0}
              open={openAccordion === "documents"}
              onToggle={() =>
                setOpenAccordion((p) =>
                  p === "documents" ? null : "documents",
                )
              }
            >
              {documentsContent}
            </AccordionSection>
          </div>
        )}
      </div>

      {/* ── Sticky Footer ── */}
      <div
        style={{
          padding: "14px 24px",
          borderTop: "1px solid var(--border-ui)",
          background: "var(--surface-card)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          flexShrink: 0,
        }}
      >
        {!isEdit ? (
          <>
            <div>
              {createStep === 1 ? (
                <button
                  onClick={onClose}
                  style={{
                    padding: "8px 18px",
                    borderRadius: 8,
                    border: "1px solid var(--border-ui)",
                    background: "var(--surface-card)",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    color: "var(--foreground)",
                  }}
                >
                  Cancel
                </button>
              ) : (
                <button
                  onClick={() => setCreateStep((s) => (s - 1) as 1 | 2 | 3)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "1px solid var(--border-ui)",
                    background: "var(--surface-card)",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    color: "var(--foreground)",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <ChevronLeft size={14} /> Back
                </button>
              )}
            </div>
            <div style={{display: "flex", alignItems: "center", gap: 8}}>
              {createStep === 1 && (
                <button
                  onClick={handleRegisterPatient}
                  style={{
                    padding: "9px 22px",
                    borderRadius: 8,
                    border: "none",
                    background:
                      "linear-gradient(135deg, var(--brand-primary) 0%, #1338a0 100%)",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    boxShadow: "0 4px 14px rgba(30,86,208,0.3)",
                  }}
                >
                  <Plus size={14} /> Register Patient
                </button>
              )}
              {createStep === 2 && (
                <>
                  <button
                    onClick={() => setCreateStep(3)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 8,
                      border: "1px solid var(--border-ui)",
                      background: "var(--surface-card)",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      color: "var(--text-muted)",
                    }}
                  >
                    Skip
                  </button>
                  <button
                    onClick={() => {
                      if (!insuranceSaved && insurance.insuranceProviderId)
                        handleSaveInsurance();
                      setCreateStep(3);
                    }}
                    style={{
                      padding: "9px 22px",
                      borderRadius: 8,
                      border: "none",
                      background:
                        "linear-gradient(135deg, var(--brand-primary) 0%, #1338a0 100%)",
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      boxShadow: "0 4px 14px rgba(30,86,208,0.3)",
                    }}
                  >
                    {insuranceSaved ? "Continue" : "Save & Continue"}{" "}
                    <ChevronRight size={14} />
                  </button>
                </>
              )}
              {createStep === 3 && (
                <button
                  onClick={onClose}
                  style={{
                    padding: "9px 22px",
                    borderRadius: 8,
                    border: "none",
                    background:
                      "linear-gradient(135deg, #279C41 0%, #1d7a30 100%)",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    boxShadow: "0 4px 14px rgba(39,156,65,0.28)",
                  }}
                >
                  <Check size={14} /> Finish
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <button
              onClick={onDelete}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "1px solid #fca5a5",
                background: "#fef2f2",
                color: "#dc2626",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Trash2 size={14} /> Delete Patient
            </button>
            <button
              onClick={onClose}
              style={{
                padding: "8px 20px",
                borderRadius: 8,
                border: "1px solid var(--border-ui)",
                background: "var(--surface-card)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                color: "var(--foreground)",
              }}
            >
              Close
            </button>
          </>
        )}
      </div>
    </Drawer>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function PaginationBar({
  totalPages,
  currentPage,
  setCurrentPage,
  className,
}: {
  totalPages: number;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  className?: string;
}) {
  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    const st = Math.max(2, currentPage - 1);
    const en = Math.min(totalPages - 1, currentPage + 1);
    for (let i = st; i <= en; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }
  return (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        padding: "14px 20px",
      }}
    >
      <button
        onClick={() => setCurrentPage((pp) => Math.max(1, pp - 1))}
        disabled={currentPage === 1}
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: "none",
          background: "transparent",
          cursor: currentPage === 1 ? "not-allowed" : "pointer",
          color:
            currentPage === 1 ? "var(--text-placeholder)" : "var(--foreground)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: currentPage === 1 ? 0.4 : 1,
        }}
      >
        <ChevronLeft size={18} strokeWidth={2} />
      </button>
      {pages.map((pg, idx) =>
        pg === "..." ? (
          <span
            key={`el-${idx}`}
            style={{
              width: 30,
              height: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              color: "var(--text-placeholder)",
              userSelect: "none",
            }}
          >
            ···
          </span>
        ) : (
          <button
            key={pg}
            onClick={() => setCurrentPage(pg as number)}
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              border: "none",
              background:
                pg === currentPage ? "var(--brand-primary)" : "transparent",
              color: pg === currentPage ? "#fff" : "var(--foreground)",
              fontSize: 13,
              fontWeight: pg === currentPage ? 700 : 400,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              if (pg !== currentPage)
                (e.currentTarget as HTMLButtonElement).style.background =
                  "var(--surface-page)";
            }}
            onMouseLeave={(e) => {
              if (pg !== currentPage)
                (e.currentTarget as HTMLButtonElement).style.background =
                  "transparent";
            }}
          >
            {pg}
          </button>
        ),
      )}
      <button
        onClick={() => setCurrentPage((pp) => Math.min(totalPages, pp + 1))}
        disabled={currentPage === totalPages}
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: "none",
          background: "transparent",
          cursor: currentPage === totalPages ? "not-allowed" : "pointer",
          color:
            currentPage === totalPages
              ? "var(--text-placeholder)"
              : "var(--foreground)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: currentPage === totalPages ? 0.4 : 1,
        }}
      >
        <ChevronRight size={18} strokeWidth={2} />
      </button>
    </div>
  );
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    status: "all",
    gender: "all",
  });
  const [dateRange, setDateRange] = useState<DateRange>({from: null, to: null});
  const [datePreset, setDatePreset] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>("lastAdded");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [sortMenuAnchor, setSortMenuAnchor] = useState<null | HTMLElement>(
    null,
  );
  const [formDrawerOpen, setFormDrawerOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuTarget, setMenuTarget] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const activeFilterCount = getActiveFilterCount(filters, dateRange);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, filters, dateRange, sort]);

  const filtered = useMemo(() => {
    let list = patients.filter((p) => {
      const fullName = getFullName(p).toLowerCase();
      if (
        search &&
        !fullName.includes(search.toLowerCase()) &&
        !(p.email || "").toLowerCase().includes(search.toLowerCase()) &&
        !(p.phone || "").toLowerCase().includes(search.toLowerCase()) &&
        !(p.cnie || "").toLowerCase().includes(search.toLowerCase())
      )
        return false;
      if (filters.status !== "all" && p.status !== filters.status) return false;
      if (filters.gender !== "all" && p.gender !== filters.gender) return false;
      if (dateRange.from && p.createdAt) {
        const d = new Date(p.createdAt);
        d.setHours(0, 0, 0, 0);
        if (d < dateRange.from) return false;
      }
      if (dateRange.to && p.createdAt) {
        const d = new Date(p.createdAt);
        d.setHours(0, 0, 0, 0);
        if (d > dateRange.to) return false;
      }
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === "name") return a.firstName.localeCompare(b.firstName);
      if (sort === "status") return a.status.localeCompare(b.status);
      if (sort === "gender")
        return (a.gender || "").localeCompare(b.gender || "");
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return list;
  }, [patients, search, filters, dateRange, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const allSelected =
    filtered.length > 0 && filtered.every((p) => selectedIds.has(p.id));
  const someSelected = filtered.some((p) => selectedIds.has(p.id));

  const toggleAll = () => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map((p) => p.id)));
  };
  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return s;
    });
  };

  const handleExport = () => {
    const rows = filtered.map((p) =>
      [
        getFullName(p),
        p.email || "",
        p.phone || "",
        p.status,
        p.gender || "",
        p.dateOfBirth || "",
        p.createdAt.split("T")[0],
      ].join(","),
    );
    const csv = [
      "Full Name,Email,Phone,Status,Gender,Date of Birth,Registered",
      ...rows,
    ].join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = "patients.csv";
    a.click();
  };

  const openNew = useCallback(() => {
    setForm(EMPTY_FORM);
    setFormError("");
    setFormDrawerOpen(true);
  }, []);

  const openEdit = useCallback((p: Patient) => {
    setForm({
      id: p.id,
      firstName: p.firstName,
      lastName: p.lastName,
      email: p.email || "",
      phone: p.phone || "",
      dateOfBirth: p.dateOfBirth || "",
      gender: p.gender || "",
      address: p.address || "",
      status: p.status,
      notes: p.notes || "",
      allergies: p.allergies || "",
      chronicConditions: p.chronicConditions || "",
      currentMedications: p.currentMedications || "",
      medicalNotes: p.medicalNotes || "",
      cnie: p.cnie || "",
    });
    setFormError("");
    setFormDrawerOpen(true);
    setMenuAnchor(null);
    setMenuTarget(null);
  }, []);

  const openMenu = (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
    setMenuTarget(id);
  };
  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuTarget(null);
  };

  const handleDelete = useCallback((id: string) => {
    setDeleteTargetId(id);
    setDeleteConfirmOpen(true);
    closeMenu();
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteTargetId) {
      setPatients((prev) => prev.filter((p) => p.id !== deleteTargetId));
      setSelectedIds((prev) => {
        const s = new Set(prev);
        s.delete(deleteTargetId);
        return s;
      });
      setDeleteConfirmOpen(false);
      setDeleteTargetId(null);
      setFormDrawerOpen(false);
    }
  }, [deleteTargetId]);

  const bulkDelete = () => {
    setPatients((prev) => prev.filter((p) => !selectedIds.has(p.id)));
    setSelectedIds(new Set());
  };

  const handleSave = () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setFormError("First name and last name are required.");
      return;
    }
    if (!form.email.trim()) {
      setFormError("Email address is required.");
      return;
    }
    if (patients.some((p) => p.email === form.email && p.id !== form.id)) {
      setFormError("A patient with this email already exists.");
      return;
    }
    const now = new Date().toISOString();
    const updated: Patient = {
      id: form.id || String(Date.now()),
      clinicId: "clinic-1",
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      createdAt: patients.find((p) => p.id === form.id)?.createdAt || now,
      updatedAt: now,
      status: form.status,
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      dateOfBirth: form.dateOfBirth || undefined,
      gender: (form.gender as PatientGender) || undefined,
      address: form.address.trim() || undefined,
      notes: form.notes.trim() || undefined,
      allergies: form.allergies.trim() || undefined,
      chronicConditions: form.chronicConditions.trim() || undefined,
      currentMedications: form.currentMedications.trim() || undefined,
      medicalNotes: form.medicalNotes.trim() || undefined,
      cnie: form.cnie.trim() || undefined,
    };
    setPatients((prev) =>
      form.id
        ? prev.map((p) => (p.id === form.id ? updated : p))
        : [...prev, updated],
    );
  };

  const removeDateFilter = () => {
    setDateRange({from: null, to: null});
    setDatePreset(null);
  };
  const removeStatusFilter = () => setFilters((f) => ({...f, status: "all"}));
  const removeGenderFilter = () => setFilters((f) => ({...f, gender: "all"}));

  const dateLabel =
    datePreset ||
    (dateRange.from
      ? `${formatDateDisplay(dateRange.from)} - ${formatDateDisplay(dateRange.to)}`
      : "Date");
  const sortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Sort";

  return (
    <>
      <div className="p-6 lg:p-8 space-y-5">
        {/* ── Stats Row ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 14,
          }}
        >
          {[
            {
              label: "Total Patients",
              value: patients.length,
              Icon: Users,
              color: "var(--brand-primary)",
              bg: "#eff6ff",
            },
            {
              label: "Active Patients",
              value: patients.filter((p) => p.status === PatientStatus.ACTIVE)
                .length,
              Icon: Activity,
              color: "#279C41",
              bg: "#E8F8EC",
            },
            {
              label: "New This Month",
              value: patients.filter((p) => isNewPatient(p.createdAt)).length,
              Icon: UserPlus,
              color: "#7c3aed",
              bg: "#f5f3ff",
            },
            {
              label: "Inactive / Archived",
              value: patients.filter(
                (p) =>
                  p.status === PatientStatus.INACTIVE ||
                  p.status === PatientStatus.ARCHIVED,
              ).length,
              Icon: Archive,
              color: "#64748b",
              bg: "#f1f5f9",
            },
          ].map(({label, value, Icon, color, bg}) => (
            <div
              key={label}
              style={{
                background: "var(--surface-card)",
                border: "1px solid var(--border-ui)",
                borderRadius: 14,
                padding: "18px 20px",
                display: "flex",
                alignItems: "center",
                gap: 14,
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                cursor: "default",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={22} color={color} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: "var(--foreground)",
                    lineHeight: 1,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {value}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text-muted)",
                    marginTop: 3,
                    fontWeight: 500,
                  }}
                >
                  {label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Toolbar Card ── */}
        <div
          style={{
            background: "var(--surface-card)",
            borderRadius: 12,
            border: "1px solid var(--border-ui)",
            boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
            padding: "10px 14px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Main Row */}
          <div style={{display: "flex", alignItems: "center", gap: 8}}>
            {/* View Toggle */}
            <div
              style={{
                display: "flex",
                borderRadius: 7,
                border: "1px solid var(--border-ui)",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              <button
                onClick={() => setViewMode("list")}
                style={{
                  padding: "6px 9px",
                  border: "none",
                  cursor: "pointer",
                  background:
                    viewMode === "list"
                      ? "var(--brand-primary)"
                      : "transparent",
                  color:
                    viewMode === "list" ? "#fff" : "var(--text-placeholder)",
                }}
              >
                <LayoutList size={15} />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                style={{
                  padding: "6px 9px",
                  border: "none",
                  cursor: "pointer",
                  background:
                    viewMode === "grid"
                      ? "var(--brand-primary)"
                      : "transparent",
                  color:
                    viewMode === "grid" ? "#fff" : "var(--text-placeholder)",
                }}
              >
                <LayoutGrid size={15} />
              </button>
            </div>
            {/* Search */}
            <div
              style={{
                position: "relative",
                width: 260,
                minWidth: 160,
                flexShrink: 1,
                flexGrow: 0,
              }}
            >
              <Search
                size={14}
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-placeholder)",
                  pointerEvents: "none",
                }}
              />
              <input
                type="text"
                placeholder="Search by name, email, phone, CNIE..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "7px 10px 7px 32px",
                  borderRadius: 7,
                  border: "1px solid var(--border-ui)",
                  fontSize: 13,
                  color: "var(--foreground)",
                  background: "var(--surface-page)",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{flex: 1}} />
            {/* Date */}
            <button
              onClick={() => setDateModalOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "7px 12px",
                borderRadius: 7,
                border:
                  dateRange.from || dateRange.to
                    ? "1px solid var(--brand-primary)"
                    : "1px solid var(--border-ui)",
                background:
                  dateRange.from || dateRange.to
                    ? "#eff6ff"
                    : "var(--surface-card)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                color:
                  dateRange.from || dateRange.to
                    ? "var(--brand-primary)"
                    : "var(--foreground)",
                flexShrink: 0,
              }}
            >
              <CalendarDays size={14} /> {dateLabel} <ChevronDown size={12} />
            </button>
            {/* Sort */}
            <button
              onClick={(e) => setSortMenuAnchor(e.currentTarget)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "7px 12px",
                borderRadius: 7,
                border: "1px solid var(--border-ui)",
                background: "var(--surface-card)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                color: "var(--foreground)",
                flexShrink: 0,
              }}
            >
              <RefreshCw size={14} /> {sortLabel} <ChevronDown size={12} />
            </button>
            <div
              style={{
                width: 1,
                height: 22,
                background: "var(--border-ui)",
                flexShrink: 0,
              }}
            />
            {/* All Filters */}
            <button
              onClick={() => setFilterDrawerOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "7px 12px",
                borderRadius: 7,
                border: "1px solid var(--border-ui)",
                background: "var(--surface-card)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                color: "var(--foreground)",
                flexShrink: 0,
                whiteSpace: "nowrap",
              }}
            >
              <SlidersHorizontal size={14} /> Filter
              {activeFilterCount > 0 && (
                <span
                  style={{
                    minWidth: 17,
                    height: 17,
                    borderRadius: 9,
                    background: "var(--brand-primary)",
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 700,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 3px",
                  }}
                >
                  {activeFilterCount}
                </span>
              )}
            </button>
            <div
              style={{
                width: 1,
                height: 22,
                background: "var(--border-ui)",
                flexShrink: 0,
              }}
            />
            {/* Export */}
            <button
              onClick={handleExport}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "7px 12px",
                borderRadius: 7,
                border: "1px solid var(--border-ui)",
                background: "var(--surface-card)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                color: "var(--foreground)",
                flexShrink: 0,
              }}
            >
              <Download size={14} /> Export
            </button>
            {/* Add Patient */}
            <button
              onClick={openNew}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                borderRadius: 8,
                border: "none",
                background: "var(--brand-primary)",
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                flexShrink: 0,
                whiteSpace: "nowrap",
                boxShadow: "0 2px 6px rgba(30,86,208,0.25)",
                transition: "background 0.15s,box-shadow 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--brand-primary-dark)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(30,86,208,0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--brand-primary)";
                e.currentTarget.style.boxShadow =
                  "0 2px 6px rgba(30,86,208,0.25)";
              }}
            >
              <Plus size={14} /> Add Patient
            </button>
          </div>
          {/* Info Row: count + filter chips */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              flexWrap: "wrap",
              marginTop: 10,
              paddingTop: 8,
              borderTop: "1px solid var(--border-ui)",
            }}
          >
            <span className="text-text-placeholder" style={{fontSize: 12}}>
              {someSelected
                ? `${selectedIds.size} selected`
                : `${filtered.length} patient${filtered.length !== 1 ? "s" : ""}`}
            </span>
            {someSelected && (
              <button
                onClick={bulkDelete}
                style={{
                  padding: "3px 10px",
                  borderRadius: 6,
                  border: "1px solid #fca5a5",
                  background: "#fef2f2",
                  color: "#dc2626",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Delete Selected
              </button>
            )}
            {filters.status !== "all" && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "3px 9px",
                  borderRadius: 20,
                  background: "#eff6ff",
                  color: "var(--brand-primary)",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {STATUS_CONFIG[filters.status].label}
                <button
                  onClick={removeStatusFilter}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    lineHeight: 1,
                    color: "var(--brand-primary)",
                    display: "flex",
                  }}
                >
                  <X size={10} />
                </button>
              </span>
            )}
            {filters.gender !== "all" && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "3px 9px",
                  borderRadius: 20,
                  background: "#eff6ff",
                  color: "var(--brand-primary)",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {filters.gender}
                <button
                  onClick={removeGenderFilter}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    lineHeight: 1,
                    color: "var(--brand-primary)",
                    display: "flex",
                  }}
                >
                  <X size={10} />
                </button>
              </span>
            )}
            {(dateRange.from || dateRange.to) && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "3px 9px",
                  borderRadius: 20,
                  background: "#eff6ff",
                  color: "var(--brand-primary)",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {datePreset || "Custom range"}
                <button
                  onClick={removeDateFilter}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    lineHeight: 1,
                    color: "var(--brand-primary)",
                    display: "flex",
                  }}
                >
                  <X size={10} />
                </button>
              </span>
            )}
            <div style={{flex: 1}} />
            {(search ||
              filters.status !== "all" ||
              filters.gender !== "all" ||
              dateRange.from ||
              dateRange.to) && (
              <button
                onClick={() => {
                  setSearch("");
                  setFilters({status: "all", gender: "all"});
                  setDateRange({from: null, to: null});
                  setDatePreset(null);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "3px 9px",
                  borderRadius: 6,
                  border: "1px solid var(--border-ui)",
                  background: "var(--surface-card)",
                  cursor: "pointer",
                  fontSize: 12,
                  color: "var(--text-muted)",
                }}
              >
                <RefreshCw size={12} /> Reset
              </button>
            )}
          </div>
        </div>

        {/* ── Content: Empty / List / Grid ── */}
        {filtered.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
              padding: "72px 0",
              background: "var(--surface-card)",
              borderRadius: 12,
              border: "1px solid var(--border-ui)",
              boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "#eff6ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Users size={32} color="var(--brand-primary)" />
            </div>
            <div style={{textAlign: "center"}}>
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "var(--foreground)",
                  margin: "0 0 4px",
                }}
              >
                No patients found
              </p>
              <p style={{fontSize: 13, color: "var(--text-muted)", margin: 0}}>
                Try adjusting your search or filter criteria
              </p>
            </div>
            <button
              onClick={() => {
                setSearch("");
                setFilters({status: "all", gender: "all"});
                setDateRange({from: null, to: null});
                setDatePreset(null);
              }}
              style={{
                padding: "8px 22px",
                borderRadius: 8,
                border: "1px solid var(--border-ui)",
                background: "var(--surface-card)",
                cursor: "pointer",
                fontSize: 13,
                color: "var(--foreground)",
                fontWeight: 600,
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : viewMode === "list" ? (
          /* ── List Table ── */
          <div
            style={{
              background: "var(--surface-card)",
              borderRadius: 12,
              border: "1px solid var(--border-ui)",
              overflow: "hidden",
              boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{overflowX: "auto"}}>
              <table style={{width: "100%", borderCollapse: "collapse"}}>
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px solid var(--border-ui)",
                      background: "var(--surface-page)",
                    }}
                  >
                    <th style={{padding: "10px 12px", width: 40}}>
                      <Checkbox
                        size="small"
                        checked={allSelected}
                        indeterminate={someSelected && !allSelected}
                        onChange={toggleAll}
                        sx={{
                          padding: 0,
                          color: "var(--text-placeholder)",
                          "&.Mui-checked": {color: "var(--brand-primary)"},
                          "&.MuiCheckbox-indeterminate": {
                            color: "var(--brand-primary)",
                          },
                        }}
                      />
                    </th>
                    {[
                      "Patient",
                      "Contact",
                      "Personal",
                      "Medical",
                      "Status",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "10px 14px",
                          textAlign: "left",
                          fontSize: 11,
                          fontWeight: 700,
                          color: "var(--text-placeholder)",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((p) => {
                    const cfg = STATUS_CONFIG[p.status];
                    const isNew = isNewPatient(p.createdAt);
                    const isChecked = selectedIds.has(p.id);
                    return (
                      <tr
                        key={p.id}
                        style={{
                          borderBottom: "1px solid var(--border-ui)",
                          background: isChecked
                            ? "rgba(30,86,208,0.05)"
                            : "transparent",
                          transition: "background 0.12s",
                          cursor: "default",
                        }}
                        onMouseEnter={(e) => {
                          if (!isChecked)
                            (e.currentTarget as HTMLElement).style.background =
                              "var(--surface-page)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.background =
                            isChecked ? "rgba(30,86,208,0.05)" : "transparent";
                        }}
                      >
                        {/* Checkbox */}
                        <td style={{padding: "12px 12px"}}>
                          <Checkbox
                            size="small"
                            checked={isChecked}
                            onChange={() => toggleOne(p.id)}
                            sx={{
                              padding: 0,
                              color: "var(--text-placeholder)",
                              "&.Mui-checked": {
                                color: "var(--brand-primary)",
                              },
                            }}
                          />
                        </td>
                        {/* Patient */}
                        <td style={{padding: "12px 14px"}}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <div
                              style={{
                                width: 38,
                                height: 38,
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                                fontWeight: 700,
                                fontSize: 13,
                                color: "#fff",
                                background: getAvatarColor(p.id),
                                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                              }}
                            >
                              {getInitials(p.firstName, p.lastName)}
                            </div>
                            <div>
                              <div
                                style={{
                                  fontSize: 14,
                                  fontWeight: 700,
                                  color: "var(--foreground)",
                                  letterSpacing: "-0.01em",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6,
                                }}
                              >
                                {getFullName(p)}
                                {isNew && (
                                  <span
                                    style={{
                                      fontSize: 9,
                                      fontWeight: 700,
                                      color: "#0891b2",
                                      background: "#ecfeff",
                                      border: "1px solid #a5f3fc",
                                      borderRadius: 4,
                                      padding: "1px 5px",
                                      textTransform: "uppercase",
                                      letterSpacing: "0.06em",
                                    }}
                                  >
                                    New
                                  </span>
                                )}
                              </div>
                              <div
                                className="text-text-placeholder"
                                style={{fontSize: 11}}
                              >
                                Registered {formatRelativeDate(p.createdAt)}
                              </div>
                            </div>
                          </div>
                        </td>
                        {/* Contact */}
                        <td style={{padding: "12px 14px"}}>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 3,
                            }}
                          >
                            {p.email && (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 5,
                                  fontSize: 12,
                                  color: "var(--text-muted)",
                                }}
                              >
                                <Mail size={11} />
                                <span
                                  style={{
                                    maxWidth: 160,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {p.email}
                                </span>
                              </div>
                            )}
                            {p.phone && (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 5,
                                  fontSize: 12,
                                  color: "var(--text-muted)",
                                }}
                              >
                                <Phone size={11} /> {p.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        {/* Personal */}
                        <td style={{padding: "12px 14px"}}>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: "var(--foreground)",
                            }}
                          >
                            {p.dateOfBirth
                              ? `${calculateAge(p.dateOfBirth)} yr`
                              : "—"}
                          </div>
                          <div
                            className="text-text-placeholder"
                            style={{fontSize: 12}}
                          >
                            {p.gender
                              ? p.gender.charAt(0) +
                                p.gender.slice(1).toLowerCase()
                              : "—"}
                          </div>
                        </td>
                        {/* Medical */}
                        <td style={{padding: "12px 14px"}}>
                          {p.allergies ? (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                padding: "3px 8px",
                                borderRadius: 6,
                                background: "#fff7ed",
                                color: "#c2410c",
                                fontSize: 11,
                                fontWeight: 600,
                              }}
                            >
                              <AlertCircle size={11} /> {p.allergies}
                            </span>
                          ) : (
                            <span
                              className="text-text-placeholder"
                              style={{fontSize: 12}}
                            >
                              No allergies
                            </span>
                          )}
                          {p.chronicConditions && (
                            <div
                              style={{
                                fontSize: 11,
                                color: "var(--text-muted)",
                                maxWidth: 130,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                marginTop: 2,
                              }}
                              title={p.chronicConditions}
                            >
                              {p.chronicConditions}
                            </div>
                          )}
                        </td>
                        {/* Status */}
                        <td style={{padding: "12px 14px"}}>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 4,
                              alignItems: "flex-start",
                            }}
                          >
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                                padding: "4px 10px",
                                borderRadius: 20,
                                background: cfg.bg,
                                color: cfg.color,
                                fontSize: 12,
                                fontWeight: 700,
                                letterSpacing: "0.01em",
                              }}
                            >
                              <span
                                style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: "50%",
                                  background: cfg.dot,
                                  flexShrink: 0,
                                }}
                              />
                              {cfg.label}
                            </span>
                          </div>
                        </td>
                        {/* Actions */}
                        <td style={{padding: "12px 14px"}}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <button
                              title="Call"
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                padding: 5,
                                borderRadius: 6,
                                color: "var(--text-muted)",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.background =
                                  "var(--surface-page)")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.background = "none")
                              }
                            >
                              <PhoneCall size={15} />
                            </button>
                            <button
                              title="Schedule"
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                padding: 5,
                                borderRadius: 6,
                                color: "var(--text-muted)",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.background =
                                  "var(--surface-page)")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.background = "none")
                              }
                            >
                              <CalendarDays size={15} />
                            </button>
                            <button
                              onClick={(e) => openMenu(e, p.id)}
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                padding: 5,
                                borderRadius: 6,
                                color: "var(--text-muted)",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.background =
                                  "var(--surface-page)")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.background = "none")
                              }
                            >
                              <MoreVertical size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <PaginationBar
              totalPages={totalPages}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          </div>
        ) : (
          /* ── Grid View ── */
          <div
            style={{
              background: "var(--surface-card)",
              borderRadius: 12,
              border: "1px solid var(--border-ui)",
              overflow: "hidden",
              boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: 16,
                padding: 20,
              }}
            >
              {paginated.map((p) => {
                const cfg = STATUS_CONFIG[p.status];
                const isNew = isNewPatient(p.createdAt);
                return (
                  <div
                    key={p.id}
                    style={{
                      background: "var(--surface-card)",
                      borderRadius: 12,
                      borderTop: "3px solid " + getAvatarColor(p.id),
                      borderRight: "1px solid var(--border-ui)",
                      borderBottom: "1px solid var(--border-ui)",
                      borderLeft: "1px solid var(--border-ui)",
                      padding: 16,
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                      position: "relative",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                      transition: "box-shadow 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow =
                        "0 8px 24px rgba(0,0,0,0.10)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow =
                        "0 1px 4px rgba(0,0,0,0.06)";
                    }}
                  >
                    {/* Menu btn */}
                    <div style={{position: "absolute", top: 10, right: 10}}>
                      <button
                        onClick={(e) => openMenu(e, p.id)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 4,
                          color: "var(--text-placeholder)",
                          borderRadius: 6,
                        }}
                      >
                        <MoreVertical size={15} />
                      </button>
                    </div>

                    {/* Avatar + Name + Status */}
                    <div
                      style={{display: "flex", alignItems: "center", gap: 12}}
                    >
                      <div
                        style={{
                          width: 46,
                          height: 46,
                          borderRadius: "50%",
                          background: getAvatarColor(p.id),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: 16,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
                          flexShrink: 0,
                        }}
                      >
                        {getInitials(p.firstName, p.lastName)}
                      </div>
                      <div style={{minWidth: 0}}>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: "var(--foreground)",
                            lineHeight: 1.2,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {getFullName(p)}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            marginTop: 4,
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              padding: "2px 7px",
                              borderRadius: 20,
                              background: cfg.bg,
                              color: cfg.color,
                              fontSize: 10,
                              fontWeight: 700,
                            }}
                          >
                            <span
                              style={{
                                width: 5,
                                height: 5,
                                borderRadius: "50%",
                                background: cfg.dot,
                                flexShrink: 0,
                              }}
                            />
                            {cfg.label}
                          </span>
                          {isNew && (
                            <span
                              style={{
                                fontSize: 9,
                                fontWeight: 700,
                                color: "#0891b2",
                                background: "#ecfeff",
                                border: "1px solid #a5f3fc",
                                borderRadius: 4,
                                padding: "2px 5px",
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                              }}
                            >
                              New
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Personal info row */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 11,
                        color: "var(--text-muted)",
                      }}
                    >
                      {p.dateOfBirth && (
                        <>
                          <span
                            style={{
                              fontWeight: 600,
                              color: "var(--foreground)",
                            }}
                          >
                            {calculateAge(p.dateOfBirth)} yr
                          </span>
                          <span
                            style={{
                              width: 3,
                              height: 3,
                              borderRadius: "50%",
                              background: "var(--border-ui)",
                              display: "inline-block",
                            }}
                          />
                        </>
                      )}
                      {p.gender && (
                        <span>
                          {p.gender.charAt(0) + p.gender.slice(1).toLowerCase()}
                        </span>
                      )}
                      {p.cnie && (
                        <>
                          <span
                            style={{
                              width: 3,
                              height: 3,
                              borderRadius: "50%",
                              background: "var(--border-ui)",
                              display: "inline-block",
                            }}
                          />
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              color: "var(--text-placeholder)",
                            }}
                          >
                            {p.cnie}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Contact */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                      }}
                    >
                      {p.email && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            fontSize: 12,
                            color: "var(--text-muted)",
                          }}
                        >
                          <Mail size={11} style={{flexShrink: 0}} />
                          <span
                            style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {p.email}
                          </span>
                        </div>
                      )}
                      {p.phone && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            fontSize: 12,
                            color: "var(--text-muted)",
                          }}
                        >
                          <Phone size={11} /> {p.phone}
                        </div>
                      )}
                    </div>

                    {/* Medical alert */}
                    {p.allergies && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          padding: "5px 8px",
                          borderRadius: 7,
                          background: "#fff7ed",
                          border: "1px solid #fed7aa",
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#c2410c",
                        }}
                      >
                        <AlertCircle size={11} style={{flexShrink: 0}} />
                        <span
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Allergy: {p.allergies}
                        </span>
                      </div>
                    )}

                    {/* Registered date */}
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--text-placeholder)",
                        paddingTop: 4,
                        borderTop: "1px solid var(--border-ui)",
                      }}
                    >
                      Registered {formatRelativeDate(p.createdAt)}
                    </div>

                    {/* Actions */}
                    <div style={{display: "flex", gap: 6}}>
                      <button
                        title="Call"
                        style={{
                          flex: 1,
                          padding: "7px 0",
                          borderRadius: 7,
                          border: "1px solid var(--border-ui)",
                          background: "var(--surface-card)",
                          cursor: "pointer",
                          color: "var(--text-muted)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <PhoneCall size={13} />
                      </button>
                      <button
                        title="Schedule"
                        style={{
                          flex: 1,
                          padding: "7px 0",
                          borderRadius: 7,
                          border: "1px solid var(--border-ui)",
                          background: "var(--surface-card)",
                          cursor: "pointer",
                          color: "var(--text-muted)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <CalendarDays size={13} />
                      </button>
                      <button
                        onClick={() => openEdit(p)}
                        style={{
                          flex: 2,
                          padding: "7px 10px",
                          borderRadius: 7,
                          border: "none",
                          background: "var(--brand-primary)",
                          color: "#fff",
                          cursor: "pointer",
                          fontSize: 12,
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 4,
                        }}
                      >
                        <Edit2 size={12} /> Edit
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <PaginationBar
              totalPages={totalPages}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* ── Sort Menu ── */}
      <Menu
        anchorEl={sortMenuAnchor}
        open={Boolean(sortMenuAnchor)}
        onClose={() => setSortMenuAnchor(null)}
        slotProps={{
          paper: {
            sx: {
              borderRadius: "10px",
              border: "1px solid var(--border-ui)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
              minWidth: 160,
            },
          },
        }}
      >
        {SORT_OPTIONS.map((o) => (
          <MenuItem
            key={o.value}
            onClick={() => {
              setSort(o.value);
              setSortMenuAnchor(null);
            }}
            sx={{
              fontSize: "0.875rem",
              fontWeight: sort === o.value ? 700 : 400,
              color:
                sort === o.value ? "var(--brand-primary)" : "var(--foreground)",
            }}
          >
            {o.label}
          </MenuItem>
        ))}
      </Menu>

      {/* ── Row Action Menu ── */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
        slotProps={{
          paper: {
            sx: {
              borderRadius: "10px",
              border: "1px solid var(--border-ui)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
              minWidth: 140,
            },
          },
        }}
      >
        <MenuItem
          onClick={() => {
            const p = patients.find((x) => x.id === menuTarget);
            if (p) openEdit(p);
          }}
          sx={{fontSize: "0.875rem", gap: 1}}
        >
          <Edit2 size={15} /> Edit
        </MenuItem>
        <MenuItem
          onClick={() => menuTarget && handleDelete(menuTarget)}
          sx={{fontSize: "0.875rem", gap: 1, color: "#e53e3e"}}
        >
          <Trash2 size={15} /> Delete
        </MenuItem>
      </Menu>

      {/* ── Date Range Modal ── */}
      <DateRangeModal
        open={dateModalOpen}
        dateRange={dateRange}
        onApply={(r, preset) => {
          setDateRange(r);
          setDatePreset(preset || null);
        }}
        onClose={() => setDateModalOpen(false)}
      />

      {/* ── Filter Drawer ── */}
      <FilterDrawer
        open={filterDrawerOpen}
        filters={filters}
        onApply={setFilters}
        onClose={() => setFilterDrawerOpen(false)}
      />

      {/* ── Patient Form Drawer (Add / Edit) ── */}
      <PatientFormDrawer
        open={formDrawerOpen}
        form={form}
        formError={formError}
        isEdit={!!form.id}
        onClose={() => setFormDrawerOpen(false)}
        onSave={handleSave}
        onDelete={() => form.id && handleDelete(form.id)}
        onChange={setForm}
      />

      {/* ── Delete Confirmation ── */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: "16px",
              border: "1px solid var(--border-ui)",
              backgroundColor: "var(--surface-card)",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: "20px 24px",
            borderBottom: "1px solid var(--border-ui)",
          }}
        >
          <Typography
            variant="h6"
            sx={{fontWeight: 700, color: "var(--foreground)"}}
          >
            Delete Patient
          </Typography>
          <IconButton size="small" onClick={() => setDeleteConfirmOpen(false)}>
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{p: "24px"}}>
          <Typography
            sx={{
              color: "var(--foreground)",
              fontSize: "0.9375rem",
              lineHeight: 1.6,
            }}
          >
            Are you sure you want to delete{" "}
            <strong className="text-primary">
              {(() => {
                const p = patients.find((x) => x.id === deleteTargetId);
                return p ? getFullName(p) : "this patient";
              })()}
            </strong>
            ? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions
          sx={{
            p: "16px 24px",
            borderTop: "1px solid var(--border-ui)",
            gap: 2,
          }}
        >
          <Button
            variant="outlined"
            onClick={() => setDeleteConfirmOpen(false)}
            sx={{textTransform: "none", fontWeight: 600, flex: 1}}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmDelete}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              flex: 1,
              background: "#dc2626",
              "&:hover": {background: "#b91c1c"},
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
