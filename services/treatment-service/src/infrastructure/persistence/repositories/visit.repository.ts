import {Injectable, NotFoundException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Not, Repository} from "typeorm";
import {
  IVisitRepository,
  OpenVisitInput,
} from "../../../domain/repositories/visit-repository.interface";
import {Visit} from "../../../domain/entities/visit";
import {VisitStatus} from "../../../domain/enums/visit-status.enum";
import {VisitTypeOrmEntity} from "../entities/visit.typeorm-entity";
import {VisitMapper} from "../mappers/visit.mapper";

@Injectable()
export class VisitRepository implements IVisitRepository {
  constructor(
    @InjectRepository(VisitTypeOrmEntity)
    private readonly repo: Repository<VisitTypeOrmEntity>,
  ) {}

  async findById(id: string): Promise<Visit | null> {
    const entity = await this.repo.findOne({where: {id}});
    return entity ? VisitMapper.toDomain(entity) : null;
  }

  async findActiveByAppointmentId(appointmentId: string): Promise<Visit | null> {
    const entity = await this.repo.findOne({
      where: {appointment_id: appointmentId, status: Not(VisitStatus.VOIDED)},
      order: {created_at: "DESC"},
    });
    return entity ? VisitMapper.toDomain(entity) : null;
  }

  async listOpenByClinic(clinicId: string, doctorId?: string): Promise<Visit[]> {
    const entities = await this.repo.find({
      where: {
        clinic_id: clinicId,
        status: VisitStatus.OPEN,
        ...(doctorId ? {doctor_id: doctorId} : {}),
      },
      order: {created_at: "ASC"},
    });
    return entities.map(VisitMapper.toDomain);
  }

  async create(input: OpenVisitInput): Promise<Visit> {
    const saved = await this.repo.save({
      clinic_id: input.clinicId,
      appointment_id: input.appointmentId,
      patient_id: input.patientId,
      patient_name: input.patientName,
      doctor_id: input.doctorId,
      doctor_name: input.doctorName,
      assistant_id: null,
      assistant_name: null,
      status: VisitStatus.OPEN,
      total_amount: "0.00",
      confirmed_at: null,
      confirmed_by: null,
      voided_at: null,
      void_reason: null,
    });
    return VisitMapper.toDomain(saved);
  }

  async assignAssistant(
    visitId: string,
    assistantId: string,
    assistantName: string,
  ): Promise<Visit> {
    const existing = await this.getEntity(visitId);
    const saved = await this.repo.save({
      ...existing,
      assistant_id: assistantId,
      assistant_name: assistantName,
    });
    return VisitMapper.toDomain(saved);
  }

  async updateTotalAmount(visitId: string, totalAmount: number): Promise<void> {
    await this.repo.update(visitId, {total_amount: totalAmount.toFixed(2)});
  }

  async confirm(visitId: string, confirmedBy: string): Promise<Visit> {
    const existing = await this.getEntity(visitId);
    const saved = await this.repo.save({
      ...existing,
      status: VisitStatus.CONFIRMED,
      confirmed_at: new Date(),
      confirmed_by: confirmedBy,
    });
    return VisitMapper.toDomain(saved);
  }

  async close(visitId: string): Promise<Visit> {
    const existing = await this.getEntity(visitId);
    const saved = await this.repo.save({...existing, status: VisitStatus.CLOSED});
    return VisitMapper.toDomain(saved);
  }

  async void(visitId: string, reason: string): Promise<Visit> {
    const existing = await this.getEntity(visitId);
    const saved = await this.repo.save({
      ...existing,
      status: VisitStatus.VOIDED,
      voided_at: new Date(),
      void_reason: reason,
    });
    return VisitMapper.toDomain(saved);
  }

  private async getEntity(id: string): Promise<VisitTypeOrmEntity> {
    const entity = await this.repo.findOne({where: {id}});
    if (!entity) throw new NotFoundException(`Visit "${id}" not found`);
    return entity;
  }
}
