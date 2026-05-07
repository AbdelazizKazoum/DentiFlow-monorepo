import { PatientInsurance } from "@/domain/patient/entities/patientInsurance";
import { IPatientInsuranceRepository } from "@/domain/patient/repositories/patientInsuranceRepository";
import type { CreatePatientInsuranceInput } from "@/domain/patient/commands/CreatePatientInsuranceInput";
import type { UpdatePatientInsuranceInput } from "@/domain/patient/commands/UpdatePatientInsuranceInput";

export class InMemoryPatientInsuranceRepository implements IPatientInsuranceRepository {
  private store: PatientInsurance[] = [];

  async findById(id: string): Promise<PatientInsurance | null> {
    return this.store.find((i) => i.id === id) ?? null;
  }

  async create(input: CreatePatientInsuranceInput): Promise<PatientInsurance> {
    const insurance = new PatientInsurance(
      String(Date.now()),
      input.clinicId,
      input.patientId,
      input.insuranceProviderId,
      new Date(),
      new Date(),
      input.isActive ?? true,
      input.policyNumber,
      input.memberId,
    );
    this.store.push(insurance);
    return insurance;
  }

  async update(
    id: string,
    updates: UpdatePatientInsuranceInput,
  ): Promise<PatientInsurance> {
    const idx = this.store.findIndex((i) => i.id === id);
    if (idx === -1) throw new Error(`PatientInsurance ${id} not found`);
    const existing = this.store[idx];
    const updated = new PatientInsurance(
      existing.id,
      existing.clinicId,
      existing.patientId,
      updates.insuranceProviderId ?? existing.insuranceProviderId,
      existing.createdAt,
      new Date(),
      updates.isActive ?? existing.isActive,
      updates.policyNumber ?? existing.policyNumber,
      updates.memberId ?? existing.memberId,
    );
    this.store[idx] = updated;
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.store = this.store.filter((i) => i.id !== id);
  }

  async findByPatientId(
    clinicId: string,
    patientId: string,
  ): Promise<PatientInsurance[]> {
    return this.store.filter(
      (i) => i.clinicId === clinicId && i.patientId === patientId,
    );
  }

  async findActiveByPatientId(
    clinicId: string,
    patientId: string,
  ): Promise<PatientInsurance[]> {
    return this.store.filter(
      (i) => i.clinicId === clinicId && i.patientId === patientId && i.isActive,
    );
  }

  async findByProviderId(
    clinicId: string,
    providerId: string,
  ): Promise<PatientInsurance[]> {
    return this.store.filter(
      (i) => i.clinicId === clinicId && i.insuranceProviderId === providerId,
    );
  }

  async findActiveByProviderId(
    clinicId: string,
    providerId: string,
  ): Promise<PatientInsurance[]> {
    return this.store.filter(
      (i) =>
        i.clinicId === clinicId &&
        i.insuranceProviderId === providerId &&
        i.isActive,
    );
  }

  async findByClinicId(clinicId: string): Promise<PatientInsurance[]> {
    return this.store.filter((i) => i.clinicId === clinicId);
  }

  async findActiveByClinicId(clinicId: string): Promise<PatientInsurance[]> {
    return this.store.filter((i) => i.clinicId === clinicId && i.isActive);
  }

  async findByPolicyNumber(
    clinicId: string,
    policyNumber: string,
  ): Promise<PatientInsurance[]> {
    return this.store.filter(
      (i) => i.clinicId === clinicId && i.policyNumber === policyNumber,
    );
  }

  async findByMemberId(
    clinicId: string,
    memberId: string,
  ): Promise<PatientInsurance[]> {
    return this.store.filter(
      (i) => i.clinicId === clinicId && i.memberId === memberId,
    );
  }

  async activate(id: string): Promise<PatientInsurance> {
    return this.update(id, { isActive: true });
  }

  async deactivate(id: string): Promise<PatientInsurance> {
    return this.update(id, { isActive: false });
  }

  async activateAllForPatient(
    clinicId: string,
    patientId: string,
  ): Promise<void> {
    this.store = this.store.map((i) =>
      i.clinicId === clinicId && i.patientId === patientId
        ? new PatientInsurance(
            i.id,
            i.clinicId,
            i.patientId,
            i.insuranceProviderId,
            i.createdAt,
            new Date(),
            true,
            i.policyNumber,
            i.memberId,
          )
        : i,
    );
  }

  async deactivateAllForPatient(
    clinicId: string,
    patientId: string,
  ): Promise<void> {
    this.store = this.store.map((i) =>
      i.clinicId === clinicId && i.patientId === patientId
        ? new PatientInsurance(
            i.id,
            i.clinicId,
            i.patientId,
            i.insuranceProviderId,
            i.createdAt,
            new Date(),
            false,
            i.policyNumber,
            i.memberId,
          )
        : i,
    );
  }
}
