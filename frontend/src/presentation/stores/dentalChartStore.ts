import {create} from "zustand";
import type {DentalAct} from "@/domain/treatment/entities/dentalAct";
import type {
  ToothId,
  ToothTreatment,
} from "@/domain/treatment/entities/toothTreatment";

interface DentalChartState {
  selectedToothId: ToothId | null;
  hoveredToothId: ToothId | null;
  draggingAct: DentalAct | null;
  orbitEnabled: boolean;
  treatments: ToothTreatment[];
  toothSurfacePositions: Record<ToothId, [number, number, number]>;
  popupOpen: boolean;
  setSelectedTooth: (id: ToothId | null) => void;
  setHoveredTooth: (id: ToothId | null) => void;
  setDraggingAct: (act: DentalAct | null) => void;
  setOrbitEnabled: (enabled: boolean) => void;
  setPopupOpen: (open: boolean) => void;
  setToothSurfacePosition: (
    id: ToothId,
    position: [number, number, number],
  ) => void;
  addTreatment: (treatment: ToothTreatment) => void;
  updateTreatment: (id: string, patch: Partial<ToothTreatment>) => void;
  removeTreatment: (id: string) => void;
}

export const useDentalChartStore = create<DentalChartState>((set) => ({
  selectedToothId: null,
  hoveredToothId: null,
  draggingAct: null,
  orbitEnabled: true,
  treatments: [],
  toothSurfacePositions: {},
  popupOpen: false,
  setSelectedTooth: (id) => set({selectedToothId: id, popupOpen: id !== null}),
  setHoveredTooth: (id) => set({hoveredToothId: id}),
  setDraggingAct: (act) => set({draggingAct: act}),
  setOrbitEnabled: (enabled) => set({orbitEnabled: enabled}),
  setPopupOpen: (open) => set({popupOpen: open}),
  setToothSurfacePosition: (id, position) =>
    set((state) => ({
      toothSurfacePositions: {
        ...state.toothSurfacePositions,
        [id]: position,
      },
    })),
  addTreatment: (treatment) =>
    set((state) => ({treatments: [...state.treatments, treatment]})),
  updateTreatment: (id, patch) =>
    set((state) => ({
      treatments: state.treatments.map((treatment) =>
        treatment.id === id ? {...treatment, ...patch} : treatment,
      ),
    })),
  removeTreatment: (id) =>
    set((state) => ({
      treatments: state.treatments.filter((treatment) => treatment.id !== id),
    })),
}));
