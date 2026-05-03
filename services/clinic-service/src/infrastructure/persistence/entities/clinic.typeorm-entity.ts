import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm";
import {Locale} from "../../../domain/enums/locale.enum";

@Entity("clinics")
@Unique(["slug"])
export class ClinicTypeOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({length: 100})
  slug!: string;

  @Column({length: 255})
  name!: string;

  @Column({length: 30, nullable: true, type: "varchar"})
  phone!: string | null;

  @Column({length: 255, nullable: true, type: "varchar"})
  email!: string | null;

  @Column({type: "text", nullable: true})
  address!: string | null;

  @Column({length: 60, default: "Africa/Algiers"})
  timezone!: string;

  @Column({type: "enum", enum: Locale, default: Locale.FR})
  locale!: Locale;

  @Column({name: "is_active", default: true})
  is_active!: boolean;

  @CreateDateColumn({name: "created_at"})
  created_at!: Date;

  @UpdateDateColumn({name: "updated_at"})
  updated_at!: Date;
}
