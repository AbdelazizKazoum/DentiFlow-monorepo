"use client";

import {useMemo, useState} from "react";
import {
  AlertCircle,
  Anchor,
  CircleDot,
  Crown,
  GitCommitHorizontal,
  LucideIcon,
  Sun,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import type {ToothTreatment} from "@/domain/treatment/entities/toothTreatment";
import {useDentalChartStore} from "@/presentation/stores/dentalChartStore";
import {RemoveTreatmentUseCase} from "@/application/useCases/admin/treatment/removeTreatmentUseCase";
import {SaveTreatmentNoteUseCase} from "@/application/useCases/admin/treatment/saveTreatmentNoteUseCase";
import {UpdateTreatmentStatusUseCase} from "@/application/useCases/admin/treatment/updateTreatmentStatusUseCase";

const ICONS: Record<string, LucideIcon> = {
  AlertCircle,
  Anchor,
  CircleDot,
  Crown,
  GitCommitHorizontal,
  Sun,
  X,
  Zap,
};

const statusClass: Record<string, string> = {
  planned: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200",
  in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-200",
  completed:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200",
  cancelled: "bg-gray-100 text-gray-500 dark:bg-gray-500/15 dark:text-gray-300",
};

interface TreatmentListItemProps {
  treatment: ToothTreatment;
}

export function TreatmentListItem({treatment}: TreatmentListItemProps) {
  const updateTreatment = useDentalChartStore((state) => state.updateTreatment);
  const removeTreatment = useDentalChartStore((state) => state.removeTreatment);
  const [note, setNote] = useState(treatment.notes ?? "");
  const Icon = ICONS[treatment.actIcon] ?? CircleDot;
  const hasUnsavedNote = note.trim() !== (treatment.notes ?? "");

  const createdAt = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(treatment.createdAt)),
    [treatment.createdAt],
  );

  const handleComplete = () => {
    new UpdateTreatmentStatusUseCase(updateTreatment).execute(
      treatment.id,
      "completed",
    );
  };

  const handleRemove = () => {
    new RemoveTreatmentUseCase(removeTreatment).execute(treatment.id);
  };

  const handleSaveNote = () => {
    new SaveTreatmentNoteUseCase(updateTreatment).execute(treatment.id, note);
  };

  return (
    <article className="rounded-lg border border-ui-border bg-page p-3">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-ui-border bg-card">
          <Icon size={18} color={treatment.actColor} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {treatment.actLabel}
              </p>
              <p className="mt-0.5 text-xs text-text-muted">{createdAt}</p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[0.6875rem] font-medium ${statusClass[treatment.status]}`}
            >
              {treatment.status.replace("_", " ")}
            </span>
          </div>

          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Add clinical note"
            className="mt-3 min-h-20 w-full resize-none rounded-md border border-ui-border bg-card px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary"
          />

          {treatment.notes && (
            <p className="mt-2 rounded-md bg-card px-3 py-2 text-xs text-text-muted">
              {treatment.notes}
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            {treatment.status !== "completed" &&
              treatment.status !== "cancelled" && (
                <button
                  type="button"
                  onClick={handleComplete}
                  className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                >
                  Mark Complete
                </button>
              )}
            {hasUnsavedNote && (
              <button
                type="button"
                onClick={handleSaveNote}
                className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-dark"
              >
                Save Note
              </button>
            )}
            <button
              type="button"
              onClick={handleRemove}
              className="inline-flex items-center gap-1 rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900/60 dark:hover:bg-red-950/30"
            >
              <Trash2 size={13} />
              Remove
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
