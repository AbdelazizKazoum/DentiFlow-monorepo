import {create} from "zustand";
import {toast} from "sonner";
import type {ActCatalog} from "@/domain/treatment/entities/ActCatalog";
import type {
  TreatmentAct,
  TreatmentActStatus,
} from "@/domain/treatment/entities/TreatmentAct";
import type {Visit} from "@/domain/treatment/entities/Visit";
import type {DentalAct, TreatmentStatus} from "@/domain/treatment/entities/dentalAct";
import type {
  ToothId,
  ToothTreatment,
} from "@/domain/treatment/entities/toothTreatment";
import {
  addTreatmentActUseCase,
  confirmVisitUseCase,
  getActCatalogUseCase,
  getOpenVisitsUseCase,
  getVisitDetailUseCase,
  removeTreatmentActUseCase,
  updateTreatmentActUseCase,
} from "@/infrastructure/container";
import {useDentalChartStore} from "./dentalChartStore";

const clinicId =
  process.env.NEXT_PUBLIC_DEFAULT_CLINIC_ID ??
  "00000000-0000-4000-8000-000000000001";
const currentUserId =
  process.env.NEXT_PUBLIC_MOCK_USER_ID ??
  "00000000-0000-4000-8000-000000000010";

const ACT_UI: Record<string, Pick<DentalAct, "category" | "colorHex" | "icon">> = {
  caries: {category: "Diagnostic", colorHex: "#EF4444", icon: "AlertCircle"},
  filling: {category: "Restorative", colorHex: "#3B82F6", icon: "CircleDot"},
  crown: {category: "Prosthetic", colorHex: "#F59E0B", icon: "Crown"},
  implant: {category: "Surgical", colorHex: "#8B5CF6", icon: "Anchor"},
  extraction: {category: "Surgical", colorHex: "#374151", icon: "X"},
  root_canal: {category: "Endodontic", colorHex: "#DC2626", icon: "Zap"},
  whitening: {category: "Cosmetic", colorHex: "#60A5FA", icon: "Sun"},
  orthodontics: {
    category: "Orthodontic",
    colorHex: "#FCD34D",
    icon: "GitCommitHorizontal",
  },
};

const statusToUi: Record<TreatmentActStatus, TreatmentStatus> = {
  PLANNED: "planned",
  IN_PROGRESS: "in_progress",
  DONE: "completed",
  CANCELLED: "cancelled",
};

const statusToDomain: Record<TreatmentStatus, TreatmentActStatus> = {
  planned: "PLANNED",
  in_progress: "IN_PROGRESS",
  completed: "DONE",
  cancelled: "CANCELLED",
};

interface TreatmentStoreState {
  catalog: ActCatalog[];
  acts: DentalAct[];
  currentVisit: Visit | null;
  treatments: ToothTreatment[];
  isLoading: boolean;
  isSaving: boolean;
  /**
   * Opens the patient treatment workspace.
   * Loads the act catalog and the existing open visit created by the waiting
   * room seating workflow. It does not create visits from page navigation.
   */
  loadWorkspace: (params: {
    patientId: string;
    patientName?: string;
    locale?: "ar" | "fr" | "en";
  }) => Promise<void>;
  /**
   * Adds a catalog act to a tooth in the current open visit.
   * Use this from drag/drop or the tooth modal after a workspace has loaded.
   */
  addTreatment: (
    act: DentalAct,
    toothId: ToothId,
    position?: [number, number, number],
  ) => Promise<ToothTreatment>;
  /**
   * Changes the clinical workflow status for an existing treatment act.
   * The store translates UI status names into treatment domain status values.
   */
  updateTreatmentStatus: (
    treatmentId: string,
    status: TreatmentStatus,
  ) => Promise<void>;
  /**
   * Persists a free-text clinical note for one treatment act.
   * Pass raw textarea content; trimming is handled by the store.
   */
  saveTreatmentNote: (treatmentId: string, notes: string) => Promise<void>;
  /**
   * Removes a treatment act from the current open visit and refreshes chart data.
   * Use only for acts that are still editable according to visit lifecycle rules.
   */
  removeTreatment: (treatmentId: string) => Promise<void>;
  /**
   * Confirms the current visit after clinical review.
   * The use case enforces that at least one act is completed before sign-off.
   */
  confirmVisit: () => Promise<void>;
}

function getMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function getLocalizedName(catalog: ActCatalog, locale: "ar" | "fr" | "en") {
  if (locale === "ar") return catalog.nameAr;
  if (locale === "fr") return catalog.nameFr;
  return catalog.nameEn;
}

function toDentalAct(catalog: ActCatalog, locale: "ar" | "fr" | "en"): DentalAct {
  const ui = ACT_UI[catalog.id] ?? {
    category: "Clinical",
    colorHex: "#0f8aa3",
    icon: "CircleDot",
  };

  return {
    id: catalog.id,
    label: getLocalizedName(catalog, locale),
    defaultStatus: "planned",
    ...ui,
  };
}

function toothIdToFdi(toothId: ToothId): string | undefined {
  const [, fdi] = toothId.split("_");
  return fdi || undefined;
}

function fdiToToothId(toothFdi?: string): ToothId {
  return toothFdi ? `tooth_${toothFdi}` : "tooth_11";
}

function toToothTreatment(
  act: TreatmentAct,
  catalog: ActCatalog[],
  locale: "ar" | "fr" | "en",
): ToothTreatment {
  const catalogItem = catalog.find((item) => item.id === act.actCatalogId);
  const dentalAct = catalogItem
    ? toDentalAct(catalogItem, locale)
    : ({
        id: act.actCatalogId,
        label: "Clinical act",
        category: "Clinical",
        colorHex: "#0f8aa3",
        defaultStatus: "planned",
        icon: "CircleDot",
      } satisfies DentalAct);

  return {
    id: act.id,
    toothId: fdiToToothId(act.toothFdi),
    actId: act.actCatalogId,
    actLabel: dentalAct.label,
    actIcon: dentalAct.icon,
    actColor: dentalAct.colorHex,
    status: statusToUi[act.status],
    position: [0, 0.2, 0],
    notes: act.notes,
    createdAt: act.createdAt.toISOString(),
  };
}

/**
 * Keeps the legacy/3D chart renderer in sync while treatment data is owned by
 * the treatment store and domain use cases.
 */
function syncChartTreatments(treatments: ToothTreatment[]) {
  useDentalChartStore.getState().setTreatments(treatments);
}

export const useTreatmentStore = create<TreatmentStoreState>((set, get) => ({
  catalog: [],
  acts: [],
  currentVisit: null,
  treatments: [],
  isLoading: false,
  isSaving: false,

  // Entry point for the page: prepares catalog, visit context, and chart state.
  loadWorkspace: async ({patientId, locale = "en"}) => {
    set({isLoading: true});
    try {
      const catalog = await getActCatalogUseCase.execute({
        clinicId,
        locale,
      });
      const openVisits = await getOpenVisitsUseCase.execute({clinicId});
      const visit =
        openVisits.items.find((item) => item.patientId === patientId) ?? null;

      if (!visit) {
        syncChartTreatments([]);
        set({
          catalog,
          acts: catalog.map((item) => toDentalAct(item, locale)),
          currentVisit: null,
          treatments: [],
          isLoading: false,
        });
        toast.info("Seat this patient from the waiting room before treatment.");
        return;
      }

      const detail = await getVisitDetailUseCase.execute({
        visitId: visit.id,
        clinicId,
      });
      const treatments = (detail.treatmentActs ?? []).map((act) =>
        toToothTreatment(act, catalog, locale),
      );

      syncChartTreatments(treatments);
      set({
        catalog,
        acts: catalog.map((item) => toDentalAct(item, locale)),
        currentVisit: detail,
        treatments,
        isLoading: false,
      });
    } catch (error) {
      set({isLoading: false});
      toast.error(getMessage(error, "Failed to load treatment workspace"));
    }
  },

  // Called by both drag/drop and modal add flows after the workspace is ready.
  addTreatment: async (act, toothId, position = [0, 0.2, 0]) => {
    const visit = get().currentVisit;

    if (!visit) {
      throw new Error("Open a visit before adding treatment acts.");
    }

    set({isSaving: true});
    try {
      const created = await addTreatmentActUseCase.execute({
        visitId: visit.id,
        actCatalogId: act.id,
        toothFdi: toothIdToFdi(toothId),
        status: statusToDomain[act.defaultStatus],
        enteredBy: currentUserId,
        clinicId,
      });
      const treatment = {
        // The domain entity stores FDI/tooth data; the odontogram needs its UI
        // marker position as a separate presentation concern.
        ...toToothTreatment(created, get().catalog, "en"),
        position,
      };

      set((state) => {
        const treatments = [...state.treatments, treatment];
        syncChartTreatments(treatments);
        return {
          treatments,
          isSaving: false,
          currentVisit: state.currentVisit
            ? {
                ...state.currentVisit,
                totalAmount:
                  state.currentVisit.totalAmount +
                  created.quantity * created.unitPrice,
              }
            : state.currentVisit,
        };
      });
      return treatment;
    } catch (error) {
      set({isSaving: false});
      toast.error(getMessage(error, "Failed to add treatment act"));
      throw error;
    }
  },

  // Status changes stay optimistic in presentation state after the use case
  // accepts the command, so the chart markers update immediately.
  updateTreatmentStatus: async (treatmentId, status) => {
    set({isSaving: true});
    try {
      await updateTreatmentActUseCase.execute({
        treatmentActId: treatmentId,
        status: statusToDomain[status],
      });
      set((state) => {
        const treatments = state.treatments.map((item) =>
          item.id === treatmentId ? {...item, status} : item,
        );
        syncChartTreatments(treatments);
        return {treatments, isSaving: false};
      });
    } catch (error) {
      set({isSaving: false});
      toast.error(getMessage(error, "Failed to update treatment status"));
      throw error;
    }
  },

  // Notes are edited locally in the row component and committed through this
  // action when the user chooses to save.
  saveTreatmentNote: async (treatmentId, notes) => {
    set({isSaving: true});
    try {
      await updateTreatmentActUseCase.execute({
        treatmentActId: treatmentId,
        notes: notes.trim(),
      });
      set((state) => {
        const treatments = state.treatments.map((item) =>
          item.id === treatmentId ? {...item, notes: notes.trim()} : item,
        );
        syncChartTreatments(treatments);
        return {treatments, isSaving: false};
      });
    } catch (error) {
      set({isSaving: false});
      toast.error(getMessage(error, "Failed to save treatment note"));
      throw error;
    }
  },

  // Delete the act through the domain use case, then remove its UI projection.
  removeTreatment: async (treatmentId) => {
    const visit = get().currentVisit;

    if (!visit) {
      throw new Error("Open a visit before removing treatment acts.");
    }

    set({isSaving: true});
    try {
      await removeTreatmentActUseCase.execute({
        treatmentActId: treatmentId,
        visitId: visit.id,
      });
      set((state) => {
        const treatments = state.treatments.filter(
          (item) => item.id !== treatmentId,
        );
        syncChartTreatments(treatments);
        return {treatments, isSaving: false};
      });
    } catch (error) {
      set({isSaving: false});
      toast.error(getMessage(error, "Failed to remove treatment act"));
      throw error;
    }
  },

  // Sign-off action for the active visit; billing/closing can be layered on
  // top of the confirmed visit state later.
  confirmVisit: async () => {
    const visit = get().currentVisit;

    if (!visit) {
      throw new Error("Open a visit before confirming.");
    }

    set({isSaving: true});
    try {
      const confirmed = await confirmVisitUseCase.execute({
        visitId: visit.id,
        confirmedBy: currentUserId,
      });
      set({currentVisit: confirmed, isSaving: false});
      toast.success("Visit confirmed");
    } catch (error) {
      set({isSaving: false});
      toast.error(getMessage(error, "Failed to confirm visit"));
      throw error;
    }
  },
}));
