"use client";

import {useEffect, useMemo, useRef, useState} from "react";
import {motion} from "framer-motion";
import {Plus, X} from "lucide-react";
import {AddTreatmentUseCase} from "@/application/useCases/admin/treatment/addTreatmentUseCase";
import {useDentalChartStore} from "@/presentation/stores/dentalChartStore";
import {DENTAL_ACTS} from "../../data/dentalActs.data";
import {getToothFdi, getToothLabel} from "../../data/toothNames.data";
import {TreatmentListItem} from "./TreatmentListItem";

export function ToothPopup() {
  const selectedToothId = useDentalChartStore((state) => state.selectedToothId);
  const treatments = useDentalChartStore((state) => state.treatments);
  const setSelectedTooth = useDentalChartStore((state) => state.setSelectedTooth);
  const addTreatment = useDentalChartStore((state) => state.addTreatment);
  const toothSurfacePositions = useDentalChartStore(
    (state) => state.toothSurfacePositions,
  );
  const [actId, setActId] = useState(DENTAL_ACTS[0]?.id ?? "");
  const headerRef = useRef<HTMLHeadingElement | null>(null);
  const isRtl =
    typeof document !== "undefined" && document.documentElement.dir === "rtl";

  const toothTreatments = useMemo(
    () =>
      selectedToothId
        ? treatments.filter((treatment) => treatment.toothId === selectedToothId)
        : [],
    [selectedToothId, treatments],
  );

  useEffect(() => {
    headerRef.current?.focus();
  }, [selectedToothId]);

  if (!selectedToothId) {
    return null;
  }

  const handleAddAct = () => {
    const act = DENTAL_ACTS.find((item) => item.id === actId);

    if (!act) {
      return;
    }

    new AddTreatmentUseCase(addTreatment).execute(
      act,
      selectedToothId,
      toothSurfacePositions[selectedToothId] ?? [0, 0.2, 0],
    );
  };

  return (
    <motion.aside
      initial={{x: isRtl ? "-100%" : "100%", opacity: 0}}
      animate={{x: 0, opacity: 1}}
      exit={{x: isRtl ? "-100%" : "100%", opacity: 0}}
      transition={{type: "spring", stiffness: 320, damping: 30}}
      className="fixed inset-x-0 bottom-0 z-30 max-h-[72vh] overflow-y-auto border-t border-ui-border bg-card shadow-2xl md:max-h-[46vh] xl:static xl:h-full xl:max-h-none xl:w-96 xl:shrink-0 xl:border-l xl:border-t-0 rtl:xl:border-l-0 rtl:xl:border-r"
    >
      <div className="sticky top-0 z-10 border-b border-ui-border bg-card px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              ref={headerRef}
              tabIndex={-1}
              className="outline-none text-2xl font-semibold text-foreground"
            >
              Tooth {getToothFdi(selectedToothId)}
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              {getToothLabel(selectedToothId)}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close tooth detail panel"
            onClick={() => setSelectedTooth(null)}
            className="rounded-md p-2 text-text-muted hover:bg-surface-hover hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>
        <div className="mt-3 inline-flex rounded-full bg-primary-soft px-2.5 py-1 text-xs font-medium text-primary">
          {toothTreatments.length} treatments
        </div>
      </div>

      <div className="space-y-3 px-5 py-4">
        {toothTreatments.length > 0 ? (
          toothTreatments.map((treatment) => (
            <TreatmentListItem key={treatment.id} treatment={treatment} />
          ))
        ) : (
          <p className="rounded-lg border border-dashed border-ui-border bg-page p-4 text-sm text-text-muted">
            No treatments recorded for this tooth.
          </p>
        )}
      </div>

      <div className="sticky bottom-0 border-t border-ui-border bg-card px-5 py-4">
        <div className="flex gap-2">
          <select
            value={actId}
            onChange={(event) => setActId(event.target.value)}
            className="min-w-0 flex-1 rounded-md border border-ui-border bg-page px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          >
            {DENTAL_ACTS.map((act) => (
              <option key={act.id} value={act.id}>
                {act.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleAddAct}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            <Plus size={16} />
            Add Act
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
