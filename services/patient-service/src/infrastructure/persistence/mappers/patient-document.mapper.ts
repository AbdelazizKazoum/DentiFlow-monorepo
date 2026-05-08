import {PatientDocument} from "../../../domain/entities/patient-document";
import {PatientDocumentTypeOrmEntity} from "../entities/patient-document.typeorm-entity";

export class PatientDocumentMapper {
  static toDomain(e: PatientDocumentTypeOrmEntity): PatientDocument {
    return new PatientDocument(
      e.id,
      e.clinic_id,
      e.patient_id,
      e.type,
      e.title,
      e.file_url,
      e.created_at,
    );
  }

  static toEntity(d: PatientDocument): Partial<PatientDocumentTypeOrmEntity> {
    return {
      ...(d.id ? {id: d.id} : {}),
      clinic_id: d.clinicId,
      patient_id: d.patientId,
      type: d.type,
      title: d.title,
      file_url: d.fileUrl,
    };
  }
}
