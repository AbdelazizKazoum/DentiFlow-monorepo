import {User} from "../entities/user";

export interface IUserRepository {
  findByEmailAndClinic(email: string, clinicId: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<User>;
  findById(id: string, clinicId: string): Promise<User | null>;
  findByIdGlobal(id: string): Promise<User | null>;
}
