import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import {PatientTypeOrmEntity} from "./patient.typeorm-entity";
import {InsuranceProviderTypeOrmEntity} from "./insurance-provider.typeorm-entity";

@Entity("patient_insurances")
@Index("idx_patient_insurance_patient", ["clinic_id", "patient_id"])
@Index("idx_patient_insurance_provider", ["clinic_id", "insurance_provider_id"])
export class PatientInsuranceTypeOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({name: "clinic_id"})
  clinic_id!: string;

  @Column({name: "patient_id"})
  patient_id!: string;

  @Column({name: "insurance_provider_id"})
  insurance_provider_id!: string;

  @Column({name: "policy_number", nullable: true, type: "varchar", length: 100})
  policy_number!: string | null;

  @Column({name: "member_id", nullable: true, type: "varchar", length: 100})
  member_id!: string | null;

  @Column({name: "is_active", default: true})
  is_active!: boolean;

  @CreateDateColumn({name: "created_at"})
  created_at!: Date;

  @UpdateDateColumn({name: "updated_at"})
  updated_at!: Date;

  @ManyToOne(() => PatientTypeOrmEntity, {onDelete: "CASCADE"})
  @JoinColumn({name: "patient_id"})
  patient!: PatientTypeOrmEntity;

  @ManyToOne(
    () => InsuranceProviderTypeOrmEntity,
    (provider) => provider.patientInsurances,
  )
  @JoinColumn({name: "insurance_provider_id"})
  provider!: InsuranceProviderTypeOrmEntity;
}
