export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.charAt(0)?.toUpperCase() ?? "";
  const last =
    parts.length > 1 ? parts[parts.length - 1].charAt(0).toUpperCase() : "";
  return `${first}${last}`;
}

export function formatClockTime(date?: Date, locale = "en-US"): string {
  if (!date) return "-";
  return date.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

interface ElapsedLabels {
  minutes: (count: number) => string;
  hoursMinutes: (hours: number, minutes: number) => string;
}

export function formatElapsed(
  start: Date,
  end = new Date(),
  labels?: ElapsedLabels,
): string {
  const diffMinutes = Math.max(
    0,
    Math.floor((end.getTime() - start.getTime()) / 60_000),
  );
  if (diffMinutes < 60) return labels?.minutes(diffMinutes) ?? `${diffMinutes} min`;
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  return labels?.hoursMinutes(hours, minutes) ?? `${hours}h ${minutes}m`;
}

interface LastUpdatedLabels {
  notSynced: string;
  justNow: string;
  secondsAgo: (count: number) => string;
  minutesAgo: (count: number) => string;
}

export function formatLastUpdated(
  date: Date | null,
  now = new Date(),
  labels?: LastUpdatedLabels,
): string {
  if (!date) return labels?.notSynced ?? "Not synced yet";
  const seconds = Math.max(
    0,
    Math.floor((now.getTime() - date.getTime()) / 1000),
  );
  if (seconds < 10) return labels?.justNow ?? "Updated just now";
  if (seconds < 60) return labels?.secondsAgo(seconds) ?? `Updated ${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  return labels?.minutesAgo(minutes) ?? `Updated ${minutes}m ago`;
}
