import {CheckCircle2, Timer} from "lucide-react";
import {useTranslations} from "next-intl";
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
  const t = useTranslations("admin.waitingRoom");

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">
          {t("header.title")}
        </h1>
        <p className="text-sm" style={{color: "var(--text-muted)"}}>
          {t("header.subtitle")}
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
          <span>{t("header.inQueue", {count: activeCount})}</span>
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
          <span>{t("header.completed", {count: completedCount})}</span>
        </div>
      </div>
    </div>
  );
}
