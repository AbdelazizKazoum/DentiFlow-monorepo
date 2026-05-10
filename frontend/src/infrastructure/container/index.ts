// Dependency injection container (root composition) — gathers domain containers
// and re-exports ready-to-use instances.

export { adminLoginUseCase } from "@/infrastructure/auth/container";

export {
  getAllStaffUseCase,
  createStaffUseCase,
  updateStaffUseCase,
  deleteStaffUseCase,
} from "@/infrastructure/staff/container";

export {
  getPatientsByClinicUseCase,
  createPatientUseCase,
  updatePatientUseCase,
  deletePatientUseCase,
  getInsuranceProvidersUseCase,
  createInsuranceProviderUseCase,
  updateInsuranceProviderUseCase,
  deleteInsuranceProviderUseCase,
  getPatientInsurancesUseCase,
  createPatientInsuranceUseCase,
  updatePatientInsuranceUseCase,
  deletePatientInsuranceUseCase,
  getPatientDocumentsUseCase,
  createPatientDocumentUseCase,
  deletePatientDocumentUseCase,
  getInsuranceTemplatesUseCase,
  createInsuranceTemplateUseCase,
  deleteInsuranceTemplateUseCase,
} from "@/infrastructure/patient/container";

export {
  createAppointmentUseCase,
  getCalendarViewUseCase,
  getPaginatedAppointmentsUseCase,
  moveAppointmentUseCase,
  updateAppointmentUseCase,
} from "@/infrastructure/appointment/container";
