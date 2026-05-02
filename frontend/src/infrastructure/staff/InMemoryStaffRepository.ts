import {Staff, StaffRole, StaffStatus} from "@/domain/staff/entities/staff";
import {StaffRepository} from "@/domain/staff/repositories/staffRepository";
import type {CreateStaffInput} from "@/domain/staff/commands/CreateStaffInput";
import type {UpdateStaffInput} from "@/domain/staff/commands/UpdateStaffInput";

const SEED_DATA: Staff[] = [
  new Staff(
    "1",
    "clinic-1",
    "user-1",
    StaffRole.DOCTOR,
    StaffStatus.ACTIVE,
    "Emily",
    "Carter",
    new Date("2021-03-15"),
    new Date("2021-03-15"),
    "555-0201",
    "emily.carter@dentiflow.com",
    "Cosmetic & Restorative Dentistry",
    "https://i.pravatar.cc/150?u=emily",
  ),
  new Staff(
    "2",
    "clinic-1",
    "user-2",
    StaffRole.DOCTOR,
    StaffStatus.ACTIVE,
    "John",
    "Harris",
    new Date("2019-07-01"),
    new Date("2019-07-01"),
    "555-0202",
    "john.harris@dentiflow.com",
    "Orthodontics",
    "https://i.pravatar.cc/150?u=john",
  ),
  new Staff(
    "3",
    "clinic-1",
    "user-3",
    StaffRole.ADMIN,
    StaffStatus.ACTIVE,
    "Sarah",
    "Chen",
    new Date("2022-01-10"),
    new Date("2022-01-10"),
    "555-0203",
    "sarah.chen@dentiflow.com",
    "Periodontal Care",
    "https://i.pravatar.cc/150?u=sarah",
  ),
  new Staff(
    "4",
    "clinic-1",
    "user-4",
    StaffRole.SECRETARY,
    StaffStatus.ON_LEAVE,
    "Mark",
    "Thompson",
    new Date("2023-05-20"),
    new Date("2023-05-20"),
    "555-0204",
    "mark.t@dentiflow.com",
    "Patient Coordination",
    "https://i.pravatar.cc/150?u=mark",
  ),
  new Staff(
    "5",
    "clinic-1",
    "user-5",
    StaffRole.DENTAL_ASSISTANT,
    StaffStatus.ACTIVE,
    "Lisa",
    "Nguyen",
    new Date("2022-09-01"),
    new Date("2022-09-01"),
    "555-0205",
    "lisa.n@dentiflow.com",
    "Dental Radiology",
    "https://i.pravatar.cc/150?u=lisa",
  ),
  new Staff(
    "6",
    "clinic-1",
    "user-6",
    StaffRole.DENTAL_ASSISTANT,
    StaffStatus.INACTIVE,
    "Carlos",
    "Rivera",
    new Date("2020-11-15"),
    new Date("2020-11-15"),
    "555-0206",
    "carlos.r@dentiflow.com",
    "Sterilization & Instruments",
    "https://i.pravatar.cc/150?u=carlos",
  ),
];

export class InMemoryStaffRepository implements StaffRepository {
  private store: Staff[] = [...SEED_DATA];

  async findAll(): Promise<Staff[]> {
    return [...this.store];
  }

  async findById(id: string): Promise<Staff | null> {
    return this.store.find((s) => s.id === id) ?? null;
  }

  async findByClinicId(clinicId: string): Promise<Staff[]> {
    return this.store.filter((s) => s.clinicId === clinicId);
  }

  async findByUserId(userId: string): Promise<Staff | null> {
    return this.store.find((s) => s.userId === userId) ?? null;
  }

  async create(input: CreateStaffInput): Promise<Staff> {
    const staff = new Staff(
      String(Date.now()),
      input.clinicId,
      input.userId,
      input.role,
      input.status,
      input.firstName,
      input.lastName,
      new Date(),
      new Date(),
      input.phone,
      input.email,
      input.specialization,
      input.avatar,
    );
    this.store.push(staff);
    return staff;
  }

  async update(id: string, input: UpdateStaffInput): Promise<Staff> {
    const idx = this.store.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error(`Staff member with id "${id}" not found`);
    const existing = this.store[idx];
    const updated = new Staff(
      existing.id,
      existing.clinicId,
      existing.userId,
      input.role ?? existing.role,
      input.status ?? existing.status,
      input.firstName ?? existing.firstName,
      input.lastName ?? existing.lastName,
      existing.createdAt,
      new Date(),
      input.phone ?? existing.phone,
      input.email ?? existing.email,
      input.specialization ?? existing.specialization,
      input.avatar ?? existing.avatar,
      input.isActive ?? existing.isActive,
    );
    this.store[idx] = updated;
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.store = this.store.filter((s) => s.id !== id);
  }
}
