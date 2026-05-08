import { CreateStaff } from "@/application/staff/useCases/CreateStaff";
import { DeleteStaff } from "@/application/staff/useCases/DeleteStaff";
import { GetAllStaff } from "@/application/staff/useCases/GetAllStaff";
import { UpdateStaff } from "@/application/staff/useCases/UpdateStaff";
import { StaffHttpRepository } from "@/infrastructure/staff/staff.repository";

const clinicId =
  process.env.NEXT_PUBLIC_DEFAULT_CLINIC_ID ??
  "00000000-0000-4000-8000-000000000001";

const staffRepository = new StaffHttpRepository(clinicId);

export const getAllStaffUseCase = new GetAllStaff(staffRepository);
export const createStaffUseCase = new CreateStaff(staffRepository);
export const updateStaffUseCase = new UpdateStaff(staffRepository);
export const deleteStaffUseCase = new DeleteStaff(staffRepository);
