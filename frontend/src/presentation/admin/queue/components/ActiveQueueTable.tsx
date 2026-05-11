import type React from "react";
import {
  AlertCircle,
  Calendar,
  ClipboardList,
  Clock,
  MoreVertical,
  Phone,
  User,
} from "lucide-react";
import type {QueueEntry} from "@/domain/queue/entities/queueEntry";
import {PriorityBadge} from "./PriorityBadge";
import {StatusChip} from "./StatusChip";
import {formatClockTime, formatElapsed, getInitials} from "../utils";

interface ActiveQueueTableProps {
  entries: QueueEntry[];
  now: Date;
  onOpenMenu: (event: React.MouseEvent<HTMLElement>, entry: QueueEntry) => void;
}

function rowAccent(status: QueueEntry["status"]): string {
  if (status === "IN_CHAIR") return "rgba(124, 58, 237, 0.08)";
  if (status === "WAITING") return "rgba(245, 158, 11, 0.08)";
  return "transparent";
}

export function ActiveQueueTable({
  entries,
  now,
  onOpenMenu,
}: ActiveQueueTableProps) {
  return (
    <div
      className="bg-card border rounded-xl overflow-hidden shadow-sm"
      style={{borderColor: "var(--border-ui)"}}
    >
      <div
        className="px-6 py-4 border-b flex items-center justify-between gap-3"
        style={{borderColor: "var(--border-ui)"}}
      >
        <div className="flex items-center gap-2">
          <Clock size={18} style={{color: "var(--brand-primary)"}} />
          <h2 className="text-base font-semibold text-foreground">
            Active Queue
          </h2>
        </div>
        <div
          className="hidden sm:flex items-center gap-2 text-xs font-semibold"
          style={{color: "var(--text-muted)"}}
        >
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Timers refresh every 30 seconds
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="p-12 flex flex-col items-center gap-3">
          <ClipboardList size={40} style={{color: "var(--text-muted)"}} />
          <p
            className="text-sm font-medium"
            style={{color: "var(--text-muted)"}}
          >
            No patients in the queue right now
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr
                className="border-b"
                style={{borderColor: "var(--border-ui)"}}
              >
                {["Patient", "Visit", "Elapsed", "Priority", "Status", ""].map(
                  (heading) => (
                    <th
                      key={heading || "actions"}
                      className="px-6 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                      style={{color: "var(--text-muted)"}}
                    >
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {entries.map((entry) => (
                <tr
                  key={entry.id}
                  className="transition-colors hover:bg-gray-50/50"
                  style={{background: rowAccent(entry.status)}}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div
                        className="relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ring-2 ring-white/20 shrink-0 shadow-sm"
                        style={{
                          backgroundColor: "var(--brand-primary)",
                          color: "white",
                        }}
                      >
                        {(entry.status === "WAITING" ||
                          entry.status === "IN_CHAIR") && (
                          <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white animate-pulse" />
                        )}
                        {getInitials(entry.patientName)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-foreground">
                          {entry.patientName}
                        </p>
                        <div
                          className="flex items-center gap-1.5 text-xs mt-0.5"
                          style={{color: "var(--text-muted)"}}
                        >
                          <Phone size={12} />
                          <span>{entry.patientPhone ?? "No phone"}</span>
                        </div>
                        {entry.notes && (
                          <div className="flex items-center gap-1 text-[11px] mt-1 text-amber-600 font-medium">
                            <AlertCircle size={10} className="shrink-0" />
                            <span className="truncate max-w-44">
                              {entry.notes}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-foreground font-semibold">
                        <Calendar
                          size={12}
                          style={{color: "var(--text-muted)"}}
                        />
                        <span>{entry.appointmentType ?? "Visit"}</span>
                      </div>
                      <div
                        className="flex items-center gap-1.5 text-xs"
                        style={{color: "var(--text-muted)"}}
                      >
                        <User size={12} />
                        <span>{entry.doctorName}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <p
                        className="text-xs font-bold"
                        style={{color: "var(--brand-primary)"}}
                      >
                        {formatElapsed(entry.arrivedAt, now)} elapsed
                      </p>
                      <p className="text-xs" style={{color: "var(--text-muted)"}}>
                        Arr: {formatClockTime(entry.arrivedAt)}
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <PriorityBadge priority={entry.priority} />
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusChip status={entry.status} />
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={(event) => onOpenMenu(event, entry)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                      style={{color: "var(--text-muted)"}}
                    >
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
