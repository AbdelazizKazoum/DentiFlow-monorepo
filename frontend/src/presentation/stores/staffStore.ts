import { create } from "zustand";
import { toast } from "sonner";
import { Staff } from "@/domain/staff/entities/staff";
import type { CreateStaffInput } from "@/domain/staff/commands/CreateStaffInput";
import type { UpdateStaffInput } from "@/domain/staff/commands/UpdateStaffInput";
import {
  getAllStaffUseCase,
  createStaffUseCase,
  updateStaffUseCase,
  deleteStaffUseCase,
} from "@/infrastructure/container";
import { AppError } from "@/infrastructure/http/httpErrorHandler";

interface StaffStoreState {
  staff: Staff[];
  isLoading: boolean;
  isAdding: boolean;
  isUpdating: boolean;
  loadStaff: () => Promise<void>;
  addStaff: (input: CreateStaffInput) => Promise<Staff>;
  editStaff: (id: string, input: UpdateStaffInput) => Promise<Staff>;
  removeStaff: (id: string) => Promise<void>;
}

export const useStaffStore = create<StaffStoreState>((set) => ({
  staff: [],
  isLoading: false,
  isAdding: false,
  isUpdating: false,

  loadStaff: async () => {
    set({ isLoading: true });
    try {
      const staff = await getAllStaffUseCase.execute();
      set({ staff, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      const message =
        error instanceof AppError ? error.message : "Failed to load staff";
      toast.error(message);
    }
  },

  addStaff: async (input) => {
    set({ isAdding: true });
    try {
      const created = await createStaffUseCase.execute(input);
      set((state) => ({ staff: [...state.staff, created], isAdding: false }));
      toast.success("Staff member added successfully");
      return created;
    } catch (error) {
      set({ isAdding: false });
      const message =
        error instanceof AppError
          ? error.message
          : "Failed to add staff member";
      toast.error(message);
      throw error;
    }
  },

  editStaff: async (id, input) => {
    set({ isUpdating: true });
    try {
      const updated = await updateStaffUseCase.execute(id, input);
      set((state) => ({
        staff: state.staff.map((s) => (s.id === id ? updated : s)),
        isUpdating: false,
      }));
      toast.success("Staff member updated successfully");
      return updated;
    } catch (error) {
      set({ isUpdating: false });
      const message =
        error instanceof AppError
          ? error.message
          : "Failed to update staff member";
      toast.error(message);
      throw error;
    }
  },

  removeStaff: async (id) => {
    try {
      await deleteStaffUseCase.execute(id);
      set((state) => ({ staff: state.staff.filter((s) => s.id !== id) }));
      toast.success("Staff member removed successfully");
    } catch (error) {
      const message =
        error instanceof AppError
          ? error.message
          : "Failed to remove staff member";
      toast.error(message);
      throw error;
    }
  },
}));
