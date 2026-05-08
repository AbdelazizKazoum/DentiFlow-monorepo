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

type CreateInsuranceProviderRequest =
  PatientProto.CreateInsuranceProviderRequest;
type UpdateInsuranceProviderRequest =
  PatientProto.UpdateInsuranceProviderRequest;

@ApiTags("insurance-providers")
@Controller("clinics/:id")
@UseGuards(JwtAuthGuard, RolesGuard, ClinicScopeGuard)
export class InsuranceProviderController implements OnModuleInit {
  private patientGrpcService!: PatientServiceClient;

  constructor(
    @Inject(PATIENT_GRPC_CLIENT) private readonly grpcClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.patientGrpcService =
      this.grpcClient.getService<PatientServiceClient>(PATIENT_SERVICE_NAME);
  }

  @Post("insurance-providers")
  @Roles(UserRole.ADMIN, UserRole.SECRETARY)
  async createInsuranceProvider(
    @Param("id", ParseUUIDPipe) clinicId: string,
    @Body() dto: Omit<CreateInsuranceProviderRequest, "clinicId">,
  ) {
    try {
      return await lastValueFrom(
        this.patientGrpcService.createInsuranceProvider({clinicId, ...dto}),
      );
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }

  @Get("insurance-providers")
  @Roles(
    UserRole.ADMIN,
    UserRole.DOCTOR,
    UserRole.SECRETARY,
    UserRole.DENTAL_ASSISTANT,
  )
  async listInsuranceProviders(
    @Param("id", ParseUUIDPipe) clinicId: string,
    @Query("isActive") isActive?: string,
    @Query("search") search?: string,
    @Query("name") name?: string,
    @Query("code") code?: string,
  ) {
    try {
      const result = await lastValueFrom(
        this.patientGrpcService.listInsuranceProviders({
          clinicId,
          ...(isActive !== undefined ? {isActive: toBoolean(isActive)} : {}),
          ...(search ? {search} : {}),
        }),
      );

      if (name) {
        return {
          providers: result.providers.filter(
            (p) => p.name.toLowerCase() === name.toLowerCase(),
          ),
        };
      }

      if (code) {
        return {
          providers: result.providers.filter(
            (p) => p.code.toLowerCase() === code.toLowerCase(),
          ),
        };
      }

      return result;
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }

  @Get("insurance-providers/:providerId")
  @Roles(
    UserRole.ADMIN,
    UserRole.DOCTOR,
    UserRole.SECRETARY,
    UserRole.DENTAL_ASSISTANT,
  )
  async getInsuranceProvider(
    @Param("providerId", ParseUUIDPipe) providerId: string,
  ) {
    try {
      return await lastValueFrom(
        this.patientGrpcService.getInsuranceProvider({id: providerId}),
      );
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }

  @Put("insurance-providers/:providerId")
  @Roles(UserRole.ADMIN, UserRole.SECRETARY)
  async updateInsuranceProvider(
    @Param("providerId", ParseUUIDPipe) providerId: string,
    @Body() dto: Omit<UpdateInsuranceProviderRequest, "providerId">,
  ) {
    try {
      return await lastValueFrom(
        this.patientGrpcService.updateInsuranceProvider({providerId, ...dto}),
      );
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }

  @Delete("insurance-providers/:providerId")
  @Roles(UserRole.ADMIN, UserRole.SECRETARY)
  async deleteInsuranceProvider(
    @Param("providerId", ParseUUIDPipe) providerId: string,
  ) {
    try {
      return await lastValueFrom(
        this.patientGrpcService.deleteInsuranceProvider({id: providerId}),
      );
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }

  @Put("insurance-providers/:providerId/activate")
  @Roles(UserRole.ADMIN, UserRole.SECRETARY)
  async activateInsuranceProvider(
    @Param("providerId", ParseUUIDPipe) providerId: string,
  ) {
    try {
      return await lastValueFrom(
        this.patientGrpcService.activateInsuranceProvider({id: providerId}),
      );
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }

  @Put("insurance-providers/:providerId/deactivate")
  @Roles(UserRole.ADMIN, UserRole.SECRETARY)
  async deactivateInsuranceProvider(
    @Param("providerId", ParseUUIDPipe) providerId: string,
  ) {
    try {
      return await lastValueFrom(
        this.patientGrpcService.deactivateInsuranceProvider({id: providerId}),
      );
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }
}
