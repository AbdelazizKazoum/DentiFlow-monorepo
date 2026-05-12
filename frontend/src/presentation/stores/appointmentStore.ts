import {create} from "zustand";
import {toast} from "sonner";
import type {Appointment} from "@/domain/appointment/entities/appointment";
import type {CreateAppointmentCommand} from "@/domain/appointment/commands/CreateAppointmentCommand";
import type {MoveAppointmentCommand} from "@/domain/appointment/commands/MoveAppointmentCommand";
import {
  createAppointmentUseCase,
  getCalendarViewUseCase,
  moveAppointmentUseCase,
  updateAppointmentUseCase,
  getAllStaffUseCase,
  searchPatientsUseCase,
} from "@/infrastructure/container";
import {AppError} from "@/infrastructure/http/httpErrorHandler";
import type {Staff} from "@/domain/staff/entities/staff";
import type {Patient} from "@/domain/patient/entities/patient";

interface AppointmentStoreState {
  appointments: Appointment[];
  doctors: Staff[];
  searchResults: Patient[];
  isLoading: boolean;
  isSaving: boolean;
  isLoadingDoctors: boolean;
  isSearchingPatients: boolean;
  loadCalendar: (clinicId: string, start: Date, end: Date) => Promise<void>;
  loadDoctors: () => Promise<void>;
  searchPatients: (query: string) => Promise<void>;
  addAppointment: (
    command: CreateAppointmentCommand,
  ) => Promise<Appointment>;
  editAppointment: (appointment: Appointment) => Promise<Appointment>;
  removeAppointment: (id: string) => Promise<void>;
  moveAppointment: (command: MoveAppointmentCommand) => Promise<boolean>;
}

function getMessage(error: unknown, fallback: string): string {
  return error instanceof AppError || error instanceof Error
    ? error.message
    : fallback;
}

export const useAppointmentStore = create<AppointmentStoreState>((set) => ({
  appointments: [],
  doctors: [],
  searchResults: [],
  isLoading: false,
  isSaving: false,
  isLoadingDoctors: false,
  isSearchingPatients: false,

  loadCalendar: async (clinicId, start, end) => {
    set({isLoading: true});
    try {
      const appointments = await getCalendarViewUseCase.execute(
        clinicId,
        start,
        end,
      );
      set({appointments, isLoading: false});
    } catch (error) {
      set({isLoading: false});
      toast.error(getMessage(error, "Failed to load appointments"));
    }
  },

  loadDoctors: async () => {
    set({isLoadingDoctors: true});
    try {
      const doctors = await getAllStaffUseCase.execute();
      set({doctors, isLoadingDoctors: false});
    } catch (error) {
      set({isLoadingDoctors: false});
      toast.error(getMessage(error, "Failed to load doctors"));
    }
  },

  searchPatients: async (query: string) => {
    set({isSearchingPatients: true});
    try {
      const searchResults = await searchPatientsUseCase.execute(query);
      set({searchResults, isSearchingPatients: false});
    } catch (error) {
      set({isSearchingPatients: false});
      toast.error(getMessage(error, "Failed to search patients"));
    }
  },

  addAppointment: async (command) => {
    set({isSaving: true});
    try {
      const created = await createAppointmentUseCase.execute(command);
      getCalendarViewUseCase.clearCache();
      set((state) => ({
        appointments: [...state.appointments, created],
        isSaving: false,
      }));
      toast.success("Appointment booked successfully");
      return created;
    } catch (error) {
      set({isSaving: false});
      toast.error(getMessage(error, "Failed to book appointment"));
      throw error;
    }
  },

  editAppointment: async (appointment) => {
    set({isSaving: true});
    try {
      const updated = await updateAppointmentUseCase.execute(appointment);
      getCalendarViewUseCase.clearCache();
      set((state) => ({
        appointments: state.appointments.map((item) =>
          item.id === updated.id ? updated : item,
        ),
        isSaving: false,
      }));
      toast.success("Appointment updated successfully");
      return updated;
    } catch (error) {
      set({isSaving: false});
      toast.error(getMessage(error, "Failed to update appointment"));
      throw error;
    }
  },

  removeAppointment: async (id) => {
    set((state) => ({
      appointments: state.appointments.filter((item) => item.id !== id),
    }));
    getCalendarViewUseCase.clearCache();
    toast.success("Appointment removed successfully");
  },

  moveAppointment: async (command) => {
    try {
      await moveAppointmentUseCase.execute(command);
      getCalendarViewUseCase.clearCache();
      set((state) => ({
        appointments: state.appointments.map((item) =>
          item.id === command.appointmentId
            ? {
                ...item,
                doctorId: command.doctorId,
                doctorName: command.doctorName ?? item.doctorName,
                startAt: command.newStartAt,
                endAt: command.newEndAt,
              }
            : item,
        ),
      }));
      return true;
    } catch (error) {
      toast.error(getMessage(error, "Failed to move appointment"));
      return false;
    }
  },
}));
