import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {BaseRepository} from "../../../../../lib";
import {StaffMemberTypeOrmEntity} from "../entities/staff-member.typeorm-entity";
import {IStaffMemberRepository} from "../../../domain/repositories/staff-member-repository.interface";
import {StaffMember} from "../../../domain/entities/staff-member";
import {StaffMemberMapper} from "../mappers/staff-member.mapper";

@Injectable()
export class StaffMemberRepository
  extends BaseRepository<StaffMemberTypeOrmEntity>
  implements IStaffMemberRepository
{
  constructor(
    @InjectRepository(StaffMemberTypeOrmEntity)
    repo: Repository<StaffMemberTypeOrmEntity>,
  ) {
    super(repo);
  }

  async findByUserAndClinic(
    userId: string,
    clinicId: string,
  ): Promise<StaffMember | null> {
    const entity = await this.repo.findOne({
      where: {user_id: userId, clinic_id: clinicId},
    });
    return entity ? StaffMemberMapper.toDomain(entity) : null;
  }

  async findByClinic(clinicId: string): Promise<StaffMember[]> {
    const entities = await this.repo.find({
      where: {clinic_id: clinicId},
      order: {last_name: "ASC", first_name: "ASC"},
    });
    return entities.map(StaffMemberMapper.toDomain);
  }

  // @ts-ignore - Intentionally overrides base class to return domain StaffMember
  async findById(id: string, clinicId: string): Promise<StaffMember | null> {
    const entity = await this.repo.findOne({where: {id, clinic_id: clinicId}});
    return entity ? StaffMemberMapper.toDomain(entity) : null;
  }

  // @ts-ignore - Intentionally overrides base class to return domain StaffMember
  async save(staffMember: StaffMember): Promise<StaffMember> {
    const saved = await this.repo.save(
      StaffMemberMapper.toEntity(staffMember) as StaffMemberTypeOrmEntity,
    );
    return StaffMemberMapper.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
