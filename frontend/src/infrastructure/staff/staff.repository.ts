import axios from "axios";
import {StaffRepository} from "../../domain/staff/repositories/staffRepository";
import {Staff} from "../../domain/staff/entities/staff";
import {axiosClient} from "../http/axiosClient";
import {BaseRepository} from "../http/BaseRepository";
import {AppError} from "../http/httpErrorHandler";
import {toDomain, toCreateDTO, toUpdateDTO} from "./staff.mapper";
import type {StaffDTO} from "./staff.dto";
import type {CreateStaffInput} from "../../domain/staff/commands/CreateStaffInput";
import type {UpdateStaffInput} from "../../domain/staff/commands/UpdateStaffInput";

export class StaffHttpRepository
  extends BaseRepository
  implements StaffRepository
{
  async findAll(): Promise<Staff[]> {
    const response = await this.execute(() =>
      axiosClient.get<StaffDTO[]>(`/staff`),
    );
    return response.data.map(toDomain);
  }

  async findById(id: string): Promise<Staff | null> {
    try {
      const response = await this.execute(() =>
        axiosClient.get<StaffDTO>(`/staff/${id}`),
      );
      return toDomain(response.data);
    } catch (error) {
      if (error instanceof AppError && error.code === "NOT_FOUND") {
        return null;
      }
      throw error;
    }
  }

  async findByClinicId(clinicId: string): Promise<Staff[]> {
    const response = await this.execute(() =>
      axiosClient.get<StaffDTO[]>(`/staff`, {
        params: {clinicId},
      }),
    );
    return response.data.map(toDomain);
  }

  async findByUserId(userId: string): Promise<Staff | null> {
    try {
      const response = await this.execute(() =>
        axiosClient.get<StaffDTO>(`/staff/user/${userId}`),
      );
      return toDomain(response.data);
    } catch (error) {
      if (error instanceof AppError && error.code === "NOT_FOUND") {
        return null;
      }
      throw error;
    }
  }

  async create(input: CreateStaffInput): Promise<Staff> {
    const createDto = toCreateDTO(input);
    const response = await this.execute(() =>
      axiosClient.post<StaffDTO>(`/staff`, createDto),
    );
    return toDomain(response.data);
  }

  async update(id: string, input: UpdateStaffInput): Promise<Staff> {
    const updateDto = toUpdateDTO(input);
    const response = await this.execute(() =>
      axiosClient.put<StaffDTO>(`/staff/${id}`, updateDto),
    );
    return toDomain(response.data);
  }

  async delete(id: string): Promise<void> {
    await this.execute(() => axiosClient.delete(`/staff/${id}`));
  }
}
