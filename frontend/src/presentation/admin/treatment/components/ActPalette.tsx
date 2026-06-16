"use client";

import {useDraggable} from "@dnd-kit/core";
import {CSS} from "@dnd-kit/utilities";
import {CircleDot, Search, Sparkles} from "lucide-react";
import type {DentalAct} from "@/domain/treatment/entities/dentalAct";
import {currencyFormatter, TREATMENT_ICONS} from "../treatmentConfig";
import type {GroupedTreatmentActs} from "../types";
import {getActMeta} from "../utils";

interface ActPaletteProps {
  groupedActs: GroupedTreatmentActs;
  query: string;
  onQueryChange: (query: string) => void;
}

export function ActPalette({
  groupedActs,
  query,
  onQueryChange,
}: ActPaletteProps) {
  return (
    <aside className="flex min-h-0 w-full shrink-0 flex-col overflow-hidden rounded-2xl border border-ui-border bg-card shadow-sm xl:w-[23rem]">
      <div className="border-b border-ui-border p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Act library
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Drag an act to a tooth or open a tooth to add manually.
            </p>
          </div>
          <Sparkles className="text-primary" size={20} />
        </div>
        <label className="mt-4 flex h-10 items-center gap-2 border border-ui-border bg-page px-3 text-sm text-text-muted focus-within:border-primary">
          <Search size={16} />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search act, code, category"
            className="h-full min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-text-placeholder"
          />
        </label>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {Object.entries(groupedActs).map(([category, acts]) => (
          <section key={category} className="mb-5 last:mb-0">
            <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              <span>{category}</span>
              <span>{acts.length}</span>
            </div>
            <div className="space-y-2">
              {acts.map((act) => (
                <DraggableAct key={act.id} act={act} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </aside>
  );
}

function DraggableAct({act}: {act: DentalAct}) {
  const {attributes, listeners, setNodeRef, transform, isDragging} =
    useDraggable({
      id: `act-${act.id}`,
      data: {act},
    });

  return (
    <button
      ref={setNodeRef}
      type="button"
      className={`w-full ${isDragging ? "opacity-40" : "opacity-100"}`}
      style={{
        transform: CSS.Translate.toString(transform),
        cursor: isDragging ? "grabbing" : "grab",
      }}
      {...listeners}
      {...attributes}
    >
      <ActGhost act={act} />
    </button>
  );
}

export function ActGhost({act}: {act: DentalAct}) {
  const Icon = TREATMENT_ICONS[act.icon] ?? CircleDot;
  const meta = getActMeta(act.id);

  return (
    <div className="group flex items-center gap-3 border border-ui-border bg-card p-3 text-left shadow-sm transition hover:border-primary/45 hover:bg-surface-hover">
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center border"
        style={{
          borderColor: `${act.colorHex}55`,
          backgroundColor: `${act.colorHex}12`,
          color: act.colorHex,
        }}
      >
        <Icon size={20} strokeWidth={2.4} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-semibold text-foreground">
            {act.label}
          </span>
          <span className="text-xs font-semibold text-text-muted">
            {meta.code}
          </span>
        </span>
        <span className="mt-1 flex items-center justify-between gap-2 text-xs text-text-muted">
          <span>{meta.duration}</span>
          <span className="font-medium text-foreground">
            {currencyFormatter.format(meta.price)}
          </span>
        </span>
      </span>
    </div>
  );
}
