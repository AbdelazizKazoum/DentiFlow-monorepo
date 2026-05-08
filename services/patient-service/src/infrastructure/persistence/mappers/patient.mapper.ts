import {Patient} from "../../../domain/entities/patient";
import {PatientTypeOrmEntity} from "../entities/patient.typeorm-entity";

export class PatientMapper {
  static toDomain(e: PatientTypeOrmEntity): Patient {
    return new Patient(
      e.id,
      e.clinic_id,
      e.first_name,
      e.last_name,
      e.status,
      e.created_at,
      e.updated_at,
      e.user_id,
      e.phone,
      e.email,
      e.date_of_birth,
      e.gender,
      e.address,
      e.notes,
      e.allergies,
      e.chronic_conditions,
      e.current_medications,
      e.medical_notes,
      e.deleted_at,
    );
  }

  static toEntity(d: Patient): Partial<PatientTypeOrmEntity> {
    return {
      ...(d.id ? {id: d.id} : {}),
      clinic_id: d.clinicId,
      first_name: d.firstName,
      last_name: d.lastName,
      user_id: d.userId,
      phone: d.phone,
      email: d.email,
      date_of_birth: d.dateOfBirth,
      gender: d.gender,
      address: d.address,
      notes: d.notes,
      allergies: d.allergies,
      chronic_conditions: d.chronicConditions,
      current_medications: d.currentMedications,
      medical_notes: d.medicalNotes,
      status: d.status,
      deleted_at: d.deletedAt,
    };
  }
}
