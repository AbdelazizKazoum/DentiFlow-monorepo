import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import {DocumentType} from "../../../domain/enums/document-type.enum";
import {PatientTypeOrmEntity} from "./patient.typeorm-entity";

@Entity("patient_documents")
@Index("idx_documents_patient", ["clinic_id", "patient_id"])
export class PatientDocumentTypeOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({name: "clinic_id"})
  clinic_id!: string;

  @Column({name: "patient_id"})
  patient_id!: string;

  @Column({type: "enum", enum: DocumentType, default: DocumentType.GENERAL})
  type!: DocumentType;

  @Column({length: 255, nullable: true, type: "varchar"})
  title!: string | null;

  @Column({name: "file_url", length: 500})
  file_url!: string;

  @CreateDateColumn({name: "created_at"})
  created_at!: Date;

  @ManyToOne(() => PatientTypeOrmEntity, {onDelete: "CASCADE"})
  @JoinColumn({name: "patient_id"})
  patient!: PatientTypeOrmEntity;
}
