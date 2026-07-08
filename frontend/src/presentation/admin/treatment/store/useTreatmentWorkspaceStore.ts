import {create} from "zustand";
import {toast} from "sonner";
import type {SurfaceCode} from "@/domain/treatment/entities";
import type {
  AddDiagnosisCommand,
  AddTreatmentPlanItemCommand,
  ChangeTreatmentStatusCommand,
  CloseVisitCommand,
  CompleteVisitProcedureCommand,
  SaveVisitHandoffCommand,
  StartTreatmentCommand,
} from "@/application/treatment/commands";
import {
  changeTreatmentStatusWithRepositoryUseCase,
  closeVisitWithRepositoryUseCase,
  completeVisitProcedureWithRepositoryUseCase,
  createTreatmentDiagnosisUseCase,
  createTreatmentPlanItemsUseCase,
  getPatientByIdUseCase,
  getTreatmentWorkspaceUseCase,
  saveClinicalAttachmentsUseCase,
  saveVisitHandoffWithRepositoryUseCase,
  startTreatmentWithRepositoryUseCase,
} from "@/infrastructure/container";
import type {Patient} from "@/domain/patient/entities/patient";
import {
  fromDomainDentalAct,
  fromDomainClinicalAttachment,
  fromDomainDiagnosis,
  fromDomainDocumentType,
  fromDomainFollowUpUrgency,
  fromDomainTreatmentCharge,
  fromDomainTreatmentGroup,
  fromDomainTreatmentPlanItem,
  fromDomainVisitHandoff,
  fromDomainVisitProcedure,
  toDomainDentalAct,
  toDomainClinicalAttachment,
  toDomainVisitHandoff,
} from "@/infrastructure/treatment/mappers";
import type {
  TreatmentPageActiveVisitDTO,
  TreatmentPageClinicalAttachmentDTO,
  TreatmentPageDentalActDTO,
  TreatmentPageDiagnosisDTO,
  TreatmentPageDocumentRequestDTO,
  TreatmentPageFollowUpRequestDTO,
  TreatmentPagePatientDTO,
  TreatmentPageTreatmentChargeDTO,
  TreatmentPageTreatmentGroupDTO,
  TreatmentPageTreatmentPlanItemDTO,
  TreatmentPageVisitLifecycleStatus,
  TreatmentPageVisitHandoffDTO,
  TreatmentPageVisitProcedureDTO,
} from "@/infrastructure/treatment/dtos";
import {TREATMENT_DEMO_PATIENT} from "@/infrastructure/treatment/inMemory";

export type TreatmentWorkspaceTab = "session" | "plan" | "history";
export type TreatmentInspectorMode = "act" | "diagnosis" | "details";
export type TreatmentDentitionMode = "adult" | "child" | "mixed";

const calculateAge = (dateOfBirth?: Date): number => {
  if (!dateOfBirth) return 0;

  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const hasBirthdayPassed =
    today.getMonth() > dateOfBirth.getMonth() ||
    (today.getMonth() === dateOfBirth.getMonth() &&
      today.getDate() >= dateOfBirth.getDate());

  if (!hasBirthdayPassed) age -= 1;

  return Math.max(age, 0);
};

const toTreatmentPatient = (patient: Patient): TreatmentPagePatientDTO => ({
  id: patient.id,
  name: patient.fullName,
  age: calculateAge(patient.dateOfBirth),
  gender: patient.gender
    ? patient.gender.charAt(0) + patient.gender.slice(1).toLowerCase()
    : "Unknown",
  phone: patient.phone ?? "No phone",
  alerts: patient.allergies ? [`Allergies: ${patient.allergies}`] : [],
  balance: 0,
});

const fromDomainVisitLifecycleStatus = (
  status: string,
): TreatmentPageVisitLifecycleStatus => {
  switch (status) {
    case "CLOSED":
      return "closed";
    case "NEEDS_CODING":
      return "needs_coding";
    default:
      return "open";
  }
};

interface TreatmentWorkspaceStoreState {
  patient: TreatmentPagePatientDTO;
  activeVisit: TreatmentPageActiveVisitDTO | null;
  acts: TreatmentPageDentalActDTO[];
  treatmentPlan: TreatmentPageTreatmentPlanItemDTO[];
  treatmentGroups: TreatmentPageTreatmentGroupDTO[];
  treatmentCharges: TreatmentPageTreatmentChargeDTO[];
  currentSession: TreatmentPageVisitProcedureDTO[];
  diagnoses: TreatmentPageDiagnosisDTO[];
  clinicalAttachments: TreatmentPageClinicalAttachmentDTO[];
  visitHandoffRecord: TreatmentPageVisitHandoffDTO | null;
  followUpRequests: TreatmentPageFollowUpRequestDTO[];
  documentRequests: TreatmentPageDocumentRequestDTO[];
  isLoading: boolean;
  isSaving: boolean;
  activeTab: TreatmentWorkspaceTab;
  inspectorMode: TreatmentInspectorMode;
  dentitionMode: TreatmentDentitionMode;
  selectedTeeth: number[];
  selectedMouthRegion: string | null;
  activeSurfaces: SurfaceCode[];
  selectedActId: string;
  surfacePickerTooth: number | null;
  isSendAssistantModalOpen: boolean;
  isCloseVisitModalOpen: boolean;
  setActiveTab: (tab: TreatmentWorkspaceTab) => void;
  setInspectorMode: (mode: TreatmentInspectorMode) => void;
  setDentitionMode: (mode: TreatmentDentitionMode) => void;
  setSelectedTeeth: (
    next: number[] | ((previous: number[]) => number[]),
  ) => void;
  setSelectedMouthRegion: (regionId: string | null) => void;
  setActiveSurfaces: (
    next: SurfaceCode[] | ((previous: SurfaceCode[]) => SurfaceCode[]),
  ) => void;
  setSelectedActId: (actId: string) => void;
  setSurfacePickerTooth: (tooth: number | null) => void;
  setIsSendAssistantModalOpen: (open: boolean) => void;
  setIsCloseVisitModalOpen: (open: boolean) => void;
  loadWorkspace: (query: {
    clinicId: string;
    patientId: string;
    activeVisitId?: string;
  }) => Promise<void>;
  loadPatient: (patientId: string) => Promise<void>;
  addTreatmentPlanItem: (
    command: AddTreatmentPlanItemCommand,
    act: TreatmentPageDentalActDTO,
  ) => Promise<void>;
  addDiagnosis: (command: AddDiagnosisCommand) => Promise<void>;
  startTreatment: (command: StartTreatmentCommand) => Promise<void>;
  completeVisitProcedure: (
    command: CompleteVisitProcedureCommand,
  ) => Promise<void>;
  changeTreatmentStatus: (
    command: ChangeTreatmentStatusCommand,
  ) => Promise<void>;
  saveVisitHandoff: (
    command: SaveVisitHandoffCommand,
    existing?: TreatmentPageVisitHandoffDTO | null,
  ) => Promise<TreatmentPageVisitHandoffDTO>;
  closeVisit: (command: CloseVisitCommand) => Promise<void>;
  addClinicalAttachments: (input: {
    clinicId: string;
    patientId: string;
    attachments: TreatmentPageClinicalAttachmentDTO[],
  }) => Promise<void>;
  clearSelection: () => void;
}

export const useTreatmentWorkspaceStore = create<TreatmentWorkspaceStoreState>(
  (set) => ({
    patient: TREATMENT_DEMO_PATIENT,
    activeVisit: null,
    acts: [],
    treatmentPlan: [],
    treatmentGroups: [],
    treatmentCharges: [],
    currentSession: [],
    diagnoses: [],
    clinicalAttachments: [],
    visitHandoffRecord: null,
    followUpRequests: [],
    documentRequests: [],
    isLoading: false,
    isSaving: false,
    activeTab: "session",
    inspectorMode: "act",
    dentitionMode: "adult",
    selectedTeeth: [],
    selectedMouthRegion: null,
    activeSurfaces: [],
    selectedActId: "",
    surfacePickerTooth: null,
    isSendAssistantModalOpen: false,
    isCloseVisitModalOpen: false,
    setActiveTab: (activeTab) => set({activeTab}),
    setInspectorMode: (inspectorMode) => set({inspectorMode}),
    setDentitionMode: (dentitionMode) => set({dentitionMode}),
    setSelectedTeeth: (next) =>
      set((state) => ({
        selectedTeeth:
          typeof next === "function" ? next(state.selectedTeeth) : next,
      })),
    setSelectedMouthRegion: (selectedMouthRegion) =>
      set({selectedMouthRegion}),
    setActiveSurfaces: (next) =>
      set((state) => ({
        activeSurfaces:
          typeof next === "function" ? next(state.activeSurfaces) : next,
      })),
    setSelectedActId: (selectedActId) => set({selectedActId}),
    setSurfacePickerTooth: (surfacePickerTooth) =>
      set({surfacePickerTooth}),
    setIsSendAssistantModalOpen: (isSendAssistantModalOpen) =>
      set({isSendAssistantModalOpen}),
    setIsCloseVisitModalOpen: (isCloseVisitModalOpen) =>
      set({isCloseVisitModalOpen}),
    loadWorkspace: async (query) => {
      set({isLoading: true});
      try {
        const workspace = await getTreatmentWorkspaceUseCase.execute(query);
        set({
          activeVisit: workspace.activeVisit
            ? {
                id: workspace.activeVisit.id,
                patientId: workspace.activeVisit.patientId,
                chairId: workspace.activeVisit.chairId,
                providerId: workspace.activeVisit.providerId,
                status: fromDomainVisitLifecycleStatus(
                  workspace.activeVisit.status,
                ),
                startedAt: workspace.activeVisit.startedAt.toISOString(),
              }
            : null,
          acts: workspace.acts.map(fromDomainDentalAct),
          treatmentPlan: workspace.treatmentPlan.map(
            fromDomainTreatmentPlanItem,
          ),
          currentSession: workspace.currentSession.map((procedure) =>
            fromDomainVisitProcedure(
              procedure,
              workspace.acts.map(fromDomainDentalAct),
            ),
          ),
          diagnoses: workspace.diagnoses.map(fromDomainDiagnosis),
          clinicalAttachments: workspace.attachments.map(
            fromDomainClinicalAttachment,
          ),
          treatmentCharges: workspace.charges.map(fromDomainTreatmentCharge),
          visitHandoffRecord:
            workspace.handoffs.length > 0
              ? fromDomainVisitHandoff(workspace.handoffs[0])
              : null,
          followUpRequests: workspace.followUpRequests.map((request) => ({
            id: request.id,
            patientId: request.patientId,
            visitId: request.visitId,
            treatmentPlanItemId: request.treatmentPlanItemId ?? "",
            reason: request.reason ?? "",
            preferredDate:
              request.preferredDate?.toISOString().split("T")[0] ?? "",
            urgency: fromDomainFollowUpUrgency(request.urgency),
            status: "requested",
            requestedAt: request.requestedAt.toISOString(),
            requestedBy: request.requestedBy,
          })),
          documentRequests: workspace.documentRequests.map((request) => ({
            id: request.id,
            patientId: request.patientId,
            visitId: request.visitId,
            treatmentPlanItemId: request.treatmentPlanItemId ?? "",
            type: fromDomainDocumentType(request.type),
            reason: request.reason ?? "",
            status: "requested",
            source: "visit_close",
            requestedAt: request.requestedAt.toISOString(),
            requestedBy: request.requestedBy,
          })),
          isLoading: false,
        });
      } catch (error) {
        set({isLoading: false});
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to load treatment workspace",
        );
      }
    },
    loadPatient: async (patientId) => {
      set((state) => ({
        patient:
          state.patient.id === patientId
            ? state.patient
            : {
                ...state.patient,
                id: patientId,
                name: "Loading patient",
                age: 0,
                gender: "Unknown",
                phone: "",
                alerts: [],
              },
      }));
      try {
        const patient = await getPatientByIdUseCase.execute(patientId);

        if (patient) {
          set({patient: toTreatmentPatient(patient)});
        }
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to load patient details",
        );
      }
    },
    addTreatmentPlanItem: async (command, act) => {
      set({isSaving: true});
      try {
        const result = await createTreatmentPlanItemsUseCase.execute(
          command,
          toDomainDentalAct(act),
        );
        set((state) => ({
          treatmentPlan: [
            ...state.treatmentPlan,
            ...result.items.map(fromDomainTreatmentPlanItem),
          ],
          treatmentGroups: result.group
            ? [
                ...state.treatmentGroups,
                fromDomainTreatmentGroup(result.group),
              ]
            : state.treatmentGroups,
          isSaving: false,
        }));
      } catch (error) {
        set({isSaving: false});
        toast.error(error instanceof Error ? error.message : "Failed to add treatment");
        throw error;
      }
    },
    addDiagnosis: async (command) => {
      set({isSaving: true});
      try {
        const diagnosis = await createTreatmentDiagnosisUseCase.execute(command);
        set((state) => ({
          diagnoses: [...state.diagnoses, fromDomainDiagnosis(diagnosis)],
          isSaving: false,
        }));
      } catch (error) {
        set({isSaving: false});
        toast.error(error instanceof Error ? error.message : "Failed to add diagnosis");
        throw error;
      }
    },
    startTreatment: async (command) => {
      set({isSaving: true});
      try {
        const result = await startTreatmentWithRepositoryUseCase.execute(command);
        if (result.reusedExistingProcedure) {
          set({activeTab: "session", isSaving: false});
          return;
        }
        set((state) => ({
          treatmentPlan: state.treatmentPlan.map((item) =>
            item.id === result.treatmentItem.id
              ? fromDomainTreatmentPlanItem(result.treatmentItem)
              : item,
          ),
          currentSession: [
            ...state.currentSession,
            {
              ...fromDomainVisitProcedure(result.procedure, state.acts),
              price:
                state.treatmentPlan.find(
                  (item) => item.id === result.treatmentItem.id,
                )?.price ?? 0,
            },
          ],
          treatmentCharges: result.charge
            ? [...state.treatmentCharges, fromDomainTreatmentCharge(result.charge)]
            : state.treatmentCharges,
          activeTab: "session",
          isSaving: false,
        }));
      } catch (error) {
        set({isSaving: false});
        toast.error(error instanceof Error ? error.message : "Failed to start treatment");
        throw error;
      }
    },
    completeVisitProcedure: async (command) => {
      set({isSaving: true});
      try {
        const result =
          await completeVisitProcedureWithRepositoryUseCase.execute(command);
        set((state) => ({
          currentSession: state.currentSession.map((item) =>
            item.id === result.procedure.id
              ? {...item, ...fromDomainVisitProcedure(result.procedure, state.acts)}
              : item,
          ),
          treatmentPlan: result.treatmentItem
            ? state.treatmentPlan.map((item) =>
                item.id === result.treatmentItem?.id
                  ? fromDomainTreatmentPlanItem(result.treatmentItem)
                  : item,
              )
            : state.treatmentPlan,
          isSaving: false,
        }));
      } catch (error) {
        set({isSaving: false});
        toast.error(error instanceof Error ? error.message : "Failed to complete treatment");
        throw error;
      }
    },
    changeTreatmentStatus: async (command) => {
      set({isSaving: true});
      try {
        const updated =
          await changeTreatmentStatusWithRepositoryUseCase.execute(command);
        set((state) => ({
          treatmentPlan: state.treatmentPlan.map((item) =>
            item.id === updated.id ? fromDomainTreatmentPlanItem(updated) : item,
          ),
          isSaving: false,
        }));
      } catch (error) {
        set({isSaving: false});
        toast.error(error instanceof Error ? error.message : "Failed to update treatment");
        throw error;
      }
    },
    saveVisitHandoff: async (command, existing) => {
      set({isSaving: true});
      try {
        const handoff = await saveVisitHandoffWithRepositoryUseCase.execute(
          command,
          existing ? toDomainVisitHandoff(existing) : undefined,
        );
        const dto = fromDomainVisitHandoff(handoff);
        set({visitHandoffRecord: dto, isSaving: false});
        return dto;
      } catch (error) {
        set({isSaving: false});
        toast.error(error instanceof Error ? error.message : "Failed to save handoff");
        throw error;
      }
    },
    closeVisit: async (command) => {
      set({isSaving: true});
      try {
        const result = await closeVisitWithRepositoryUseCase.execute(command);
        set((state) => ({
          followUpRequests: result.followUpRequest
            ? [
                ...state.followUpRequests,
                {
                  id: result.followUpRequest.id,
                  patientId: result.followUpRequest.patientId,
                  visitId: result.followUpRequest.visitId,
                  treatmentPlanItemId:
                    result.followUpRequest.treatmentPlanItemId ?? "",
                  reason: result.followUpRequest.reason ?? "",
                  preferredDate:
                    result.followUpRequest.preferredDate
                      ?.toISOString()
                      .split("T")[0] ?? "",
                  urgency: fromDomainFollowUpUrgency(
                    result.followUpRequest.urgency,
                  ),
                  status: "requested",
                  requestedAt: result.followUpRequest.requestedAt.toISOString(),
                  requestedBy: result.followUpRequest.requestedBy,
                },
              ]
            : state.followUpRequests,
          documentRequests: result.documentRequest
            ? [
                ...state.documentRequests,
                {
                  id: result.documentRequest.id,
                  patientId: result.documentRequest.patientId,
                  visitId: result.documentRequest.visitId,
                  treatmentPlanItemId:
                    result.documentRequest.treatmentPlanItemId ?? "",
                  type: fromDomainDocumentType(result.documentRequest.type),
                  reason: result.documentRequest.reason ?? "",
                  status: "requested",
                  source: "visit_close",
                  requestedAt:
                    result.documentRequest.requestedAt.toISOString(),
                  requestedBy: result.documentRequest.requestedBy,
                },
              ]
            : state.documentRequests,
          isSaving: false,
        }));
      } catch (error) {
        set({isSaving: false});
        toast.error(error instanceof Error ? error.message : "Failed to close visit");
        throw error;
      }
    },
    addClinicalAttachments: async (input) => {
      set({isSaving: true});
      try {
        const saved = await saveClinicalAttachmentsUseCase.execute({
          attachments: input.attachments.map((attachment) =>
            toDomainClinicalAttachment(attachment, {
              clinicId: input.clinicId,
              patientId: input.patientId,
            }),
          ),
        });
        set((state) => ({
          clinicalAttachments: [
            ...state.clinicalAttachments,
            ...saved.map(fromDomainClinicalAttachment),
          ],
          isSaving: false,
        }));
      } catch (error) {
        set({isSaving: false});
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to save clinical attachments",
        );
        throw error;
      }
    },
    clearSelection: () =>
      set({
        selectedTeeth: [],
        selectedMouthRegion: null,
        activeSurfaces: [],
        surfacePickerTooth: null,
      }),
  }),
);
