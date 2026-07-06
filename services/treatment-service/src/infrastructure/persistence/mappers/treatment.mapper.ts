import type {
  ClinicalAttachment,
  Diagnosis,
  FollowUpRequest,
  MedicalDocumentRequest,
  TreatmentAct,
  TreatmentCharge,
  TreatmentGroup,
  TreatmentLocation,
  TreatmentPlanItem,
  Visit,
  VisitHandoff,
  VisitProcedure,
} from "../../../domain/entities";
import {
  ClinicalAttachmentTypeOrmEntity,
  DiagnosisTypeOrmEntity,
  FollowUpRequestTypeOrmEntity,
  MedicalDocumentRequestTypeOrmEntity,
  TreatmentActTypeOrmEntity,
  TreatmentChargeTypeOrmEntity,
  TreatmentGroupTypeOrmEntity,
  TreatmentPlanItemTypeOrmEntity,
  VisitHandoffTypeOrmEntity,
  VisitProcedureTypeOrmEntity,
  VisitTypeOrmEntity,
} from "../entities/treatment.typeorm-entities";

const asDate = (value: Date | string | undefined | null): Date | undefined =>
  value ? new Date(value) : undefined;

export class TreatmentMapper {
  static act(e: TreatmentActTypeOrmEntity): TreatmentAct {
    return {
      id: e.id,
      clinicId: e.clinic_id,
      name: e.name,
      category: e.category as TreatmentAct["category"],
      price: Number(e.price),
      groupableTeeth: e.groupable_teeth,
      affectsTooth: e.affects_tooth,
      visualType: (e.visual_type ?? undefined) as TreatmentAct["visualType"],
      defaultSurfaces: (e.default_surfaces ?? undefined) as TreatmentAct["defaultSurfaces"],
      active: e.active,
    };
  }

  static visit(e: VisitTypeOrmEntity): Visit {
    return {
      id: e.id,
      clinicId: e.clinic_id,
      patientId: e.patient_id,
      queueEntryId: e.queue_entry_id ?? undefined,
      appointmentId: e.appointment_id ?? undefined,
      chairId: e.chair_id,
      providerId: e.provider_id,
      status: e.status as Visit["status"],
      source: e.source as Visit["source"],
      startedAt: e.started_at,
      closedAt: asDate(e.closed_at),
      cancelledAt: asDate(e.cancelled_at),
      cancellationReason: e.cancellation_reason ?? undefined,
    };
  }

  static group(e: TreatmentGroupTypeOrmEntity): TreatmentGroup {
    return {
      id: e.id,
      clinicId: e.clinic_id,
      patientId: e.patient_id,
      actId: e.act_id,
      actName: e.act_name,
      toothIds: e.tooth_ids,
      billingMode: e.billing_mode as TreatmentGroup["billingMode"],
      createdAt: e.created_at,
      createdBy: e.created_by,
    };
  }

  static planItem(e: TreatmentPlanItemTypeOrmEntity): TreatmentPlanItem {
    return {
      id: e.id,
      clinicId: e.clinic_id,
      patientId: e.patient_id,
      actId: e.act_id,
      actName: e.act_name,
      price: Number(e.price),
      priority: e.priority as TreatmentPlanItem["priority"],
      status: e.status as TreatmentPlanItem["status"],
      location: e.location as unknown as TreatmentLocation,
      notes: e.notes ?? undefined,
      treatmentGroupId: e.treatment_group_id ?? undefined,
      visitProcedureIds: e.visit_procedure_ids ?? [],
      chargeId: e.charge_id ?? undefined,
      billingStatus: e.billing_status as TreatmentPlanItem["billingStatus"],
      createdAt: e.created_at,
      createdBy: e.created_by,
      startedAt: asDate(e.started_at),
      completedAt: asDate(e.completed_at),
      cancelledAt: asDate(e.cancelled_at),
      cancellationReason: e.cancellation_reason ?? undefined,
      voidedAt: asDate(e.voided_at),
      voidReason: e.void_reason ?? undefined,
      statusChangedAt: asDate(e.status_changed_at),
      statusChangedBy: e.status_changed_by ?? undefined,
    };
  }

  static procedure(e: VisitProcedureTypeOrmEntity): VisitProcedure {
    return {
      id: e.id,
      clinicId: e.clinic_id,
      patientId: e.patient_id,
      visitId: e.visit_id,
      treatmentPlanItemId: e.treatment_plan_item_id,
      actId: e.act_id,
      actName: e.act_name,
      location: e.location as unknown as TreatmentLocation,
      status: e.status as VisitProcedure["status"],
      action: e.action as VisitProcedure["action"],
      notes: e.notes ?? undefined,
      performedAt: e.performed_at,
      completedAt: asDate(e.completed_at),
      providerId: e.provider_id,
    };
  }

  static diagnosis(e: DiagnosisTypeOrmEntity): Diagnosis {
    return {
      id: e.id,
      clinicId: e.clinic_id,
      patientId: e.patient_id,
      diagnosis: e.diagnosis,
      location: e.location as unknown as TreatmentLocation,
      severity: e.severity as Diagnosis["severity"],
      certainty: e.certainty as Diagnosis["certainty"],
      status: e.status as Diagnosis["status"],
      evidence: e.evidence as Diagnosis["evidence"],
      attachmentIds: e.attachment_ids,
      symptoms: e.symptoms,
      painLevel: e.pain_level,
      notes: e.notes ?? undefined,
      createdAt: e.created_at,
      createdBy: e.created_by,
    };
  }

  static attachment(e: ClinicalAttachmentTypeOrmEntity): ClinicalAttachment {
    return {
      id: e.id,
      clinicId: e.clinic_id,
      patientId: e.patient_id,
      visitId: e.visit_id ?? undefined,
      type: e.type as ClinicalAttachment["type"],
      title: e.title,
      fileName: e.file_name,
      mimeType: e.mime_type,
      fileUrl: e.file_url,
      uploadedAt: e.uploaded_at,
      uploadedBy: e.uploaded_by,
    };
  }

  static handoff(e: VisitHandoffTypeOrmEntity): VisitHandoff {
    return {
      id: e.id,
      clinicId: e.clinic_id,
      patientId: e.patient_id,
      visitId: e.visit_id,
      treatmentPlanItemId: e.treatment_plan_item_id ?? undefined,
      text: e.text,
      status: e.status as VisitHandoff["status"],
      authoredBy: e.authored_by,
      savedAt: e.saved_at,
      codedAt: asDate(e.coded_at),
      codedBy: e.coded_by ?? undefined,
    };
  }

  static charge(e: TreatmentChargeTypeOrmEntity): TreatmentCharge {
    return {
      id: e.id,
      clinicId: e.clinic_id,
      patientId: e.patient_id,
      visitId: e.visit_id,
      sourceType: e.source_type as TreatmentCharge["sourceType"],
      sourceId: e.source_id,
      label: e.label,
      locationLabel: e.location_label,
      originalAmount: Number(e.original_amount),
      paidAmount: Number(e.paid_amount),
      remainingAmount: Number(e.remaining_amount),
      status: e.status as TreatmentCharge["status"],
      createdAt: e.created_at,
      createdBy: e.created_by,
    };
  }

  static followUp(e: FollowUpRequestTypeOrmEntity): FollowUpRequest {
    return {
      id: e.id,
      clinicId: e.clinic_id,
      patientId: e.patient_id,
      visitId: e.visit_id,
      treatmentPlanItemId: e.treatment_plan_item_id ?? undefined,
      reason: e.reason ?? undefined,
      preferredDate: asDate(e.preferred_date),
      urgency: e.urgency as FollowUpRequest["urgency"],
      status: e.status as FollowUpRequest["status"],
      requestedAt: e.requested_at,
      requestedBy: e.requested_by,
    };
  }

  static documentRequest(e: MedicalDocumentRequestTypeOrmEntity): MedicalDocumentRequest {
    return {
      id: e.id,
      clinicId: e.clinic_id,
      patientId: e.patient_id,
      visitId: e.visit_id,
      treatmentPlanItemId: e.treatment_plan_item_id ?? undefined,
      type: e.type as MedicalDocumentRequest["type"],
      reason: e.reason ?? undefined,
      status: e.status as MedicalDocumentRequest["status"],
      requestedAt: e.requested_at,
      requestedBy: e.requested_by,
    };
  }
}
