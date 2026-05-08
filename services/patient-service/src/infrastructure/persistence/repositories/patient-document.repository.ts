import {Injectable, NotFoundException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {In, Repository} from "typeorm";
import {BaseRepository} from "../../../../../lib";
import {
  CreatePatientDocumentInput,
  IPatientDocumentRepository,
  UpdatePatientDocumentInput,
} from "../../../domain/repositories/patient-document-repository.interface";
import {PatientDocument} from "../../../domain/entities/patient-document";
import {DocumentType} from "../../../domain/enums/document-type.enum";
import {PatientDocumentTypeOrmEntity} from "../entities/patient-document.typeorm-entity";
import {PatientDocumentMapper} from "../mappers/patient-document.mapper";

@Injectable()
export class PatientDocumentRepository
  extends BaseRepository<PatientDocumentTypeOrmEntity>
  implements IPatientDocumentRepository
{
  constructor(
    @InjectRepository(PatientDocumentTypeOrmEntity)
    repo: Repository<PatientDocumentTypeOrmEntity>,
  ) {
    super(repo);
  }

  // @ts-ignore override return type
  async findById(id: string): Promise<PatientDocument | null> {
    const entity = await this.repo.findOne({where: {id}});
    return entity ? PatientDocumentMapper.toDomain(entity) : null;
  }

  async create(document: CreatePatientDocumentInput): Promise<PatientDocument> {
    const saved = await this.repo.save({
      clinic_id: document.clinicId,
      patient_id: document.patientId,
      type: document.type,
      title: document.title ?? null,
      file_url: document.fileUrl,
    });
    return PatientDocumentMapper.toDomain(saved);
  }

  async update(
    id: string,
    updates: UpdatePatientDocumentInput,
  ): Promise<PatientDocument> {
    const existing = await this.repo.findOne({where: {id}});
    if (!existing)
      throw new NotFoundException(`Patient document \"${id}\" not found`);

    const saved = await this.repo.save({
      ...existing,
      ...(updates.type !== undefined ? {type: updates.type} : {}),
      ...(updates.title !== undefined ? {title: updates.title} : {}),
      ...(updates.fileUrl !== undefined ? {file_url: updates.fileUrl} : {}),
    });
    return PatientDocumentMapper.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async findByPatientId(
    clinicId: string,
    patientId: string,
  ): Promise<PatientDocument[]> {
    const entities = await this.repo.find({
      where: {clinic_id: clinicId, patient_id: patientId},
      order: {created_at: "DESC"},
    });
    return entities.map(PatientDocumentMapper.toDomain);
  }

  async findByPatientIdAndType(
    clinicId: string,
    patientId: string,
    type: DocumentType,
  ): Promise<PatientDocument[]> {
    const entities = await this.repo.find({
      where: {clinic_id: clinicId, patient_id: patientId, type},
      order: {created_at: "DESC"},
    });
    return entities.map(PatientDocumentMapper.toDomain);
  }

  async findByClinicId(clinicId: string): Promise<PatientDocument[]> {
    const entities = await this.repo.find({
      where: {clinic_id: clinicId},
      order: {created_at: "DESC"},
    });
    return entities.map(PatientDocumentMapper.toDomain);
  }

  async findByClinicIdAndType(
    clinicId: string,
    type: DocumentType,
  ): Promise<PatientDocument[]> {
    const entities = await this.repo.find({
      where: {clinic_id: clinicId, type},
      order: {created_at: "DESC"},
    });
    return entities.map(PatientDocumentMapper.toDomain);
  }

  findMedicalDocuments(
    clinicId: string,
    patientId?: string,
  ): Promise<PatientDocument[]> {
    return patientId
      ? this.findByPatientIdAndType(clinicId, patientId, DocumentType.MEDICAL)
      : this.findByClinicIdAndType(clinicId, DocumentType.MEDICAL);
  }

  findInsuranceDocuments(
    clinicId: string,
    patientId?: string,
  ): Promise<PatientDocument[]> {
    return patientId
      ? this.findByPatientIdAndType(clinicId, patientId, DocumentType.INSURANCE)
      : this.findByClinicIdAndType(clinicId, DocumentType.INSURANCE);
  }

  findGeneralDocuments(
    clinicId: string,
    patientId?: string,
  ): Promise<PatientDocument[]> {
    return patientId
      ? this.findByPatientIdAndType(clinicId, patientId, DocumentType.GENERAL)
      : this.findByClinicIdAndType(clinicId, DocumentType.GENERAL);
  }

  async searchByTitle(
    clinicId: string,
    searchTerm: string,
    patientId?: string,
  ): Promise<PatientDocument[]> {
    const qb = this.repo
      .createQueryBuilder("pd")
      .where("pd.clinic_id = :clinicId", {clinicId})
      .andWhere("pd.title LIKE :search", {search: `%${searchTerm}%`});

    if (patientId) {
      qb.andWhere("pd.patient_id = :patientId", {patientId});
    }

    const entities = await qb.orderBy("pd.created_at", "DESC").getMany();
    return entities.map(PatientDocumentMapper.toDomain);
  }

  async findMultipleByIds(ids: string[]): Promise<PatientDocument[]> {
    if (!ids.length) return [];
    const entities = await this.repo.find({
      where: {id: In(ids)},
      order: {created_at: "DESC"},
    });
    return entities.map(PatientDocumentMapper.toDomain);
  }

  async deleteMultiple(ids: string[]): Promise<void> {
    if (!ids.length) return;
    await this.repo.delete({id: In(ids)});
  }
}
