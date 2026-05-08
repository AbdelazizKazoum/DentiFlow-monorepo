import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  OnModuleInit,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import {ClientGrpc} from "@nestjs/microservices";
import {lastValueFrom} from "rxjs";
import {ApiTags} from "@nestjs/swagger";
import {PatientProto} from "@lib/proto";
import {JwtAuthGuard} from "../../../shared/guards/jwt-auth.guard";
import {RolesGuard} from "../../../shared/guards/roles.guard";
import {ClinicScopeGuard} from "../../../shared/guards/clinic-scope.guard";
import {Roles} from "../../../shared/decorators/roles.decorator";
import {UserRole} from "../../../domain/auth/enums/user-role.enum";
import {
  PATIENT_GRPC_CLIENT,
  PatientServiceClient,
  PATIENT_SERVICE_NAME,
  handleGrpcError,
} from "../patient-grpc.helper";

type CreatePatientDocumentRequest = PatientProto.CreatePatientDocumentRequest;
type UpdatePatientDocumentRequest = PatientProto.UpdatePatientDocumentRequest;

@ApiTags("patient-documents")
@Controller("clinics/:id")
@UseGuards(JwtAuthGuard, RolesGuard, ClinicScopeGuard)
export class PatientDocumentController implements OnModuleInit {
  private patientGrpcService!: PatientServiceClient;

  constructor(
    @Inject(PATIENT_GRPC_CLIENT) private readonly grpcClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.patientGrpcService =
      this.grpcClient.getService<PatientServiceClient>(PATIENT_SERVICE_NAME);
  }

  // ── per-patient routes ───────────────────────────────────────────────────

  @Post("patients/:patientId/documents")
  @Roles(UserRole.ADMIN, UserRole.SECRETARY, UserRole.DOCTOR)
  async createPatientDocument(
    @Param("id", ParseUUIDPipe) clinicId: string,
    @Param("patientId", ParseUUIDPipe) patientId: string,
    @Body() dto: Omit<CreatePatientDocumentRequest, "clinicId" | "patientId">,
  ) {
    try {
      return await lastValueFrom(
        this.patientGrpcService.createPatientDocument({
          clinicId,
          patientId,
          ...dto,
        }),
      );
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }

  @Get("patients/:patientId/documents")
  @Roles(
    UserRole.ADMIN,
    UserRole.DOCTOR,
    UserRole.SECRETARY,
    UserRole.DENTAL_ASSISTANT,
  )
  async listPatientDocuments(
    @Param("id", ParseUUIDPipe) clinicId: string,
    @Param("patientId", ParseUUIDPipe) patientId: string,
    @Query("type") type?: string,
  ) {
    try {
      return await lastValueFrom(
        this.patientGrpcService.listPatientDocuments({
          clinicId,
          patientId,
          ...(type ? {type} : {}),
        }),
      );
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }

  // ── clinic-wide routes ───────────────────────────────────────────────────

  @Get("patient-documents")
  @Roles(
    UserRole.ADMIN,
    UserRole.DOCTOR,
    UserRole.SECRETARY,
    UserRole.DENTAL_ASSISTANT,
  )
  async listClinicPatientDocuments(
    @Param("id", ParseUUIDPipe) clinicId: string,
    @Query("type") type?: string,
    @Query("patientId") patientId?: string,
    @Query("search") search?: string,
    @Query("ids") ids?: string,
  ) {
    try {
      const result = await lastValueFrom(
        this.patientGrpcService.listClinicPatientDocuments({
          clinicId,
          ...(type ? {type} : {}),
          ...(patientId ? {patientId} : {}),
          ...(search ? {search} : {}),
        }),
      );

      if (ids) {
        const set = new Set(ids.split(",").map((v) => v.trim()));
        return {
          documents: result.documents.filter((d) => set.has(d.id)),
        };
      }

      return result;
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }

  @Get("patient-documents/:documentId")
  @Roles(
    UserRole.ADMIN,
    UserRole.DOCTOR,
    UserRole.SECRETARY,
    UserRole.DENTAL_ASSISTANT,
  )
  async getPatientDocument(
    @Param("documentId", ParseUUIDPipe) documentId: string,
  ) {
    try {
      return await lastValueFrom(
        this.patientGrpcService.getPatientDocument({id: documentId}),
      );
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }

  @Put("patient-documents/:documentId")
  @Roles(UserRole.ADMIN, UserRole.SECRETARY, UserRole.DOCTOR)
  async updatePatientDocument(
    @Param("documentId", ParseUUIDPipe) documentId: string,
    @Body() dto: Omit<UpdatePatientDocumentRequest, "documentId">,
  ) {
    try {
      return await lastValueFrom(
        this.patientGrpcService.updatePatientDocument({documentId, ...dto}),
      );
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }

  @Delete("patient-documents/:documentId")
  @Roles(UserRole.ADMIN, UserRole.SECRETARY, UserRole.DOCTOR)
  async deletePatientDocument(
    @Param("documentId", ParseUUIDPipe) documentId: string,
  ) {
    try {
      return await lastValueFrom(
        this.patientGrpcService.deletePatientDocument({id: documentId}),
      );
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }

  @Delete("patient-documents")
  @Roles(UserRole.ADMIN, UserRole.SECRETARY, UserRole.DOCTOR)
  async deleteManyPatientDocuments(@Body() dto: {ids: string[]}) {
    try {
      return await lastValueFrom(
        this.patientGrpcService.deleteManyPatientDocuments({ids: dto.ids}),
      );
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }
}
