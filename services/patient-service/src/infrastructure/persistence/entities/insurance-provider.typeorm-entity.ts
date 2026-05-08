import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm";
import {InsuranceTemplateTypeOrmEntity} from "./insurance-template.typeorm-entity";
import {PatientInsuranceTypeOrmEntity} from "./patient-insurance.typeorm-entity";

@Entity("insurance_providers")
@Unique("uq_insurance_name_clinic", ["clinic_id", "name"])
@Index("idx_insurance_clinic", ["clinic_id"])
export class InsuranceProviderTypeOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({name: "clinic_id"})
  clinic_id!: string;

  @Column({length: 255})
  name!: string;

  @Column({length: 50, nullable: true, type: "varchar"})
  code!: string | null;

  @Column({name: "is_active", default: true})
  is_active!: boolean;

  @CreateDateColumn({name: "created_at"})
  created_at!: Date;

  @UpdateDateColumn({name: "updated_at"})
  updated_at!: Date;

  @OneToMany(() => InsuranceTemplateTypeOrmEntity, (tpl) => tpl.provider)
  templates!: InsuranceTemplateTypeOrmEntity[];

  @OneToMany(() => PatientInsuranceTypeOrmEntity, (pi) => pi.provider)
  patientInsurances!: PatientInsuranceTypeOrmEntity[];
}
