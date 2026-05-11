import {Radio} from "lucide-react";
import {formatLastUpdated} from "../utils";

interface LivePulseProps {
  lastUpdatedAt: Date | null;
  now: Date;
}

export function LivePulse({lastUpdatedAt, now}: LivePulseProps) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold"
      style={{
        borderColor: "var(--border-ui)",
        backgroundColor: "var(--card-bg)",
        color: "var(--foreground)",
      }}
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
      </span>
      <Radio size={15} className="text-emerald-500" />
      <span>Live</span>
      <span
        className="hidden sm:inline text-xs font-medium"
        style={{color: "var(--text-muted)"}}
      >
        {formatLastUpdated(lastUpdatedAt, now)}
      </span>
    </div>
  );
}
