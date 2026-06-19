import {Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import {Dentition} from "../../../domain/enums/dentition.enum";
import {ToothPart} from "../../../domain/enums/tooth-part.enum";
import {ToothSurface} from "../../../domain/enums/tooth-surface.enum";
import {TreatmentActStatus} from "../../../domain/enums/treatment-act-status.enum";

@Entity("treatment_plan_items")
@Index("idx_treatment_plan_patient", ["clinic_id", "patient_id"])
@Index("idx_treatment_plan_patient_status", ["clinic_id", "patient_id", "status"])
@Index("idx_treatment_plan_patient_tooth", ["clinic_id", "patient_id", "tooth_fdi"])
export class TreatmentPlanItemTypeOrmEntity {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column({name: "clinic_id", length: 36}) clinic_id!: string;
  @Column({name: "patient_id", length: 36}) patient_id!: string;
  @Column({name: "act_catalog_id", length: 36}) act_catalog_id!: string;
  @Column({name: "tooth_fdi", type: "varchar", length: 10, nullable: true}) tooth_fdi!: string | null;
  @Column({type: "enum", enum: ToothSurface, nullable: true}) surface!: ToothSurface | null;
  @Column({name: "tooth_part", type: "enum", enum: ToothPart, nullable: true}) tooth_part!: ToothPart | null;
  @Column({type: "enum", enum: Dentition, nullable: true}) dentition!: Dentition | null;
  @Column({type: "enum", enum: TreatmentActStatus, default: TreatmentActStatus.PLANNED}) status!: TreatmentActStatus;
  @Column({name: "diagnosis_notes", type: "text", nullable: true}) diagnosis_notes!: string | null;
  @Column({name: "created_visit_id", length: 36}) created_visit_id!: string;
  @Column({name: "completed_visit_id", type: "varchar", length: 36, nullable: true}) completed_visit_id!: string | null;
  @Column({name: "created_by", length: 36}) created_by!: string;
  @Column({name: "completed_by", type: "varchar", length: 36, nullable: true}) completed_by!: string | null;
  @CreateDateColumn({name: "created_at"}) created_at!: Date;
  @UpdateDateColumn({name: "updated_at"}) updated_at!: Date;
}
