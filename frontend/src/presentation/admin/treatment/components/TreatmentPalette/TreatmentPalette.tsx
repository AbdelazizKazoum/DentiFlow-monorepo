"use client";

import {useMemo, useState} from "react";
import {ChevronDown, ChevronUp} from "lucide-react";
import {DENTAL_ACTS} from "../../data/dentalActs.data";
import {ActCard} from "./ActCard";

interface TreatmentPaletteProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function TreatmentPalette({
  mobileOpen = false,
  onMobileClose,
}: TreatmentPaletteProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const groups = useMemo(() => {
    return DENTAL_ACTS.reduce<Record<string, typeof DENTAL_ACTS>>(
      (acc, act) => {
        acc[act.category] = [...(acc[act.category] ?? []), act];
        return acc;
      },
      {},
    );
  }, []);

  const content = (
    <>
      <div className="border-b border-ui-border px-5 py-4">
        <p className="text-sm font-semibold text-foreground">Treatment Acts</p>
        <p className="mt-1 text-xs text-text-muted">Drag an act onto a tooth.</p>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {Object.entries(groups).map(([category, acts]) => {
          const isCollapsed = collapsed[category] ?? false;

          return (
            <section key={category} className="mb-4 last:mb-0">
              <button
                type="button"
                className="mb-2 flex w-full items-center justify-between rounded-md px-1 py-1 text-xs font-semibold uppercase tracking-[0.04em] text-text-muted"
                onClick={() =>
                  setCollapsed((state) => ({
                    ...state,
                    [category]: !isCollapsed,
                  }))
                }
              >
                <span>{category}</span>
                {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
              </button>

              {!isCollapsed && (
                <div className="space-y-2">
                  {acts.map((act) => (
                    <ActCard key={act.id} act={act} />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden h-full w-80 shrink-0 flex-col border-r border-ui-border bg-card lg:flex rtl:border-l rtl:border-r-0">
        {content}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onMobileClose}>
          <aside
            className="absolute bottom-0 left-0 right-0 max-h-[78vh] rounded-t-xl border-t border-ui-border bg-card shadow-2xl md:max-h-[44vh]"
            onClick={(event) => event.stopPropagation()}
          >
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
