import {
  Patient,
  PatientStatus,
  PatientGender,
} from "@/domain/patient/entities/patient";
import { IPatientRepository } from "@/domain/patient/repositories/patientRepository";
import type { CreatePatientInput } from "@/domain/patient/commands/CreatePatientInput";
import type { UpdatePatientInput } from "@/domain/patient/commands/UpdatePatientInput";
import type { GetPatientsQuery } from "@/domain/patient/commands/GetPatientsQuery";
import type { PatientListResponse } from "@/domain/patient/queries/patientQueries";

const SEED_DATA: Patient[] = [
  new Patient(
    "1",
    "00000000-0000-4000-8000-000000000001",
    "Alice",
    "Johnson",
    new Date("2026-04-15"),
    new Date("2026-04-15"),
    PatientStatus.ACTIVE,
    undefined,
    "555-0101",
    "alice.j@example.com",
    new Date("1985-06-15"),
    PatientGender.FEMALE,
    "123 Main St, Springfield",
    undefined,
    "Penicillin",
    "Hypertension",
  ),
  new Patient(
    "2",
    "00000000-0000-4000-8000-000000000001",
    "Michael",
    "Chen",
    new Date("2026-04-25"),
    new Date("2026-04-25"),
    PatientStatus.ACTIVE,
    undefined,
    "555-0203",
    "m.chen@example.com",
    new Date("1992-11-22"),
    PatientGender.MALE,
  ),
  new Patient(
    "3",
    "00000000-0000-4000-8000-000000000001",
    "Sarah",
    "Williams",
    new Date("2025-12-20"),
    new Date("2025-12-20"),
    PatientStatus.INACTIVE,
    undefined,
    "555-0305",
    "sarah.w@example.com",
    new Date("1978-03-08"),
    PatientGender.FEMALE,
    undefined,
    undefined,
    "Latex",
    "Diabetes Type 2",
  ),
  new Patient(
    "4",
    "00000000-0000-4000-8000-000000000001",
    "David",
    "Martinez",
    new Date("2026-04-28"),
    new Date("2026-04-28"),
    PatientStatus.ACTIVE,
    undefined,
    "555-0407",
    "d.martinez@example.com",
    new Date("2000-09-30"),
    PatientGender.MALE,
  ),
  new Patient(
    "5",
    "00000000-0000-4000-8000-000000000001",
    "Emma",
    "Thompson",
    new Date("2026-04-20"),
    new Date("2026-04-20"),
    PatientStatus.ACTIVE,
    undefined,
    "555-0509",
    "emma.t@example.com",
    new Date("1995-12-12"),
    PatientGender.FEMALE,
    undefined,
    undefined,
    "Aspirin",
    "Asthma",
    "Salbutamol inhaler",
  ),
  new Patient(
    "6",
    "00000000-0000-4000-8000-000000000001",
    "Omar",
    "Al-Rashid",
    new Date("2026-05-01"),
    new Date("2026-05-01"),
    PatientStatus.ACTIVE,
    undefined,
    "555-0611",
    "omar.r@example.com",
    new Date("1988-07-03"),
    PatientGender.MALE,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    "MR-11234",
  ),
  new Patient(
    "7",
    "00000000-0000-4000-8000-000000000001",
    "Priya",
    "Sharma",
    new Date("2026-04-10"),
    new Date("2026-04-10"),
    PatientStatus.ACTIVE,
    undefined,
    "555-0713",
    "priya.s@example.com",
    new Date("1997-02-18"),
    PatientGender.FEMALE,
    undefined,
    undefined,
    "Sulfa drugs",
  ),
  new Patient(
    "8",
    "00000000-0000-4000-8000-000000000001",
    "James",
    "Carter",
    new Date("2026-03-12"),
    new Date("2026-03-12"),
    PatientStatus.ACTIVE,
    undefined,
    "555-0815",
    "j.carter@example.com",
    new Date("1983-04-22"),
    PatientGender.MALE,
  ),
  new Patient(
    "9",
    "00000000-0000-4000-8000-000000000001",
    "Aisha",
    "Patel",
    new Date("2026-04-05"),
    new Date("2026-04-05"),
    PatientStatus.ACTIVE,
    undefined,
    "555-0917",
    "aisha.p@example.com",
    new Date("2001-08-14"),
    PatientGender.FEMALE,
    undefined,
    undefined,
    "Penicillin",
  ),
  new Patient(
    "10",
    "00000000-0000-4000-8000-000000000001",
    "Lucas",
    "Fernandez",
    new Date("2026-02-28"),
    new Date("2026-02-28"),
    PatientStatus.INACTIVE,
    undefined,
    "555-1019",
    "l.fernandez@example.com",
    new Date("1990-12-03"),
    PatientGender.MALE,
    undefined,
    undefined,
    undefined,
    "High cholesterol",
    "Atorvastatin 20mg",
  ),
  new Patient(
    "11",
    "00000000-0000-4000-8000-000000000001",
    "Yuki",
    "Tanaka",
    new Date("2026-05-02"),
    new Date("2026-05-02"),
    PatientStatus.ACTIVE,
    undefined,
    "555-1121",
    "yuki.t@example.com",
    new Date("1996-06-18"),
    PatientGender.FEMALE,
  ),
  new Patient(
    "12",
    "00000000-0000-4000-8000-000000000001",
    "Fatima",
    "Nour",
    new Date("2026-04-18"),
    new Date("2026-04-18"),
    PatientStatus.ACTIVE,
    undefined,
    "555-1223",
    "fatima.n@example.com",
    new Date("1987-09-29"),
    PatientGender.FEMALE,
    undefined,
    undefined,
    "Ibuprofen",
    "Migraine",
    "Sumatriptan",
  ),
  new Patient(
    "13",
    "00000000-0000-4000-8000-000000000001",
    "Ethan",
    "Brooks",
    new Date("2026-04-30"),
    new Date("2026-04-30"),
    PatientStatus.ACTIVE,
    undefined,
    "555-1325",
    "e.brooks@example.com",
    new Date("1994-01-07"),
    PatientGender.MALE,
  ),
  new Patient(
    "14",
    "00000000-0000-4000-8000-000000000001",
    "Nina",
    "Kowalski",
    new Date("2026-01-15"),
    new Date("2026-01-15"),
    PatientStatus.INACTIVE,
    undefined,
    "555-1427",
    "nina.k@example.com",
    new Date("1980-11-25"),
    PatientGender.FEMALE,
    undefined,
    undefined,
    "Sulfa drugs",
    "Arthritis",
  ),
  new Patient(
    "15",
    "00000000-0000-4000-8000-000000000001",
    "Carlos",
    "Mendez",
    new Date("2026-04-22"),
    new Date("2026-04-22"),
    PatientStatus.ACTIVE,
    undefined,
    "555-1529",
    "c.mendez@example.com",
    new Date("1975-05-11"),
    PatientGender.MALE,
    undefined,
    undefined,
    undefined,
    "Type 1 Diabetes",
    "Insulin",
  ),
  new Patient(
    "16",
    "00000000-0000-4000-8000-000000000001",
    "Sophie",
    "Laurent",
    new Date("2026-04-29"),
    new Date("2026-04-29"),
    PatientStatus.ACTIVE,
    undefined,
    "555-1631",
    "sophie.l@example.com",
    new Date("1999-03-16"),
    PatientGender.FEMALE,
    undefined,
    undefined,
    "Latex",
  ),
  new Patient(
    "17",
    "00000000-0000-4000-8000-000000000001",
    "Amir",
    "Hassan",
    new Date("2026-03-25"),
    new Date("2026-03-25"),
    PatientStatus.ACTIVE,
    undefined,
    "555-1733",
    "amir.h@example.com",
    new Date("1986-10-08"),
    PatientGender.MALE,
    undefined,
    undefined,
    undefined,
    "Hypertension",
    "Lisinopril 10mg",
    undefined,
    undefined,
    "MR-98765",
  ),
  new Patient(
    "18",
    "00000000-0000-4000-8000-000000000001",
    "Mia",
    "Johansson",
    new Date("2026-04-12"),
    new Date("2026-04-12"),
    PatientStatus.ACTIVE,
    undefined,
    "555-1835",
    "mia.j@example.com",
    new Date("2003-07-20"),
    PatientGender.FEMALE,
    undefined,
    undefined,
    "Aspirin",
  ),
];

export class InMemoryPatientRepository implements IPatientRepository {
  private store: Patient[] = [...SEED_DATA];

  async findById(id: string): Promise<Patient | null> {
    return this.store.find((p) => p.id === id) ?? null;
  }

  async create(input: CreatePatientInput): Promise<Patient> {
    const patient = new Patient(
      String(Date.now()),
      input.clinicId,
      input.firstName,
      input.lastName,
      new Date(),
      new Date(),
      input.status ?? PatientStatus.ACTIVE,
      input.userId,
      input.phone,
      input.email,
      input.dateOfBirth,
      input.gender,
      input.address,
      input.notes,
      input.allergies,
      input.chronicConditions,
      input.currentMedications,
      input.medicalNotes,
      undefined,
      input.cnie,
    );
    this.store.push(patient);
    return patient;
  }

  async update(id: string, updates: UpdatePatientInput): Promise<Patient> {
    const idx = this.store.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error(`Patient ${id} not found`);
    const existing = this.store[idx];
    const updated = new Patient(
      existing.id,
      existing.clinicId,
      updates.firstName ?? existing.firstName,
      updates.lastName ?? existing.lastName,
      existing.createdAt,
      new Date(),
      updates.status ?? existing.status,
      existing.userId,
      updates.phone ?? existing.phone,
      updates.email ?? existing.email,
      updates.dateOfBirth ?? existing.dateOfBirth,
      updates.gender ?? existing.gender,
      updates.address ?? existing.address,
      updates.notes ?? existing.notes,
      updates.allergies ?? existing.allergies,
      updates.chronicConditions ?? existing.chronicConditions,
      updates.currentMedications ?? existing.currentMedications,
      updates.medicalNotes ?? existing.medicalNotes,
      existing.deletedAt,
      updates.cnie ?? existing.cnie,
    );
    this.store[idx] = updated;
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.store = this.store.filter((p) => p.id !== id);
  }

  async findMany(query: GetPatientsQuery): Promise<PatientListResponse> {
    let list = this.store.filter((p) => p.clinicId === query.clinicId);
    if (query.status) list = list.filter((p) => p.status === query.status);
    if (query.gender) list = list.filter((p) => p.gender === query.gender);
    if (query.search) {
      const s = query.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.fullName.toLowerCase().includes(s) ||
          (p.email ?? "").toLowerCase().includes(s) ||
          (p.phone ?? "").toLowerCase().includes(s),
      );
    }
    const total = list.length;
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const items = list.slice((page - 1) * limit, page * limit).map((p) => ({
      id: p.id,
      clinicId: p.clinicId,
      firstName: p.firstName,
      lastName: p.lastName,
      fullName: p.fullName,
      status: p.status,
      phone: p.phone,
      email: p.email,
      dateOfBirth: p.dateOfBirth,
      gender: p.gender,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
    return {
      items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findByClinicId(clinicId: string): Promise<Patient[]> {
    return this.store.filter((p) => p.clinicId === clinicId);
  }

  async findActiveByClinicId(clinicId: string): Promise<Patient[]> {
    return this.store.filter(
      (p) => p.clinicId === clinicId && p.status === PatientStatus.ACTIVE,
    );
  }

  async findByClinicIdAndStatus(
    clinicId: string,
    status: Patient["status"],
  ): Promise<Patient[]> {
    return this.store.filter(
      (p) => p.clinicId === clinicId && p.status === status,
    );
  }

  async findByUserId(userId: string): Promise<Patient | null> {
    return this.store.find((p) => p.userId === userId) ?? null;
  }

  async searchByName(
    clinicId: string,
    firstName?: string,
    lastName?: string,
  ): Promise<Patient[]> {
    return this.store.filter(
      (p) =>
        p.clinicId === clinicId &&
        (!firstName ||
          p.firstName.toLowerCase().includes(firstName.toLowerCase())) &&
        (!lastName ||
          p.lastName.toLowerCase().includes(lastName.toLowerCase())),
    );
  }

  async searchByPhone(clinicId: string, phone: string): Promise<Patient[]> {
    return this.store.filter(
      (p) => p.clinicId === clinicId && (p.phone ?? "").includes(phone),
    );
  }

  async findWithMedicalInfo(clinicId: string): Promise<Patient[]> {
    return this.store.filter(
      (p) => p.clinicId === clinicId && p.hasMedicalInfo(),
    );
  }

  async findNewPatients(
    clinicId: string,
    daysThreshold = 30,
  ): Promise<Patient[]> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysThreshold);
    return this.store.filter(
      (p) => p.clinicId === clinicId && p.createdAt >= cutoff,
    );
  }

  async softDelete(id: string): Promise<void> {
    const idx = this.store.findIndex((p) => p.id === id);
    if (idx === -1) return;
    const p = this.store[idx];
    this.store[idx] = new Patient(
      p.id,
      p.clinicId,
      p.firstName,
      p.lastName,
      p.createdAt,
      new Date(),
      PatientStatus.ARCHIVED,
      p.userId,
      p.phone,
      p.email,
      p.dateOfBirth,
      p.gender,
      p.address,
      p.notes,
      p.allergies,
      p.chronicConditions,
      p.currentMedications,
      p.medicalNotes,
      new Date(),
      p.cnie,
    );
  }

  async restore(id: string): Promise<Patient> {
    const idx = this.store.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error(`Patient ${id} not found`);
    const p = this.store[idx];
    const restored = new Patient(
      p.id,
      p.clinicId,
      p.firstName,
      p.lastName,
      p.createdAt,
      new Date(),
      PatientStatus.ACTIVE,
      p.userId,
      p.phone,
      p.email,
      p.dateOfBirth,
      p.gender,
      p.address,
      p.notes,
      p.allergies,
      p.chronicConditions,
      p.currentMedications,
      p.medicalNotes,
      undefined,
      p.cnie,
    );
    this.store[idx] = restored;
    return restored;
  }
}
