import { IInsuranceTemplateRepository } from "@/domain/patient/repositories/insuranceTemplateRepository";

export class DeleteInsuranceTemplate {
  constructor(private readonly repository: IInsuranceTemplateRepository) {}

  async execute(id: string): Promise<void> {
    return this.repository.delete(id);
  }
}
