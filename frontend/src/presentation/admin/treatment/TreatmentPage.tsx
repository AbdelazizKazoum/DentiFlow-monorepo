"use client";

import {useMemo, useRef, useState} from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {CSS} from "@dnd-kit/utilities";
import {AnimatePresence, motion} from "framer-motion";
import {
  AlertCircle,
  Anchor,
  CheckCircle2,
  CircleDot,
  Crown,
  Eye,
  GitCommitHorizontal,
  LucideIcon,
  Plus,
  Search,
  Sparkles,
  Stethoscope,
  Sun,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import {AddTreatmentUseCase} from "@/application/useCases/admin/treatment/addTreatmentUseCase";
import {RemoveTreatmentUseCase} from "@/application/useCases/admin/treatment/removeTreatmentUseCase";
import {SaveTreatmentNoteUseCase} from "@/application/useCases/admin/treatment/saveTreatmentNoteUseCase";
import {UpdateTreatmentStatusUseCase} from "@/application/useCases/admin/treatment/updateTreatmentStatusUseCase";
import type {DentalAct, TreatmentStatus} from "@/domain/treatment/entities/dentalAct";
import type {
  ToothId,
  ToothTreatment,
} from "@/domain/treatment/entities/toothTreatment";
import {useDentalChartStore} from "@/presentation/stores/dentalChartStore";
import {DentalScene} from "./components/DentalScene/DentalScene";
import type {DentalSceneHandle} from "./components/DentalScene/SceneExposer";
import {DENTAL_ACTS} from "./data/dentalActs.data";
import {getToothFdi, getToothLabel} from "./data/toothNames.data";

type TreatmentTab = "chart" | "visualization";

interface ActCatalogMeta {
  code: string;
  price: number;
  duration: string;
  surface: string;
}

const ACT_META: Record<string, ActCatalogMeta> = {
  caries: {code: "DIA-01", price: 180, duration: "15 min", surface: "Occlusal"},
  filling: {code: "RES-12", price: 520, duration: "35 min", surface: "O/M/D"},
  crown: {code: "PRO-40", price: 2400, duration: "2 visits", surface: "Full crown"},
  implant: {code: "SUR-90", price: 7800, duration: "3 visits", surface: "Root axis"},
  extraction: {code: "SUR-20", price: 650, duration: "30 min", surface: "Whole tooth"},
  root_canal: {code: "END-31", price: 1800, duration: "60 min", surface: "Canal"},
  whitening: {code: "COS-10", price: 1200, duration: "45 min", surface: "Facial"},
  orthodontics: {code: "ORT-70", price: 3200, duration: "Monthly", surface: "Arch"},
};

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

const STATUS_CLASS: Record<TreatmentStatus, string> = {
  planned: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200",
  in_progress: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-200",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-200",
  cancelled: "border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300",
};

const UPPER_TEETH = [
  "tooth_18",
  "tooth_17",
  "tooth_16",
  "tooth_15",
  "tooth_14",
  "tooth_13",
  "tooth_12",
  "tooth_11",
  "tooth_21",
  "tooth_22",
  "tooth_23",
  "tooth_24",
  "tooth_25",
  "tooth_26",
  "tooth_27",
  "tooth_28",
];

const LOWER_TEETH = [
  "tooth_48",
  "tooth_47",
  "tooth_46",
  "tooth_45",
  "tooth_44",
  "tooth_43",
  "tooth_42",
  "tooth_41",
  "tooth_31",
  "tooth_32",
  "tooth_33",
  "tooth_34",
  "tooth_35",
  "tooth_36",
  "tooth_37",
  "tooth_38",
];

const currencyFormatter = new Intl.NumberFormat("fr-MA", {
  style: "currency",
  currency: "MAD",
  maximumFractionDigits: 0,
});

function getActMeta(actId: string): ActCatalogMeta {
  return ACT_META[actId] ?? {
    code: "ACT",
    price: 0,
    duration: "TBD",
    surface: "Clinical",
  };
}

function getToothKind(toothId: ToothId) {
  const number = Number(getToothFdi(toothId).slice(1));

  if (number <= 2) return "incisor";
  if (number === 3) return "canine";
  if (number <= 5) return "premolar";
  return "molar";
}

function getToothPath(kind: string, isUpper: boolean) {
  if (kind === "molar") {
    return isUpper
      ? "M18 18 C14 23 13 34 15 50 C17 66 23 78 32 78 C39 78 42 68 43 58 C44 68 47 78 54 78 C63 78 69 66 71 50 C73 34 72 23 68 18 C62 10 54 13 48 18 C45 21 42 21 39 18 C32 13 24 10 18 18 Z"
      : "M18 62 C14 57 13 46 15 30 C17 14 23 2 32 2 C39 2 42 12 43 22 C44 12 47 2 54 2 C63 2 69 14 71 30 C73 46 72 57 68 62 C62 70 54 67 48 62 C45 59 42 59 39 62 C32 67 24 70 18 62 Z";
  }

  if (kind === "premolar") {
    return isUpper
      ? "M24 17 C19 23 18 34 20 50 C22 66 28 78 40 78 C52 78 58 66 60 50 C62 34 61 23 56 17 C51 11 46 14 42 19 C41 20 39 20 38 19 C34 14 29 11 24 17 Z"
      : "M24 63 C19 57 18 46 20 30 C22 14 28 2 40 2 C52 2 58 14 60 30 C62 46 61 57 56 63 C51 69 46 66 42 61 C41 60 39 60 38 61 C34 66 29 69 24 63 Z";
  }

  if (kind === "canine") {
    return isUpper
      ? "M31 13 C22 24 20 42 24 59 C27 72 33 79 40 79 C47 79 53 72 56 59 C60 42 58 24 49 13 C45 8 43 15 40 24 C37 15 35 8 31 13 Z"
      : "M31 67 C22 56 20 38 24 21 C27 8 33 1 40 1 C47 1 53 8 56 21 C60 38 58 56 49 67 C45 72 43 65 40 56 C37 65 35 72 31 67 Z";
  }

  return isUpper
    ? "M29 15 C23 24 22 40 25 57 C28 72 33 79 40 79 C47 79 52 72 55 57 C58 40 57 24 51 15 C47 9 43 16 40 24 C37 16 33 9 29 15 Z"
    : "M29 65 C23 56 22 40 25 23 C28 8 33 1 40 1 C47 1 52 8 55 23 C58 40 57 56 51 65 C47 71 43 64 40 56 C37 64 33 71 29 65 Z";
}

function TreatmentPage() {
  const sceneRef = useRef<DentalSceneHandle | null>(null);
  const [activeTab, setActiveTab] = useState<TreatmentTab>("chart");
  const [query, setQuery] = useState("");
  const [selectedModalTooth, setSelectedModalTooth] = useState<ToothId | null>(
    null,
  );

  const draggingAct = useDentalChartStore((state) => state.draggingAct);
  const setDraggingAct = useDentalChartStore((state) => state.setDraggingAct);
  const setOrbitEnabled = useDentalChartStore((state) => state.setOrbitEnabled);
  const addTreatment = useDentalChartStore((state) => state.addTreatment);
  const treatments = useDentalChartStore((state) => state.treatments);
  const setSelectedTooth = useDentalChartStore((state) => state.setSelectedTooth);
  const setHoveredTooth = useDentalChartStore((state) => state.setHoveredTooth);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {distance: 6},
    }),
  );

  const filteredActs = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return DENTAL_ACTS.filter((act) => {
      if (!normalized) return true;

      return `${act.label} ${act.category} ${getActMeta(act.id).code}`
        .toLowerCase()
        .includes(normalized);
    });
  }, [query]);

  const groupedActs = useMemo(() => {
    return filteredActs.reduce<Record<string, DentalAct[]>>((acc, act) => {
      acc[act.category] = [...(acc[act.category] ?? []), act];
      return acc;
    }, {});
  }, [filteredActs]);

  const totals = useMemo(() => {
    const planned = treatments.filter(
      (treatment) => treatment.status !== "completed",
    );
    const amount = planned.reduce(
      (sum, treatment) => sum + getActMeta(treatment.actId).price,
      0,
    );

    return {
      teeth: new Set(treatments.map((treatment) => treatment.toothId)).size,
      planned: planned.length,
      completed: treatments.filter((treatment) => treatment.status === "completed")
        .length,
      amount,
    };
  }, [treatments]);

  const handleDragStart = (event: DragStartEvent) => {
    const act = event.active.data.current?.act as DentalAct | undefined;

    if (!act) return;

    setDraggingAct(act);
    setOrbitEnabled(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const act = event.active.data.current?.act as DentalAct | undefined;
    const toothId = event.over?.data.current?.toothId as ToothId | undefined;

    if (act && toothId) {
      new AddTreatmentUseCase(addTreatment).execute(act, toothId, [0, 0.2, 0]);
      setSelectedModalTooth(toothId);
      setSelectedTooth(toothId);
    }

    setDraggingAct(null);
    setOrbitEnabled(true);
  };

  const handleDragCancel = () => {
    setDraggingAct(null);
    setOrbitEnabled(true);
  };

  const openTooth = (toothId: ToothId) => {
    setSelectedModalTooth(toothId);
    setSelectedTooth(toothId);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <main className="min-h-screen bg-[#f4f7f8] text-slate-950 dark:bg-slate-950 dark:text-slate-50">
        <div className="mx-auto flex min-h-screen w-full max-w-[1800px] flex-col gap-4 px-4 py-4 lg:px-6">
          <header className="flex flex-col gap-4 border-b border-slate-200/80 bg-white px-4 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-teal-700 dark:text-teal-300">
                <Stethoscope size={15} />
                Clinical treatment planning
              </div>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
                Odontogram and act application
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Drag clinical acts onto teeth, review tooth history, and keep the
                3D model for visual confirmation.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Metric label="Teeth" value={totals.teeth.toString()} />
              <Metric label="Planned" value={totals.planned.toString()} />
              <Metric label="Done" value={totals.completed.toString()} />
              <Metric label="Estimate" value={currencyFormatter.format(totals.amount)} />
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-4 xl:flex-row">
            <aside className="flex min-h-0 w-full shrink-0 flex-col border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 xl:w-[23rem]">
              <div className="border-b border-slate-200 p-4 dark:border-slate-800">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-slate-950 dark:text-white">
                      Act library
                    </h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Drag an act to a tooth or open a tooth to add manually.
                    </p>
                  </div>
                  <Sparkles className="text-teal-600 dark:text-teal-300" size={20} />
                </div>
                <label className="mt-4 flex h-10 items-center gap-2 border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 focus-within:border-teal-500 dark:border-slate-700 dark:bg-slate-950">
                  <Search size={16} />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search act, code, category"
                    className="h-full min-w-0 flex-1 bg-transparent text-slate-950 outline-none placeholder:text-slate-400 dark:text-white"
                  />
                </label>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-4">
                {Object.entries(groupedActs).map(([category, acts]) => (
                  <section key={category} className="mb-5 last:mb-0">
                    <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
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

            <section className="min-w-0 flex-1 border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-950 dark:text-white">
                    Treatment workspace
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Primary planning happens on the 2D model. Open any tooth for
                    pricing, notes, status, and history.
                  </p>
                </div>

                <div className="inline-flex w-full border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-950 md:w-auto">
                  <TabButton
                    active={activeTab === "chart"}
                    icon={CircleDot}
                    label="2D odontogram"
                    onClick={() => setActiveTab("chart")}
                  />
                  <TabButton
                    active={activeTab === "visualization"}
                    icon={Eye}
                    label="3D visual"
                    onClick={() => setActiveTab("visualization")}
                  />
                </div>
              </div>

              {activeTab === "chart" ? (
                <div className="min-h-[44rem] overflow-auto bg-[#eef4f3] p-4 dark:bg-slate-950 lg:p-6">
                  <div className="mx-auto flex min-w-[58rem] max-w-6xl flex-col gap-5">
                    <Arch
                      title="Maxillary arch"
                      teeth={UPPER_TEETH}
                      treatments={treatments}
                      onOpenTooth={openTooth}
                      onHoverTooth={setHoveredTooth}
                    />
                    <div className="flex items-center justify-center gap-3 px-8">
                      <div className="h-px flex-1 bg-slate-300 dark:bg-slate-700" />
                      <span className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                        Occlusal plane
                      </span>
                      <div className="h-px flex-1 bg-slate-300 dark:bg-slate-700" />
                    </div>
                    <Arch
                      title="Mandibular arch"
                      teeth={LOWER_TEETH}
                      treatments={treatments}
                      onOpenTooth={openTooth}
                      onHoverTooth={setHoveredTooth}
                    />
                  </div>
                </div>
              ) : (
                <div className="h-[calc(100vh-15rem)] min-h-[42rem]">
                  <DentalScene sceneRef={sceneRef} />
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {selectedModalTooth && (
          <ToothTreatmentModal
            toothId={selectedModalTooth}
            treatments={treatments.filter(
              (treatment) => treatment.toothId === selectedModalTooth,
            )}
            onClose={() => {
              setSelectedModalTooth(null);
              setSelectedTooth(null);
            }}
          />
        )}
      </AnimatePresence>

      <DragOverlay dropAnimation={{duration: 160, easing: "ease-out"}}>
        {draggingAct ? <ActGhost act={draggingAct} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

function Metric({label, value}: {label: string; value: string}) {
  return (
    <div className="min-w-28 border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-950">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">
        {value}
      </p>
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
          ? "bg-white text-teal-700 shadow-sm dark:bg-slate-800 dark:text-teal-200"
          : "text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
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

function ActGhost({act}: {act: DentalAct}) {
  const Icon = ICONS[act.icon] ?? CircleDot;
  const meta = getActMeta(act.id);

  return (
    <div className="group flex items-center gap-3 border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:border-teal-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-950 dark:hover:border-teal-500/70">
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
          <span className="truncate text-sm font-semibold text-slate-950 dark:text-white">
            {act.label}
          </span>
          <span className="text-xs font-semibold text-slate-500">
            {meta.code}
          </span>
        </span>
        <span className="mt-1 flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>{meta.duration}</span>
          <span className="font-medium text-slate-700 dark:text-slate-200">
            {currencyFormatter.format(meta.price)}
          </span>
        </span>
      </span>
    </div>
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
    <section className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
          {title}
        </h3>
        <span className="text-xs text-slate-500">
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
  const kind = getToothKind(toothId);
  const path = getToothPath(kind, isUpper);
  const gradientId = `tooth-shade-${toothId}`;

  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={onOpen}
      onMouseEnter={() => onHover(toothId)}
      onMouseLeave={() => onHover(null)}
      className={`group relative flex min-h-32 flex-col items-center justify-between border bg-slate-50 px-1.5 py-2 transition dark:bg-slate-950 ${
        isOver
          ? "border-teal-500 shadow-[0_0_0_3px_rgba(20,184,166,0.18)]"
          : "border-slate-200 hover:border-teal-300 dark:border-slate-700 dark:hover:border-teal-500"
      }`}
    >
      <span className="text-[0.7rem] font-semibold text-slate-500">
        {getToothFdi(toothId)}
      </span>
      <span className="relative block h-20 w-full">
        <svg viewBox="0 0 80 80" className="h-full w-full drop-shadow-sm">
          <path
            d={path}
            fill="#fbfaf6"
            stroke={isOver ? "#0f766e" : "#94a3b8"}
            strokeWidth="2"
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
          const Icon = ICONS[treatment.actIcon] ?? CircleDot;

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
      </span>
      <span className="text-[0.65rem] font-medium text-slate-400">
        {visibleTreatments.length ? `${visibleTreatments.length} act` : "clear"}
      </span>
    </button>
  );
}

function ToothTreatmentModal({
  toothId,
  treatments,
  onClose,
}: {
  toothId: ToothId;
  treatments: ToothTreatment[];
  onClose: () => void;
}) {
  const addTreatment = useDentalChartStore((state) => state.addTreatment);
  const [actId, setActId] = useState(DENTAL_ACTS[0]?.id ?? "");
  const total = treatments
    .filter((treatment) => treatment.status !== "cancelled")
    .reduce((sum, treatment) => sum + getActMeta(treatment.actId).price, 0);

  const handleAdd = () => {
    const act = DENTAL_ACTS.find((item) => item.id === actId);

    if (!act) return;

    new AddTreatmentUseCase(addTreatment).execute(act, toothId, [0, 0.2, 0]);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4"
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      exit={{opacity: 0}}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.section
        initial={{y: 24, scale: 0.98, opacity: 0}}
        animate={{y: 0, scale: 1, opacity: 1}}
        exit={{y: 18, scale: 0.98, opacity: 0}}
        transition={{duration: 0.18}}
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 p-5 dark:border-slate-800">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal-700 dark:text-teal-300">
              Tooth details
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-950 dark:text-white">
              Tooth {getToothFdi(toothId)}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {getToothLabel(toothId)}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close tooth treatment details"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <X size={18} />
          </button>
        </header>

        <div className="grid gap-3 border-b border-slate-200 p-5 dark:border-slate-800 sm:grid-cols-3">
          <Metric label="Acts applied" value={treatments.length.toString()} />
          <Metric
            label="Active"
            value={treatments
              .filter((treatment) => treatment.status !== "cancelled")
              .length.toString()}
          />
          <Metric label="Estimated fees" value={currencyFormatter.format(total)} />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {treatments.length > 0 ? (
            <div className="space-y-3">
              {treatments.map((treatment) => (
                <TreatmentRow key={treatment.id} treatment={treatment} />
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-slate-300 bg-slate-50 p-6 text-center dark:border-slate-700 dark:bg-slate-950">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                No acts applied to this tooth yet.
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Add one below or drag from the act library onto the tooth.
              </p>
            </div>
          )}
        </div>

        <footer className="border-t border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              value={actId}
              onChange={(event) => setActId(event.target.value)}
              className="h-11 min-w-0 flex-1 border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              {DENTAL_ACTS.map((act) => (
                <option key={act.id} value={act.id}>
                  {act.label} - {currencyFormatter.format(getActMeta(act.id).price)}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAdd}
              className="inline-flex h-11 items-center justify-center gap-2 bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800"
            >
              <Plus size={16} />
              Add act
            </button>
          </div>
        </footer>
      </motion.section>
    </motion.div>
  );
}

function TreatmentRow({treatment}: {treatment: ToothTreatment}) {
  const updateTreatment = useDentalChartStore((state) => state.updateTreatment);
  const removeTreatment = useDentalChartStore((state) => state.removeTreatment);
  const [note, setNote] = useState(treatment.notes ?? "");
  const Icon = ICONS[treatment.actIcon] ?? CircleDot;
  const meta = getActMeta(treatment.actId);
  const hasUnsavedNote = note.trim() !== (treatment.notes ?? "");
  const createdAt = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(treatment.createdAt));

  const updateStatus = (status: TreatmentStatus) => {
    new UpdateTreatmentStatusUseCase(updateTreatment).execute(treatment.id, status);
  };

  return (
    <article className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center border"
            style={{
              borderColor: `${treatment.actColor}55`,
              backgroundColor: `${treatment.actColor}14`,
              color: treatment.actColor,
            }}
          >
            <Icon size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-950 dark:text-white">
                {treatment.actLabel}
              </h3>
              <span
                className={`border px-2 py-0.5 text-xs font-medium ${STATUS_CLASS[treatment.status]}`}
              >
                {treatment.status.replace("_", " ")}
              </span>
            </div>
            <div className="mt-2 grid gap-2 text-xs text-slate-500 dark:text-slate-400 sm:grid-cols-4">
              <span>Code: {meta.code}</span>
              <span>Surface: {meta.surface}</span>
              <span>Duration: {meta.duration}</span>
              <span>Added: {createdAt}</span>
            </div>
          </div>
        </div>

        <div className="text-left lg:text-right">
          <p className="text-sm font-semibold text-slate-950 dark:text-white">
            {currencyFormatter.format(meta.price)}
          </p>
          <p className="mt-1 text-xs text-slate-500">Clinical fee</p>
        </div>
      </div>

      <textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="Clinical note, material, shade, surface detail..."
        className="mt-4 min-h-20 w-full resize-none border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-teal-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
      />

      <div className="mt-3 flex flex-wrap gap-2">
        {treatment.status !== "completed" && (
          <button
            type="button"
            onClick={() => updateStatus("completed")}
            className="inline-flex items-center gap-1 border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-200"
          >
            <CheckCircle2 size={14} />
            Complete
          </button>
        )}
        {treatment.status !== "in_progress" && treatment.status !== "completed" && (
          <button
            type="button"
            onClick={() => updateStatus("in_progress")}
            className="border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-200"
          >
            Start
          </button>
        )}
        {hasUnsavedNote && (
          <button
            type="button"
            onClick={() =>
              new SaveTreatmentNoteUseCase(updateTreatment).execute(
                treatment.id,
                note,
              )
            }
            className="bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-800"
          >
            Save note
          </button>
        )}
        <button
          type="button"
          onClick={() =>
            new RemoveTreatmentUseCase(removeTreatment).execute(treatment.id)
          }
          className="inline-flex items-center gap-1 border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-900/60 dark:hover:bg-red-950/30"
        >
          <Trash2 size={14} />
          Remove
        </button>
      </div>
    </article>
  );
}

export default TreatmentPage;
