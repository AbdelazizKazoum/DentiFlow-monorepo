import type {LucideIcon} from "lucide-react";
import {FileText, History, Play} from "lucide-react";
import {useTranslations} from "next-intl";
import type {TreatmentWorkspaceTab} from "../store/useTreatmentWorkspaceStore";

interface TreatmentTabsProps {
  activeTab: TreatmentWorkspaceTab;
  currentSessionCount: number;
  treatmentPlanCount: number;
  onChange: (tab: TreatmentWorkspaceTab) => void;
}

const TABS: Array<{
  id: TreatmentWorkspaceTab;
  labelKey: "currentSession" | "treatmentPlan" | "clinicalHistory";
  icon: LucideIcon;
  getCount: (props: TreatmentTabsProps) => number;
}> = [
  {
    id: "session",
    labelKey: "currentSession",
    icon: Play,
    getCount: (props) => props.currentSessionCount,
  },
  {
    id: "plan",
    labelKey: "treatmentPlan",
    icon: FileText,
    getCount: (props) => props.treatmentPlanCount,
  },
  {
    id: "history",
    labelKey: "clinicalHistory",
    icon: History,
    getCount: () => 12,
  },
];

export function TreatmentTabs(props: TreatmentTabsProps) {
  const t = useTranslations("admin.treatment.tabs");

  return (
    <div className="flex border-b border-slate-200 px-2 overflow-x-auto bg-slate-50/50 rounded-t-xl">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const count = tab.getCount(props);

        return (
          <button
            key={tab.id}
            onClick={() => props.onChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              props.activeTab === tab.id
                ? "border-primary text-primary bg-card"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            }`}
          >
            <Icon size={16} />
            {t(tab.labelKey)}
            {count > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-xs ${
                  props.activeTab === tab.id
                    ? "bg-primary-soft text-primary"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
