"use client";

import {useState} from "react";
import {motion} from "framer-motion";
import {
  CheckCircle2,
  CircleDot,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import type {DentalAct, TreatmentStatus} from "@/domain/treatment/entities/dentalAct";
import type {
  ToothId,
  ToothTreatment,
} from "@/domain/treatment/entities/toothTreatment";
import {useTreatmentStore} from "@/presentation/stores/treatmentStore";
import {
  currencyFormatter,
  PREVIOUS_STATUS,
  STATUS_CLASS,
  TREATMENT_ICONS,
} from "../treatmentConfig";
import {getActMeta} from "../utils";
import {getToothFdi, getToothLabel} from "../data/toothNames.data";
import {Metric} from "./Metric";

interface ToothTreatmentModalProps {
  toothId: ToothId;
  treatments: ToothTreatment[];
  acts: DentalAct[];
  onClose: () => void;
}

export function ToothTreatmentModal({
  toothId,
  treatments,
  acts,
  onClose,
}: ToothTreatmentModalProps) {
  const addTreatment = useTreatmentStore((state) => state.addTreatment);
  const [actId, setActId] = useState(acts[0]?.id ?? "");
  const selectedActId = actId || acts[0]?.id || "";
  const total = treatments
    .filter((treatment) => treatment.status !== "cancelled")
    .reduce((sum, treatment) => sum + getActMeta(treatment.actId).price, 0);

  const handleAdd = () => {
    const act = acts.find((item) => item.id === selectedActId);

    if (!act) return;

    void addTreatment(act, toothId, [0, 0.2, 0]);
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
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden border border-ui-border bg-card shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-ui-border p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
              Tooth details
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-foreground">
              Tooth {getToothFdi(toothId)}
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              {getToothLabel(toothId)}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close tooth treatment details"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center text-text-muted transition hover:bg-surface-hover hover:text-foreground"
          >
            <X size={18} />
          </button>
        </header>

        <div className="grid gap-3 border-b border-ui-border p-5 sm:grid-cols-3">
          <Metric label="Acts applied" value={treatments.length.toString()} />
          <Metric
            label="Active"
            value={treatments
              .filter((treatment) => treatment.status !== "cancelled")
              .length.toString()}
          />
          <Metric
            label="Estimated fees"
            value={currencyFormatter.format(total)}
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {treatments.length > 0 ? (
            <div className="space-y-3">
              {treatments.map((treatment) => (
                <TreatmentRow key={treatment.id} treatment={treatment} />
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-ui-border bg-page p-6 text-center">
              <p className="text-sm font-medium text-foreground">
                No acts applied to this tooth yet.
              </p>
              <p className="mt-1 text-sm text-text-muted">
                Add one below or drag from the act library onto the tooth.
              </p>
            </div>
          )}
        </div>

        <footer className="border-t border-ui-border bg-page p-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              value={selectedActId}
              onChange={(event) => setActId(event.target.value)}
              className="h-11 min-w-0 flex-1 border border-ui-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary"
            >
              {acts.map((act) => (
                <option key={act.id} value={act.id}>
                  {act.label} -{" "}
                  {currencyFormatter.format(getActMeta(act.id).price)}
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
  const updateTreatmentStatus = useTreatmentStore(
    (state) => state.updateTreatmentStatus,
  );
  const saveTreatmentNote = useTreatmentStore((state) => state.saveTreatmentNote);
  const removeTreatment = useTreatmentStore((state) => state.removeTreatment);
  const [note, setNote] = useState(treatment.notes ?? "");
  const Icon = TREATMENT_ICONS[treatment.actIcon] ?? CircleDot;
  const meta = getActMeta(treatment.actId);
  const hasUnsavedNote = note.trim() !== (treatment.notes ?? "");
  const createdAt = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(treatment.createdAt));

  const updateStatus = (status: TreatmentStatus) => {
    void updateTreatmentStatus(treatment.id, status);
  };
  const previousStatus = PREVIOUS_STATUS[treatment.status];

  return (
    <article className="border border-ui-border bg-card p-4 shadow-sm">
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
              <h3 className="text-sm font-semibold text-foreground">
                {treatment.actLabel}
              </h3>
              <span
                className={`border px-2 py-0.5 text-xs font-medium ${STATUS_CLASS[treatment.status]}`}
              >
                {treatment.status.replace("_", " ")}
              </span>
            </div>
            <div className="mt-2 grid gap-2 text-xs text-text-muted sm:grid-cols-4">
              <span>Code: {meta.code}</span>
              <span>Surface: {meta.surface}</span>
              <span>Duration: {meta.duration}</span>
              <span>Added: {createdAt}</span>
            </div>
          </div>
        </div>

        <div className="text-left lg:text-right">
          <p className="text-sm font-semibold text-foreground">
            {currencyFormatter.format(meta.price)}
          </p>
          <p className="mt-1 text-xs text-text-muted">Clinical fee</p>
        </div>
      </div>

      <textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="Clinical note, material, shade, surface detail..."
        className="mt-4 min-h-20 w-full resize-none border border-ui-border bg-page px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-text-placeholder focus:border-primary"
      />

      <div className="mt-3 flex flex-wrap gap-2">
        {previousStatus && (
          <button
            type="button"
            onClick={() => updateStatus(previousStatus)}
            className="inline-flex items-center gap-1 border border-ui-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-hover"
            title={`Change status back to ${previousStatus.replace("_", " ")}`}
          >
            <RotateCcw size={14} />
            {treatment.status === "completed"
              ? "Reopen act"
              : treatment.status === "cancelled"
                ? "Restore as planned"
                : "Back to planned"}
          </button>
        )}
        {treatment.status !== "completed" &&
          treatment.status !== "cancelled" && (
            <button
              type="button"
              onClick={() => updateStatus("completed")}
              className="inline-flex items-center gap-1 border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-200"
            >
              <CheckCircle2 size={14} />
              Complete
            </button>
          )}
        {treatment.status !== "in_progress" &&
          treatment.status !== "completed" &&
          treatment.status !== "cancelled" && (
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
            onClick={() => void saveTreatmentNote(treatment.id, note)}
            className="bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-800"
          >
            Save note
          </button>
        )}
        <button
          type="button"
          onClick={() => void removeTreatment(treatment.id)}
          className="inline-flex items-center gap-1 border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-900/60 dark:hover:bg-red-950/30"
        >
          <Trash2 size={14} />
          Remove
        </button>
      </div>
    </article>
  );
}
