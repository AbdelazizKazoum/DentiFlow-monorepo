import axios from "axios";
import {StaffRepository} from "../../domain/staff/repositories/staffRepository";
import {Staff} from "../../domain/staff/entities/staff";
import {axiosClient} from "../http/axiosClient";
import {toDomain, toCreateDTO, toUpdateDTO} from "./staff.mapper";
import type {StaffDTO} from "./staff.dto";
import type {CreateStaffInput} from "../../domain/staff/commands/CreateStaffInput";
import type {UpdateStaffInput} from "../../domain/staff/commands/UpdateStaffInput";

export class StaffHttpRepository implements StaffRepository {
  async findById(id: string): Promise<Staff | null> {
    try {
      const response = await axiosClient.get<StaffDTO>(`/staff/${id}`);
      return toDomain(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async findByClinicId(clinicId: string): Promise<Staff[]> {
    const response = await axiosClient.get<StaffDTO[]>(`/staff`, {
      params: {clinicId},
    });
    return response.data.map(toDomain);
  }

  async findByUserId(userId: string): Promise<Staff | null> {
    try {
      const response = await axiosClient.get<StaffDTO>(`/staff/user/${userId}`);
      return toDomain(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async create(input: CreateStaffInput): Promise<Staff> {
    const createDto = toCreateDTO(input);
    const response = await axiosClient.post<StaffDTO>(`/staff`, createDto);
    return toDomain(response.data);
  }

  async update(id: string, input: UpdateStaffInput): Promise<Staff> {
    const updateDto = toUpdateDTO(input);
    const response = await axiosClient.put<StaffDTO>(`/staff/${id}`, updateDto);
    return toDomain(response.data);
  }

  async delete(id: string): Promise<void> {
    await axiosClient.delete(`/staff/${id}`);
  }
}
