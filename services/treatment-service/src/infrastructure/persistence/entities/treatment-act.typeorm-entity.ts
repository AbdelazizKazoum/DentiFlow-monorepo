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
import {Dentition} from "../../../domain/enums/dentition.enum";
import {ToothPart} from "../../../domain/enums/tooth-part.enum";
import {ToothSurface} from "../../../domain/enums/tooth-surface.enum";
import {TreatmentActStatus} from "../../../domain/enums/treatment-act-status.enum";
import {ActCatalogTypeOrmEntity} from "./act-catalog.typeorm-entity";
import {VisitTypeOrmEntity} from "./visit.typeorm-entity";

@Entity("treatment_acts")
@Index("idx_treatment_acts_visit", ["visit_id"])
@Index("idx_treatment_acts_clinic", ["clinic_id"])
export class TreatmentActTypeOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({name: "clinic_id", length: 36})
  clinic_id!: string;

  @Column({name: "visit_id", length: 36})
  visit_id!: string;

  @Column({name: "act_catalog_id", length: 36})
  act_catalog_id!: string;

  @Column({name: "tooth_fdi", length: 10, nullable: true, type: "varchar"})
  tooth_fdi!: string | null;

  @Column({default: 1})
  quantity!: number;

  @Column({name: "unit_price", type: "decimal", precision: 12, scale: 2})
  unit_price!: string;

  @Column({type: "enum", enum: ToothSurface, nullable: true})
  surface!: ToothSurface | null;

  @Column({name: "tooth_part", type: "enum", enum: ToothPart, nullable: true})
  tooth_part!: ToothPart | null;

  @Column({type: "enum", enum: Dentition, nullable: true})
  dentition!: Dentition | null;

  @Column({
    type: "enum",
    enum: TreatmentActStatus,
    default: TreatmentActStatus.PLANNED,
  })
  status!: TreatmentActStatus;

  @Column({type: "text", nullable: true})
  notes!: string | null;

  @Column({name: "entered_by", length: 36})
  entered_by!: string;

  @CreateDateColumn({name: "created_at"})
  created_at!: Date;

  @UpdateDateColumn({name: "updated_at"})
  updated_at!: Date;

  @ManyToOne(() => VisitTypeOrmEntity, {onDelete: "CASCADE"})
  @JoinColumn({name: "visit_id"})
  visit?: VisitTypeOrmEntity;

  @ManyToOne(() => ActCatalogTypeOrmEntity, {onDelete: "RESTRICT"})
  @JoinColumn({name: "act_catalog_id"})
  actCatalog?: ActCatalogTypeOrmEntity;
}
