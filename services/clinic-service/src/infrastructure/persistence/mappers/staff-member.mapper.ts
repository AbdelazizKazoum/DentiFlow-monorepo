import {StaffMember} from "../../../domain/entities/staff-member";
import {StaffMemberTypeOrmEntity} from "../entities/staff-member.typeorm-entity";

export class StaffMemberMapper {
  static toDomain(e: StaffMemberTypeOrmEntity): StaffMember {
    return new StaffMember(
      e.id,
      e.clinic_id,
      e.user_id,
      e.role,
      e.status,
      e.first_name,
      e.last_name,
      e.phone,
      e.email,
      e.specialization,
      e.avatar,
      e.is_active,
      e.created_at,
      e.updated_at,
    );
  }

  static toEntity(d: StaffMember): Partial<StaffMemberTypeOrmEntity> {
    return {
      ...(d.id ? {id: d.id} : {}),
      clinic_id: d.clinicId,
      user_id: d.userId,
      role: d.role,
      status: d.status,
      first_name: d.firstName,
      last_name: d.lastName,
      phone: d.phone,
      email: d.email,
      specialization: d.specialization,
      avatar: d.avatar,
      is_active: d.isActive,
    };
  }
}
