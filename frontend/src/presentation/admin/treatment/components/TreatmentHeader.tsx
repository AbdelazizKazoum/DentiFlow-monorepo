import {Stethoscope} from "lucide-react";
import {currencyFormatter} from "../treatmentConfig";
import type {TreatmentTotals} from "../types";
import {Metric} from "./Metric";

export function TreatmentHeader({totals}: {totals: TreatmentTotals}) {
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
    </header>
  );
}
