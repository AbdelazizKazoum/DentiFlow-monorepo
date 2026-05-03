import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm";
import {StaffRole} from "../../../domain/enums/staff-role.enum";
import {StaffStatus} from "../../../domain/enums/staff-status.enum";

@Entity("staff_members")
@Unique(["user_id", "clinic_id"])
@Index("idx_staff_clinic", ["clinic_id"])
@Index("idx_staff_role", ["clinic_id", "role"])
@Index("idx_staff_status", ["clinic_id", "status"])
@Index("idx_staff_name", ["clinic_id", "last_name", "first_name"])
export class StaffMemberTypeOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({name: "clinic_id"})
  clinic_id!: string;

  @Column({name: "user_id"})
  user_id!: string;

  @Column({type: "enum", enum: StaffRole})
  role!: StaffRole;

  @Column({type: "enum", enum: StaffStatus, default: StaffStatus.ACTIVE})
  status!: StaffStatus;

  @Column({name: "first_name", length: 100})
  first_name!: string;

  @Column({name: "last_name", length: 100})
  last_name!: string;

  @Column({length: 30, nullable: true, type: "varchar"})
  phone!: string | null;

  @Column({length: 255, nullable: true, type: "varchar"})
  email!: string | null;

  @Column({length: 255, nullable: true, type: "varchar"})
  specialization!: string | null;

  @Column({length: 500, nullable: true, type: "varchar"})
  avatar!: string | null;

  @Column({name: "is_active", default: true})
  is_active!: boolean;

  @CreateDateColumn({name: "created_at"})
  created_at!: Date;

  @UpdateDateColumn({name: "updated_at"})
  updated_at!: Date;
}
