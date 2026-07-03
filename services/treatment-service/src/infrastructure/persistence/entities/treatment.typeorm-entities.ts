import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("treatment_acts")
@Index("idx_treatment_acts_clinic_category", ["clinic_id", "category"])
@Index("idx_treatment_acts_active", ["active"])
export class TreatmentActTypeOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({name: "clinic_id", length: 36, nullable: true, type: "varchar"})
  clinic_id!: string | null;

  @Column({length: 255})
  name!: string;

  @Column({length: 40})
  category!: string;

  @Column({type: "decimal", precision: 10, scale: 2})
  price!: string;

  @Column({name: "groupable_teeth", default: false})
  groupable_teeth!: boolean;

  @Column({name: "visual_type", length: 40, nullable: true, type: "varchar"})
  visual_type!: string | null;

  @Column({name: "affects_tooth", default: true})
  affects_tooth!: boolean;

  @Column({name: "default_surfaces", nullable: true, type: "json"})
  default_surfaces!: string[] | null;

  @Column({default: true})
  active!: boolean;

  @CreateDateColumn({name: "created_at"})
  created_at!: Date;

  @UpdateDateColumn({name: "updated_at"})
  updated_at!: Date;
}

@Entity("visits")
@Index("idx_visits_clinic_patient_status", ["clinic_id", "patient_id", "status"])
@Index("idx_visits_clinic_queue", ["clinic_id", "queue_entry_id"])
@Index("idx_visits_clinic_started_at", ["clinic_id", "started_at"])
@Index("uq_visits_queue_entry", ["queue_entry_id"], {unique: true})
export class VisitTypeOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({name: "clinic_id", length: 36})
  clinic_id!: string;

  @Column({name: "patient_id", length: 36})
  patient_id!: string;

  @Column({name: "queue_entry_id", length: 36, nullable: true, type: "varchar"})
  queue_entry_id!: string | null;

  @Column({name: "appointment_id", length: 36, nullable: true, type: "varchar"})
  appointment_id!: string | null;

  @Column({name: "chair_id", length: 36})
  chair_id!: string;

  @Column({name: "provider_id", length: 36})
  provider_id!: string;

  @Column({length: 30, default: "OPEN"})
  status!: string;

  @Column({length: 20, default: "QUEUE"})
  source!: string;

  @Column({name: "started_at", type: "datetime"})
  started_at!: Date;

  @Column({name: "closed_at", nullable: true, type: "datetime"})
  closed_at!: Date | null;

  @Column({name: "cancelled_at", nullable: true, type: "datetime"})
  cancelled_at!: Date | null;

  @Column({name: "cancellation_reason", nullable: true, type: "text"})
  cancellation_reason!: string | null;

  @CreateDateColumn({name: "created_at"})
  created_at!: Date;

  @UpdateDateColumn({name: "updated_at"})
  updated_at!: Date;
}

@Entity("treatment_groups")
@Index("idx_treatment_groups_patient", ["clinic_id", "patient_id"])
export class TreatmentGroupTypeOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({name: "clinic_id", length: 36})
  clinic_id!: string;

  @Column({name: "patient_id", length: 36})
  patient_id!: string;

  @Column({name: "act_id", length: 36})
  act_id!: string;

  @Column({name: "act_name", length: 255})
  act_name!: string;

  @Column({name: "tooth_ids", type: "json"})
  tooth_ids!: number[];

  @Column({name: "billing_mode", length: 20})
  billing_mode!: string;

  @Column({name: "created_at", type: "datetime"})
  created_at!: Date;

  @Column({name: "created_by", length: 36})
  created_by!: string;
}

@Entity("treatment_plan_items")
@Index("idx_treatment_plan_patient_status", ["clinic_id", "patient_id", "status"])
@Index("idx_treatment_plan_group", ["treatment_group_id"])
@Index("idx_treatment_plan_charge", ["charge_id"])
export class TreatmentPlanItemTypeOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({name: "clinic_id", length: 36})
  clinic_id!: string;

  @Column({name: "patient_id", length: 36})
  patient_id!: string;

  @Column({name: "act_id", length: 36})
  act_id!: string;

  @Column({name: "act_name", length: 255})
  act_name!: string;

  @Column({type: "decimal", precision: 10, scale: 2})
  price!: string;

  @Column({length: 20})
  priority!: string;

  @Column({length: 30})
  status!: string;

  @Column({type: "json"})
  location!: Record<string, unknown>;

  @Column({nullable: true, type: "text"})
  notes!: string | null;

  @Column({name: "treatment_group_id", length: 36, nullable: true, type: "varchar"})
  treatment_group_id!: string | null;

  @Column({name: "visit_procedure_ids", type: "json"})
  visit_procedure_ids!: string[];

  @Column({name: "charge_id", length: 36, nullable: true, type: "varchar"})
  charge_id!: string | null;

  @Column({name: "billing_status", length: 20, default: "NOT_CHARGED"})
  billing_status!: string;

  @Column({name: "created_at", type: "datetime"})
  created_at!: Date;

  @Column({name: "created_by", length: 36})
  created_by!: string;

  @Column({name: "started_at", nullable: true, type: "datetime"})
  started_at!: Date | null;

  @Column({name: "completed_at", nullable: true, type: "datetime"})
  completed_at!: Date | null;

  @Column({name: "cancelled_at", nullable: true, type: "datetime"})
  cancelled_at!: Date | null;

  @Column({name: "cancellation_reason", nullable: true, type: "text"})
  cancellation_reason!: string | null;

  @Column({name: "voided_at", nullable: true, type: "datetime"})
  voided_at!: Date | null;

  @Column({name: "void_reason", nullable: true, type: "text"})
  void_reason!: string | null;

  @Column({name: "status_changed_at", nullable: true, type: "datetime"})
  status_changed_at!: Date | null;

  @Column({name: "status_changed_by", length: 36, nullable: true, type: "varchar"})
  status_changed_by!: string | null;

  @UpdateDateColumn({name: "updated_at"})
  updated_at!: Date;
}

@Entity("visit_procedures")
@Index("idx_visit_procedures_visit", ["visit_id"])
@Index("idx_visit_procedures_plan_item", ["treatment_plan_item_id"])
@Index("idx_visit_procedures_patient", ["clinic_id", "patient_id"])
export class VisitProcedureTypeOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({name: "clinic_id", length: 36})
  clinic_id!: string;

  @Column({name: "patient_id", length: 36})
  patient_id!: string;

  @Column({name: "visit_id", length: 36})
  visit_id!: string;

  @Column({name: "treatment_plan_item_id", length: 36})
  treatment_plan_item_id!: string;

  @Column({name: "act_id", length: 36})
  act_id!: string;

  @Column({name: "act_name", length: 255})
  act_name!: string;

  @Column({type: "json"})
  location!: Record<string, unknown>;

  @Column({length: 20})
  status!: string;

  @Column({length: 20})
  action!: string;

  @Column({nullable: true, type: "text"})
  notes!: string | null;

  @Column({name: "performed_at", type: "datetime"})
  performed_at!: Date;

  @Column({name: "completed_at", nullable: true, type: "datetime"})
  completed_at!: Date | null;

  @Column({name: "provider_id", length: 36})
  provider_id!: string;

  @CreateDateColumn({name: "created_at"})
  created_at!: Date;

  @UpdateDateColumn({name: "updated_at"})
  updated_at!: Date;
}

@Entity("diagnoses")
@Index("idx_diagnoses_patient_status", ["clinic_id", "patient_id", "status"])
@Index("idx_diagnoses_created_at", ["clinic_id", "created_at"])
export class DiagnosisTypeOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({name: "clinic_id", length: 36})
  clinic_id!: string;

  @Column({name: "patient_id", length: 36})
  patient_id!: string;

  @Column({length: 255})
  diagnosis!: string;

  @Column({type: "json"})
  location!: Record<string, unknown>;

  @Column({length: 20})
  severity!: string;

  @Column({length: 20})
  certainty!: string;

  @Column({length: 20})
  status!: string;

  @Column({type: "json"})
  evidence!: string[];

  @Column({name: "attachment_ids", type: "json"})
  attachment_ids!: string[];

  @Column({type: "json"})
  symptoms!: string[];

  @Column({name: "pain_level", default: 0})
  pain_level!: number;

  @Column({nullable: true, type: "text"})
  notes!: string | null;

  @Column({name: "created_at", type: "datetime"})
  created_at!: Date;

  @Column({name: "created_by", length: 36})
  created_by!: string;
}

@Entity("clinical_attachments")
@Index("idx_attachments_patient", ["clinic_id", "patient_id"])
@Index("idx_attachments_visit", ["visit_id"])
export class ClinicalAttachmentTypeOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({name: "clinic_id", length: 36})
  clinic_id!: string;

  @Column({name: "patient_id", length: 36})
  patient_id!: string;

  @Column({name: "visit_id", length: 36, nullable: true, type: "varchar"})
  visit_id!: string | null;

  @Column({length: 20})
  type!: string;

  @Column({length: 255})
  title!: string;

  @Column({name: "file_name", length: 255})
  file_name!: string;

  @Column({name: "mime_type", length: 100})
  mime_type!: string;

  @Column({name: "file_url", type: "text"})
  file_url!: string;

  @Column({name: "uploaded_at", type: "datetime"})
  uploaded_at!: Date;

  @Column({name: "uploaded_by", length: 36})
  uploaded_by!: string;
}

@Entity("visit_handoffs")
@Index("idx_handoffs_visit", ["visit_id"])
@Index("idx_handoffs_patient", ["clinic_id", "patient_id"])
export class VisitHandoffTypeOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({name: "clinic_id", length: 36})
  clinic_id!: string;

  @Column({name: "visit_id", length: 36})
  visit_id!: string;

  @Column({name: "patient_id", length: 36})
  patient_id!: string;

  @Column({name: "treatment_plan_item_id", length: 36, nullable: true, type: "varchar"})
  treatment_plan_item_id!: string | null;

  @Column({type: "text"})
  text!: string;

  @Column({length: 30})
  status!: string;

  @Column({name: "authored_by", length: 36})
  authored_by!: string;

  @Column({name: "saved_at", type: "datetime"})
  saved_at!: Date;

  @Column({name: "coded_at", nullable: true, type: "datetime"})
  coded_at!: Date | null;

  @Column({name: "coded_by", length: 36, nullable: true, type: "varchar"})
  coded_by!: string | null;
}

@Entity("treatment_charges")
@Index("idx_treatment_charges_patient", ["clinic_id", "patient_id", "status"])
@Index("idx_treatment_charges_visit", ["visit_id"])
@Index("idx_treatment_charges_source", ["source_type", "source_id"])
export class TreatmentChargeTypeOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({name: "clinic_id", length: 36})
  clinic_id!: string;

  @Column({name: "patient_id", length: 36})
  patient_id!: string;

  @Column({name: "visit_id", length: 36})
  visit_id!: string;

  @Column({name: "source_type", length: 40})
  source_type!: string;

  @Column({name: "source_id", length: 36})
  source_id!: string;

  @Column({length: 255})
  label!: string;

  @Column({name: "location_label", length: 255})
  location_label!: string;

  @Column({name: "original_amount", type: "decimal", precision: 10, scale: 2})
  original_amount!: string;

  @Column({name: "paid_amount", type: "decimal", precision: 10, scale: 2, default: 0})
  paid_amount!: string;

  @Column({name: "remaining_amount", type: "decimal", precision: 10, scale: 2})
  remaining_amount!: string;

  @Column({length: 30})
  status!: string;

  @Column({name: "created_at", type: "datetime"})
  created_at!: Date;

  @Column({name: "created_by", length: 36})
  created_by!: string;
}

@Entity("follow_up_requests")
export class FollowUpRequestTypeOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({name: "clinic_id", length: 36})
  clinic_id!: string;

  @Column({name: "patient_id", length: 36})
  patient_id!: string;

  @Column({name: "visit_id", length: 36})
  visit_id!: string;

  @Column({name: "treatment_plan_item_id", length: 36, nullable: true, type: "varchar"})
  treatment_plan_item_id!: string | null;

  @Column({nullable: true, type: "text"})
  reason!: string | null;

  @Column({name: "preferred_date", nullable: true, type: "date"})
  preferred_date!: string | null;

  @Column({length: 20})
  urgency!: string;

  @Column({length: 20, default: "REQUESTED"})
  status!: string;

  @Column({name: "requested_at", type: "datetime"})
  requested_at!: Date;

  @Column({name: "requested_by", length: 36})
  requested_by!: string;
}

@Entity("medical_document_requests")
export class MedicalDocumentRequestTypeOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({name: "clinic_id", length: 36})
  clinic_id!: string;

  @Column({name: "patient_id", length: 36})
  patient_id!: string;

  @Column({name: "visit_id", length: 36})
  visit_id!: string;

  @Column({name: "treatment_plan_item_id", length: 36, nullable: true, type: "varchar"})
  treatment_plan_item_id!: string | null;

  @Column({length: 40})
  type!: string;

  @Column({nullable: true, type: "text"})
  reason!: string | null;

  @Column({length: 20, default: "REQUESTED"})
  status!: string;

  @Column({name: "requested_at", type: "datetime"})
  requested_at!: Date;

  @Column({name: "requested_by", length: 36})
  requested_by!: string;
}

@Entity("outbox")
@Index("idx_outbox_unpublished", ["published", "created_at"])
export class OutboxTypeOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({name: "event_type", length: 100})
  event_type!: string;

  @Column({type: "json"})
  payload!: Record<string, unknown>;

  @Column({default: false})
  published!: boolean;

  @CreateDateColumn({name: "created_at"})
  created_at!: Date;
}
