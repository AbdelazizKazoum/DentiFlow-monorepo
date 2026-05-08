import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import {PatientGender} from "../../../domain/enums/patient-gender.enum";
import {PatientStatus} from "../../../domain/enums/patient-status.enum";

@Entity("patients")
@Index("idx_patients_clinic", ["clinic_id"])
@Index("idx_patients_user", ["user_id"])
@Index("idx_patients_phone", ["clinic_id", "phone"])
@Index("idx_patients_name", ["clinic_id", "last_name", "first_name"])
@Index("idx_patients_status", ["clinic_id", "status"])
export class PatientTypeOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({name: "clinic_id"})
  clinic_id!: string;

  @Column({name: "user_id", nullable: true, type: "varchar", length: 36})
  user_id!: string | null;

  @Column({name: "first_name", length: 100})
  first_name!: string;

  @Column({name: "last_name", length: 100})
  last_name!: string;

  @Column({length: 30, nullable: true, type: "varchar"})
  phone!: string | null;

  @Column({length: 255, nullable: true, type: "varchar"})
  email!: string | null;

  @Column({name: "date_of_birth", nullable: true, type: "date"})
  date_of_birth!: Date | null;

  @Column({type: "enum", enum: PatientGender, nullable: true})
  gender!: PatientGender | null;

  @Column({type: "text", nullable: true})
  address!: string | null;

  @Column({type: "text", nullable: true})
  notes!: string | null;

  @Column({name: "allergies", type: "text", nullable: true})
  allergies!: string | null;

  @Column({name: "chronic_conditions", type: "text", nullable: true})
  chronic_conditions!: string | null;

  @Column({name: "current_medications", type: "text", nullable: true})
  current_medications!: string | null;

  @Column({name: "medical_notes", type: "text", nullable: true})
  medical_notes!: string | null;

  @Column({type: "enum", enum: PatientStatus, default: PatientStatus.ACTIVE})
  status!: PatientStatus;

  @Column({name: "deleted_at", nullable: true, type: "datetime"})
  deleted_at!: Date | null;

  @CreateDateColumn({name: "created_at"})
  created_at!: Date;

  @UpdateDateColumn({name: "updated_at"})
  updated_at!: Date;
}
