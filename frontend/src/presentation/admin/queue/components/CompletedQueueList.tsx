import type React from "react";
import {CheckCircle2, MoreVertical} from "lucide-react";
import type {QueueEntry} from "@/domain/queue/entities/queueEntry";
import {StatusChip} from "./StatusChip";
import {formatClockTime, getInitials} from "../utils";

interface CompletedQueueListProps {
  entries: QueueEntry[];
  onOpenMenu: (event: React.MouseEvent<HTMLElement>, entry: QueueEntry) => void;
}

export function CompletedQueueList({
  entries,
  onOpenMenu,
}: CompletedQueueListProps) {
  if (entries.length === 0) return null;

  return (
    <div
      className="bg-card border rounded-xl overflow-hidden shadow-sm mt-8"
      style={{borderColor: "var(--border-ui)"}}
    >
      <div
        className="px-6 py-4 border-b flex items-center gap-2"
        style={{borderColor: "var(--border-ui)"}}
      >
        <CheckCircle2 size={18} className="text-green-600" />
        <h2 className="text-base font-semibold text-foreground">
          Completed Today
        </h2>
      </div>
      <div className="md:hidden">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="border-b p-4 last:border-b-0"
            style={{borderColor: "var(--border-ui)"}}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-semibold text-green-700 ring-1 ring-white/10">
                  {getInitials(entry.patientName)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {entry.patientName}
                  </p>
                  <div
                    className="mt-0.5 text-xs"
                    style={{color: "var(--text-muted)"}}
                  >
                    <span>{entry.doctorName}</span>
                    <span> - </span>
                    <span>
                      {formatClockTime(entry.arrivedAt)} to{" "}
                      {formatClockTime(entry.completedAt)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <StatusChip status="DONE" />
                <button
                  type="button"
                  onClick={(event) => onOpenMenu(event, entry)}
                  className="rounded-lg p-1.5 transition-colors hover:bg-gray-100"
                  style={{color: "var(--text-muted)"}}
                  aria-label={`Open actions for ${entry.patientName}`}
                >
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left">
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {entries.map((entry) => (
              <tr
                key={entry.id}
                className="transition-colors hover:bg-gray-50/50"
              >
                <td className="px-6 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ring-1 ring-white/10 shrink-0 text-green-700 bg-green-100">
                      {getInitials(entry.patientName)}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">
                        {entry.patientName}
                      </p>
                      <div
                        className="flex items-center gap-2 text-[11px] mt-0.5"
                        style={{color: "var(--text-muted)"}}
                      >
                        <span>{entry.doctorName}</span>
                        <span>-</span>
                        <span>
                          {formatClockTime(entry.arrivedAt)} to{" "}
                          {formatClockTime(entry.completedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2">
                    <StatusChip status="DONE" />
                    <button
                      type="button"
                      onClick={(event) => onOpenMenu(event, entry)}
                      className="rounded-lg p-1.5 transition-colors hover:bg-gray-100"
                      style={{color: "var(--text-muted)"}}
                      aria-label={`Open actions for ${entry.patientName}`}
                    >
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
