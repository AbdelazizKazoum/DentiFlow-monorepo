"use client";

import {useRef, useState} from "react";
import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {AnimatePresence} from "framer-motion";
import {PanelLeftOpen} from "lucide-react";
import {AddTreatmentUseCase} from "@/application/useCases/admin/treatment/addTreatmentUseCase";
import type {DentalAct} from "@/domain/treatment/entities/dentalAct";
import {useDentalChartStore} from "@/presentation/stores/dentalChartStore";
import {DentalScene} from "./components/DentalScene/DentalScene";
import type {DentalSceneHandle} from "./components/DentalScene/SceneExposer";
import {TreatmentPalette} from "./components/TreatmentPalette/TreatmentPalette";
import {ActCard} from "./components/TreatmentPalette/ActCard";
import {ToothPopup} from "./components/ToothPopup/ToothPopup";
import {useDentalDrop} from "./hooks/useDentalDrop";

export default function TreatmentPage() {
  const canvasWrapperRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<DentalSceneHandle | null>(null);
  const [mobilePaletteOpen, setMobilePaletteOpen] = useState(false);
  const draggingAct = useDentalChartStore((state) => state.draggingAct);
  const setDraggingAct = useDentalChartStore((state) => state.setDraggingAct);
  const setOrbitEnabled = useDentalChartStore((state) => state.setOrbitEnabled);
  const addTreatment = useDentalChartStore((state) => state.addTreatment);
  const selectedToothId = useDentalChartStore((state) => state.selectedToothId);
  const {resolveDrop} = useDentalDrop(canvasWrapperRef, sceneRef);

  const handleDragStart = (event: DragStartEvent) => {
    const act = event.active.data.current?.act as DentalAct | undefined;

    if (!act) {
      return;
    }

    setDraggingAct(act);
    setOrbitEnabled(false);
    setMobilePaletteOpen(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const act = event.active.data.current?.act as DentalAct | undefined;

    if (act) {
      const hit = resolveDrop(event);

      if (hit) {
        new AddTreatmentUseCase(addTreatment).execute(
          act,
          hit.toothId,
          hit.point,
        );
      }
    }

    setDraggingAct(null);
    setOrbitEnabled(true);
  };

  const handleDragCancel = () => {
    setDraggingAct(null);
    setOrbitEnabled(true);
  };

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <main className="relative flex h-[calc(100vh-0px)] min-h-[42rem] overflow-hidden bg-page rtl:flex-row-reverse">
        <TreatmentPalette
          mobileOpen={mobilePaletteOpen}
          onMobileClose={() => setMobilePaletteOpen(false)}
        />

        <section ref={canvasWrapperRef} className="min-w-0 flex-1">
          <DentalScene sceneRef={sceneRef} />
        </section>

        <AnimatePresence>{selectedToothId && <ToothPopup />}</AnimatePresence>

        <button
          type="button"
          aria-label="Open treatment palette"
          onClick={() => setMobilePaletteOpen(true)}
          className="fixed bottom-5 left-5 z-30 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-xl hover:bg-primary-dark lg:hidden"
        >
          <PanelLeftOpen size={20} />
        </button>
      </main>

      <DragOverlay dropAnimation={{duration: 180, easing: "ease-out"}}>
        {draggingAct ? <ActCard act={draggingAct} isDragOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
