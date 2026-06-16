"use client";

import {useDroppable} from "@dnd-kit/core";
import {CircleDot, Eye} from "lucide-react";
import type {LucideIcon} from "lucide-react";
import type {
  ToothId,
  ToothTreatment,
} from "@/domain/treatment/entities/toothTreatment";
import {DentalScene} from "./DentalScene/DentalScene";
import type {DentalSceneHandle} from "./DentalScene/SceneExposer";
import {
  LOWER_TEETH,
  TREATMENT_ICONS,
  UNFINISHED_TOOTH_COLOR,
  UPPER_TEETH,
} from "../treatmentConfig";
import type {TreatmentTab} from "../types";
import {getToothKind, getToothPath} from "../utils";
import {getToothFdi} from "../data/toothNames.data";

interface TreatmentWorkspaceProps {
  activeTab: TreatmentTab;
  treatments: ToothTreatment[];
  sceneRef: React.MutableRefObject<DentalSceneHandle | null>;
  onTabChange: (tab: TreatmentTab) => void;
  onOpenTooth: (toothId: ToothId) => void;
  onHoverTooth: (toothId: ToothId | null) => void;
}

export function TreatmentWorkspace({
  activeTab,
  treatments,
  sceneRef,
  onTabChange,
  onOpenTooth,
  onHoverTooth,
}: TreatmentWorkspaceProps) {
  return (
    <section className="min-w-0 flex-1 overflow-hidden rounded-2xl border border-ui-border bg-card shadow-sm">
      <div className="flex flex-col gap-3 border-b border-ui-border p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Treatment workspace
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            Primary planning happens on the 2D model. Open any tooth for
            pricing, notes, status, and history.
          </p>
        </div>

        <div className="inline-flex w-full border border-ui-border bg-page p-1 md:w-auto">
          <TabButton
            active={activeTab === "chart"}
            icon={CircleDot}
            label="2D odontogram"
            onClick={() => onTabChange("chart")}
          />
          <TabButton
            active={activeTab === "visualization"}
            icon={Eye}
            label="3D visual"
            onClick={() => onTabChange("visualization")}
          />
        </div>
      </div>

      <TreatmentStatusLegend />

      {activeTab === "chart" ? (
        <div className="min-h-[44rem] overflow-auto bg-page p-4 lg:p-6">
          <div className="mx-auto flex min-w-[58rem] max-w-6xl flex-col gap-5">
            <Arch
              title="Maxillary arch"
              teeth={UPPER_TEETH}
              treatments={treatments}
              onOpenTooth={onOpenTooth}
              onHoverTooth={onHoverTooth}
            />
            <div className="flex items-center justify-center gap-3 px-8">
              <div className="h-px flex-1 bg-ui-border" />
              <span className="rounded-full border border-ui-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
                Occlusal plane
              </span>
              <div className="h-px flex-1 bg-ui-border" />
            </div>
            <Arch
              title="Mandibular arch"
              teeth={LOWER_TEETH}
              treatments={treatments}
              onOpenTooth={onOpenTooth}
              onHoverTooth={onHoverTooth}
            />
          </div>
        </div>
      ) : (
        <div className="h-[calc(100vh-15rem)] min-h-[42rem]">
          <DentalScene sceneRef={sceneRef} />
        </div>
      )}
    </section>
  );
}

function TreatmentStatusLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-ui-border bg-page px-4 py-2 text-xs text-text-muted">
      <span className="font-semibold uppercase tracking-[0.08em] text-text-muted">
        Tooth status
      </span>
      <span className="inline-flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
        Planned
      </span>
      <span className="inline-flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
        In progress
      </span>
      <span className="inline-flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
        Completed
      </span>
    </div>
  );
}

function TabButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-9 flex-1 items-center justify-center gap-2 px-3 text-sm font-medium transition md:flex-none ${
        active
          ? "bg-card text-primary shadow-sm"
          : "text-text-muted hover:bg-surface-hover hover:text-foreground"
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}

function Arch({
  title,
  teeth,
  treatments,
  onOpenTooth,
  onHoverTooth,
}: {
  title: string;
  teeth: ToothId[];
  treatments: ToothTreatment[];
  onOpenTooth: (toothId: ToothId) => void;
  onHoverTooth: (toothId: ToothId | null) => void;
}) {
  return (
    <section className="border border-ui-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-text-muted">
          {title}
        </h3>
        <span className="text-xs text-text-muted">
          {teeth.length} permanent teeth
        </span>
      </div>
      <div className="grid grid-cols-[repeat(16,minmax(0,1fr))] gap-2">
        {teeth.map((toothId) => (
          <OdontogramTooth
            key={toothId}
            toothId={toothId}
            isUpper={title.includes("Maxillary")}
            treatments={treatments.filter(
              (treatment) => treatment.toothId === toothId,
            )}
            onOpen={() => onOpenTooth(toothId)}
            onHover={onHoverTooth}
          />
        ))}
      </div>
    </section>
  );
}

function OdontogramTooth({
  toothId,
  isUpper,
  treatments,
  onOpen,
  onHover,
}: {
  toothId: ToothId;
  isUpper: boolean;
  treatments: ToothTreatment[];
  onOpen: () => void;
  onHover: (toothId: ToothId | null) => void;
}) {
  const {setNodeRef, isOver} = useDroppable({
    id: `drop-${toothId}`,
    data: {toothId},
  });
  const visibleTreatments = treatments.filter(
    (treatment) => treatment.status !== "cancelled",
  );
  const unfinishedTreatments = visibleTreatments.filter(
    (treatment) => treatment.status !== "completed",
  );
  const toothStatus = unfinishedTreatments.some(
    (treatment) => treatment.status === "in_progress",
  )
    ? "in_progress"
    : unfinishedTreatments.length > 0
      ? "planned"
      : visibleTreatments.length > 0
        ? "completed"
        : null;
  const statusColor = toothStatus
    ? toothStatus === "completed"
      ? "#10b981"
      : UNFINISHED_TOOTH_COLOR[toothStatus]
    : null;
  const path = getToothPath(getToothKind(toothId), isUpper);
  const gradientId = `tooth-shade-${toothId}`;

  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={onOpen}
      onMouseEnter={() => onHover(toothId)}
      onMouseLeave={() => onHover(null)}
      className={`group relative flex min-h-32 flex-col items-center justify-between border bg-page px-1.5 py-2 transition ${
        isOver
          ? "border-primary shadow-[0_0_0_3px_rgba(15,138,163,0.18)]"
          : "border-ui-border hover:border-primary/50"
      }`}
    >
      <span className="text-[0.7rem] font-semibold text-text-muted">
        {getToothFdi(toothId)}
      </span>
      <span className="relative block h-20 w-full">
        <svg viewBox="0 0 80 80" className="h-full w-full drop-shadow-sm">
          <path
            d={path}
            fill={statusColor ? `${statusColor}24` : "#fbfaf6"}
            stroke={isOver ? "var(--brand-primary)" : statusColor ?? "#94a3b8"}
            strokeWidth={statusColor ? "2.8" : "2"}
          />
          <path
            d={path}
            fill={`url(#${gradientId})`}
            opacity="0.45"
            className="transition group-hover:opacity-70"
          />
          <defs>
            <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="1">
              <stop stopColor="#ffffff" offset="0" />
              <stop stopColor="#d9e1e2" offset="1" />
            </linearGradient>
          </defs>
        </svg>

        {visibleTreatments.slice(0, 4).map((treatment, index) => {
          const Icon = TREATMENT_ICONS[treatment.actIcon] ?? CircleDot;

          return (
            <span
              key={treatment.id}
              className="absolute flex h-5 w-5 items-center justify-center rounded-full border border-white shadow-sm"
              style={{
                left: `${12 + index * 18}%`,
                top: isUpper ? `${14 + index * 6}%` : `${58 - index * 6}%`,
                backgroundColor: treatment.actColor,
                color: "white",
              }}
            >
              <Icon size={11} strokeWidth={2.8} />
            </span>
          );
        })}

        {visibleTreatments.length > 0 && (
          <span className="absolute bottom-1 left-1/2 flex -translate-x-1/2 overflow-hidden rounded-full border border-white shadow-sm">
            {visibleTreatments.slice(0, 5).map((treatment) => (
              <span
                key={treatment.id}
                className="h-1.5 w-4"
                style={{backgroundColor: treatment.actColor}}
              />
            ))}
          </span>
        )}

        {toothStatus && (
          <span
            className="absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-card shadow-sm"
            style={{backgroundColor: statusColor ?? undefined}}
            aria-hidden="true"
          />
        )}
      </span>
      <span
        className="text-[0.65rem] font-semibold"
        style={{color: statusColor ?? "#94a3b8"}}
      >
        {toothStatus === "in_progress"
          ? "in progress"
          : toothStatus === "planned"
            ? "planned"
            : toothStatus === "completed"
              ? "completed"
              : "clear"}
      </span>
    </button>
  );
}
