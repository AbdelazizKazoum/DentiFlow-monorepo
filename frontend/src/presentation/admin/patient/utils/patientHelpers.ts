import { AVATAR_COLORS } from "../patientConfig";
import type { DateRange } from "../types";

export function getFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

export function isNewPatient(createdAt: Date): boolean {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return new Date(createdAt) >= thirtyDaysAgo;
}

export function calculateAge(dob?: Date): string | number {
  if (!dob) return "—";
  const today = new Date();
  const bd = new Date(dob);
  let age = today.getFullYear() - bd.getFullYear();
  const m = today.getMonth() - bd.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age--;
  return age;
}

export function getInitials(firstName: string, lastName: string): string {
  return (
    (firstName.charAt(0) || "").toUpperCase() +
    (lastName.charAt(0) || "").toUpperCase()
  );
}

export function formatRelativeDate(date: Date): string {
  const d = new Date(date);
  const today = new Date();
  d.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diff = Math.round(
    (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getAvatarColor(id: string): string {
  const n = parseInt(id, 10) || id.charCodeAt(0);
  return AVATAR_COLORS[n % AVATAR_COLORS.length];
}

export function getActiveFilterCount(
  filters: { status: string; gender: string },
  dateRange: DateRange,
): number {
  let n = 0;
  if (filters.status !== "all") n++;
  if (filters.gender !== "all") n++;
  if (dateRange.from || dateRange.to) n++;
  return n;
}

export function formatDateDisplay(d: Date | null): string {
  if (!d) return "DD/MM/YY";
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getFullYear()).slice(-2)}`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function startOfWeek(d: Date): Date {
  const r = new Date(d);
  r.setDate(d.getDate() - d.getDay());
  return r;
}

export function endOfWeek(d: Date): Date {
  const r = new Date(d);
  r.setDate(d.getDate() + (6 - d.getDay()));
  return r;
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

export function buildPresets(): { label: string; range: DateRange }[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const lastYear = new Date(today);
  lastYear.setFullYear(today.getFullYear() - 1);
  return [
    { label: "Today", range: { from: today, to: today } },
    { label: "Yesterday", range: { from: yesterday, to: yesterday } },
    {
      label: "This week",
      range: { from: startOfWeek(today), to: endOfWeek(today) },
    },
    {
      label: "Last week",
      range: { from: startOfWeek(yesterday), to: endOfWeek(yesterday) },
    },
    {
      label: "This month",
      range: { from: startOfMonth(today), to: endOfMonth(today) },
    },
    {
      label: "Last month",
      range: { from: startOfMonth(yesterday), to: endOfMonth(yesterday) },
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
    { label: "All time", range: { from: null, to: null } },
  ];
}
