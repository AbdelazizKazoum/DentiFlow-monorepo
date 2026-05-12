import {CheckCircle2, Timer} from "lucide-react";
import {LivePulse} from "./LivePulse";

interface QueueHeaderProps {
  activeCount: number;
  completedCount: number;
  lastUpdatedAt: Date | null;
  now: Date;
}

export function QueueHeader({
  activeCount,
  completedCount,
  lastUpdatedAt,
  now,
}: QueueHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">
          Waiting Room
        </h1>
        <p className="text-sm" style={{color: "var(--text-muted)"}}>
          Manage real-time patient queue and status tracking
        </p>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
        <LivePulse lastUpdatedAt={lastUpdatedAt} now={now} />
        <div
          className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg border text-sm font-semibold shadow-sm"
          style={{
            borderColor: "var(--border-ui)",
            backgroundColor: "var(--card-bg)",
            color: "var(--foreground)",
          }}
        >
          <Timer size={16} style={{color: "var(--brand-primary)"}} />
          <span>{activeCount} in queue</span>
        </div>
        <div
          className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg border text-sm font-semibold shadow-sm"
          style={{
            borderColor: "var(--border-ui)",
            backgroundColor: "var(--card-bg)",
            color: "var(--foreground)",
          }}
        >
          <CheckCircle2 size={16} className="text-green-600" />
          <span>{completedCount} completed</span>
        </div>
      </div>
    </div>
  );
}
