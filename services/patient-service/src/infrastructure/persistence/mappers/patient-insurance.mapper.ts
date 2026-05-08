import {PatientInsurance} from "../../../domain/entities/patient-insurance";
import {PatientInsuranceTypeOrmEntity} from "../entities/patient-insurance.typeorm-entity";

export class PatientInsuranceMapper {
  static toDomain(e: PatientInsuranceTypeOrmEntity): PatientInsurance {
    return new PatientInsurance(
      e.id,
      e.clinic_id,
      e.patient_id,
      e.insurance_provider_id,
      e.policy_number,
      e.member_id,
      e.is_active,
      e.created_at,
      e.updated_at,
    );
  }

  static toEntity(d: PatientInsurance): Partial<PatientInsuranceTypeOrmEntity> {
    return {
      ...(d.id ? {id: d.id} : {}),
      clinic_id: d.clinicId,
      patient_id: d.patientId,
      insurance_provider_id: d.insuranceProviderId,
      policy_number: d.policyNumber,
      member_id: d.memberId,
      is_active: d.isActive,
    };
  }
}
