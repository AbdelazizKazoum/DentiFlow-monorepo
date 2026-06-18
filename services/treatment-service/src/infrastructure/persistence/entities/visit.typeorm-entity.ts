import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import {VisitStatus} from "../../../domain/enums/visit-status.enum";

@Entity("visits")
@Index("idx_visits_clinic", ["clinic_id"])
@Index("idx_visits_clinic_patient", ["clinic_id", "patient_id"])
@Index("idx_visits_clinic_doctor", ["clinic_id", "doctor_id"])
@Index("idx_visits_clinic_status", ["clinic_id", "status"])
@Index("idx_visits_appointment", ["appointment_id"])
export class VisitTypeOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({name: "clinic_id", length: 36})
  clinic_id!: string;

  @Column({name: "appointment_id", length: 36})
  appointment_id!: string;

  @Column({name: "patient_id", length: 36})
  patient_id!: string;

  @Column({name: "patient_name", length: 255})
  patient_name!: string;

  @Column({name: "doctor_id", length: 36})
  doctor_id!: string;

  @Column({name: "doctor_name", length: 255})
  doctor_name!: string;

  @Column({name: "assistant_id", length: 36, nullable: true, type: "varchar"})
  assistant_id!: string | null;

  @Column({name: "assistant_name", length: 255, nullable: true, type: "varchar"})
  assistant_name!: string | null;

  @Column({type: "enum", enum: VisitStatus, default: VisitStatus.OPEN})
  status!: VisitStatus;

  @Column({name: "total_amount", type: "decimal", precision: 12, scale: 2, default: 0})
  total_amount!: string;

  @Column({name: "confirmed_at", type: "datetime", nullable: true})
  confirmed_at!: Date | null;

  @Column({name: "confirmed_by", length: 36, nullable: true, type: "varchar"})
  confirmed_by!: string | null;

  @Column({name: "voided_at", type: "datetime", nullable: true})
  voided_at!: Date | null;

  @Column({name: "void_reason", type: "text", nullable: true})
  void_reason!: string | null;

  @CreateDateColumn({name: "created_at"})
  created_at!: Date;

  @UpdateDateColumn({name: "updated_at"})
  updated_at!: Date;
}
