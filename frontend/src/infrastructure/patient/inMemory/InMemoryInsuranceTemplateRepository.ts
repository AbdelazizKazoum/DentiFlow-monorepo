import { InsuranceTemplate } from "@/domain/patient/entities/insuranceTemplate";
import { IInsuranceTemplateRepository } from "@/domain/patient/repositories/insuranceTemplateRepository";
import type { CreateInsuranceTemplateInput } from "@/domain/patient/commands/CreateInsuranceTemplateInput";
import type { UpdateInsuranceTemplateInput } from "@/domain/patient/commands/UpdateInsuranceTemplateInput";

export class InMemoryInsuranceTemplateRepository implements IInsuranceTemplateRepository {
  private store: InsuranceTemplate[] = [];

  async findById(id: string): Promise<InsuranceTemplate | null> {
    return this.store.find((t) => t.id === id) ?? null;
  }

  async create(
    input: CreateInsuranceTemplateInput,
  ): Promise<InsuranceTemplate> {
    const template = new InsuranceTemplate(
      String(Date.now()),
      input.insuranceProviderId,
      input.name,
      input.fileUrl,
      new Date(),
    );
    this.store.push(template);
    return template;
  }

  async update(
    id: string,
    updates: UpdateInsuranceTemplateInput,
  ): Promise<InsuranceTemplate> {
    const idx = this.store.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error(`InsuranceTemplate ${id} not found`);
    const existing = this.store[idx];
    const updated = new InsuranceTemplate(
      existing.id,
      updates.insuranceProviderId ?? existing.insuranceProviderId,
      updates.name ?? existing.name,
      updates.fileUrl ?? existing.fileUrl,
      existing.createdAt,
    );
    this.store[idx] = updated;
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.store = this.store.filter((t) => t.id !== id);
  }

  async findByProviderId(providerId: string): Promise<InsuranceTemplate[]> {
    return this.store.filter((t) => t.insuranceProviderId === providerId);
  }

  async findByProviderIds(providerIds: string[]): Promise<InsuranceTemplate[]> {
    return this.store.filter((t) =>
      providerIds.includes(t.insuranceProviderId),
    );
  }

  async findByName(
    providerId: string,
    name: string,
  ): Promise<InsuranceTemplate | null> {
    return (
      this.store.find(
        (t) =>
          t.insuranceProviderId === providerId &&
          t.name.toLowerCase() === name.toLowerCase(),
      ) ?? null
    );
  }

  async searchByName(searchTerm: string): Promise<InsuranceTemplate[]> {
    return this.store.filter((t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }

  async findAll(): Promise<InsuranceTemplate[]> {
    return [...this.store];
  }
}
