import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm";
import {UserRole} from "../../../domain/enums/user-role.enum";

@Entity("users")
@Unique(["email", "clinic_id"])
export class UserTypeOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({name: "clinic_id"})
  clinic_id!: string;

  @Column()
  email!: string;

  @Column({name: "password_hash"})
  password_hash!: string;

  @Column({name: "full_name"})
  full_name!: string;

  @Column({type: "enum", enum: UserRole})
  role!: UserRole;

  @CreateDateColumn({name: "created_at"})
  created_at!: Date;

  @UpdateDateColumn({name: "updated_at"})
  updated_at!: Date;
}
