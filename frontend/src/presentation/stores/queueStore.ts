import {create} from "zustand";
import {toast} from "sonner";
import type {CheckInPatientCommand} from "@/domain/queue/commands/CheckInPatientCommand";
import type {QueueEntry, QueueStatus} from "@/domain/queue/entities/queueEntry";
import {sortQueueEntries} from "@/domain/queue/services/queuePolicy";
import {
  checkInPatientUseCase,
  correctQueueStatusUseCase,
  getWaitingRoomQueueUseCase,
  seatPatientUseCase,
  updateQueueNotesUseCase,
  updateQueueStatusUseCase,
} from "@/infrastructure/container";
import {AppError} from "@/infrastructure/http/httpErrorHandler";

interface QueueStoreState {
  entries: QueueEntry[];
  isLoading: boolean;
  isUpdating: boolean;
  lastUpdatedAt: Date | null;
  loadQueue: (clinicId: string) => Promise<void>;
  checkInPatient: (command: CheckInPatientCommand) => Promise<QueueEntry>;
  changeStatus: (entryId: string, status: QueueStatus) => Promise<QueueEntry>;
  correctStatus: (
    entryId: string,
    status: QueueStatus,
    correctionReason: string,
  ) => Promise<QueueEntry>;
  seatPatient: (entryId: string) => Promise<QueueEntry>;
  saveNotes: (entryId: string, notes?: string) => Promise<QueueEntry>;
}

function getMessage(error: unknown, fallback: string): string {
  return error instanceof AppError || error instanceof Error
    ? error.message
    : fallback;
}

function replaceEntry(entries: QueueEntry[], updated: QueueEntry): QueueEntry[] {
  return sortQueueEntries(
    entries.map((entry) => (entry.id === updated.id ? updated : entry)),
  );
}

export const useQueueStore = create<QueueStoreState>((set) => ({
  entries: [],
  isLoading: false,
  isUpdating: false,
  lastUpdatedAt: null,

  loadQueue: async (clinicId) => {
    set({isLoading: true});
    try {
      const entries = await getWaitingRoomQueueUseCase.execute(clinicId);
      set({entries, isLoading: false, lastUpdatedAt: new Date()});
    } catch (error) {
      set({isLoading: false});
      toast.error(getMessage(error, "Failed to load waiting room queue"));
    }
  },

  checkInPatient: async (command) => {
    set({isUpdating: true});
    try {
      const entry = await checkInPatientUseCase.execute(command);
      set((state) => ({
        entries: sortQueueEntries([...state.entries, entry]),
        isUpdating: false,
        lastUpdatedAt: new Date(),
      }));
      toast.success("Patient checked in");
      return entry;
    } catch (error) {
      set({isUpdating: false});
      toast.error(getMessage(error, "Failed to check in patient"));
      throw error;
    }
  },

  changeStatus: async (entryId, status) => {
    set({isUpdating: true});
    try {
      const updated = await updateQueueStatusUseCase.execute({
        queueEntryId: entryId,
        status,
      });
      set((state) => ({
        entries: replaceEntry(state.entries, updated),
        isUpdating: false,
        lastUpdatedAt: new Date(),
      }));
      toast.success("Queue status updated");
      return updated;
    } catch (error) {
      set({isUpdating: false});
      toast.error(getMessage(error, "Failed to update queue status"));
      throw error;
    }
  },

  correctStatus: async (entryId, status, correctionReason) => {
    set({isUpdating: true});
    try {
      const updated = await correctQueueStatusUseCase.execute({
        queueEntryId: entryId,
        status,
        correctionReason,
      });
      set((state) => ({
        entries: replaceEntry(state.entries, updated),
        isUpdating: false,
        lastUpdatedAt: new Date(),
      }));
      toast.success("Queue correction saved");
      return updated;
    } catch (error) {
      set({isUpdating: false});
      toast.error(getMessage(error, "Failed to correct queue status"));
      throw error;
    }
  },

  seatPatient: async (entryId) => {
    set({isUpdating: true});
    try {
      const updated = await seatPatientUseCase.execute(entryId);
      set((state) => ({
        entries: replaceEntry(state.entries, updated),
        isUpdating: false,
        lastUpdatedAt: new Date(),
      }));
      toast.success("Patient seated");
      return updated;
    } catch (error) {
      set({isUpdating: false});
      toast.error(getMessage(error, "Failed to seat patient"));
      throw error;
    }
  },

  saveNotes: async (entryId, notes) => {
    set({isUpdating: true});
    try {
      const updated = await updateQueueNotesUseCase.execute({
        queueEntryId: entryId,
        notes,
      });
      set((state) => ({
        entries: replaceEntry(state.entries, updated),
        isUpdating: false,
        lastUpdatedAt: new Date(),
      }));
      toast.success("Queue notes saved");
      return updated;
    } catch (error) {
      set({isUpdating: false});
      toast.error(getMessage(error, "Failed to save queue notes"));
      throw error;
    }
  },
}));
