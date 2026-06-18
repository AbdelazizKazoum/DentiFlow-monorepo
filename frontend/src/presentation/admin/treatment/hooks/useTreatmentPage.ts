"use client";

import {useEffect, useMemo, useRef, useState} from "react";
import {
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import type {DentalAct} from "@/domain/treatment/entities/dentalAct";
import type {ToothId} from "@/domain/treatment/entities/toothTreatment";
import {useDentalChartStore} from "@/presentation/stores/dentalChartStore";
import {usePatientStore} from "@/presentation/stores/patientStore";
import {useTreatmentStore} from "@/presentation/stores/treatmentStore";
import type {DentalSceneHandle} from "../components/DentalScene/SceneExposer";
import type {TreatmentTab} from "../types";
import {
  calculateTreatmentTotals,
  filterTreatmentActs,
  groupTreatmentActs,
} from "../utils";

/**
 * Presentation orchestrator for the treatment workspace.
 * Keeps UI-only state here while treatment mutations go through treatmentStore.
 */
export function useTreatmentPage(patientId: string) {
  const sceneRef = useRef<DentalSceneHandle | null>(null);
  const [activeTab, setActiveTab] = useState<TreatmentTab>("chart");
  const [query, setQuery] = useState("");
  const [selectedModalTooth, setSelectedModalTooth] =
    useState<ToothId | null>(null);

  const draggingAct = useDentalChartStore((state) => state.draggingAct);
  const setDraggingAct = useDentalChartStore((state) => state.setDraggingAct);
  const setOrbitEnabled = useDentalChartStore((state) => state.setOrbitEnabled);
  const setSelectedTooth = useDentalChartStore((state) => state.setSelectedTooth);
  const setHoveredTooth = useDentalChartStore((state) => state.setHoveredTooth);

  const acts = useTreatmentStore((state) => state.acts);
  const treatments = useTreatmentStore((state) => state.treatments);
  const loadTreatmentWorkspace = useTreatmentStore((state) => state.loadWorkspace);
  const addTreatment = useTreatmentStore((state) => state.addTreatment);

  const patient = usePatientStore((state) =>
    state.patients.find((item) => item.id === patientId),
  );
  const getPatientById = usePatientStore((state) => state.getPatientById);
  const isLoadingPatient = usePatientStore((state) => state.isLoadingPatient);
  const patientError = usePatientStore((state) => state.patientError);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {distance: 6},
    }),
  );

  // Ensure the patient summary has data even when the user lands directly here.
  useEffect(() => {
    if (!patient) {
      void getPatientById(patientId);
    }
  }, [getPatientById, patient, patientId]);

  // Prepare catalog, open visit context, and already-recorded treatment acts.
  useEffect(() => {
    void loadTreatmentWorkspace({
      patientId,
      patientName: patient?.fullName,
      locale: "en",
    });
  }, [loadTreatmentWorkspace, patient?.fullName, patientId]);

  const filteredActs = useMemo(
    () => filterTreatmentActs(acts, query),
    [acts, query],
  );
  const groupedActs = useMemo(
    () => groupTreatmentActs(filteredActs),
    [filteredActs],
  );
  const totals = useMemo(
    () => calculateTreatmentTotals(treatments),
    [treatments],
  );

  // Disable 3D orbiting while an act is being dragged over the odontogram.
  const handleDragStart = (event: DragStartEvent) => {
    const act = event.active.data.current?.act as DentalAct | undefined;

    if (!act) return;

    setDraggingAct(act);
    setOrbitEnabled(false);
  };

  // Applies the dragged act to the drop target tooth and opens that tooth modal.
  const handleDragEnd = (event: DragEndEvent) => {
    const act = event.active.data.current?.act as DentalAct | undefined;
    const toothId = event.over?.data.current?.toothId as ToothId | undefined;

    if (act && toothId) {
      void addTreatment(act, toothId, [0, 0.2, 0]);
      setSelectedModalTooth(toothId);
      setSelectedTooth(toothId);
    }

    setDraggingAct(null);
    setOrbitEnabled(true);
  };

  // Restore chart interaction when drag is aborted outside a tooth target.
  const handleDragCancel = () => {
    setDraggingAct(null);
    setOrbitEnabled(true);
  };

  // Selects a tooth in both the 2D modal and the 3D chart highlight state.
  const openTooth = (toothId: ToothId) => {
    setSelectedModalTooth(toothId);
    setSelectedTooth(toothId);
  };

  // Clears the modal and any selected tooth highlight.
  const closeTooth = () => {
    setSelectedModalTooth(null);
    setSelectedTooth(null);
  };

  const selectedToothTreatments = selectedModalTooth
    ? treatments.filter((treatment) => treatment.toothId === selectedModalTooth)
    : [];

  return {
    activeTab,
    acts,
    draggingAct,
    groupedActs,
    isLoadingPatient,
    patient,
    patientError,
    query,
    sceneRef,
    selectedModalTooth,
    selectedToothTreatments,
    sensors,
    treatments,
    totals,
    closeTooth,
    handleDragCancel,
    handleDragEnd,
    handleDragStart,
    openTooth,
    setActiveTab,
    setHoveredTooth,
    setQuery,
  };
}
