import {AddTreatmentActUseCase} from "@/application/treatment/useCases/AddTreatmentActUseCase";
import {AssignAssistantUseCase} from "@/application/treatment/useCases/AssignAssistantUseCase";
import {CloseVisitUseCase} from "@/application/treatment/useCases/CloseVisitUseCase";
import {ConfirmVisitUseCase} from "@/application/treatment/useCases/ConfirmVisitUseCase";
import {GetActCatalogUseCase} from "@/application/treatment/useCases/GetActCatalogUseCase";
import {GetOpenVisitsUseCase} from "@/application/treatment/useCases/GetOpenVisitsUseCase";
import {GetVisitDetailUseCase} from "@/application/treatment/useCases/GetVisitDetailUseCase";
import {OpenVisitUseCase} from "@/application/treatment/useCases/OpenVisitUseCase";
import {RemoveTreatmentActUseCase} from "@/application/treatment/useCases/RemoveTreatmentActUseCase";
import {UpdateTreatmentActUseCase} from "@/application/treatment/useCases/UpdateTreatmentActUseCase";
import {InMemoryActCatalogRepository} from "./inMemory/InMemoryActCatalogRepository";
import {InMemoryTreatmentActRepository} from "./inMemory/InMemoryTreatmentActRepository";
import {InMemoryVisitRepository} from "./inMemory/InMemoryVisitRepository";
import {
  ActCatalogHttpRepository,
  TreatmentActHttpRepository,
  VisitHttpRepository,
  TreatmentPlanHttpRepository,
} from "./repositories";

const useMockTreatmentRepository =
  process.env.NEXT_PUBLIC_USE_MOCK_TREATMENT_REPOSITORY === "true";

export const visitRepository = useMockTreatmentRepository
  ? new InMemoryVisitRepository()
  : new VisitHttpRepository();
export const actCatalogRepository = useMockTreatmentRepository
  ? new InMemoryActCatalogRepository()
  : new ActCatalogHttpRepository();
export const treatmentActRepository = useMockTreatmentRepository
  ? new InMemoryTreatmentActRepository()
  : new TreatmentActHttpRepository();
// Plan persistence is API-only for now; mock treatment remains a legacy demo mode.
export const treatmentPlanRepository = new TreatmentPlanHttpRepository();

export const openVisitUseCase = new OpenVisitUseCase(visitRepository);
export const assignAssistantUseCase = new AssignAssistantUseCase(
  visitRepository,
);
export const confirmVisitUseCase = new ConfirmVisitUseCase(visitRepository);
export const closeVisitUseCase = new CloseVisitUseCase(visitRepository);
export const addTreatmentActUseCase = new AddTreatmentActUseCase(
  visitRepository,
  actCatalogRepository,
  treatmentActRepository,
);
export const updateTreatmentActUseCase = new UpdateTreatmentActUseCase(
  visitRepository,
  treatmentActRepository,
);
export const removeTreatmentActUseCase = new RemoveTreatmentActUseCase(
  visitRepository,
  treatmentActRepository,
);
export const getActCatalogUseCase = new GetActCatalogUseCase(
  actCatalogRepository,
);
export const getOpenVisitsUseCase = new GetOpenVisitsUseCase(visitRepository);
export const getVisitDetailUseCase = new GetVisitDetailUseCase(
  visitRepository,
  treatmentActRepository,
);
