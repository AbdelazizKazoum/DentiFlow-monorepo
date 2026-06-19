import {CheckCircle2, LockKeyhole, Stethoscope} from "lucide-react";
import type {Visit} from "@/domain/treatment/entities/Visit";
import {currencyFormatter} from "../treatmentConfig";
import type {TreatmentTotals} from "../types";
import {Metric} from "./Metric";

export function TreatmentHeader({totals, visit, isSaving, onConfirm}: {totals: TreatmentTotals; visit: Visit | null; isSaving: boolean; onConfirm: () => void}) {
  const isOpen = visit?.status === "OPEN";
  return (
    <header className="flex flex-col gap-4 rounded-2xl border border-ui-border bg-card px-5 py-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
          <Stethoscope size={15} />
          Clinical treatment planning
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          Odontogram and act application
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Drag clinical acts onto teeth, review tooth history, and keep the 3D
          model for visual confirmation.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Metric label="Teeth" value={totals.teeth.toString()} />
        <Metric label="Planned" value={totals.planned.toString()} />
        <Metric label="Done" value={totals.completed.toString()} />
        <Metric
          label="Estimate"
          value={currencyFormatter.format(totals.amount)}
        />
      </div>

      <div className="flex flex-col items-stretch gap-2 sm:items-end">
        {isOpen ? (
          <button type="button" onClick={onConfirm} disabled={isSaving} className="inline-flex h-11 items-center justify-center gap-2 bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50">
            <CheckCircle2 size={17} /> {isSaving ? "Confirming…" : "Confirm clinical visit"}
          </button>
        ) : (
          <span className="inline-flex items-center justify-center gap-2 border border-ui-border px-4 py-3 text-sm font-semibold text-text-muted"><LockKeyhole size={16} /> Visit {visit?.status?.toLowerCase() ?? "unavailable"}</span>
        )}
        <p className="max-w-xs text-right text-xs text-text-muted">Clinical sign-off locks this visit. Reception can then complete checkout or mark the queue entry done.</p>
      </div>
    </header>
  );
}
