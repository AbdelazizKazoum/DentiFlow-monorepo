import {
  Body,
  Controller,
  Get,
  Inject,
  OnModuleInit,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {ClientGrpc} from "@nestjs/microservices";
import {lastValueFrom} from "rxjs";
import {ApiTags} from "@nestjs/swagger";
import {JwtAuthGuard} from "../../shared/guards/jwt-auth.guard";
import {RolesGuard} from "../../shared/guards/roles.guard";
import {ClinicScopeGuard} from "../../shared/guards/clinic-scope.guard";
import {Roles} from "../../shared/decorators/roles.decorator";
import {CurrentUser} from "../../shared/decorators/current-user.decorator";
import {JwtPayload} from "../../domain/auth/entities/jwt-payload.entity";
import {UserRole} from "../../domain/auth/enums/user-role.enum";
import {
  TREATMENT_GRPC_CLIENT,
  TreatmentServiceClient,
  attachmentToHttp,
  diagnosisToHttp,
  documentToHttp,
  followUpToHttp,
  handleGrpcError,
  handoffToHttp,
  initTreatmentGrpcService,
  planItemToHttp,
  procedureToHttp,
  visitToHttp,
  workspaceToHttp,
} from "./treatment-grpc.helper";

type JsonBody = Record<string, any>;

@ApiTags("treatment")
@Controller("treatment")
@UseGuards(JwtAuthGuard, RolesGuard, ClinicScopeGuard)
export class TreatmentController implements OnModuleInit {
  private treatmentGrpcService!: TreatmentServiceClient;

  constructor(
    @Inject(TREATMENT_GRPC_CLIENT) private readonly grpcClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.treatmentGrpcService = initTreatmentGrpcService(this.grpcClient);
  }

  @Post("visits/from-queue")
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.DENTAL_ASSISTANT)
  async createVisitFromQueue(@Body() body: JsonBody, @CurrentUser() user: JwtPayload) {
    try {
      return visitToHttp(
        await lastValueFrom(
          this.treatmentGrpcService.createVisitFromQueue({
            clinicId: body.clinicId ?? body.clinic_id ?? user.clinic_id,
            patientId: body.patientId ?? body.patient_id ?? "",
            queueEntryId: body.queueEntryId ?? body.queue_entry_id ?? "",
            appointmentId: body.appointmentId ?? body.appointment_id ?? "",
            chairId: body.chairId ?? body.chair_id ?? "",
            providerId: body.providerId ?? body.provider_id ?? user.user_id,
            startedAt: body.startedAt ?? body.started_at ?? "",
          }),
        ),
      );
    } catch (err) {
      handleGrpcError(err);
    }
  }

  @Get("workspace")
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.DENTAL_ASSISTANT)
  async getWorkspace(
    @Query() query: {clinicId?: string; patientId?: string; activeVisitId?: string},
    @CurrentUser() user: JwtPayload,
  ) {
    try {
      return workspaceToHttp(
        await lastValueFrom(
          this.treatmentGrpcService.getTreatmentWorkspace({
            clinicId: query.clinicId ?? user.clinic_id,
            patientId: query.patientId ?? "",
            activeVisitId: query.activeVisitId ?? "",
          }),
        ),
      );
    } catch (err) {
      handleGrpcError(err);
    }
  }

  @Post("plan-items")
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  async createPlanItems(@Body() body: JsonBody, @CurrentUser() user: JwtPayload) {
    try {
      const result = await lastValueFrom(
        this.treatmentGrpcService.createTreatmentPlanItems({
          clinicId: body.clinicId ?? body.clinic_id ?? user.clinic_id,
          patientId: body.patientId ?? body.patient_id ?? "",
          actId: body.actId ?? body.act_id ?? "",
          selectedTeeth: body.selectedTeeth ?? body.selected_teeth ?? [],
          mouthRegionId: body.mouthRegionId ?? body.mouth_region_id ?? "",
          surfacesByToothJson: JSON.stringify(body.surfacesByTooth ?? body.surfaces_by_tooth ?? {}),
          priority: body.priority ?? "NORMAL",
          notes: body.notes ?? "",
          dentition: body.dentition ?? "ADULT",
          providerId: body.providerId ?? body.provider_id ?? user.user_id,
        }),
      );
      return {items: result.items.map(planItemToHttp)};
    } catch (err) {
      handleGrpcError(err);
    }
  }

  @Post("diagnoses")
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  async createDiagnosis(@Body() body: JsonBody, @CurrentUser() user: JwtPayload) {
    try {
      return diagnosisToHttp(
        await lastValueFrom(
          this.treatmentGrpcService.createDiagnosis({
            clinicId: body.clinicId ?? body.clinic_id ?? user.clinic_id,
            patientId: body.patientId ?? body.patient_id ?? "",
            diagnosis: body.diagnosis ?? "",
            selectedTeeth: body.selectedTeeth ?? body.selected_teeth ?? [],
            mouthRegionId: body.mouthRegionId ?? body.mouth_region_id ?? "",
            surfacesByToothJson: JSON.stringify(body.surfacesByTooth ?? body.surfaces_by_tooth ?? {}),
            severity: body.severity ?? "MODERATE",
            certainty: body.certainty ?? "CONFIRMED",
            status: body.status ?? "ACTIVE",
            evidence: body.evidence ?? [],
            attachmentIds: body.attachmentIds ?? body.attachment_ids ?? [],
            symptoms: body.symptoms ?? [],
            painLevel: body.painLevel ?? body.pain_level ?? 0,
            notes: body.notes ?? "",
            dentition: body.dentition ?? "ADULT",
            providerId: body.providerId ?? body.provider_id ?? user.user_id,
          }),
        ),
      );
    } catch (err) {
      handleGrpcError(err);
    }
  }

  @Post("start")
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  async startTreatment(@Body() body: JsonBody, @CurrentUser() user: JwtPayload) {
    try {
      const result = await lastValueFrom(
        this.treatmentGrpcService.startTreatment({
          clinicId: body.clinicId ?? body.clinic_id ?? user.clinic_id,
          patientId: body.patientId ?? body.patient_id ?? "",
          visitId: body.visitId ?? body.visit_id ?? "",
          treatmentPlanItemId: body.treatmentPlanItemId ?? body.treatment_plan_item_id ?? "",
          providerId: body.providerId ?? body.provider_id ?? user.user_id,
        }),
      );
      return {
        treatmentItem: result.treatmentItem ? planItemToHttp(result.treatmentItem) : undefined,
        procedure: result.procedure ? procedureToHttp(result.procedure) : undefined,
        reusedExistingProcedure: result.reusedExistingProcedure,
      };
    } catch (err) {
      handleGrpcError(err);
    }
  }

  @Post("procedures/:id/complete")
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  async completeProcedure(
    @Param("id") id: string,
    @Body() body: JsonBody,
    @CurrentUser() user: JwtPayload,
  ) {
    try {
      const result = await lastValueFrom(
        this.treatmentGrpcService.completeVisitProcedure({
          clinicId: body.clinicId ?? body.clinic_id ?? user.clinic_id,
          patientId: body.patientId ?? body.patient_id ?? "",
          visitProcedureId: id,
          providerId: body.providerId ?? body.provider_id ?? user.user_id,
        }),
      );
      return {
        procedure: result.procedure ? procedureToHttp(result.procedure) : undefined,
        treatmentItem: result.treatmentItem ? planItemToHttp(result.treatmentItem) : undefined,
      };
    } catch (err) {
      handleGrpcError(err);
    }
  }

  @Patch("plan-items/:id/status")
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  async changeStatus(
    @Param("id") id: string,
    @Body() body: JsonBody,
    @CurrentUser() user: JwtPayload,
  ) {
    try {
      return planItemToHttp(
        await lastValueFrom(
          this.treatmentGrpcService.changeTreatmentStatus({
            clinicId: body.clinicId ?? body.clinic_id ?? user.clinic_id,
            treatmentPlanItemId: id,
            status: body.status ?? "",
            reason: body.reason ?? "",
            providerId: body.providerId ?? body.provider_id ?? user.user_id,
          }),
        ),
      );
    } catch (err) {
      handleGrpcError(err);
    }
  }

  @Post("handoffs")
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.DENTAL_ASSISTANT)
  async saveHandoff(@Body() body: JsonBody, @CurrentUser() user: JwtPayload) {
    try {
      return handoffToHttp(
        await lastValueFrom(
          this.treatmentGrpcService.saveVisitHandoff({
            clinicId: body.clinicId ?? body.clinic_id ?? user.clinic_id,
            patientId: body.patientId ?? body.patient_id ?? "",
            visitId: body.visitId ?? body.visit_id ?? "",
            text: body.text ?? "",
            status: body.status ?? "STRUCTURED",
            providerId: body.providerId ?? body.provider_id ?? user.user_id,
            treatmentPlanItemId: body.treatmentPlanItemId ?? body.treatment_plan_item_id ?? "",
          }),
        ),
      );
    } catch (err) {
      handleGrpcError(err);
    }
  }

  @Post("attachments")
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.DENTAL_ASSISTANT)
  async saveAttachments(@Body() body: JsonBody) {
    try {
      const attachments = body.attachments ?? [];
      const result = await lastValueFrom(
        this.treatmentGrpcService.saveClinicalAttachments({
          attachments: attachments.map((item: JsonBody) => ({
            id: item.id ?? "",
            clinicId: item.clinicId ?? item.clinic_id ?? "",
            patientId: item.patientId ?? item.patient_id ?? "",
            visitId: item.visitId ?? item.visit_id ?? "",
            type: item.type ?? "DOCUMENT",
            title: item.title ?? "",
            fileName: item.fileName ?? item.file_name ?? "",
            mimeType: item.mimeType ?? item.mime_type ?? "",
            fileUrl: item.fileUrl ?? item.file_url ?? "",
            uploadedAt: item.uploadedAt ?? item.uploaded_at ?? new Date().toISOString(),
            uploadedBy: item.uploadedBy ?? item.uploaded_by ?? "",
          })),
        }),
      );
      return {attachments: result.attachments.map(attachmentToHttp)};
    } catch (err) {
      handleGrpcError(err);
    }
  }

  @Post("visits/:id/close")
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  async closeVisit(
    @Param("id") id: string,
    @Body() body: JsonBody,
    @CurrentUser() user: JwtPayload,
  ) {
    try {
      const followUp = body.followUpRequest ?? body.follow_up_request;
      const documentRequest = body.documentRequest ?? body.document_request;
      const result = await lastValueFrom(
        this.treatmentGrpcService.closeVisit({
          clinicId: body.clinicId ?? body.clinic_id ?? user.clinic_id,
          patientId: body.patientId ?? body.patient_id ?? "",
          visitId: id,
          providerId: body.providerId ?? body.provider_id ?? user.user_id,
          hasFollowUpRequest: Boolean(followUp),
          followUpTreatmentPlanItemId: followUp?.treatmentPlanItemId ?? followUp?.treatment_plan_item_id ?? "",
          followUpReason: followUp?.reason ?? "",
          followUpPreferredDate: followUp?.preferredDate ?? followUp?.preferred_date ?? "",
          followUpUrgency: followUp?.urgency ?? "",
          hasDocumentRequest: Boolean(documentRequest),
          documentTreatmentPlanItemId: documentRequest?.treatmentPlanItemId ?? documentRequest?.treatment_plan_item_id ?? "",
          documentType: documentRequest?.type ?? "",
          documentReason: documentRequest?.reason ?? "",
        }),
      );
      return {
        visit: result.visit ? visitToHttp(result.visit) : undefined,
        followUpRequest: result.followUpRequest ? followUpToHttp(result.followUpRequest) : undefined,
        documentRequest: result.documentRequest ? documentToHttp(result.documentRequest) : undefined,
      };
    } catch (err) {
      handleGrpcError(err);
    }
  }
}
