"use client";

import {DndContext, DragOverlay} from "@dnd-kit/core";
import {AnimatePresence} from "framer-motion";
import {useRouter} from "next/navigation";
import {useState} from "react";
import {ActGhost, ActPalette} from "./components/ActPalette";
import {PatientSummaryCard} from "./components/PatientSummaryCard";
import {ToothTreatmentModal} from "./components/ToothTreatmentModal";
import {TreatmentHeader} from "./components/TreatmentHeader";
import {ConfirmVisitDialog} from "./components/ConfirmVisitDialog";
import {TreatmentWorkspace} from "./components/TreatmentWorkspace";
import {useTreatmentPage} from "./hooks/useTreatmentPage";

interface TreatmentPageProps {
  visitId: string;
}

function TreatmentPage({visitId}: TreatmentPageProps) {
  const hook = useTreatmentPage(visitId);
  const router = useRouter();
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const handleConfirmVisit = async () => {
    await hook.confirmVisit();
    router.push("/admin/waiting-room");
  };

  return (
    <DndContext
      sensors={hook.sensors}
      onDragStart={hook.handleDragStart}
      onDragEnd={hook.handleDragEnd}
      onDragCancel={hook.handleDragCancel}
    >
      <main className="min-h-screen bg-page text-foreground">
        <div className="mx-auto flex min-h-screen w-full max-w-[1800px] flex-col gap-4 px-4 py-4 lg:px-6">
          <TreatmentHeader
            totals={hook.totals}
            visit={hook.currentVisit}
            isSaving={hook.isSaving}
            onConfirm={() => setIsConfirmDialogOpen(true)}
          />

          <PatientSummaryCard
            patient={hook.patient}
            isLoading={hook.isLoadingPatient}
            error={hook.patientError}
          />

          <div className="flex flex-1 flex-col gap-4 xl:flex-row">
            <ActPalette
              groupedActs={hook.groupedActs}
              query={hook.query}
              onQueryChange={hook.setQuery}
            />

            <TreatmentWorkspace
              activeTab={hook.activeTab}
              treatments={hook.treatments}
              planItems={hook.planItems}
              sceneRef={hook.sceneRef}
              onTabChange={hook.setActiveTab}
              onOpenTooth={hook.openTooth}
              onHoverTooth={hook.setHoveredTooth}
            />
          </div>
        </div>
      </main>

      <AnimatePresence>
        {isConfirmDialogOpen && (
          <ConfirmVisitDialog
            isSubmitting={hook.isSaving}
            onCancel={() => setIsConfirmDialogOpen(false)}
            onConfirm={() => void handleConfirmVisit()}
          />
        )}
        {hook.selectedModalTooth && (
          <ToothTreatmentModal
            toothId={hook.selectedModalTooth}
            treatments={hook.selectedToothTreatments}
            acts={hook.acts}
            onClose={hook.closeTooth}
          />
        )}
      </AnimatePresence>

      <DragOverlay dropAnimation={{duration: 160, easing: "ease-out"}}>
        {hook.draggingAct ? <ActGhost act={hook.draggingAct} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

export default TreatmentPage;
