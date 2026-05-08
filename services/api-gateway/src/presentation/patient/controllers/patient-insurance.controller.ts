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
  toBoolean,
} from "../patient-grpc.helper";

type CreatePatientInsuranceRequest = PatientProto.CreatePatientInsuranceRequest;
type UpdatePatientInsuranceRequest = PatientProto.UpdatePatientInsuranceRequest;

@ApiTags("patient-insurance")
@Controller("clinics/:id")
@UseGuards(JwtAuthGuard, RolesGuard, ClinicScopeGuard)
export class PatientInsuranceController implements OnModuleInit {
  private patientGrpcService!: PatientServiceClient;

  constructor(
    @Inject(PATIENT_GRPC_CLIENT) private readonly grpcClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.patientGrpcService =
      this.grpcClient.getService<PatientServiceClient>(PATIENT_SERVICE_NAME);
  }

  // ── per-patient routes ───────────────────────────────────────────────────

  @Post("patients/:patientId/insurance")
  @Roles(UserRole.ADMIN, UserRole.SECRETARY)
  async createPatientInsurance(
    @Param("id", ParseUUIDPipe) clinicId: string,
    @Param("patientId", ParseUUIDPipe) patientId: string,
    @Body() dto: Omit<CreatePatientInsuranceRequest, "clinicId" | "patientId">,
  ) {
    try {
      return await lastValueFrom(
        this.patientGrpcService.createPatientInsurance({
          clinicId,
          patientId,
          ...dto,
        }),
      );
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }

  @Get("patients/:patientId/insurance")
  @Roles(
    UserRole.ADMIN,
    UserRole.DOCTOR,
    UserRole.SECRETARY,
    UserRole.DENTAL_ASSISTANT,
  )
  async listPatientInsurances(
    @Param("id", ParseUUIDPipe) clinicId: string,
    @Param("patientId", ParseUUIDPipe) patientId: string,
    @Query("isActive") isActive?: string,
  ) {
    try {
      return await lastValueFrom(
        this.patientGrpcService.listPatientInsurances({
          clinicId,
          patientId,
          ...(isActive !== undefined ? {isActive: toBoolean(isActive)} : {}),
        }),
      );
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }

  @Put("patients/:patientId/insurance/activate-all")
  @Roles(UserRole.ADMIN, UserRole.SECRETARY)
  async activateAllPatientInsurances(
    @Param("id", ParseUUIDPipe) clinicId: string,
    @Param("patientId", ParseUUIDPipe) patientId: string,
  ) {
    try {
      return await lastValueFrom(
        this.patientGrpcService.activateAllPatientInsurances({
          clinicId,
          patientId,
        }),
      );
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }

  @Put("patients/:patientId/insurance/deactivate-all")
  @Roles(UserRole.ADMIN, UserRole.SECRETARY)
  async deactivateAllPatientInsurances(
    @Param("id", ParseUUIDPipe) clinicId: string,
    @Param("patientId", ParseUUIDPipe) patientId: string,
  ) {
    try {
      return await lastValueFrom(
        this.patientGrpcService.deactivateAllPatientInsurances({
          clinicId,
          patientId,
        }),
      );
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }

  // ── clinic-wide routes ───────────────────────────────────────────────────

  @Get("patient-insurance")
  @Roles(
    UserRole.ADMIN,
    UserRole.DOCTOR,
    UserRole.SECRETARY,
    UserRole.DENTAL_ASSISTANT,
  )
  async listClinicPatientInsurances(
    @Param("id", ParseUUIDPipe) clinicId: string,
    @Query("insuranceProviderId") insuranceProviderId?: string,
    @Query("isActive") isActive?: string,
    @Query("policyNumber") policyNumber?: string,
    @Query("memberId") memberId?: string,
  ) {
    try {
      const result = await lastValueFrom(
        this.patientGrpcService.listClinicPatientInsurances({
          clinicId,
          ...(insuranceProviderId ? {insuranceProviderId} : {}),
          ...(isActive !== undefined ? {isActive: toBoolean(isActive)} : {}),
        }),
      );

      if (policyNumber) {
        return {
          insurances: result.insurances.filter(
            (i) => i.policyNumber === policyNumber,
          ),
        };
      }

      if (memberId) {
        return {
          insurances: result.insurances.filter((i) => i.memberId === memberId),
        };
      }

      return result;
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }

  @Get("patient-insurance/:insuranceId")
  @Roles(
    UserRole.ADMIN,
    UserRole.DOCTOR,
    UserRole.SECRETARY,
    UserRole.DENTAL_ASSISTANT,
  )
  async getPatientInsurance(
    @Param("insuranceId", ParseUUIDPipe) insuranceId: string,
  ) {
    try {
      return await lastValueFrom(
        this.patientGrpcService.getPatientInsurance({id: insuranceId}),
      );
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }

  @Put("patient-insurance/:insuranceId")
  @Roles(UserRole.ADMIN, UserRole.SECRETARY)
  async updatePatientInsurance(
    @Param("insuranceId", ParseUUIDPipe) insuranceId: string,
    @Body() dto: Omit<UpdatePatientInsuranceRequest, "insuranceId">,
  ) {
    try {
      return await lastValueFrom(
        this.patientGrpcService.updatePatientInsurance({insuranceId, ...dto}),
      );
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }

  @Delete("patient-insurance/:insuranceId")
  @Roles(UserRole.ADMIN, UserRole.SECRETARY)
  async deletePatientInsurance(
    @Param("insuranceId", ParseUUIDPipe) insuranceId: string,
  ) {
    try {
      return await lastValueFrom(
        this.patientGrpcService.deletePatientInsurance({id: insuranceId}),
      );
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }

  @Put("patient-insurance/:insuranceId/activate")
  @Roles(UserRole.ADMIN, UserRole.SECRETARY)
  async activatePatientInsurance(
    @Param("insuranceId", ParseUUIDPipe) insuranceId: string,
  ) {
    try {
      return await lastValueFrom(
        this.patientGrpcService.activatePatientInsurance({id: insuranceId}),
      );
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }

  @Put("patient-insurance/:insuranceId/deactivate")
  @Roles(UserRole.ADMIN, UserRole.SECRETARY)
  async deactivatePatientInsurance(
    @Param("insuranceId", ParseUUIDPipe) insuranceId: string,
  ) {
    try {
      return await lastValueFrom(
        this.patientGrpcService.deactivatePatientInsurance({id: insuranceId}),
      );
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }
}
