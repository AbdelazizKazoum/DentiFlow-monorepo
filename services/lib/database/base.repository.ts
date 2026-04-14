import {
  DeepPartial,
  FindManyOptions,
  FindOptionsWhere,
  Repository,
} from "typeorm";

/**
 * BaseRepository<T> — abstract generic repository enforcing clinic_id
 * scoping on every DB operation.
 *
 * EVERY service repository MUST extend this class.
 * T requires `id: string` (UUID v4) and `clinic_id: string`.
 *
 * Usage:
 *   @Injectable()
 *   export class UserRepository extends BaseRepository<UserEntity> {
 *     constructor(@InjectRepository(UserEntity) repo: Repository<UserEntity>) {
 *       super(repo);
 *     }
 *   }
 */
export abstract class BaseRepository<
  T extends {id: string; clinic_id: string},
> {
  constructor(protected readonly repo: Repository<T>) {}

  findById(id: string, clinicId: string): Promise<T | null> {
    return this.repo.findOne({
      where: {id, clinic_id: clinicId} as FindOptionsWhere<T>,
    });
  }

  findAll(
    clinicId: string,
    options?: Omit<FindManyOptions<T>, "where">,
  ): Promise<T[]> {
    return this.repo.find({
      ...options,
      where: {clinic_id: clinicId} as FindOptionsWhere<T>,
    });
  }

  save(entity: DeepPartial<T>): Promise<T> {
    return this.repo.save(entity);
  }

  async delete(id: string, clinicId: string): Promise<void> {
    await this.repo.delete({id, clinic_id: clinicId} as FindOptionsWhere<T>);
  }

  count(clinicId: string): Promise<number> {
    return this.repo.count({
      where: {clinic_id: clinicId} as FindOptionsWhere<T>,
    });
  }
}
