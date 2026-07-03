import {
  AddDiagnosisUseCase,
  AddTreatmentPlanItemUseCase,
  ChangeTreatmentStatusWithRepositoryUseCase,
  ChangeTreatmentStatusUseCase,
  CloseVisitWithRepositoryUseCase,
  CloseVisitUseCase,
  CompleteVisitProcedureUseCase,
  CompleteVisitProcedureWithRepositoryUseCase,
  CreateDiagnosisUseCase,
  CreateVisitFromQueueUseCase,
  CreateTreatmentPlanItemsUseCase,
  GetTreatmentWorkspaceUseCase,
  SaveVisitHandoffUseCase,
  SaveVisitHandoffWithRepositoryUseCase,
  SaveClinicalAttachmentsUseCase,
  StartTreatmentUseCase,
  StartTreatmentWithRepositoryUseCase,
} from "@/application/treatment/useCases";
import {InMemoryTreatmentWorkspaceRepository} from "./inMemory";

const treatmentWorkspaceRepository = new InMemoryTreatmentWorkspaceRepository();

export const addTreatmentPlanItemUseCase = new AddTreatmentPlanItemUseCase();
export const addTreatmentDiagnosisUseCase = new AddDiagnosisUseCase();
export const startTreatmentUseCase = new StartTreatmentUseCase();
export const completeVisitProcedureUseCase =
  new CompleteVisitProcedureUseCase();
export const changeTreatmentStatusUseCase = new ChangeTreatmentStatusUseCase();
export const saveVisitHandoffUseCase = new SaveVisitHandoffUseCase();
export const closeTreatmentVisitUseCase = new CloseVisitUseCase();

export const getTreatmentWorkspaceUseCase = new GetTreatmentWorkspaceUseCase(
  treatmentWorkspaceRepository,
);
export const createTreatmentVisitFromQueueUseCase =
  new CreateVisitFromQueueUseCase(treatmentWorkspaceRepository);
export const createTreatmentPlanItemsUseCase =
  new CreateTreatmentPlanItemsUseCase(treatmentWorkspaceRepository);
export const createTreatmentDiagnosisUseCase = new CreateDiagnosisUseCase(
  treatmentWorkspaceRepository,
);
export const startTreatmentWithRepositoryUseCase =
  new StartTreatmentWithRepositoryUseCase(treatmentWorkspaceRepository);
export const completeVisitProcedureWithRepositoryUseCase =
  new CompleteVisitProcedureWithRepositoryUseCase(
    treatmentWorkspaceRepository,
  );
export const changeTreatmentStatusWithRepositoryUseCase =
  new ChangeTreatmentStatusWithRepositoryUseCase(treatmentWorkspaceRepository);
export const saveVisitHandoffWithRepositoryUseCase =
  new SaveVisitHandoffWithRepositoryUseCase(treatmentWorkspaceRepository);
export const closeVisitWithRepositoryUseCase = new CloseVisitWithRepositoryUseCase(
  treatmentWorkspaceRepository,
);
export const saveClinicalAttachmentsUseCase = new SaveClinicalAttachmentsUseCase(
  treatmentWorkspaceRepository,
);
