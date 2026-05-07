import { InsuranceProvider } from "@/domain/patient/entities/insuranceProvider";
import { IInsuranceProviderRepository } from "@/domain/patient/repositories/insuranceProviderRepository";
import type { CreateInsuranceProviderInput } from "@/domain/patient/commands/CreateInsuranceProviderInput";
import type { UpdateInsuranceProviderInput } from "@/domain/patient/commands/UpdateInsuranceProviderInput";

const SEED_DATA: InsuranceProvider[] = [
  new InsuranceProvider(
    "prov-cnops",
    "00000000-0000-4000-8000-000000000001",
    "CNOPS",
    new Date(),
    new Date(),
    true,
    "CNOPS",
  ),
  new InsuranceProvider(
    "prov-cnss",
    "00000000-0000-4000-8000-000000000001",
    "CNSS",
    new Date(),
    new Date(),
    true,
    "CNSS",
  ),
  new InsuranceProvider(
    "prov-rma",
    "00000000-0000-4000-8000-000000000001",
    "RMA Watanya",
    new Date(),
    new Date(),
    true,
    "RMA",
  ),
  new InsuranceProvider(
    "prov-saham",
    "00000000-0000-4000-8000-000000000001",
    "Saham Assurance",
    new Date(),
    new Date(),
    true,
    "SAHAM",
  ),
  new InsuranceProvider(
    "prov-axa",
    "00000000-0000-4000-8000-000000000001",
    "AXA Assurance",
    new Date(),
    new Date(),
    true,
    "AXA",
  ),
  new InsuranceProvider(
    "prov-allianz",
    "00000000-0000-4000-8000-000000000001",
    "Allianz Maroc",
    new Date(),
    new Date(),
    true,
    "ALLIANZ",
  ),
  new InsuranceProvider(
    "prov-wafa",
    "00000000-0000-4000-8000-000000000001",
    "Wafa Assurance",
    new Date(),
    new Date(),
    true,
    "WAFA",
  ),
  new InsuranceProvider(
    "prov-atlanta",
    "00000000-0000-4000-8000-000000000001",
    "Atlanta Assurance",
    new Date(),
    new Date(),
    true,
    "ATLANTA",
  ),
];

export class InMemoryInsuranceProviderRepository implements IInsuranceProviderRepository {
  private store: InsuranceProvider[] = [...SEED_DATA];

  async findById(id: string): Promise<InsuranceProvider | null> {
    return this.store.find((p) => p.id === id) ?? null;
  }

  async create(
    input: CreateInsuranceProviderInput,
  ): Promise<InsuranceProvider> {
    const provider = new InsuranceProvider(
      String(Date.now()),
      input.clinicId,
      input.name,
      new Date(),
      new Date(),
      input.isActive ?? true,
      input.code,
    );
    this.store.push(provider);
    return provider;
  }

  async update(
    id: string,
    updates: UpdateInsuranceProviderInput,
  ): Promise<InsuranceProvider> {
    const idx = this.store.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error(`InsuranceProvider ${id} not found`);
    const existing = this.store[idx];
    const updated = new InsuranceProvider(
      existing.id,
      existing.clinicId,
      updates.name ?? existing.name,
      existing.createdAt,
      new Date(),
      updates.isActive ?? existing.isActive,
      updates.code ?? existing.code,
    );
    this.store[idx] = updated;
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.store = this.store.filter((p) => p.id !== id);
  }

  async findByClinicId(clinicId: string): Promise<InsuranceProvider[]> {
    return this.store.filter((p) => p.clinicId === clinicId);
  }

  async findActiveByClinicId(clinicId: string): Promise<InsuranceProvider[]> {
    return this.store.filter((p) => p.clinicId === clinicId && p.isActive);
  }

  async findByName(
    clinicId: string,
    name: string,
  ): Promise<InsuranceProvider | null> {
    return (
      this.store.find(
        (p) =>
          p.clinicId === clinicId &&
          p.name.toLowerCase() === name.toLowerCase(),
      ) ?? null
    );
  }

  async findByCode(
    clinicId: string,
    code: string,
  ): Promise<InsuranceProvider | null> {
    return (
      this.store.find(
        (p) =>
          p.clinicId === clinicId &&
          (p.code ?? "").toLowerCase() === code.toLowerCase(),
      ) ?? null
    );
  }

  async searchByName(
    clinicId: string,
    searchTerm: string,
  ): Promise<InsuranceProvider[]> {
    return this.store.filter(
      (p) =>
        p.clinicId === clinicId &&
        p.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }

  async activate(id: string): Promise<InsuranceProvider> {
    return this.update(id, { isActive: true });
  }

  async deactivate(id: string): Promise<InsuranceProvider> {
    return this.update(id, { isActive: false });
  }
}
