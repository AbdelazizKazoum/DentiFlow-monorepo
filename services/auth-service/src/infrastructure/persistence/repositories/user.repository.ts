import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {BaseRepository} from "../../../../../lib";
import {UserTypeOrmEntity} from "../entities/user.typeorm-entity";
import {IUserRepository} from "../../../domain/repositories/user-repository.interface";
import {User} from "../../../domain/entities/user";
import {UserMapper} from "../mappers/user.mapper";

@Injectable()
export class UserRepository
  extends BaseRepository<UserTypeOrmEntity>
  implements IUserRepository
{
  constructor(
    @InjectRepository(UserTypeOrmEntity)
    repo: Repository<UserTypeOrmEntity>,
  ) {
    super(repo);
  }

  async findByEmailAndClinic(
    email: string,
    clinicId: string,
  ): Promise<User | null> {
    const entity = await this.repo.findOne({
      where: {email, clinic_id: clinicId},
    });
    return entity ? UserMapper.toDomain(entity) : null;
  }

  // @ts-ignore - Intentionally overrides base class to return domain User instead of UserTypeOrmEntity
  async save(user: User): Promise<User> {
    const saved = await this.repo.save(
      UserMapper.toEntity(user) as UserTypeOrmEntity,
    );
    return UserMapper.toDomain(saved);
  }

  // @ts-ignore - Intentionally overrides base class to return domain User instead of UserTypeOrmEntity
  async findById(id: string, clinicId: string): Promise<User | null> {
    const entity = await this.repo.findOne({
      where: {id, clinic_id: clinicId},
    });
    return entity ? UserMapper.toDomain(entity) : null;
  }
}
