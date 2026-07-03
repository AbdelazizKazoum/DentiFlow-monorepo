import {Controller} from "@nestjs/common";
import {TreatmentProto} from "@lib/proto";
import {ManageTreatmentWorkspaceUseCase} from "../../application/use-cases/manage-treatment-workspace.use-case";
import {ManageVisitWorkflowUseCase} from "../../application/use-cases/manage-visit-workflow.use-case";
import {
  attachmentFromGrpc,
  attachmentToGrpc,
  chargeToGrpc,
  diagnosisToGrpc,
  documentToGrpc,
  followUpToGrpc,
  parseDate,
  parseJsonRecord,
  planItemToGrpc,
  procedureToGrpc,
  visitToGrpc,
  workspaceToGrpc,
} from "./treatment.grpc-mapper";
import {toRpcError} from "./rpc-error.helper";

@Controller()
@TreatmentProto.TreatmentServiceControllerMethods()
export class TreatmentGrpcController implements TreatmentProto.TreatmentServiceController {
  constructor(
    private readonly visits: ManageVisitWorkflowUseCase,
    private readonly workspace: ManageTreatmentWorkspaceUseCase,
  ) {}

  async createVisitFromQueue(request: TreatmentProto.CreateVisitFromQueueRequest) {
    try {
      return visitToGrpc(
        await this.visits.createVisitFromQueue({
          clinicId: request.clinicId,
          patientId: request.patientId,
          queueEntryId: request.queueEntryId,
          appointmentId: request.appointmentId || undefined,
          chairId: request.chairId,
          providerId: request.providerId,
          startedAt: parseDate(request.startedAt),
        }),
      );
    } catch (err) {
      toRpcError(err);
    }
  }

  async getTreatmentWorkspace(request: TreatmentProto.GetTreatmentWorkspaceRequest) {
    try {
      return workspaceToGrpc(
        await this.workspace.getWorkspace({
          clinicId: request.clinicId,
          patientId: request.patientId,
          activeVisitId: request.activeVisitId || undefined,
        }),
      );
    } catch (err) {
      toRpcError(err);
    }
  }

  async createTreatmentPlanItems(request: TreatmentProto.CreateTreatmentPlanItemsRequest) {
    try {
      const result = await this.workspace.createTreatmentPlanItems({
        clinicId: request.clinicId,
        patientId: request.patientId,
        actId: request.actId,
        selectedTeeth: request.selectedTeeth,
        mouthRegionId: request.mouthRegionId || undefined,
        surfacesByTooth: parseJsonRecord(request.surfacesByToothJson, {}),
        priority: request.priority as never,
        notes: request.notes || undefined,
        dentition: request.dentition as never,
        providerId: request.providerId,
      });
      return {items: result.items.map(planItemToGrpc)};
    } catch (err) {
      toRpcError(err);
    }
  }

  async createDiagnosis(request: TreatmentProto.CreateDiagnosisRequest) {
    try {
      return diagnosisToGrpc(
        await this.workspace.createDiagnosis({
          clinicId: request.clinicId,
          patientId: request.patientId,
          diagnosis: request.diagnosis,
          selectedTeeth: request.selectedTeeth,
          mouthRegionId: request.mouthRegionId || undefined,
          surfacesByTooth: parseJsonRecord(request.surfacesByToothJson, {}),
          severity: request.severity as never,
          certainty: request.certainty as never,
          status: request.status as never,
          evidence: request.evidence as never,
          attachmentIds: request.attachmentIds,
          symptoms: request.symptoms,
          painLevel: request.painLevel,
          notes: request.notes || undefined,
          dentition: request.dentition as never,
          providerId: request.providerId,
        }),
      );
    } catch (err) {
      toRpcError(err);
    }
  }

  async startTreatment(request: TreatmentProto.StartTreatmentRequest) {
    try {
      const result = await this.workspace.startTreatment(request);
      return {
        treatmentItem: planItemToGrpc(result.treatmentItem),
        procedure: procedureToGrpc(result.procedure),
        charge: result.charge ? chargeToGrpc(result.charge) : undefined,
        reusedExistingProcedure: result.reusedExistingProcedure,
      };
    } catch (err) {
      toRpcError(err);
    }
  }

  async completeVisitProcedure(request: TreatmentProto.CompleteVisitProcedureRequest) {
    try {
      const result = await this.workspace.completeVisitProcedure({
        clinicId: request.clinicId,
        patientId: request.patientId || undefined,
        visitProcedureId: request.visitProcedureId,
        providerId: request.providerId,
      });
      return {
        procedure: procedureToGrpc(result.procedure),
        treatmentItem: result.treatmentItem
          ? planItemToGrpc(result.treatmentItem)
          : undefined,
      };
    } catch (err) {
      toRpcError(err);
    }
  }

  async changeTreatmentStatus(request: TreatmentProto.ChangeTreatmentStatusRequest) {
    try {
      return planItemToGrpc(await this.workspace.changeTreatmentStatus(request as never));
    } catch (err) {
      toRpcError(err);
    }
  }

  async saveVisitHandoff(request: TreatmentProto.SaveVisitHandoffRequest) {
    try {
      return this.visits.saveVisitHandoff({
        clinicId: request.clinicId,
        patientId: request.patientId,
        visitId: request.visitId,
        text: request.text,
        status: request.status as never,
        providerId: request.providerId,
        treatmentPlanItemId: request.treatmentPlanItemId || undefined,
      }).then((handoff) => ({
        id: handoff.id,
        clinicId: handoff.clinicId,
        patientId: handoff.patientId,
        visitId: handoff.visitId,
        treatmentPlanItemId: handoff.treatmentPlanItemId ?? "",
        text: handoff.text,
        status: handoff.status,
        authoredBy: handoff.authoredBy,
        savedAt: handoff.savedAt.toISOString(),
        codedAt: handoff.codedAt?.toISOString() ?? "",
        codedBy: handoff.codedBy ?? "",
      }));
    } catch (err) {
      toRpcError(err);
    }
  }

  async saveClinicalAttachments(request: TreatmentProto.SaveClinicalAttachmentsRequest) {
    try {
      const attachments = await this.workspace.saveClinicalAttachments({
        attachments: request.attachments.map(attachmentFromGrpc),
      });
      return {attachments: attachments.map(attachmentToGrpc)};
    } catch (err) {
      toRpcError(err);
    }
  }

  async closeVisit(request: TreatmentProto.CloseVisitRequest) {
    try {
      const result = await this.visits.closeVisit({
        clinicId: request.clinicId,
        patientId: request.patientId,
        visitId: request.visitId,
        providerId: request.providerId,
        followUpRequest: request.hasFollowUpRequest
          ? {
              treatmentPlanItemId: request.followUpTreatmentPlanItemId || undefined,
              reason: request.followUpReason || undefined,
              preferredDate: parseDate(request.followUpPreferredDate),
              urgency: request.followUpUrgency as never,
            }
          : undefined,
        documentRequest: request.hasDocumentRequest
          ? {
              treatmentPlanItemId: request.documentTreatmentPlanItemId || undefined,
              type: request.documentType as never,
              reason: request.documentReason || undefined,
            }
          : undefined,
      });
      return {
        visit: visitToGrpc(result.visit),
        followUpRequest: result.followUpRequest
          ? followUpToGrpc(result.followUpRequest)
          : undefined,
        documentRequest: result.documentRequest
          ? documentToGrpc(result.documentRequest)
          : undefined,
      };
    } catch (err) {
      toRpcError(err);
    }
  }
}
