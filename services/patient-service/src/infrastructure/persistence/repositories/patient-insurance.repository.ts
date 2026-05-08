import {Injectable, NotFoundException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {BaseRepository} from "../../../../../lib";
import {
  CreatePatientInsuranceInput,
  IPatientInsuranceRepository,
  UpdatePatientInsuranceInput,
} from "../../../domain/repositories/patient-insurance-repository.interface";
import {PatientInsurance} from "../../../domain/entities/patient-insurance";
import {PatientInsuranceTypeOrmEntity} from "../entities/patient-insurance.typeorm-entity";
import {PatientInsuranceMapper} from "../mappers/patient-insurance.mapper";

@Injectable()
export class PatientInsuranceRepository
  extends BaseRepository<PatientInsuranceTypeOrmEntity>
  implements IPatientInsuranceRepository
{
  constructor(
    @InjectRepository(PatientInsuranceTypeOrmEntity)
    repo: Repository<PatientInsuranceTypeOrmEntity>,
  ) {
    super(repo);
  }

  // @ts-ignore override return type
  async findById(id: string): Promise<PatientInsurance | null> {
    const entity = await this.repo.findOne({where: {id}});
    return entity ? PatientInsuranceMapper.toDomain(entity) : null;
  }

  async create(
    insurance: CreatePatientInsuranceInput,
  ): Promise<PatientInsurance> {
    const saved = await this.repo.save({
      clinic_id: insurance.clinicId,
      patient_id: insurance.patientId,
      insurance_provider_id: insurance.insuranceProviderId,
      policy_number: insurance.policyNumber ?? null,
      member_id: insurance.memberId ?? null,
      is_active: insurance.isActive ?? true,
    });
    return PatientInsuranceMapper.toDomain(saved);
  }

  async update(
    id: string,
    updates: UpdatePatientInsuranceInput,
  ): Promise<PatientInsurance> {
    const existing = await this.repo.findOne({where: {id}});
    if (!existing)
      throw new NotFoundException(`Patient insurance \"${id}\" not found`);

    const saved = await this.repo.save({
      ...existing,
      ...(updates.policyNumber !== undefined
        ? {policy_number: updates.policyNumber}
        : {}),
      ...(updates.memberId !== undefined ? {member_id: updates.memberId} : {}),
      ...(updates.isActive !== undefined ? {is_active: updates.isActive} : {}),
    });
    return PatientInsuranceMapper.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async findByPatientId(
    clinicId: string,
    patientId: string,
  ): Promise<PatientInsurance[]> {
    const entities = await this.repo.find({
      where: {clinic_id: clinicId, patient_id: patientId},
      order: {created_at: "DESC"},
    });
    return entities.map(PatientInsuranceMapper.toDomain);
  }

  async findActiveByPatientId(
    clinicId: string,
    patientId: string,
  ): Promise<PatientInsurance[]> {
    const entities = await this.repo.find({
      where: {clinic_id: clinicId, patient_id: patientId, is_active: true},
      order: {created_at: "DESC"},
    });
    return entities.map(PatientInsuranceMapper.toDomain);
  }

  async findByProviderId(
    clinicId: string,
    providerId: string,
  ): Promise<PatientInsurance[]> {
    const entities = await this.repo.find({
      where: {clinic_id: clinicId, insurance_provider_id: providerId},
      order: {created_at: "DESC"},
    });
    return entities.map(PatientInsuranceMapper.toDomain);
  }

  async findActiveByProviderId(
    clinicId: string,
    providerId: string,
  ): Promise<PatientInsurance[]> {
    const entities = await this.repo.find({
      where: {
        clinic_id: clinicId,
        insurance_provider_id: providerId,
        is_active: true,
      },
      order: {created_at: "DESC"},
    });
    return entities.map(PatientInsuranceMapper.toDomain);
  }

  async findByClinicId(clinicId: string): Promise<PatientInsurance[]> {
    const entities = await this.repo.find({
      where: {clinic_id: clinicId},
      order: {created_at: "DESC"},
    });
    return entities.map(PatientInsuranceMapper.toDomain);
  }

  async findActiveByClinicId(clinicId: string): Promise<PatientInsurance[]> {
    const entities = await this.repo.find({
      where: {clinic_id: clinicId, is_active: true},
      order: {created_at: "DESC"},
    });
    return entities.map(PatientInsuranceMapper.toDomain);
  }

  async findByPolicyNumber(
    clinicId: string,
    policyNumber: string,
  ): Promise<PatientInsurance[]> {
    const entities = await this.repo.find({
      where: {clinic_id: clinicId, policy_number: policyNumber},
      order: {created_at: "DESC"},
    });
    return entities.map(PatientInsuranceMapper.toDomain);
  }

  async findByMemberId(
    clinicId: string,
    memberId: string,
  ): Promise<PatientInsurance[]> {
    const entities = await this.repo.find({
      where: {clinic_id: clinicId, member_id: memberId},
      order: {created_at: "DESC"},
    });
    return entities.map(PatientInsuranceMapper.toDomain);
  }

  async activate(id: string): Promise<PatientInsurance> {
    return this.update(id, {isActive: true});
  }

  async deactivate(id: string): Promise<PatientInsurance> {
    return this.update(id, {isActive: false});
  }

  async activateAllForPatient(
    clinicId: string,
    patientId: string,
  ): Promise<void> {
    await this.repo.update(
      {clinic_id: clinicId, patient_id: patientId},
      {is_active: true},
    );
  }

  async deactivateAllForPatient(
    clinicId: string,
    patientId: string,
  ): Promise<void> {
    await this.repo.update(
      {clinic_id: clinicId, patient_id: patientId},
      {is_active: false},
    );
  }
}
