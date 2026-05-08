import { CreateInsuranceProvider } from "@/application/patient/useCases/CreateInsuranceProvider";
import { CreateInsuranceTemplate } from "@/application/patient/useCases/CreateInsuranceTemplate";
import { CreatePatient } from "@/application/patient/useCases/CreatePatient";
import { CreatePatientDocument } from "@/application/patient/useCases/CreatePatientDocument";
import { CreatePatientInsurance } from "@/application/patient/useCases/CreatePatientInsurance";
import { DeleteInsuranceProvider } from "@/application/patient/useCases/DeleteInsuranceProvider";
import { DeleteInsuranceTemplate } from "@/application/patient/useCases/DeleteInsuranceTemplate";
import { DeletePatient } from "@/application/patient/useCases/DeletePatient";
import { DeletePatientDocument } from "@/application/patient/useCases/DeletePatientDocument";
import { DeletePatientInsurance } from "@/application/patient/useCases/DeletePatientInsurance";
import { GetInsuranceProviders } from "@/application/patient/useCases/GetInsuranceProviders";
import { GetInsuranceTemplates } from "@/application/patient/useCases/GetInsuranceTemplates";
import { GetPatientDocuments } from "@/application/patient/useCases/GetPatientDocuments";
import { GetPatientInsurances } from "@/application/patient/useCases/GetPatientInsurances";
import { GetPatientsByClinic } from "@/application/patient/useCases/GetPatientsByClinic";
import { UpdateInsuranceProvider } from "@/application/patient/useCases/UpdateInsuranceProvider";
import { UpdatePatient } from "@/application/patient/useCases/UpdatePatient";
import { UpdatePatientInsurance } from "@/application/patient/useCases/UpdatePatientInsurance";
import {
  PatientHttpRepository,
  InsuranceProviderHttpRepository,
  PatientInsuranceHttpRepository,
  PatientDocumentHttpRepository,
  InsuranceTemplateHttpRepository,
} from "@/infrastructure/patient/repositories";

// Using HTTP repositories (API) for patient domain.
const clinicId =
  process.env.NEXT_PUBLIC_DEFAULT_CLINIC_ID ??
  "00000000-0000-4000-8000-000000000001";

const patientRepository = new PatientHttpRepository(clinicId);
const insuranceProviderRepository = new InsuranceProviderHttpRepository(
  clinicId,
);
const patientInsuranceRepository = new PatientInsuranceHttpRepository(clinicId);
const patientDocumentRepository = new PatientDocumentHttpRepository(clinicId);
const insuranceTemplateRepository = new InsuranceTemplateHttpRepository(
  clinicId,
);

export const getPatientsByClinicUseCase = new GetPatientsByClinic(
  patientRepository,
);
export const createPatientUseCase = new CreatePatient(patientRepository);
export const updatePatientUseCase = new UpdatePatient(patientRepository);
export const deletePatientUseCase = new DeletePatient(patientRepository);

export const getInsuranceProvidersUseCase = new GetInsuranceProviders(
  insuranceProviderRepository,
);
export const createInsuranceProviderUseCase = new CreateInsuranceProvider(
  insuranceProviderRepository,
);
export const updateInsuranceProviderUseCase = new UpdateInsuranceProvider(
  insuranceProviderRepository,
);
export const deleteInsuranceProviderUseCase = new DeleteInsuranceProvider(
  insuranceProviderRepository,
);

export const getPatientInsurancesUseCase = new GetPatientInsurances(
  patientInsuranceRepository,
);
export const createPatientInsuranceUseCase = new CreatePatientInsurance(
  patientInsuranceRepository,
);
export const updatePatientInsuranceUseCase = new UpdatePatientInsurance(
  patientInsuranceRepository,
);
export const deletePatientInsuranceUseCase = new DeletePatientInsurance(
  patientInsuranceRepository,
);

export const getPatientDocumentsUseCase = new GetPatientDocuments(
  patientDocumentRepository,
);
export const createPatientDocumentUseCase = new CreatePatientDocument(
  patientDocumentRepository,
);
export const deletePatientDocumentUseCase = new DeletePatientDocument(
  patientDocumentRepository,
);

export const getInsuranceTemplatesUseCase = new GetInsuranceTemplates(
  insuranceTemplateRepository,
);
export const createInsuranceTemplateUseCase = new CreateInsuranceTemplate(
  insuranceTemplateRepository,
);
export const deleteInsuranceTemplateUseCase = new DeleteInsuranceTemplate(
  insuranceTemplateRepository,
);
