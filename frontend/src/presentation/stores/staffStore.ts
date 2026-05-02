import {create} from "zustand";
import {Staff} from "@/domain/staff/entities/staff";
import type {CreateStaffInput} from "@/domain/staff/commands/CreateStaffInput";
import type {UpdateStaffInput} from "@/domain/staff/commands/UpdateStaffInput";
import {
  getAllStaffUseCase,
  createStaffUseCase,
  updateStaffUseCase,
  deleteStaffUseCase,
} from "@/infrastructure/container";

interface StaffStoreState {
  staff: Staff[];
  isLoading: boolean;
  loadStaff: () => Promise<void>;
  addStaff: (input: CreateStaffInput) => Promise<Staff>;
  editStaff: (id: string, input: UpdateStaffInput) => Promise<Staff>;
  removeStaff: (id: string) => Promise<void>;
}

export const useStaffStore = create<StaffStoreState>((set) => ({
  staff: [],
  isLoading: false,

  loadStaff: async () => {
    set({isLoading: true});
    const staff = await getAllStaffUseCase.execute();
    set({staff, isLoading: false});
  },

  addStaff: async (input) => {
    const created = await createStaffUseCase.execute(input);
    set((state) => ({staff: [...state.staff, created]}));
    return created;
  },

  editStaff: async (id, input) => {
    const updated = await updateStaffUseCase.execute(id, input);
    set((state) => ({
      staff: state.staff.map((s) => (s.id === id ? updated : s)),
    }));
    return updated;
  },

  removeStaff: async (id) => {
    await deleteStaffUseCase.execute(id);
    set((state) => ({staff: state.staff.filter((s) => s.id !== id)}));
  },
}));
