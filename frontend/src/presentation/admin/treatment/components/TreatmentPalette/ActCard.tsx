"use client";

import {CSS} from "@dnd-kit/utilities";
import {useDraggable} from "@dnd-kit/core";
import {
  AlertCircle,
  Anchor,
  CircleDot,
  Crown,
  GitCommitHorizontal,
  LucideIcon,
  Sun,
  X,
  Zap,
} from "lucide-react";
import type {DentalAct} from "@/domain/treatment/entities/dentalAct";

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

interface ActCardProps {
  act: DentalAct;
  isDragOverlay?: boolean;
}

export function ActCard({act, isDragOverlay = false}: ActCardProps) {
  const {attributes, listeners, setNodeRef, transform, isDragging} =
    useDraggable({
      id: act.id,
      data: {act},
      disabled: isDragOverlay,
    });
  const Icon = ICONS[act.icon] ?? CircleDot;

  return (
    <button
      ref={setNodeRef}
      type="button"
      aria-label={`Drag ${act.label} onto a tooth`}
      className={`flex w-full items-center gap-3 rounded-lg border border-ui-border bg-card p-3 text-left transition hover:border-primary/40 hover:bg-surface-hover ${
        isDragging ? "opacity-40" : "opacity-100"
      } ${isDragOverlay ? "shadow-2xl ring-2 ring-primary/30" : ""}`}
      style={{
        transform: CSS.Translate.toString(transform),
        cursor: isDragging ? "grabbing" : "grab",
      }}
      {...listeners}
      {...attributes}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-ui-border bg-page">
        <Icon size={18} color={act.colorHex} strokeWidth={2.4} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-foreground">
          {act.label}
        </span>
        <span className="mt-1 inline-flex max-w-full rounded-full bg-page px-2 py-0.5 text-[0.6875rem] text-text-muted">
          {act.category}
        </span>
      </span>
    </button>
  );
}
