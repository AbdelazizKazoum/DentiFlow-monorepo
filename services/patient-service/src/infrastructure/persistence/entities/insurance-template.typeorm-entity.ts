import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import {InsuranceProviderTypeOrmEntity} from "./insurance-provider.typeorm-entity";

@Entity("insurance_templates")
@Index("idx_templates_provider", ["insurance_provider_id"])
export class InsuranceTemplateTypeOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({name: "insurance_provider_id"})
  insurance_provider_id!: string;

  @Column({length: 255})
  name!: string;

  @Column({name: "file_url", length: 500})
  file_url!: string;

  @CreateDateColumn({name: "created_at"})
  created_at!: Date;

  @ManyToOne(
    () => InsuranceProviderTypeOrmEntity,
    (provider) => provider.templates,
    {
      onDelete: "CASCADE",
    },
  )
  @JoinColumn({name: "insurance_provider_id"})
  provider!: InsuranceProviderTypeOrmEntity;
}
