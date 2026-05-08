import {Inject, Injectable, NotFoundException} from "@nestjs/common";
import {
  CreatePatientInsuranceInput,
  IPatientInsuranceRepository,
  UpdatePatientInsuranceInput,
} from "../../domain/repositories/patient-insurance-repository.interface";
import {PatientInsurance} from "../../domain/entities/patient-insurance";
import {PATIENT_INSURANCE_REPOSITORY} from "../../shared/constants/injection-tokens";

@Injectable()
export class ManagePatientInsurancesUseCase {
  constructor(
    @Inject(PATIENT_INSURANCE_REPOSITORY)
    private readonly repository: IPatientInsuranceRepository,
  ) {}

  create(input: CreatePatientInsuranceInput): Promise<PatientInsurance> {
    return this.repository.create(input);
  }

  async getById(id: string): Promise<PatientInsurance> {
    const insurance = await this.repository.findById(id);
    if (!insurance) {
      throw new NotFoundException(`Patient insurance \"${id}\" not found`);
    }
    return insurance;
  }

  listByPatient(
    clinicId: string,
    patientId: string,
    onlyActive?: boolean,
  ): Promise<PatientInsurance[]> {
    if (onlyActive) {
      return this.repository.findActiveByPatientId(clinicId, patientId);
    }
    return this.repository.findByPatientId(clinicId, patientId);
  }

  listByClinic(
    clinicId: string,
    onlyActive?: boolean,
    providerId?: string,
  ): Promise<PatientInsurance[]> {
    if (providerId && onlyActive) {
      return this.repository.findActiveByProviderId(clinicId, providerId);
    }
    if (providerId) {
      return this.repository.findByProviderId(clinicId, providerId);
    }
    if (onlyActive) {
      return this.repository.findActiveByClinicId(clinicId);
    }
    return this.repository.findByClinicId(clinicId);
  }

  update(
    id: string,
    updates: UpdatePatientInsuranceInput,
  ): Promise<PatientInsurance> {
    return this.repository.update(id, updates);
  }

  delete(id: string): Promise<void> {
    return this.repository.delete(id);
  }

  activate(id: string): Promise<PatientInsurance> {
    return this.repository.activate(id);
  }

  deactivate(id: string): Promise<PatientInsurance> {
    return this.repository.deactivate(id);
  }

  activateAll(clinicId: string, patientId: string): Promise<void> {
    return this.repository.activateAllForPatient(clinicId, patientId);
  }

  deactivateAll(clinicId: string, patientId: string): Promise<void> {
    return this.repository.deactivateAllForPatient(clinicId, patientId);
  }
}
