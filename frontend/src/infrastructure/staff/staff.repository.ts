import axios from "axios";
import {StaffRepository} from "@domain/staff/repositories/staffRepository";
import {Staff} from "@domain/staff/entities/staff";
import {axiosClient} from "../http/axiosClient";
import {toDomain, toCreateDTO, toUpdateDTO} from "./staff.mapper";
import type {StaffDTO, CreateStaffDTO, UpdateStaffDTO} from "./staff.dto";

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

  async save(staff: Staff): Promise<void> {
    const createDto = toCreateDTO(staff);
    await axiosClient.post(`/staff`, createDto);
  }

  async update(staff: Staff): Promise<void> {
    const updateDto = toUpdateDTO(staff);
    await axiosClient.put(`/staff/${staff.id}`, updateDto);
  }

  async delete(id: string): Promise<void> {
    await axiosClient.delete(`/staff/${id}`);
  }
}
