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
} from "@/infrastructure/container";
import {AppError} from "@/infrastructure/http/httpErrorHandler";

interface AppointmentStoreState {
  appointments: Appointment[];
  isLoading: boolean;
  isSaving: boolean;
  loadCalendar: (clinicId: string, start: Date, end: Date) => Promise<void>;
  addAppointment: (
    command: CreateAppointmentCommand,
  ) => Promise<Appointment | null>;
  editAppointment: (appointment: Appointment) => Promise<Appointment | null>;
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
  isLoading: false,
  isSaving: false,

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
      return null;
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
      return null;
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
