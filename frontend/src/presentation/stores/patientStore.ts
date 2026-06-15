import {create} from "zustand";
import {toast} from "sonner";
import {Patient} from "@/domain/patient/entities/patient";
import {InsuranceProvider} from "@/domain/patient/entities/insuranceProvider";
import {InsuranceTemplate} from "@/domain/patient/entities/insuranceTemplate";
import type {CreatePatientInput} from "@/domain/patient/commands/CreatePatientInput";
import type {UpdatePatientInput} from "@/domain/patient/commands/UpdatePatientInput";
import type {CreateInsuranceProviderInput} from "@/domain/patient/commands/CreateInsuranceProviderInput";
import {
  getPatientsByClinicUseCase,
  getPatientByIdUseCase,
  createPatientUseCase,
  updatePatientUseCase,
  deletePatientUseCase,
  getInsuranceProvidersUseCase,
  createInsuranceProviderUseCase,
  getInsuranceTemplatesUseCase,
} from "@/infrastructure/container";
import {AppError} from "@/infrastructure/http/httpErrorHandler";
import type {GetPatientsQuery} from "@/domain/patient/commands/GetPatientsQuery";
import type {PatientListItem} from "@/domain/patient/queries/patientQueries";

interface PatientStoreState {
  // ── Patient state ──────────────────────────────────────────────────────────
  patients: Patient[];
  patientsMeta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoading: boolean;
  isAdding: boolean;
  isUpdating: boolean;
  isLoadingPatient: boolean;
  patientError: string | null;
  // ── Insurance providers state ──────────────────────────────────────────────
  insuranceProviders: InsuranceProvider[];
  isLoadingProviders: boolean;
  // ── Insurance templates state ──────────────────────────────────────────────
  insuranceTemplates: InsuranceTemplate[];
  isLoadingTemplates: boolean;
  // ── Actions ────────────────────────────────────────────────────────────────
  loadPatients: (query: GetPatientsQuery) => Promise<void>;
  getPatientById: (id: string) => Promise<Patient | null>;
  addPatient: (input: CreatePatientInput) => Promise<Patient>;
  editPatient: (id: string, input: UpdatePatientInput) => Promise<Patient>;
  removePatient: (id: string) => Promise<void>;
  loadInsuranceProviders: (clinicId: string) => Promise<void>;
  addInsuranceProvider: (
    input: CreateInsuranceProviderInput,
  ) => Promise<InsuranceProvider>;
  loadInsuranceTemplates: (providerIds: string[]) => Promise<void>;
}

export const usePatientStore = create<PatientStoreState>((set, get) => ({
  patients: [],
  patientsMeta: {page: 1, limit: 8, total: 0, totalPages: 1},
  isLoading: false,
  isAdding: false,
  isUpdating: false,
  isLoadingPatient: false,
  patientError: null,
  insuranceProviders: [],
  isLoadingProviders: false,
  insuranceTemplates: [],
  isLoadingTemplates: false,

  loadPatients: async (query) => {
    set({isLoading: true});
    try {
      const response = await getPatientsByClinicUseCase.execute(query);
      set((state) => {
        const cachedPatients = new Map(
          state.patients.map((patient) => [patient.id, patient]),
        );

        return {
          patients: response.items.map(
            (item) => cachedPatients.get(item.id) ?? toPatientFromListItem(item),
          ),
          patientsMeta: response.meta,
          isLoading: false,
        };
      });
    } catch (error) {
      set({isLoading: false});
      const message =
        error instanceof AppError ? error.message : "Failed to load patients";
      toast.error(message);
    }
  },

  getPatientById: async (id) => {
    const cachedPatient = get().patients.find((patient) => patient.id === id);

    if (cachedPatient) {
      return cachedPatient;
    }

    set({isLoadingPatient: true, patientError: null});

    try {
      const patient = await getPatientByIdUseCase.execute(id);

      if (!patient) {
        set({
          isLoadingPatient: false,
          patientError: "Patient record not found.",
        });
        return null;
      }

      set((state) => ({
        patients: state.patients.some((item) => item.id === patient.id)
          ? state.patients
          : [...state.patients, patient],
        isLoadingPatient: false,
        patientError: null,
      }));

      return patient;
    } catch (error) {
      const message =
        error instanceof AppError
          ? error.message
          : "Failed to load patient information";
      set({isLoadingPatient: false, patientError: message});
      return null;
    }
  },

  addPatient: async (input) => {
    set({isAdding: true});
    try {
      const created = await createPatientUseCase.execute(input);
      set((state) => ({
        patients: [...state.patients, created],
        isAdding: false,
      }));
      toast.success("Patient added successfully");
      return created;
    } catch (error) {
      set({isAdding: false});
      const message =
        error instanceof AppError ? error.message : "Failed to add patient";
      toast.error(message);
      throw error;
    }
  },

  editPatient: async (id, input) => {
    set({isUpdating: true});
    try {
      const updated = await updatePatientUseCase.execute(id, input);
      set((state) => ({
        patients: state.patients.map((p) => (p.id === id ? updated : p)),
        isUpdating: false,
      }));
      toast.success("Patient updated successfully");
      return updated;
    } catch (error) {
      set({isUpdating: false});
      const message =
        error instanceof AppError ? error.message : "Failed to update patient";
      toast.error(message);
      throw error;
    }
  },

  removePatient: async (id) => {
    try {
      await deletePatientUseCase.execute(id);
      set((state) => ({patients: state.patients.filter((p) => p.id !== id)}));
      toast.success("Patient removed successfully");
    } catch (error) {
      const message =
        error instanceof AppError ? error.message : "Failed to remove patient";
      toast.error(message);
      throw error;
    }
  },

  loadInsuranceProviders: async (clinicId) => {
    set({isLoadingProviders: true});
    try {
      const providers = await getInsuranceProvidersUseCase.execute(clinicId);
      set({insuranceProviders: providers, isLoadingProviders: false});
    } catch (error) {
      set({isLoadingProviders: false});
      const message =
        error instanceof AppError
          ? error.message
          : "Failed to load insurance providers";
      toast.error(message);
    }
  },

  addInsuranceProvider: async (input) => {
    try {
      const created = await createInsuranceProviderUseCase.execute(input);
      set((state) => ({
        insuranceProviders: [...state.insuranceProviders, created],
      }));
      toast.success("Insurance provider added successfully");
      return created;
    } catch (error) {
      const message =
        error instanceof AppError
          ? error.message
          : "Failed to add insurance provider";
      toast.error(message);
      throw error;
    }
  },

  loadInsuranceTemplates: async (providerIds: string[]) => {
    set({isLoadingTemplates: true});
    try {
      const templates = await getInsuranceTemplatesUseCase.execute(providerIds);
      set({insuranceTemplates: templates, isLoadingTemplates: false});
    } catch (error) {
      console.error(error);

      set({isLoadingTemplates: false});
      const message =
        error instanceof AppError
          ? error.message
          : "Failed to load insurance templates";
      toast.error(message);
    }
  },
}));

function toPatientFromListItem(item: PatientListItem): Patient {
  return new Patient(
    item.id,
    item.clinicId,
    item.firstName,
    item.lastName,
    item.createdAt,
    item.updatedAt,
    item.status,
    undefined,
    item.phone,
    item.email,
    item.dateOfBirth,
    item.gender,
  );
}
