// Dependency injection container — wires repositories to use cases and exports
// ready-to-use instances. This is the only place that knows about concrete implementations.

import { AdminAuthRepositoryImpl } from "@/infrastructure/repositories/AdminAuthRepositoryImpl";
import { AdminLogin } from "@/application/auth/useCases/AdminLogin";
import { StaffHttpRepository } from "@/infrastructure/staff/staff.repository";
import { GetAllStaff } from "@/application/staff/useCases/GetAllStaff";
import { CreateStaff } from "@/application/staff/useCases/CreateStaff";
import { UpdateStaff } from "@/application/staff/useCases/UpdateStaff";
import { DeleteStaff } from "@/application/staff/useCases/DeleteStaff";

// ─── Patient use cases ────────────────────────────────────────────────────────
import { InMemoryPatientRepository } from "@/infrastructure/patient/inMemory/InMemoryPatientRepository";
import { InMemoryInsuranceProviderRepository } from "@/infrastructure/patient/inMemory/InMemoryInsuranceProviderRepository";
import { InMemoryPatientInsuranceRepository } from "@/infrastructure/patient/inMemory/InMemoryPatientInsuranceRepository";
import { InMemoryPatientDocumentRepository } from "@/infrastructure/patient/inMemory/InMemoryPatientDocumentRepository";
import { InMemoryInsuranceTemplateRepository } from "@/infrastructure/patient/inMemory/InMemoryInsuranceTemplateRepository";
import { GetPatientsByClinic } from "@/application/patient/useCases/GetPatientsByClinic";
import { CreatePatient } from "@/application/patient/useCases/CreatePatient";
import { UpdatePatient } from "@/application/patient/useCases/UpdatePatient";
import { DeletePatient } from "@/application/patient/useCases/DeletePatient";
import { GetInsuranceProviders } from "@/application/patient/useCases/GetInsuranceProviders";
import { CreateInsuranceProvider } from "@/application/patient/useCases/CreateInsuranceProvider";
import { UpdateInsuranceProvider } from "@/application/patient/useCases/UpdateInsuranceProvider";
import { DeleteInsuranceProvider } from "@/application/patient/useCases/DeleteInsuranceProvider";
import { GetPatientInsurances } from "@/application/patient/useCases/GetPatientInsurances";
import { CreatePatientInsurance } from "@/application/patient/useCases/CreatePatientInsurance";
import { UpdatePatientInsurance } from "@/application/patient/useCases/UpdatePatientInsurance";
import { DeletePatientInsurance } from "@/application/patient/useCases/DeletePatientInsurance";
import { GetPatientDocuments } from "@/application/patient/useCases/GetPatientDocuments";
import { CreatePatientDocument } from "@/application/patient/useCases/CreatePatientDocument";
import { DeletePatientDocument } from "@/application/patient/useCases/DeletePatientDocument";
import { GetInsuranceTemplates } from "@/application/patient/useCases/GetInsuranceTemplates";
import { CreateInsuranceTemplate } from "@/application/patient/useCases/CreateInsuranceTemplate";
import { DeleteInsuranceTemplate } from "@/application/patient/useCases/DeleteInsuranceTemplate";

// ─── Auth ─────────────────────────────────────────────────────────────────────
const adminAuthRepository = new AdminAuthRepositoryImpl();
export const adminLoginUseCase = new AdminLogin(adminAuthRepository);

// ─── Staff ────────────────────────────────────────────────────────────────────
const clinicId =
  process.env.NEXT_PUBLIC_DEFAULT_CLINIC_ID ??
  "00000000-0000-4000-8000-000000000001";
const staffRepository = new StaffHttpRepository(clinicId);
export const getAllStaffUseCase = new GetAllStaff(staffRepository);
export const createStaffUseCase = new CreateStaff(staffRepository);
export const updateStaffUseCase = new UpdateStaff(staffRepository);
export const deleteStaffUseCase = new DeleteStaff(staffRepository);

// ─── Patient ──────────────────────────────────────────────────────────────────
// Using in-memory repositories for now; swap to HTTP repositories once the API is ready.
const patientRepository = new InMemoryPatientRepository();
const insuranceProviderRepository = new InMemoryInsuranceProviderRepository();
const patientInsuranceRepository = new InMemoryPatientInsuranceRepository();
const patientDocumentRepository = new InMemoryPatientDocumentRepository();
const insuranceTemplateRepository = new InMemoryInsuranceTemplateRepository();

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
