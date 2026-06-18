import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm";

@Entity("act_catalog")
@Unique("uq_act_catalog_clinic_code", ["clinic_id", "code"])
@Index("idx_act_catalog_clinic", ["clinic_id"])
export class ActCatalogTypeOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({name: "clinic_id", length: 36})
  clinic_id!: string;

  @Column({length: 50})
  code!: string;

  @Column({name: "name_ar", length: 255})
  name_ar!: string;

  @Column({name: "name_fr", length: 255})
  name_fr!: string;

  @Column({name: "name_en", length: 255})
  name_en!: string;

  @Column({name: "default_price", type: "decimal", precision: 12, scale: 2})
  default_price!: string;

  @Column({name: "is_active", default: true})
  is_active!: boolean;

  @Column({type: "varchar", length: 80, nullable: true})
  icon!: string | null;

  @CreateDateColumn({name: "created_at"})
  created_at!: Date;

  @UpdateDateColumn({name: "updated_at"})
  updated_at!: Date;
}
