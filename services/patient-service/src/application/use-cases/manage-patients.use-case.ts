import {Inject, Injectable, NotFoundException} from "@nestjs/common";
import {
  CreatePatientInput,
  IPatientRepository,
  ListPatientsQuery,
  PatientListResponse,
  UpdatePatientInput,
} from "../../domain/repositories/patient-repository.interface";
import {Patient} from "../../domain/entities/patient";
import {PATIENT_REPOSITORY} from "../../shared/constants/injection-tokens";

@Injectable()
export class ManagePatientsUseCase {
  constructor(
    @Inject(PATIENT_REPOSITORY)
    private readonly patientRepository: IPatientRepository,
  ) {}

  create(input: CreatePatientInput): Promise<Patient> {
    return this.patientRepository.create(input);
  }

  async getById(id: string): Promise<Patient> {
    const patient = await this.patientRepository.findById(id);
    if (!patient) {
      throw new NotFoundException(`Patient \"${id}\" not found`);
    }
    return patient;
  }

  list(query: ListPatientsQuery): Promise<PatientListResponse> {
    return this.patientRepository.findMany(query);
  }

  update(id: string, input: UpdatePatientInput): Promise<Patient> {
    return this.patientRepository.update(id, input);
  }

  delete(id: string): Promise<void> {
    return this.patientRepository.delete(id);
  }

  softDelete(id: string): Promise<void> {
    return this.patientRepository.softDelete(id);
  }

  restore(id: string): Promise<Patient> {
    return this.patientRepository.restore(id);
  }

  async getByUserId(userId: string): Promise<Patient> {
    const patient = await this.patientRepository.findByUserId(userId);
    if (!patient) {
      throw new NotFoundException(
        `Patient with userId \"${userId}\" not found`,
      );
    }
    return patient;
  }

  searchByName(
    clinicId: string,
    firstName?: string,
    lastName?: string,
  ): Promise<Patient[]> {
    return this.patientRepository.searchByName(clinicId, firstName, lastName);
  }

  listByClinic(clinicId: string): Promise<Patient[]> {
    return this.patientRepository.findByClinicId(clinicId);
  }

  listWithMedicalInfo(clinicId: string): Promise<Patient[]> {
    return this.patientRepository.findWithMedicalInfo(clinicId);
  }
}
