import type React from "react";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import {useMediaQuery} from "@mui/material";
import {AnimatePresence, motion} from "framer-motion";
import {
  AlertCircle,
  Calendar,
  ClipboardList,
  Clock,
  GripVertical,
  MoreVertical,
  Phone,
  RotateCcw,
  User,
} from "lucide-react";
import type {QueueEntry} from "@/domain/queue/entities/queueEntry";
import type {QueueSortMode} from "@/domain/queue/services/queuePolicy";
import {PriorityBadge} from "./PriorityBadge";
import {StatusChip} from "./StatusChip";
import {formatClockTime, formatElapsed, getInitials} from "../utils";

interface ActiveQueueTableProps {
  canReorder: boolean;
  entries: QueueEntry[];
  lastUpdatedId: string | null;
  manualOrder: string[] | null;
  now: Date;
  sortMode: QueueSortMode;
  onOpenMenu: (event: React.MouseEvent<HTMLElement>, entry: QueueEntry) => void;
  onReorder: (ids: string[]) => void;
  onResetOrder: () => void;
  onSortModeChange: (mode: QueueSortMode) => void;
}

interface SortableQueueRowProps {
  entry: QueueEntry;
  isDragEnabled: boolean;
  isUpdated: boolean;
  now: Date;
  onOpenMenu: (event: React.MouseEvent<HTMLElement>, entry: QueueEntry) => void;
}

interface MobileQueueItemProps {
  entry: QueueEntry;
  isDragEnabled: boolean;
  isUpdated: boolean;
  now: Date;
  onOpenMenu: (event: React.MouseEvent<HTMLElement>, entry: QueueEntry) => void;
}

function rowAccent(status: QueueEntry["status"]): string {
  if (status === "IN_CHAIR") return "rgba(124, 58, 237, 0.08)";
  if (status === "WAITING") return "rgba(245, 158, 11, 0.08)";
  return "transparent";
}

function SortableQueueRow({
  entry,
  isDragEnabled,
  isUpdated,
  now,
  onOpenMenu,
}: SortableQueueRowProps) {
  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({id: entry.id, disabled: !isDragEnabled});
  const accent = rowAccent(entry.status);

  return (
    <motion.tr
      ref={setNodeRef}
      layout
      initial={{opacity: 0, y: -12}}
      animate={{
        opacity: isDragging ? 0.84 : 1,
        y: 0,
        backgroundColor: isUpdated
          ? ["rgba(16, 185, 129, 0.22)", accent]
          : accent,
      }}
      exit={{opacity: 0, x: 40}}
      transition={{
        duration: 0.25,
        ease: "easeOut",
        backgroundColor: {duration: 1.5, ease: "easeOut"},
      }}
      className="transition-colors hover:bg-gray-50/50"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        position: "relative",
        zIndex: isDragging ? 1 : "auto",
      }}
    >
      {isDragEnabled && (
        <td className="pl-4 pr-0 py-4 whitespace-nowrap">
          <button
            ref={setActivatorNodeRef}
            type="button"
            aria-label={`Reorder ${entry.patientName}`}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-grab active:cursor-grabbing"
            style={{color: "var(--text-muted)"}}
            {...attributes}
            {...listeners}
          >
            <GripVertical size={16} />
          </button>
        </td>
      )}

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div
            className="relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ring-2 ring-white/20 shrink-0 shadow-sm"
            style={{
              backgroundColor: "var(--brand-primary)",
              color: "white",
            }}
          >
            {(entry.status === "WAITING" || entry.status === "IN_CHAIR") && (
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
                <span className="truncate max-w-44">{entry.notes}</span>
              </div>
            )}
          </div>
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-foreground font-semibold">
            <Calendar size={12} style={{color: "var(--text-muted)"}} />
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
          type="button"
          onClick={(event) => onOpenMenu(event, entry)}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          style={{color: "var(--text-muted)"}}
        >
          <MoreVertical size={16} />
        </button>
      </td>
    </motion.tr>
  );
}

function MobileQueueItem({
  entry,
  isDragEnabled,
  isUpdated,
  now,
  onOpenMenu,
}: MobileQueueItemProps) {
  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({id: entry.id, disabled: !isDragEnabled});
  const accent = rowAccent(entry.status);

  return (
    <motion.div
      ref={setNodeRef}
      layout
      initial={{opacity: 0, y: -10}}
      animate={{
        opacity: isDragging ? 0.84 : 1,
        y: 0,
        backgroundColor: isUpdated
          ? ["rgba(16, 185, 129, 0.22)", accent]
          : accent,
      }}
      exit={{opacity: 0, x: 28}}
      transition={{
        duration: 0.22,
        ease: "easeOut",
        backgroundColor: {duration: 1.5, ease: "easeOut"},
      }}
      className="border-b p-4 last:border-b-0"
      style={{
        borderColor: "var(--border-ui)",
        transform: CSS.Transform.toString(transform),
        transition,
        position: "relative",
        zIndex: isDragging ? 1 : "auto",
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex shrink-0 items-center gap-2">
          {isDragEnabled && (
            <button
              ref={setActivatorNodeRef}
              type="button"
              aria-label={`Reorder ${entry.patientName}`}
              className="rounded-lg p-1.5 transition-colors hover:bg-gray-100 cursor-grab active:cursor-grabbing"
              style={{color: "var(--text-muted)"}}
              {...attributes}
              {...listeners}
            >
              <GripVertical size={16} />
            </button>
          )}
          <div
            className="relative mt-0.5 flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold shadow-sm ring-2 ring-white/20"
            style={{
              backgroundColor: "var(--brand-primary)",
              color: "white",
            }}
          >
            {(entry.status === "WAITING" || entry.status === "IN_CHAIR") && (
              <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white animate-pulse" />
            )}
            {getInitials(entry.patientName)}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {entry.patientName}
              </p>
              <div
                className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs"
                style={{color: "var(--text-muted)"}}
              >
                <Phone size={12} className="shrink-0" />
                <span className="truncate">
                  {entry.patientPhone ?? "No phone"}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={(event) => onOpenMenu(event, entry)}
              className="shrink-0 rounded-lg p-1.5 transition-colors hover:bg-gray-100"
              style={{color: "var(--text-muted)"}}
            >
              <MoreVertical size={16} />
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusChip status={entry.status} />
            <PriorityBadge priority={entry.priority} />
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-foreground">
              <Calendar size={12} style={{color: "var(--text-muted)"}} />
              <span className="font-semibold">
                {entry.appointmentType ?? "Visit"}
              </span>
              <span style={{color: "var(--text-muted)"}}>with</span>
              <span className="min-w-0 truncate">{entry.doctorName}</span>
            </div>
            <div style={{color: "var(--text-muted)"}}>
              <span
                className="font-bold"
                style={{color: "var(--brand-primary)"}}
              >
                {formatElapsed(entry.arrivedAt, now)}
              </span>{" "}
              elapsed - arrived {formatClockTime(entry.arrivedAt)}
            </div>
          </div>

          {entry.notes && (
            <div className="mt-3 flex items-start gap-1.5 rounded-lg bg-amber-50 px-2.5 py-2 text-xs font-medium text-amber-700">
              <AlertCircle size={12} className="mt-0.5 shrink-0" />
              <span className="min-w-0 break-words">{entry.notes}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function ActiveQueueTable({
  canReorder,
  entries,
  lastUpdatedId,
  manualOrder,
  now,
  sortMode,
  onOpenMenu,
  onReorder,
  onResetOrder,
  onSortModeChange,
}: ActiveQueueTableProps) {
  const isDragEnabled = canReorder && sortMode === "POLICY";
  const isMobile = useMediaQuery("(max-width: 767px)", {noSsr: true});
  const sensors = useSensors(
    useSensor(PointerSensor, {activationConstraint: {distance: 6}}),
  );
  const headings = isDragEnabled
    ? ["", "Patient", "Visit", "Elapsed", "Priority", "Status", ""]
    : ["Patient", "Visit", "Elapsed", "Priority", "Status", ""];

  const handleDragEnd = (event: DragEndEvent) => {
    const {active, over} = event;
    if (!over || active.id === over.id) return;

    const oldIndex = entries.findIndex((entry) => entry.id === active.id);
    const newIndex = entries.findIndex((entry) => entry.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    onReorder(arrayMove(entries.map((entry) => entry.id), oldIndex, newIndex));
  };

  return (
    <div
      className="bg-card border rounded-xl overflow-hidden shadow-sm"
      style={{borderColor: "var(--border-ui)"}}
    >
      <div
        className="flex flex-col gap-3 border-b px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between"
        style={{borderColor: "var(--border-ui)"}}
      >
        <div className="flex items-center gap-2">
          <Clock size={18} style={{color: "var(--brand-primary)"}} />
          <h2 className="text-base font-semibold text-foreground">
            Active Queue
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {manualOrder && sortMode === "POLICY" && (
            <button
              type="button"
              onClick={onResetOrder}
              className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors hover:bg-gray-50"
              style={{
                borderColor: "var(--border-ui)",
                color: "var(--text-muted)",
              }}
            >
              <RotateCcw size={13} />
              Reset
            </button>
          )}
          <select
            value={sortMode}
            onChange={(event) =>
              onSortModeChange(event.target.value as QueueSortMode)
            }
            className="min-h-9 rounded-lg border bg-transparent px-3 py-1.5 text-xs font-semibold outline-none transition-colors"
            style={{
              borderColor: "var(--border-ui)",
              color: "var(--foreground)",
            }}
          >
            <option value="POLICY">Smart sort</option>
            <option value="ARRIVED_AT">Walk-in time</option>
          </select>
          <div
            className="hidden sm:flex items-center gap-2 text-xs font-semibold"
            style={{color: "var(--text-muted)"}}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live updates on
          </div>
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          {isMobile ? (
            <SortableContext
              items={entries.map((entry) => entry.id)}
              strategy={verticalListSortingStrategy}
            >
              <div>
                <AnimatePresence initial={false}>
                  {entries.map((entry) => (
                    <MobileQueueItem
                      key={entry.id}
                      entry={entry}
                      isDragEnabled={isDragEnabled}
                      isUpdated={entry.id === lastUpdatedId}
                      now={now}
                      onOpenMenu={onOpenMenu}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </SortableContext>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr
                    className="border-b"
                    style={{borderColor: "var(--border-ui)"}}
                  >
                    {headings.map((heading, index) => (
                      <th
                        key={`${heading || "actions"}-${index}`}
                        className={
                          index === 0 && isDragEnabled
                            ? "pl-4 pr-0 py-3 w-10"
                            : "px-6 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                        }
                        style={{color: "var(--text-muted)"}}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <SortableContext
                  items={entries.map((entry) => entry.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <AnimatePresence initial={false}>
                      {entries.map((entry) => (
                        <SortableQueueRow
                          key={entry.id}
                          entry={entry}
                          isDragEnabled={isDragEnabled}
                          isUpdated={entry.id === lastUpdatedId}
                          now={now}
                          onOpenMenu={onOpenMenu}
                        />
                      ))}
                    </AnimatePresence>
                  </tbody>
                </SortableContext>
              </table>
            </div>
          )}
        </DndContext>
      )}
    </div>
  );
}
