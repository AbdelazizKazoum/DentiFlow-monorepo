import {User} from "../../../domain/entities/user";
import {UserTypeOrmEntity} from "../entities/user.typeorm-entity";

export class UserMapper {
  static toDomain(e: UserTypeOrmEntity): User {
    return new User(
      e.id,
      e.clinic_id,
      e.email,
      e.password_hash,
      e.full_name,
      e.role,
      e.created_at,
    );
  }

  static toEntity(d: User): Partial<UserTypeOrmEntity> {
    return {
      id: d.id,
      clinic_id: d.clinicId,
      email: d.email,
      password_hash: d.passwordHash,
      full_name: d.fullName,
      role: d.role,
    };
  }
}
