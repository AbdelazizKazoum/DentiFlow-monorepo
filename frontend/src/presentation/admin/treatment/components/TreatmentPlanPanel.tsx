import {Info, Play} from "lucide-react";

type TreatmentStatus =
  | "proposed"
  | "accepted"
  | "scheduled"
  | "in_progress"
  | "completed"
  | "declined"
  | "cancelled"
  | "voided";

interface TreatmentPlanPanelItem {
  id: string;
  tooth: number | string;
  toothIds?: number[];
  surfaces: string[];
  act: string;
  priority: string;
  price: number;
  status: TreatmentStatus;
  treatmentGroupId?: string | null;
  chargeId?: string;
}

interface TreatmentGroupSummary {
  id: string;
  label: string;
  billingMode: "package" | "per_item";
}

interface TreatmentPlanPanelProps<TItem extends TreatmentPlanPanelItem> {
  treatmentPlan: TItem[];
  treatmentGroups: TreatmentGroupSummary[];
  getTreatmentLocationLabel: (item: TItem) => string;
  onStartTreatment: (item: TItem) => void;
  onOpenDetails: (item: TItem) => void;
  onChangeStatus: (
    id: string,
    status: Extract<TreatmentStatus, "cancelled" | "voided">,
    reason: string,
  ) => void;
}

const INACTIVE_STATUSES: TreatmentStatus[] = [
  "cancelled",
  "voided",
  "declined",
  "completed",
];

export function TreatmentPlanPanel<TItem extends TreatmentPlanPanelItem>({
  treatmentPlan,
  treatmentGroups,
  getTreatmentLocationLabel,
  onStartTreatment,
  onOpenDetails,
  onChangeStatus,
}: TreatmentPlanPanelProps<TItem>) {
  const activePlanItems = treatmentPlan.filter(
    (item) => !INACTIVE_STATUSES.includes(item.status),
  );

  return (
    <div className="p-4">
      {treatmentGroups
        .filter((group) =>
          treatmentPlan.some(
            (item) =>
              item.treatmentGroupId === group.id &&
              !INACTIVE_STATUSES.includes(item.status),
          ),
        )
        .map((group) => {
          const items = treatmentPlan.filter(
            (item) => item.treatmentGroupId === group.id,
          );
          const completed = items.filter(
            (item) => item.status === "completed",
          ).length;

          return (
            <div
              key={group.id}
              className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary-soft px-4 py-3"
            >
              <div>
                <p className="text-sm font-bold text-foreground">
                  {group.label}
                </p>
                <p className="text-xs text-text-muted">
                  Bulk treatment group ·{" "}
                  {group.billingMode === "per_item"
                    ? "Billed per tooth"
                    : "Package billing"}
                </p>
              </div>
              <span className="rounded-full bg-card px-2.5 py-1 text-xs font-bold text-primary">
                {completed}/{items.length} completed
              </span>
            </div>
          );
        })}

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Location</th>
              <th className="px-4 py-3 font-semibold">Treatment Act</th>
              <th className="px-4 py-3 font-semibold">Priority</th>
              <th className="px-4 py-3 font-semibold">Price</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {activePlanItems.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center h-7 px-2 bg-slate-100 rounded font-bold text-slate-700 border border-slate-200">
                    {getTreatmentLocationLabel(item)}
                  </span>
                  {item.surfaces.length > 0 && (
                    <div className="flex gap-1">
                      {item.surfaces.map((surface) => (
                        <span
                          key={surface}
                          className="px-1.5 py-0.5 text-[10px] font-bold bg-white border border-slate-300 rounded text-slate-600"
                        >
                          {surface}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 font-medium text-slate-800">
                  <div>{item.act}</div>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-text-muted">
                    <span className="rounded-full bg-primary-soft px-2 py-0.5 font-semibold text-primary">
                      {item.status.replace("_", " ")}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 font-semibold ${
                        item.chargeId
                          ? "bg-teal-50 text-teal-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {item.chargeId ? "Charge posted" : "Not charged"}
                    </span>
                    {item.treatmentGroupId && (
                      <span className="rounded-full border border-primary/20 bg-card px-2 py-0.5 font-semibold text-primary">
                        Grouped teeth
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                      item.priority === "High"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    {item.priority}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  ${item.price.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right flex justify-end gap-2">
                  <button
                    onClick={() => onOpenDetails(item)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded transition-colors"
                  >
                    <Info size={12} /> Details
                  </button>
                  <button
                    onClick={() => onStartTreatment(item)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-primary bg-primary-soft hover:bg-primary/15 border border-primary/25 rounded transition-colors"
                  >
                    <Play size={12} fill="currentColor" />{" "}
                    {item.status === "in_progress" ? "Continue" : "Start"}
                  </button>
                  <button
                    onClick={() =>
                      onChangeStatus(
                        item.id,
                        "cancelled",
                        "Cancelled from treatment plan",
                      )
                    }
                    className="px-2.5 py-1 text-xs font-semibold text-amber-800 border border-amber-200 bg-amber-50 rounded transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() =>
                      onChangeStatus(item.id, "voided", "Entered in error")
                    }
                    className="px-2.5 py-1 text-xs font-semibold text-red-700 border border-red-200 bg-red-50 rounded transition-colors"
                  >
                    Void
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
