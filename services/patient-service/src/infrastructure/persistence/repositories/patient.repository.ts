import {Injectable, NotFoundException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Brackets, Repository} from "typeorm";
import {BaseRepository} from "../../../../../lib";
import {
  CreatePatientInput,
  IPatientRepository,
  ListPatientsQuery,
  PatientListResponse,
  UpdatePatientInput,
} from "../../../domain/repositories/patient-repository.interface";
import {Patient} from "../../../domain/entities/patient";
import {PatientStatus} from "../../../domain/enums/patient-status.enum";
import {PatientTypeOrmEntity} from "../entities/patient.typeorm-entity";
import {PatientMapper} from "../mappers/patient.mapper";

@Injectable()
export class PatientRepository
  extends BaseRepository<PatientTypeOrmEntity>
  implements IPatientRepository
{
  constructor(
    @InjectRepository(PatientTypeOrmEntity)
    repo: Repository<PatientTypeOrmEntity>,
  ) {
    super(repo);
  }

  // @ts-ignore override return type
  async findById(id: string): Promise<Patient | null> {
    const entity = await this.repo.findOne({where: {id}});
    return entity ? PatientMapper.toDomain(entity) : null;
  }

  async create(patient: CreatePatientInput): Promise<Patient> {
    const saved = await this.repo.save({
      clinic_id: patient.clinicId,
      first_name: patient.firstName,
      last_name: patient.lastName,
      user_id: patient.userId ?? null,
      phone: patient.phone ?? null,
      email: patient.email ?? null,
      date_of_birth: patient.dateOfBirth ?? null,
      gender: patient.gender ?? null,
      address: patient.address ?? null,
      notes: patient.notes ?? null,
      allergies: patient.allergies ?? null,
      chronic_conditions: patient.chronicConditions ?? null,
      current_medications: patient.currentMedications ?? null,
      medical_notes: patient.medicalNotes ?? null,
      status: patient.status ?? PatientStatus.ACTIVE,
      deleted_at: null,
    });
    return PatientMapper.toDomain(saved);
  }

  async update(id: string, updates: UpdatePatientInput): Promise<Patient> {
    const existing = await this.repo.findOne({where: {id}});
    if (!existing) throw new NotFoundException(`Patient \"${id}\" not found`);

    const saved = await this.repo.save({
      ...existing,
      ...(updates.firstName !== undefined
        ? {first_name: updates.firstName}
        : {}),
      ...(updates.lastName !== undefined ? {last_name: updates.lastName} : {}),
      ...(updates.phone !== undefined ? {phone: updates.phone} : {}),
      ...(updates.email !== undefined ? {email: updates.email} : {}),
      ...(updates.dateOfBirth !== undefined
        ? {date_of_birth: updates.dateOfBirth}
        : {}),
      ...(updates.gender !== undefined ? {gender: updates.gender} : {}),
      ...(updates.address !== undefined ? {address: updates.address} : {}),
      ...(updates.notes !== undefined ? {notes: updates.notes} : {}),
      ...(updates.allergies !== undefined
        ? {allergies: updates.allergies}
        : {}),
      ...(updates.chronicConditions !== undefined
        ? {chronic_conditions: updates.chronicConditions}
        : {}),
      ...(updates.currentMedications !== undefined
        ? {current_medications: updates.currentMedications}
        : {}),
      ...(updates.medicalNotes !== undefined
        ? {medical_notes: updates.medicalNotes}
        : {}),
      ...(updates.status !== undefined ? {status: updates.status} : {}),
    });

    return PatientMapper.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async findMany(query: ListPatientsQuery): Promise<PatientListResponse> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.max(1, Math.min(100, query.limit ?? 20));

    const qb = this.repo
      .createQueryBuilder("p")
      .where("p.clinic_id = :clinicId", {clinicId: query.clinicId});

    if (query.status) qb.andWhere("p.status = :status", {status: query.status});
    if (query.gender) qb.andWhere("p.gender = :gender", {gender: query.gender});

    if (query.search) {
      qb.andWhere(
        new Brackets((sqb) => {
          sqb
            .where("p.first_name LIKE :search", {search: `%${query.search}%`})
            .orWhere("p.last_name LIKE :search", {search: `%${query.search}%`})
            .orWhere("p.phone LIKE :search", {search: `%${query.search}%`})
            .orWhere("p.email LIKE :search", {search: `%${query.search}%`});
        }),
      );
    }

    if (query.isNew) {
      const threshold = new Date();
      threshold.setDate(threshold.getDate() - 30);
      qb.andWhere("p.created_at >= :threshold", {threshold});
    }

    if (query.createdFrom)
      qb.andWhere("p.created_at >= :createdFrom", {
        createdFrom: query.createdFrom,
      });
    if (query.createdTo)
      qb.andWhere("p.created_at <= :createdTo", {createdTo: query.createdTo});

    const sortMap: Record<string, string> = {
      firstName: "p.first_name",
      lastName: "p.last_name",
      createdAt: "p.created_at",
      updatedAt: "p.updated_at",
    };
    const sortBy = query.sortBy ? sortMap[query.sortBy] : "p.created_at";
    qb.orderBy(
      sortBy ?? "p.created_at",
      query.sortOrder === "asc" ? "ASC" : "DESC",
    );

    qb.skip((page - 1) * limit).take(limit);

    const [entities, total] = await qb.getManyAndCount();
    return {
      items: entities.map((e) => ({
        id: e.id,
        clinicId: e.clinic_id,
        firstName: e.first_name,
        lastName: e.last_name,
        fullName: `${e.first_name} ${e.last_name}`,
        status: e.status,
        phone: e.phone,
        email: e.email,
        dateOfBirth: e.date_of_birth,
        gender: e.gender,
        createdAt: e.created_at,
        updatedAt: e.updated_at,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async findByClinicId(clinicId: string): Promise<Patient[]> {
    const entities = await this.repo.find({
      where: {clinic_id: clinicId},
      order: {last_name: "ASC", first_name: "ASC"},
    });
    return entities.map(PatientMapper.toDomain);
  }

  async findActiveByClinicId(clinicId: string): Promise<Patient[]> {
    return this.findByClinicIdAndStatus(clinicId, PatientStatus.ACTIVE);
  }

  async findByClinicIdAndStatus(
    clinicId: string,
    status: PatientStatus,
  ): Promise<Patient[]> {
    const entities = await this.repo.find({
      where: {clinic_id: clinicId, status},
      order: {last_name: "ASC", first_name: "ASC"},
    });
    return entities.map(PatientMapper.toDomain);
  }

  async findByUserId(userId: string): Promise<Patient | null> {
    const entity = await this.repo.findOne({where: {user_id: userId}});
    return entity ? PatientMapper.toDomain(entity) : null;
  }

  async searchByName(
    clinicId: string,
    firstName?: string,
    lastName?: string,
  ): Promise<Patient[]> {
    const qb = this.repo
      .createQueryBuilder("p")
      .where("p.clinic_id = :clinicId", {clinicId});

    if (firstName)
      qb.andWhere("p.first_name LIKE :firstName", {
        firstName: `%${firstName}%`,
      });
    if (lastName)
      qb.andWhere("p.last_name LIKE :lastName", {lastName: `%${lastName}%`});

    const entities = await qb
      .orderBy("p.last_name", "ASC")
      .addOrderBy("p.first_name", "ASC")
      .getMany();
    return entities.map(PatientMapper.toDomain);
  }

  async searchByPhone(clinicId: string, phone: string): Promise<Patient[]> {
    const entities = await this.repo.find({
      where: {clinic_id: clinicId, phone},
      order: {last_name: "ASC", first_name: "ASC"},
    });
    return entities.map(PatientMapper.toDomain);
  }

  async findWithMedicalInfo(clinicId: string): Promise<Patient[]> {
    const entities = await this.repo
      .createQueryBuilder("p")
      .where("p.clinic_id = :clinicId", {clinicId})
      .andWhere(
        "(p.allergies IS NOT NULL OR p.chronic_conditions IS NOT NULL OR p.current_medications IS NOT NULL OR p.medical_notes IS NOT NULL)",
      )
      .orderBy("p.last_name", "ASC")
      .addOrderBy("p.first_name", "ASC")
      .getMany();

    return entities.map(PatientMapper.toDomain);
  }

  async findNewPatients(
    clinicId: string,
    daysThreshold = 30,
  ): Promise<Patient[]> {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - daysThreshold);

    const entities = await this.repo.find({
      where: {clinic_id: clinicId},
      order: {created_at: "DESC"},
    });

    return entities
      .filter((e) => e.created_at >= threshold)
      .map(PatientMapper.toDomain);
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.update(
      {id},
      {deleted_at: new Date(), status: PatientStatus.ARCHIVED},
    );
  }

  async restore(id: string): Promise<Patient> {
    await this.repo.update(
      {id},
      {deleted_at: null, status: PatientStatus.ACTIVE},
    );
    const restored = await this.repo.findOne({where: {id}});
    if (!restored) throw new NotFoundException(`Patient \"${id}\" not found`);
    return PatientMapper.toDomain(restored);
  }
}
