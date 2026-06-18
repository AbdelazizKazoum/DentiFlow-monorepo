import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  OnModuleInit,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Delete,
  Query,
  UseGuards,
} from "@nestjs/common";
import {ClientGrpc} from "@nestjs/microservices";
import {lastValueFrom} from "rxjs";
import {ApiTags} from "@nestjs/swagger";
import {JwtAuthGuard} from "../../shared/guards/jwt-auth.guard";
import {RolesGuard} from "../../shared/guards/roles.guard";
import {Roles} from "../../shared/decorators/roles.decorator";
import {CurrentUser} from "../../shared/decorators/current-user.decorator";
import {JwtPayload} from "../../domain/auth/entities/jwt-payload.entity";
import {UserRole} from "../../domain/auth/enums/user-role.enum";
import {
  TREATMENT_GRPC_CLIENT,
  TreatmentServiceClient,
  actCatalogToHttp,
  grpcClinicId,
  handleGrpcError,
  initTreatmentGrpcService,
  toNumber,
  treatmentActToHttp,
  visitToHttp,
} from "./treatment-grpc.helper";

@ApiTags("treatment")
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class TreatmentController implements OnModuleInit {
  private treatmentGrpcService!: TreatmentServiceClient;

  constructor(
    @Inject(TREATMENT_GRPC_CLIENT) private readonly grpcClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.treatmentGrpcService = initTreatmentGrpcService(this.grpcClient);
  }

  @Get("treatment/visits/:visitId")
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.DENTAL_ASSISTANT)
  async getVisit(
    @Param("visitId", ParseUUIDPipe) visitId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    try {
      const visit = await lastValueFrom(
        this.treatmentGrpcService.getVisit({id: visitId}),
      );
      const httpVisit = visitToHttp(visit);
      this.assertClinicAccess(httpVisit.clinic_id, user.clinic_id);
      return httpVisit;
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }

  @Get("treatment/visits/by-appointment/:appointmentId")
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.DENTAL_ASSISTANT)
  async getVisitByAppointment(
    @Param("appointmentId", ParseUUIDPipe) appointmentId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    try {
      const result = await lastValueFrom(
        this.treatmentGrpcService.getVisitByAppointment({appointmentId}),
      );
      if (!result.visit) return {visit: null};
      const httpVisit = visitToHttp(result.visit);
      this.assertClinicAccess(httpVisit.clinic_id, user.clinic_id);
      return {visit: httpVisit};
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }

  @Get("clinics/:id/treatment/visits")
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.DENTAL_ASSISTANT)
  async listOpenVisits(
    @Param("id", ParseUUIDPipe) clinicId: string,
    @CurrentUser() user: JwtPayload,
    @Query("doctor_id") doctorId?: string,
  ) {
    try {
      this.assertClinicAccess(clinicId, user.clinic_id);
      const result = await lastValueFrom(
        this.treatmentGrpcService.listOpenVisits({clinicId, doctorId}),
      );
      return {
        visits: (result.visits ?? []).map(visitToHttp),
        total: result.total ?? 0,
      };
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }

  @Post("clinics/:id/treatment/visits")
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.DENTAL_ASSISTANT)
  async openVisit(
    @Param("id", ParseUUIDPipe) clinicId: string,
    @CurrentUser() user: JwtPayload,
    @Body()
    body: {
      appointment_id?: string;
      patient_id?: string;
      patient_name?: string;
      doctor_id?: string;
      doctor_name?: string;
    },
  ) {
    try {
      this.assertClinicAccess(clinicId, user.clinic_id);
      const visit = await lastValueFrom(
        this.treatmentGrpcService.openVisit({
          clinicId,
          appointmentId: body.appointment_id ?? "",
          patientId: body.patient_id ?? "",
          patientName: body.patient_name ?? "",
          doctorId: body.doctor_id ?? "",
          doctorName: body.doctor_name ?? "",
        }),
      );
      return visitToHttp(visit);
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }

  @Patch("treatment/visits/:visitId/assistant")
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.DENTAL_ASSISTANT)
  async assignAssistant(
    @Param("visitId", ParseUUIDPipe) visitId: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: {assistant_id?: string; assistant_name?: string},
  ) {
    try {
      await this.assertVisitInClinic(visitId, user.clinic_id);
      const visit = await lastValueFrom(
        this.treatmentGrpcService.assignAssistant({
          visitId,
          assistantId: body.assistant_id ?? "",
          assistantName: body.assistant_name ?? "",
        }),
      );
      return visitToHttp(visit);
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }

  @Patch("treatment/visits/:visitId/confirm")
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  async confirmVisit(
    @Param("visitId", ParseUUIDPipe) visitId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    try {
      await this.assertVisitInClinic(visitId, user.clinic_id);
      const visit = await lastValueFrom(
        this.treatmentGrpcService.confirmVisit({
          visitId,
          confirmedBy: user.user_id,
        }),
      );
      return visitToHttp(visit);
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }

  @Patch("treatment/visits/:visitId/close")
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.SECRETARY)
  async closeVisit(
    @Param("visitId", ParseUUIDPipe) visitId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    try {
      await this.assertVisitInClinic(visitId, user.clinic_id);
      const visit = await lastValueFrom(
        this.treatmentGrpcService.closeVisit({visitId}),
      );
      return visitToHttp(visit);
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }

  @Patch("treatment/visits/:visitId/void")
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  async voidVisit(
    @Param("visitId", ParseUUIDPipe) visitId: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: {reason?: string},
  ) {
    try {
      await this.assertVisitInClinic(visitId, user.clinic_id);
      const visit = await lastValueFrom(
        this.treatmentGrpcService.voidVisit({
          visitId,
          reason: body.reason ?? "",
        }),
      );
      return visitToHttp(visit);
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }

  @Get("treatment/visits/:visitId/acts")
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.DENTAL_ASSISTANT)
  async listTreatmentActs(
    @Param("visitId", ParseUUIDPipe) visitId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    try {
      await this.assertVisitInClinic(visitId, user.clinic_id);
      const result = await lastValueFrom(
        this.treatmentGrpcService.listTreatmentActs({visitId}),
      );
      return {
        treatment_acts: (result.treatmentActs ?? []).map(treatmentActToHttp),
        total: result.total ?? 0,
      };
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }

  @Post("treatment/visits/:visitId/acts")
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.DENTAL_ASSISTANT)
  async addTreatmentAct(
    @Param("visitId", ParseUUIDPipe) visitId: string,
    @CurrentUser() user: JwtPayload,
    @Body()
    body: {
      act_catalog_id?: string;
      tooth_fdi?: string;
      quantity?: number;
      surface?: string;
      tooth_part?: string;
      dentition?: string;
      status?: string;
      notes?: string;
      entered_by?: string;
    },
  ) {
    try {
      const visit = await this.assertVisitInClinic(visitId, user.clinic_id);
      const act = await lastValueFrom(
        this.treatmentGrpcService.addTreatmentAct({
          clinicId: grpcClinicId(visit),
          visitId,
          actCatalogId: body.act_catalog_id ?? "",
          toothFdi: body.tooth_fdi,
          quantity: body.quantity,
          surface: body.surface,
          toothPart: body.tooth_part,
          dentition: body.dentition,
          status: body.status,
          notes: body.notes,
          enteredBy: body.entered_by ?? user.user_id,
        }),
      );
      return treatmentActToHttp(act);
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }

  @Get("treatment/acts/:actId")
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.DENTAL_ASSISTANT)
  async getTreatmentAct(
    @Param("actId", ParseUUIDPipe) actId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    try {
      const act = await lastValueFrom(
        this.treatmentGrpcService.getTreatmentAct({id: actId}),
      );
      const httpAct = treatmentActToHttp(act);
      this.assertClinicAccess(httpAct.clinic_id, user.clinic_id);
      return httpAct;
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }

  @Patch("treatment/acts/:actId")
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.DENTAL_ASSISTANT)
  async updateTreatmentAct(
    @Param("actId", ParseUUIDPipe) actId: string,
    @CurrentUser() user: JwtPayload,
    @Body()
    body: {
      tooth_fdi?: string;
      quantity?: number;
      surface?: string;
      tooth_part?: string;
      dentition?: string;
      status?: string;
      notes?: string;
    },
  ) {
    try {
      const existing = await lastValueFrom(
        this.treatmentGrpcService.getTreatmentAct({id: actId}),
      );
      this.assertClinicAccess(treatmentActToHttp(existing).clinic_id, user.clinic_id);
      const act = await lastValueFrom(
        this.treatmentGrpcService.updateTreatmentAct({
          id: actId,
          toothFdi: body.tooth_fdi,
          quantity: body.quantity,
          surface: body.surface,
          toothPart: body.tooth_part,
          dentition: body.dentition,
          status: body.status,
          notes: body.notes,
        }),
      );
      return treatmentActToHttp(act);
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }

  @Delete("treatment/acts/:actId")
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.DENTAL_ASSISTANT)
  async removeTreatmentAct(
    @Param("actId", ParseUUIDPipe) actId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    try {
      const existing = await lastValueFrom(
        this.treatmentGrpcService.getTreatmentAct({id: actId}),
      );
      this.assertClinicAccess(treatmentActToHttp(existing).clinic_id, user.clinic_id);
      await lastValueFrom(this.treatmentGrpcService.removeTreatmentAct({id: actId}));
      return {ok: true};
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }

  @Get("treatment/visits/:visitId/total")
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.DENTAL_ASSISTANT)
  async calculateVisitTotal(
    @Param("visitId", ParseUUIDPipe) visitId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    try {
      await this.assertVisitInClinic(visitId, user.clinic_id);
      const result = await lastValueFrom(
        this.treatmentGrpcService.calculateVisitTotal({visitId}),
      );
      return {total_amount: result.totalAmount};
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }

  @Get("clinics/:id/treatment/act-catalog")
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.DENTAL_ASSISTANT)
  async listActCatalog(
    @Param("id", ParseUUIDPipe) clinicId: string,
    @CurrentUser() user: JwtPayload,
    @Query() query: {page?: string; limit?: string},
  ) {
    try {
      this.assertClinicAccess(clinicId, user.clinic_id);
      const result = await lastValueFrom(
        this.treatmentGrpcService.listActCatalog({
          clinicId,
          ...(query.page ? {page: toNumber(query.page)} : {}),
          ...(query.limit ? {limit: toNumber(query.limit)} : {}),
        }),
      );
      return {
        items: (result.items ?? []).map(actCatalogToHttp),
        total: result.total ?? 0,
      };
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }

  @Post("clinics/:id/treatment/act-catalog")
  @Roles(UserRole.ADMIN)
  async createActCatalog(
    @Param("id", ParseUUIDPipe) clinicId: string,
    @CurrentUser() user: JwtPayload,
    @Body()
    body: {
      code?: string;
      name_ar?: string;
      name_fr?: string;
      name_en?: string;
      default_price?: number;
      is_active?: boolean;
    },
  ) {
    try {
      this.assertClinicAccess(clinicId, user.clinic_id);
      const item = await lastValueFrom(
        this.treatmentGrpcService.createActCatalog({
          clinicId,
          code: body.code ?? "",
          nameAr: body.name_ar ?? "",
          nameFr: body.name_fr ?? "",
          nameEn: body.name_en ?? "",
          defaultPrice: body.default_price ?? 0,
          isActive: body.is_active,
        }),
      );
      return actCatalogToHttp(item);
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }

  @Get("treatment/act-catalog/:id")
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.DENTAL_ASSISTANT)
  async getActCatalog(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    try {
      const item = await lastValueFrom(
        this.treatmentGrpcService.getActCatalog({id}),
      );
      const httpItem = actCatalogToHttp(item);
      this.assertClinicAccess(httpItem.clinic_id, user.clinic_id);
      return httpItem;
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }

  @Patch("treatment/act-catalog/:id")
  @Roles(UserRole.ADMIN)
  async updateActCatalog(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Body()
    body: {
      code?: string;
      name_ar?: string;
      name_fr?: string;
      name_en?: string;
      default_price?: number;
      is_active?: boolean;
    },
  ) {
    try {
      const existing = await lastValueFrom(
        this.treatmentGrpcService.getActCatalog({id}),
      );
      this.assertClinicAccess(actCatalogToHttp(existing).clinic_id, user.clinic_id);
      const item = await lastValueFrom(
        this.treatmentGrpcService.updateActCatalog({
          id,
          code: body.code,
          nameAr: body.name_ar,
          nameFr: body.name_fr,
          nameEn: body.name_en,
          defaultPrice: body.default_price,
          isActive: body.is_active,
        }),
      );
      return actCatalogToHttp(item);
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }

  @Delete("treatment/act-catalog/:id")
  @Roles(UserRole.ADMIN)
  async deleteActCatalog(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    try {
      const existing = await lastValueFrom(
        this.treatmentGrpcService.getActCatalog({id}),
      );
      this.assertClinicAccess(actCatalogToHttp(existing).clinic_id, user.clinic_id);
      await lastValueFrom(this.treatmentGrpcService.deleteActCatalog({id}));
      return {ok: true};
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }

  private async assertVisitInClinic(
    visitId: string,
    clinicId: string,
  ): Promise<Record<string, unknown>> {
    const visit = await lastValueFrom(
      this.treatmentGrpcService.getVisit({id: visitId}),
    );
    this.assertClinicAccess(visitToHttp(visit).clinic_id, clinicId);
    return visit as unknown as Record<string, unknown>;
  }

  private assertClinicAccess(
    entityClinicId: string,
    userClinicId: string,
  ): void {
    if (entityClinicId !== userClinicId) {
      throw new ForbiddenException(
        "You do not have access to this clinic's resources",
      );
    }
  }
}
