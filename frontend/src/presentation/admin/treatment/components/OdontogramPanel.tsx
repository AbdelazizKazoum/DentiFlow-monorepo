import type {ComponentType} from "react";
import {Stethoscope} from "lucide-react";

interface DentitionModeOption {
  id: "adult" | "child" | "mixed";
  label: string;
}

interface ChartRow {
  id: string;
  label: string;
  right: number[];
  left: number[];
  compact: boolean;
}

interface ChartRows {
  upper: ChartRow[];
  lower: ChartRow[];
}

interface OdontogramPanelProps {
  chartRows: ChartRows;
  dentitionLabel: string;
  dentitionMode: "adult" | "child" | "mixed";
  dentitionModes: readonly DentitionModeOption[];
  ToothComponent: ComponentType<{number: number}>;
  labels: {
    title: string;
    midline: string;
    legend: {
      filling: string;
      rootCanal: string;
      crown: string;
      pathology: string;
    };
  };
  onDentitionModeChange: (mode: "adult" | "child" | "mixed") => void;
}

export function OdontogramPanel({
  chartRows,
  dentitionLabel,
  dentitionMode,
  dentitionModes,
  ToothComponent,
  labels,
  onDentitionModeChange,
}: OdontogramPanelProps) {
  return (
    <div className="bg-white m-4 rounded-xl border border-slate-200 shadow-sm p-5 select-none">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Stethoscope size={20} className="text-primary" />
            {labels.title} ({dentitionLabel})
          </h2>
          <div className="flex rounded-lg border border-ui-border bg-card p-0.5">
            {dentitionModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => onDentitionModeChange(mode.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                  dentitionMode === mode.id
                    ? "bg-primary text-white shadow-sm"
                    : "text-slate-500 hover:bg-surface-hover"
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4 text-xs font-medium text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
          <LegendSwatch colorClass="bg-emerald-500" label={labels.legend.filling} />
          <LegendSwatch colorClass="bg-rose-500" label={labels.legend.rootCanal} />
          <LegendSwatch colorClass="bg-yellow-500" label={labels.legend.crown} />
          <LegendSwatch colorClass="bg-red-500" label={labels.legend.pathology} />
        </div>
      </div>

      <div className="flex flex-col gap-10 items-center py-4">
        {chartRows.upper.map((row) => (
          <ChartArch
            key={row.id}
            row={row}
            dentitionMode={dentitionMode}
            ToothComponent={ToothComponent}
          />
        ))}

        <div className="w-full max-w-4xl h-px bg-slate-200 relative">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-slate-400 font-bold uppercase tracking-widest rounded-full border border-slate-100">
            {labels.midline}
          </div>
        </div>

        {chartRows.lower.map((row) => (
          <ChartArch
            key={row.id}
            row={row}
            dentitionMode={dentitionMode}
            ToothComponent={ToothComponent}
          />
        ))}
      </div>
    </div>
  );
}

function LegendSwatch({
  colorClass,
  label,
}: {
  colorClass: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1">
      <div className={`w-3 h-3 ${colorClass} rounded-sm`} /> {label}
    </div>
  );
}

function ChartArch({
  row,
  dentitionMode,
  ToothComponent,
}: {
  row: ChartRow;
  dentitionMode: "adult" | "child" | "mixed";
  ToothComponent: ComponentType<{number: number}>;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      {dentitionMode === "mixed" && (
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {row.label}
        </p>
      )}
      <div
        className={`flex gap-6 ${row.compact ? "scale-90 origin-center" : ""}`}
      >
        <div className="flex gap-2">
          {row.right.map((num) => (
            <ToothComponent key={`${row.id}-${num}`} number={num} />
          ))}
        </div>
        <div className="w-px bg-slate-300 mx-2" />
        <div className="flex gap-2">
          {row.left.map((num) => (
            <ToothComponent key={`${row.id}-${num}`} number={num} />
          ))}
        </div>
      </div>
    </div>
  );
}
