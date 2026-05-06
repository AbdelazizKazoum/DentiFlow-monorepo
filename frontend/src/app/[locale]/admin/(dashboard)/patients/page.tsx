"use client";

import React, {useState, useCallback, useMemo} from "react";
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

// ─── Types ────────────────────────────────────────────────────────────────────

type PatientStatus = "active" | "inactive" | "new";
type BloodType = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
type SortOption = "lastAdded" | "name" | "lastVisit" | "status";

interface DateRange {
  from: Date | null;
  to: Date | null;
}
interface FilterState {
  status: PatientStatus | "all";
  bloodType: BloodType | "all";
}

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  bloodType: BloodType;
  allergies: string;
  medicalConditions: string;
  emergencyContact: string;
  emergencyPhone: string;
  lastVisit: string;
  nextAppointment: string;
  status: PatientStatus;
  avatar: string;
  registrationDate: string;
  balance: number;
}
interface FormState {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  bloodType: BloodType;
  allergies: string;
  medicalConditions: string;
  emergencyContact: string;
  emergencyPhone: string;
  lastVisit: string;
  nextAppointment: string;
  status: PatientStatus;
  balance: number;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  PatientStatus,
  {label: string; color: string; bg: string; dot: string}
> = {
  active: {label: "Active", color: "#279C41", bg: "#E8F8EC", dot: "#279C41"},
  new: {
    label: "New Patient",
    color: "var(--brand-primary)",
    bg: "#e8f0fe",
    dot: "#1e56d0",
  },
  inactive: {
    label: "Inactive",
    color: "#64748b",
    bg: "#f1f5f9",
    dot: "#94a3b8",
  },
};
const BLOOD_TYPES: BloodType[] = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
];
const SORT_OPTIONS: {value: SortOption; label: string}[] = [
  {value: "lastAdded", label: "Last Added"},
  {value: "name", label: "Name (A\u2013Z)"},
  {value: "lastVisit", label: "Last Visit"},
  {value: "status", label: "Status"},
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

const INITIAL_PATIENTS: Patient[] = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice.j@example.com",
    phone: "555-0101",
    dateOfBirth: "1985-06-15",
    bloodType: "O+",
    allergies: "Penicillin",
    medicalConditions: "Hypertension",
    emergencyContact: "Bob Johnson",
    emergencyPhone: "555-0102",
    lastVisit: "2026-04-15",
    nextAppointment: "2026-05-10",
    status: "active",
    avatar: "",
    registrationDate: "2026-04-15",
    balance: 120.5,
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "m.chen@example.com",
    phone: "555-0203",
    dateOfBirth: "1992-11-22",
    bloodType: "A+",
    allergies: "None",
    medicalConditions: "None",
    emergencyContact: "Lisa Chen",
    emergencyPhone: "555-0204",
    lastVisit: "2026-04-25",
    nextAppointment: "",
    status: "active",
    avatar: "",
    registrationDate: "2026-04-25",
    balance: 0,
  },
  {
    id: "3",
    name: "Sarah Williams",
    email: "sarah.w@example.com",
    phone: "555-0305",
    dateOfBirth: "1978-03-08",
    bloodType: "B-",
    allergies: "Latex",
    medicalConditions: "Diabetes Type 2",
    emergencyContact: "John Williams",
    emergencyPhone: "555-0306",
    lastVisit: "2025-12-20",
    nextAppointment: "",
    status: "inactive",
    avatar: "",
    registrationDate: "2025-12-20",
    balance: 45.75,
  },
  {
    id: "4",
    name: "David Martinez",
    email: "d.martinez@example.com",
    phone: "555-0407",
    dateOfBirth: "2000-09-30",
    bloodType: "AB+",
    allergies: "None",
    medicalConditions: "None",
    emergencyContact: "Maria Martinez",
    emergencyPhone: "555-0408",
    lastVisit: "",
    nextAppointment: "2026-05-05",
    status: "new",
    avatar: "",
    registrationDate: "2026-04-28",
    balance: 0,
  },
  {
    id: "5",
    name: "Emma Thompson",
    email: "emma.t@example.com",
    phone: "555-0509",
    dateOfBirth: "1995-12-12",
    bloodType: "O-",
    allergies: "Aspirin",
    medicalConditions: "Asthma",
    emergencyContact: "James Thompson",
    emergencyPhone: "555-0510",
    lastVisit: "2026-04-20",
    nextAppointment: "2026-06-01",
    status: "active",
    avatar: "",
    registrationDate: "2026-04-20",
    balance: 300.0,
  },
  {
    id: "6",
    name: "Omar Al-Rashid",
    email: "omar.r@example.com",
    phone: "555-0611",
    dateOfBirth: "1988-07-03",
    bloodType: "B+",
    allergies: "None",
    medicalConditions: "None",
    emergencyContact: "Fatima Al-Rashid",
    emergencyPhone: "555-0612",
    lastVisit: "2026-05-01",
    nextAppointment: "2026-06-15",
    status: "active",
    avatar: "",
    registrationDate: "2026-05-01",
    balance: 75.0,
  },
  {
    id: "7",
    name: "Priya Sharma",
    email: "priya.s@example.com",
    phone: "555-0713",
    dateOfBirth: "1997-02-18",
    bloodType: "A-",
    allergies: "Sulfa drugs",
    medicalConditions: "Anxiety",
    emergencyContact: "Raj Sharma",
    emergencyPhone: "555-0714",
    lastVisit: "2026-04-10",
    nextAppointment: "2026-05-20",
    status: "new",
    avatar: "",
    registrationDate: "2026-04-10",
    balance: 0,
  },
  {
    id: "8",
    name: "James Carter",
    email: "j.carter@example.com",
    phone: "555-0815",
    dateOfBirth: "1983-04-22",
    bloodType: "A+",
    allergies: "None",
    medicalConditions: "None",
    emergencyContact: "Linda Carter",
    emergencyPhone: "555-0816",
    lastVisit: "2026-03-12",
    nextAppointment: "2026-06-20",
    status: "active",
    avatar: "",
    registrationDate: "2026-03-12",
    balance: 55.0,
  },
  {
    id: "9",
    name: "Aisha Patel",
    email: "aisha.p@example.com",
    phone: "555-0917",
    dateOfBirth: "2001-08-14",
    bloodType: "B+",
    allergies: "Penicillin",
    medicalConditions: "None",
    emergencyContact: "Ravi Patel",
    emergencyPhone: "555-0918",
    lastVisit: "2026-04-05",
    nextAppointment: "2026-05-25",
    status: "new",
    avatar: "",
    registrationDate: "2026-04-05",
    balance: 0,
  },
  {
    id: "10",
    name: "Lucas Fernandez",
    email: "l.fernandez@example.com",
    phone: "555-1019",
    dateOfBirth: "1990-12-03",
    bloodType: "O+",
    allergies: "None",
    medicalConditions: "High cholesterol",
    emergencyContact: "Ana Fernandez",
    emergencyPhone: "555-1020",
    lastVisit: "2026-02-28",
    nextAppointment: "",
    status: "inactive",
    avatar: "",
    registrationDate: "2026-02-28",
    balance: 210.0,
  },
  {
    id: "11",
    name: "Yuki Tanaka",
    email: "yuki.t@example.com",
    phone: "555-1121",
    dateOfBirth: "1996-06-18",
    bloodType: "AB-",
    allergies: "None",
    medicalConditions: "None",
    emergencyContact: "Hiro Tanaka",
    emergencyPhone: "555-1122",
    lastVisit: "2026-05-02",
    nextAppointment: "2026-06-10",
    status: "active",
    avatar: "",
    registrationDate: "2026-05-02",
    balance: 0,
  },
  {
    id: "12",
    name: "Fatima Nour",
    email: "fatima.n@example.com",
    phone: "555-1223",
    dateOfBirth: "1987-09-29",
    bloodType: "A-",
    allergies: "Ibuprofen",
    medicalConditions: "Migraine",
    emergencyContact: "Hassan Nour",
    emergencyPhone: "555-1224",
    lastVisit: "2026-04-18",
    nextAppointment: "2026-07-01",
    status: "active",
    avatar: "",
    registrationDate: "2026-04-18",
    balance: 90.25,
  },
  {
    id: "13",
    name: "Ethan Brooks",
    email: "e.brooks@example.com",
    phone: "555-1325",
    dateOfBirth: "1994-01-07",
    bloodType: "O-",
    allergies: "None",
    medicalConditions: "None",
    emergencyContact: "Carol Brooks",
    emergencyPhone: "555-1326",
    lastVisit: "",
    nextAppointment: "2026-05-15",
    status: "new",
    avatar: "",
    registrationDate: "2026-04-30",
    balance: 0,
  },
  {
    id: "14",
    name: "Nina Kowalski",
    email: "nina.k@example.com",
    phone: "555-1427",
    dateOfBirth: "1980-11-25",
    bloodType: "B-",
    allergies: "Sulfa drugs",
    medicalConditions: "Arthritis",
    emergencyContact: "Piotr Kowalski",
    emergencyPhone: "555-1428",
    lastVisit: "2026-01-15",
    nextAppointment: "",
    status: "inactive",
    avatar: "",
    registrationDate: "2026-01-15",
    balance: 175.5,
  },
  {
    id: "15",
    name: "Carlos Mendez",
    email: "c.mendez@example.com",
    phone: "555-1529",
    dateOfBirth: "1975-05-11",
    bloodType: "AB+",
    allergies: "None",
    medicalConditions: "Type 1 Diabetes",
    emergencyContact: "Rosa Mendez",
    emergencyPhone: "555-1530",
    lastVisit: "2026-04-22",
    nextAppointment: "2026-05-30",
    status: "active",
    avatar: "",
    registrationDate: "2026-04-22",
    balance: 0,
  },
  {
    id: "16",
    name: "Sophie Laurent",
    email: "sophie.l@example.com",
    phone: "555-1631",
    dateOfBirth: "1999-03-16",
    bloodType: "A+",
    allergies: "Latex",
    medicalConditions: "None",
    emergencyContact: "Marc Laurent",
    emergencyPhone: "555-1632",
    lastVisit: "2026-04-29",
    nextAppointment: "2026-06-05",
    status: "active",
    avatar: "",
    registrationDate: "2026-04-29",
    balance: 40.0,
  },
  {
    id: "17",
    name: "Amir Hassan",
    email: "amir.h@example.com",
    phone: "555-1733",
    dateOfBirth: "1986-10-08",
    bloodType: "O+",
    allergies: "None",
    medicalConditions: "Hypertension",
    emergencyContact: "Layla Hassan",
    emergencyPhone: "555-1734",
    lastVisit: "2026-03-25",
    nextAppointment: "2026-05-18",
    status: "active",
    avatar: "",
    registrationDate: "2026-03-25",
    balance: 130.0,
  },
  {
    id: "18",
    name: "Mia Johansson",
    email: "mia.j@example.com",
    phone: "555-1835",
    dateOfBirth: "2003-07-20",
    bloodType: "B+",
    allergies: "Aspirin",
    medicalConditions: "None",
    emergencyContact: "Erik Johansson",
    emergencyPhone: "555-1836",
    lastVisit: "2026-04-12",
    nextAppointment: "2026-06-22",
    status: "new",
    avatar: "",
    registrationDate: "2026-04-12",
    balance: 0,
  },
];
const EMPTY_FORM: FormState = {
  id: "",
  name: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  bloodType: "O+",
  allergies: "",
  medicalConditions: "",
  emergencyContact: "",
  emergencyPhone: "",
  lastVisit: "",
  nextAppointment: "",
  status: "new",
  balance: 0,
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
              <option value="active">Active</option>
              <option value="new">New Patient</option>
              <option value="inactive">Inactive</option>
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
          <label style={labelSty}>Blood Type</label>
          <div style={{position: "relative"}}>
            <select
              value={local.bloodType}
              onChange={sel("bloodType")}
              style={selSty}
            >
              <option value="all">All Blood Types</option>
              {BLOOD_TYPES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
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
          <label style={labelSty}>Balance</label>
          <div style={{position: "relative"}}>
            <select style={selSty} defaultValue="all">
              <option value="all">Any</option>
              <option value="owed">Has balance owed</option>
              <option value="clear">No balance</option>
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
            setLocal({status: "all", bloodType: "all"});
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

function calculateAge(dob: string): string | number {
  if (!dob) return "—";
  const today = new Date();
  const bd = new Date(dob);
  let age = today.getFullYear() - bd.getFullYear();
  const m = today.getMonth() - bd.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age--;
  return age;
}
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return (
    (parts[0]?.charAt(0) || "").toUpperCase() +
    (parts.length > 1 ? parts[parts.length - 1].charAt(0).toUpperCase() : "")
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
  if (filters.bloodType !== "all") n++;
  if (dateRange.from || dateRange.to) n++;
  return n;
}
// ─── Main Component ───────────────────────────────────────────────────────────

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    status: "all",
    bloodType: "all",
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

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuTarget, setMenuTarget] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const activeFilterCount = getActiveFilterCount(filters, dateRange);

  // Reset to page 1 whenever filters/search/sort change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, filters, dateRange, sort]);

  const filtered = useMemo(() => {
    let list = patients.filter((p) => {
      if (
        search &&
        !p.name.toLowerCase().includes(search.toLowerCase()) &&
        !p.email.toLowerCase().includes(search.toLowerCase()) &&
        !p.phone.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      if (filters.status !== "all" && p.status !== filters.status) return false;
      if (filters.bloodType !== "all" && p.bloodType !== filters.bloodType)
        return false;
      if (dateRange.from && p.registrationDate) {
        const d = new Date(p.registrationDate);
        d.setHours(0, 0, 0, 0);
        if (d < dateRange.from) return false;
      }
      if (dateRange.to && p.registrationDate) {
        const d = new Date(p.registrationDate);
        d.setHours(0, 0, 0, 0);
        if (d > dateRange.to) return false;
      }
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "lastVisit")
        return (b.lastVisit || "").localeCompare(a.lastVisit || "");
      if (sort === "status") return a.status.localeCompare(b.status);
      return b.registrationDate.localeCompare(a.registrationDate);
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
      if (s.has(id)) {
        s.delete(id);
      } else {
        s.add(id);
      }
      return s;
    });
  };

  const handleExport = () => {
    const rows = filtered.map((p) =>
      [p.name, p.email, p.phone, p.status, p.bloodType, p.lastVisit || ""].join(
        ",",
      ),
    );
    const csv = ["Name,Email,Phone,Status,Blood Type,Last Visit", ...rows].join(
      "\n",
    );
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = "patients.csv";
    a.click();
  };

  const openNew = useCallback(() => {
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  }, []);
  const openEdit = useCallback((p: Patient) => {
    setForm({
      id: p.id,
      name: p.name,
      email: p.email,
      phone: p.phone,
      dateOfBirth: p.dateOfBirth,
      bloodType: p.bloodType,
      allergies: p.allergies,
      medicalConditions: p.medicalConditions,
      emergencyContact: p.emergencyContact,
      emergencyPhone: p.emergencyPhone,
      lastVisit: p.lastVisit,
      nextAppointment: p.nextAppointment,
      status: p.status,
      balance: p.balance ?? 0,
    });
    setFormError("");
    setModalOpen(true);
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
      setModalOpen(false);
    }
  }, [deleteTargetId]);
  const bulkDelete = () => {
    setPatients((prev) => prev.filter((p) => !selectedIds.has(p.id)));
    setSelectedIds(new Set());
  };
  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) {
      setFormError("Name and email are required.");
      return;
    }
    if (patients.some((p) => p.email === form.email && p.id !== form.id)) {
      setFormError("Email already exists.");
      return;
    }
    const updated: Patient = {
      id: form.id || String(Date.now()),
      name: form.name,
      email: form.email,
      phone: form.phone,
      dateOfBirth: form.dateOfBirth,
      bloodType: form.bloodType,
      allergies: form.allergies,
      medicalConditions: form.medicalConditions,
      emergencyContact: form.emergencyContact,
      emergencyPhone: form.emergencyPhone,
      lastVisit: form.lastVisit,
      nextAppointment: form.nextAppointment,
      status: form.status,
      balance: form.balance || 0,
      avatar: "",
      registrationDate:
        patients.find((p) => p.id === form.id)?.registrationDate ||
        new Date().toISOString().split("T")[0],
    };
    setPatients((prev) =>
      form.id
        ? prev.map((p) => (p.id === form.id ? updated : p))
        : [...prev, updated],
    );
    setModalOpen(false);
  };

  const removeDateFilter = () => {
    setDateRange({from: null, to: null});
    setDatePreset(null);
  };
  const removeStatusFilter = () => setFilters((f) => ({...f, status: "all"}));
  const removeBloodFilter = () => setFilters((f) => ({...f, bloodType: "all"}));

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
              value: patients.filter((p) => p.status === "active").length,
              Icon: Activity,
              color: "#279C41",
              bg: "#E8F8EC",
            },
            {
              label: "New Patients",
              value: patients.filter((p) => p.status === "new").length,
              Icon: UserPlus,
              color: "#7c3aed",
              bg: "#f5f3ff",
            },
            {
              label: "Inactive",
              value: patients.filter((p) => p.status === "inactive").length,
              Icon: Heart,
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
                transition: "transform 0.15s,box-shadow 0.15s",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(-2px)";
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 8px 22px rgba(0,0,0,0.10)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "none";
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 1px 3px rgba(0,0,0,0.05)";
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
                placeholder="Search patients..."
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
            {/* spacer pushes actions right */}
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
            {/* Divider */}
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
            {/* Divider */}
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
                transition: "background 0.15s,box-shadow 0.15s,transform 0.1s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--brand-primary-dark)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(30,86,208,0.35)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--brand-primary)";
                e.currentTarget.style.boxShadow =
                  "0 2px 6px rgba(30,86,208,0.25)";
                e.currentTarget.style.transform = "translateY(0)";
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
            {filters.bloodType !== "all" && (
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
                {filters.bloodType}
                <button
                  onClick={removeBloodFilter}
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
              filters.bloodType !== "all" ||
              dateRange.from ||
              dateRange.to) && (
              <button
                onClick={() => {
                  setSearch("");
                  setFilters({status: "all", bloodType: "all"});
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
                setFilters({status: "all", bloodType: "all"});
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
                      "Age / Blood",
                      "Medical Info",
                      "Last Visit",
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
                    const hasAllergy = p.allergies && p.allergies !== "None";
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
                          maxWidth: "95%", // Adjusted to ensure rows do not take full width
                          margin: "0 auto", // Center align rows
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
                              "&.Mui-checked": {color: "var(--brand-primary)"},
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
                                width: 40,
                                height: 40,
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                                fontWeight: 700,
                                fontSize: 14,
                                color: "#fff",
                                background: getAvatarColor(p.id),
                                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                              }}
                            >
                              {getInitials(p.name)}
                            </div>
                            <div>
                              <div
                                style={{
                                  fontSize: 14,
                                  fontWeight: 700,
                                  color: "var(--foreground)",
                                  letterSpacing: "-0.01em",
                                }}
                              >
                                {p.name}
                              </div>
                              <div
                                className="text-text-placeholder"
                                style={{fontSize: 12}}
                              >
                                {formatRelativeDate(p.registrationDate)}
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
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 5,
                                fontSize: 12,
                                color: "var(--text-muted)",
                              }}
                            >
                              <Mail size={11} />{" "}
                              <span
                                style={{
                                  maxWidth: 170,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {p.email}
                              </span>
                            </div>
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
                        {/* Age / Blood */}
                        <td style={{padding: "12px 14px"}}>
                          <div
                            style={{
                              fontSize: 14,
                              fontWeight: 600,
                              color: "var(--foreground)",
                            }}
                          >
                            {calculateAge(p.dateOfBirth)} yr
                          </div>
                          <div
                            className="text-text-placeholder"
                            style={{fontSize: 12}}
                          >
                            {p.bloodType}
                          </div>
                        </td>
                        {/* Medical Info */}
                        <td style={{padding: "12px 14px"}}>
                          {hasAllergy ? (
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
                              None
                            </span>
                          )}
                          {p.medicalConditions &&
                            p.medicalConditions !== "None" && (
                              <div
                                style={{
                                  fontSize: 12,
                                  color: "var(--text-muted)",
                                  maxWidth: 140,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  marginTop: 2,
                                }}
                                title={p.medicalConditions}
                              >
                                {p.medicalConditions}
                              </div>
                            )}
                        </td>
                        {/* Last Visit */}
                        <td style={{padding: "12px 14px"}}>
                          {p.lastVisit ? (
                            <>
                              <div
                                className="text-foreground"
                                style={{fontSize: 13}}
                              >
                                {new Date(p.lastVisit).toLocaleDateString(
                                  "en-US",
                                  {month: "short", day: "numeric"},
                                )}
                              </div>
                              <div
                                className="text-text-placeholder"
                                style={{fontSize: 11}}
                              >
                                {new Date(p.lastVisit).getFullYear()}
                              </div>
                            </>
                          ) : (
                            <span
                              className="text-text-placeholder"
                              style={{fontSize: 12}}
                            >
                              —
                            </span>
                          )}
                        </td>
                        {/* Status */}
                        <td style={{padding: "12px 14px"}}>
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

            {/* ── Pagination ── */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                padding: "14px 20px",
                borderTop: "1px solid var(--border-ui)",
                maxWidth: "95%", // Adjusted to match row width
                margin: "0 auto", // Center align pagination
              }}
            >
              {/* Prev */}
              <button
                onClick={() => setCurrentPage((pp) => Math.max(1, pp - 1))}
                disabled={currentPage === 1}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: "1px solid var(--border-ui)",
                  background: "var(--surface-card)",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  color:
                    currentPage === 1
                      ? "var(--text-placeholder)"
                      : "var(--foreground)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: currentPage === 1 ? 0.5 : 1,
                }}
              >
                <ChevronLeft size={15} strokeWidth={2} />
              </button>

              {/* Page Numbers */}
              {(() => {
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
                return pages.map((pg, idx) =>
                  pg === "..." ? (
                    <span
                      key={`el-${idx}`}
                      style={{
                        width: 32,
                        height: 32,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 13,
                        color: "var(--text-placeholder)",
                        letterSpacing: 1,
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
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        border: "none",
                        background:
                          pg === currentPage
                            ? "var(--brand-primary)"
                            : "transparent",
                        color:
                          pg === currentPage ? "#fff" : "var(--foreground)",
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
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = "var(--surface-page)";
                      }}
                      onMouseLeave={(e) => {
                        if (pg !== currentPage)
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = "transparent";
                      }}
                    >
                      {pg}
                    </button>
                  ),
                );
              })()}

              {/* Next */}
              <button
                onClick={() =>
                  setCurrentPage((pp) => Math.min(totalPages, pp + 1))
                }
                disabled={currentPage === totalPages}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: "1px solid var(--border-ui)",
                  background: "var(--surface-card)",
                  cursor:
                    currentPage === totalPages ? "not-allowed" : "pointer",
                  color:
                    currentPage === totalPages
                      ? "var(--text-placeholder)"
                      : "var(--foreground)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: currentPage === totalPages ? 0.5 : 1,
                }}
              >
                <ChevronRight size={15} strokeWidth={2} />
              </button>
            </div>
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
                gridTemplateColumns: "repeat(auto-fill,260px)",
                gap: 16,
                padding: 20,
                justifyContent: "start",
              }}
            >
              {paginated.map((p) => {
                const cfg = STATUS_CONFIG[p.status];
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
                      gap: 12,
                      position: "relative",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                      transition: "transform 0.15s,box-shadow 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.transform =
                        "translateY(-3px)";
                      (e.currentTarget as HTMLElement).style.boxShadow =
                        "0 10px 28px rgba(0,0,0,0.12)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = "none";
                      (e.currentTarget as HTMLElement).style.boxShadow =
                        "0 1px 4px rgba(0,0,0,0.06)";
                    }}
                  >
                    <div style={{position: "absolute", top: 12, right: 12}}>
                      <button
                        onClick={(e) => openMenu(e, p.id)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 4,
                          color: "var(--text-placeholder)",
                        }}
                      >
                        <MoreVertical size={16} />
                      </button>
                    </div>
                    <div
                      style={{display: "flex", alignItems: "center", gap: 12}}
                    >
                      <div
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: "50%",
                          background: getAvatarColor(p.id),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: 18,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
                          flexShrink: 0,
                        }}
                      >
                        {getInitials(p.name)}
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: 15,
                            fontWeight: 700,
                            color: "var(--foreground)",
                            lineHeight: 1.2,
                          }}
                        >
                          {p.name}
                        </div>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "2px 8px",
                            borderRadius: 20,
                            background: cfg.bg,
                            color: cfg.color,
                            fontSize: 11,
                            fontWeight: 600,
                            marginTop: 2,
                          }}
                        >
                          <span
                            style={{
                              width: 5,
                              height: 5,
                              borderRadius: "50%",
                              background: cfg.dot,
                            }}
                          />
                          {cfg.label}
                        </span>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginTop: 2,
                        marginBottom: 4,
                      }}
                    >
                      <span className="text-text-muted" style={{fontSize: 11}}>
                        Age{" "}
                        <strong className="text-text-muted font-semibold">
                          {calculateAge(p.dateOfBirth)}
                        </strong>
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
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "var(--brand-primary)",
                          background: "#eff6ff",
                          padding: "1px 7px",
                          borderRadius: 20,
                        }}
                      >
                        {p.bloodType}
                      </span>
                    </div>
                    <div
                      style={{display: "flex", flexDirection: "column", gap: 5}}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 12,
                          color: "var(--text-muted)",
                        }}
                      >
                        <Mail size={11} />{" "}
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
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 12,
                          color: "var(--text-muted)",
                        }}
                      >
                        <CalendarDays size={11} />{" "}
                        {p.lastVisit
                          ? new Date(p.lastVisit).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "No visits"}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        borderTop: "1px solid var(--border-ui)",
                        paddingTop: 10,
                      }}
                    >
                      <button
                        title="Call"
                        style={{
                          flex: 1,
                          padding: "6px 0",
                          borderRadius: 6,
                          border: "1px solid var(--border-ui)",
                          background: "var(--surface-card)",
                          cursor: "pointer",
                          color: "var(--text-muted)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <PhoneCall size={14} />
                      </button>
                      <button
                        title="Schedule"
                        style={{
                          flex: 1,
                          padding: "6px 0",
                          borderRadius: 6,
                          border: "1px solid var(--border-ui)",
                          background: "var(--surface-card)",
                          cursor: "pointer",
                          color: "var(--text-muted)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <CalendarDays size={14} />
                      </button>
                      <button
                        onClick={() => openEdit(p)}
                        style={{
                          flex: 2,
                          padding: "6px 10px",
                          borderRadius: 6,
                          border: "none",
                          background: "var(--brand-primary)",
                          color: "#fff",
                          cursor: "pointer",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Pagination ── */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                padding: "14px 20px",
                borderTop: "1px solid var(--border-ui)",
                maxWidth: "95%", // Adjusted to match row width
                margin: "0 auto", // Center align pagination
              }}
            >
              {/* Prev */}
              <button
                onClick={() => setCurrentPage((pp) => Math.max(1, pp - 1))}
                disabled={currentPage === 1}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: "1px solid var(--border-ui)",
                  background: "var(--surface-card)",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  color:
                    currentPage === 1
                      ? "var(--text-placeholder)"
                      : "var(--foreground)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: currentPage === 1 ? 0.5 : 1,
                }}
              >
                <ChevronLeft size={15} strokeWidth={2} />
              </button>

              {/* Page Numbers */}
              {(() => {
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
                return pages.map((pg, idx) =>
                  pg === "..." ? (
                    <span
                      key={`el-${idx}`}
                      style={{
                        width: 32,
                        height: 32,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 13,
                        color: "var(--text-placeholder)",
                        letterSpacing: 1,
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
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        border: "none",
                        background:
                          pg === currentPage
                            ? "var(--brand-primary)"
                            : "transparent",
                        color:
                          pg === currentPage ? "#fff" : "var(--foreground)",
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
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = "var(--surface-page)";
                      }}
                      onMouseLeave={(e) => {
                        if (pg !== currentPage)
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = "transparent";
                      }}
                    >
                      {pg}
                    </button>
                  ),
                );
              })()}

              {/* Next */}
              <button
                onClick={() =>
                  setCurrentPage((pp) => Math.min(totalPages, pp + 1))
                }
                disabled={currentPage === totalPages}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: "1px solid var(--border-ui)",
                  background: "var(--surface-card)",
                  cursor:
                    currentPage === totalPages ? "not-allowed" : "pointer",
                  color:
                    currentPage === totalPages
                      ? "var(--text-placeholder)"
                      : "var(--foreground)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: currentPage === totalPages ? 0.5 : 1,
                }}
              >
                <ChevronRight size={15} strokeWidth={2} />
              </button>
            </div>
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

      {/* ── Add / Edit Modal ── */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: "16px",
              boxShadow: "0 20px 40px -10px rgba(0,0,0,0.15)",
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
            {form.id ? "Edit Patient" : "Add New Patient"}
          </Typography>
          <IconButton
            size="small"
            onClick={() => setModalOpen(false)}
            sx={{color: "var(--text-muted)"}}
          >
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{p: "24px"}}>
          {formError && (
            <div
              style={{
                marginBottom: 16,
                padding: "10px 14px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 8,
                fontSize: 13,
                color: "#dc2626",
              }}
            >
              {formError}
            </div>
          )}
          <div style={{display: "flex", flexDirection: "column", gap: 4}}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--text-placeholder)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: 4,
              }}
            >
              Basic Information
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
                marginBottom: 8,
              }}
            >
              <TextField
                label="Full Name"
                fullWidth
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})}
                required
              />
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={form.email}
                onChange={(e) => setForm({...form, email: e.target.value})}
                required
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
                marginBottom: 8,
              }}
            >
              <TextField
                label="Phone"
                fullWidth
                value={form.phone}
                onChange={(e) => setForm({...form, phone: e.target.value})}
              />
              <TextField
                label="Date of Birth"
                type="date"
                fullWidth
                value={form.dateOfBirth}
                onChange={(e) =>
                  setForm({...form, dateOfBirth: e.target.value})
                }
                slotProps={{inputLabel: {shrink: true}}}
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
                marginBottom: 16,
              }}
            >
              <FormControl fullWidth>
                <InputLabel>Blood Type</InputLabel>
                <Select
                  label="Blood Type"
                  value={form.bloodType}
                  onChange={(e) =>
                    setForm({...form, bloodType: e.target.value as BloodType})
                  }
                >
                  {BLOOD_TYPES.map((b) => (
                    <MenuItem key={b} value={b}>
                      {b}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={form.status}
                  onChange={(e) =>
                    setForm({...form, status: e.target.value as PatientStatus})
                  }
                >
                  <MenuItem value="new">New Patient</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--text-placeholder)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: 4,
              }}
            >
              Medical Information
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
                marginBottom: 16,
              }}
            >
              <TextField
                label="Allergies"
                fullWidth
                value={form.allergies}
                onChange={(e) => setForm({...form, allergies: e.target.value})}
              />
              <TextField
                label="Medical Conditions"
                fullWidth
                value={form.medicalConditions}
                onChange={(e) =>
                  setForm({...form, medicalConditions: e.target.value})
                }
              />
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--text-placeholder)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: 4,
              }}
            >
              Emergency Contact
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
                marginBottom: 16,
              }}
            >
              <TextField
                label="Contact Name"
                fullWidth
                value={form.emergencyContact}
                onChange={(e) =>
                  setForm({...form, emergencyContact: e.target.value})
                }
              />
              <TextField
                label="Contact Phone"
                fullWidth
                value={form.emergencyPhone}
                onChange={(e) =>
                  setForm({...form, emergencyPhone: e.target.value})
                }
              />
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--text-placeholder)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: 4,
              }}
            >
              Appointments
            </div>
            <div
              style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16}}
            >
              <TextField
                label="Last Visit"
                type="date"
                fullWidth
                value={form.lastVisit}
                onChange={(e) => setForm({...form, lastVisit: e.target.value})}
                slotProps={{inputLabel: {shrink: true}}}
              />
              <TextField
                label="Next Appointment"
                type="date"
                fullWidth
                value={form.nextAppointment}
                onChange={(e) =>
                  setForm({...form, nextAppointment: e.target.value})
                }
                slotProps={{inputLabel: {shrink: true}}}
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions
          sx={{
            p: "16px 24px",
            borderTop: "1px solid var(--border-ui)",
            justifyContent: "space-between",
          }}
        >
          <div>
            {form.id && (
              <Button
                color="error"
                variant="text"
                onClick={() => handleDelete(form.id)}
                sx={{textTransform: "none", fontWeight: 600}}
              >
                Delete Patient
              </Button>
            )}
          </div>
          <div style={{display: "flex", gap: 8}}>
            <Button
              variant="outlined"
              onClick={() => setModalOpen(false)}
              sx={{textTransform: "none", fontWeight: 600}}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                background: "var(--brand-primary)",
                "&:hover": {background: "var(--brand-primary-dark)"},
              }}
            >
              {form.id ? "Save Changes" : "Add Patient"}
            </Button>
          </div>
        </DialogActions>
      </Dialog>

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
              {patients.find((p) => p.id === deleteTargetId)?.name}
            </strong>
            ? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions
          sx={{p: "16px 24px", borderTop: "1px solid var(--border-ui)", gap: 2}}
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
