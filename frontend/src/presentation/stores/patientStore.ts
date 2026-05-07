import { create } from "zustand";
import { toast } from "sonner";
import { Patient } from "@/domain/patient/entities/patient";
import { InsuranceProvider } from "@/domain/patient/entities/insuranceProvider";
import { InsuranceTemplate } from "@/domain/patient/entities/insuranceTemplate";
import type { CreatePatientInput } from "@/domain/patient/commands/CreatePatientInput";
import type { UpdatePatientInput } from "@/domain/patient/commands/UpdatePatientInput";
import type { CreateInsuranceProviderInput } from "@/domain/patient/commands/CreateInsuranceProviderInput";
import {
  getPatientsByClinicUseCase,
  createPatientUseCase,
  updatePatientUseCase,
  deletePatientUseCase,
  getInsuranceProvidersUseCase,
  createInsuranceProviderUseCase,
  getInsuranceTemplatesUseCase,
} from "@/infrastructure/container";
import { AppError } from "@/infrastructure/http/httpErrorHandler";

interface PatientStoreState {
  // ── Patient state ──────────────────────────────────────────────────────────
  patients: Patient[];
  isLoading: boolean;
  isAdding: boolean;
  isUpdating: boolean;
  // ── Insurance providers state ──────────────────────────────────────────────
  insuranceProviders: InsuranceProvider[];
  isLoadingProviders: boolean;
  // ── Insurance templates state ──────────────────────────────────────────────
  insuranceTemplates: InsuranceTemplate[];
  isLoadingTemplates: boolean;
  // ── Actions ────────────────────────────────────────────────────────────────
  loadPatients: (clinicId: string) => Promise<void>;
  addPatient: (input: CreatePatientInput) => Promise<Patient>;
  editPatient: (id: string, input: UpdatePatientInput) => Promise<Patient>;
  removePatient: (id: string) => Promise<void>;
  loadInsuranceProviders: (clinicId: string) => Promise<void>;
  addInsuranceProvider: (
    input: CreateInsuranceProviderInput,
  ) => Promise<InsuranceProvider>;
  loadInsuranceTemplates: (providerIds: string[]) => Promise<void>;
}

export const usePatientStore = create<PatientStoreState>((set) => ({
  patients: [],
  isLoading: false,
  isAdding: false,
  isUpdating: false,
  insuranceProviders: [],
  isLoadingProviders: false,
  insuranceTemplates: [],
  isLoadingTemplates: false,

  loadPatients: async (clinicId) => {
    set({ isLoading: true });
    try {
      const patients = await getPatientsByClinicUseCase.execute(clinicId);
      set({ patients, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      const message =
        error instanceof AppError ? error.message : "Failed to load patients";
      toast.error(message);
    }
  },

  addPatient: async (input) => {
    set({ isAdding: true });
    try {
      const created = await createPatientUseCase.execute(input);
      set((state) => ({
        patients: [...state.patients, created],
        isAdding: false,
      }));
      toast.success("Patient added successfully");
      return created;
    } catch (error) {
      set({ isAdding: false });
      const message =
        error instanceof AppError ? error.message : "Failed to add patient";
      toast.error(message);
      throw error;
    }
  },

  editPatient: async (id, input) => {
    set({ isUpdating: true });
    try {
      const updated = await updatePatientUseCase.execute(id, input);
      set((state) => ({
        patients: state.patients.map((p) => (p.id === id ? updated : p)),
        isUpdating: false,
      }));
      toast.success("Patient updated successfully");
      return updated;
    } catch (error) {
      set({ isUpdating: false });
      const message =
        error instanceof AppError ? error.message : "Failed to update patient";
      toast.error(message);
      throw error;
    }
  },

  removePatient: async (id) => {
    try {
      await deletePatientUseCase.execute(id);
      set((state) => ({ patients: state.patients.filter((p) => p.id !== id) }));
      toast.success("Patient removed successfully");
    } catch (error) {
      const message =
        error instanceof AppError ? error.message : "Failed to remove patient";
      toast.error(message);
      throw error;
    }
  },

  loadInsuranceProviders: async (clinicId) => {
    set({ isLoadingProviders: true });
    try {
      const providers = await getInsuranceProvidersUseCase.execute(clinicId);
      set({ insuranceProviders: providers, isLoadingProviders: false });
    } catch (error) {
      set({ isLoadingProviders: false });
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
    set({ isLoadingTemplates: true });
    try {
      const templates = await getInsuranceTemplatesUseCase.execute(providerIds);
      set({ insuranceTemplates: templates, isLoadingTemplates: false });
    } catch (error) {
      set({ isLoadingTemplates: false });
      const message =
        error instanceof AppError
          ? error.message
          : "Failed to load insurance templates";
      toast.error(message);
    }
  },
}));
