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

type CreateInsuranceTemplateRequest =
  PatientProto.CreateInsuranceTemplateRequest;
type UpdateInsuranceTemplateRequest =
  PatientProto.UpdateInsuranceTemplateRequest;

@ApiTags("insurance-templates")
@Controller("clinics/:id")
@UseGuards(JwtAuthGuard, RolesGuard, ClinicScopeGuard)
export class InsuranceTemplateController implements OnModuleInit {
  private patientGrpcService!: PatientServiceClient;

  constructor(
    @Inject(PATIENT_GRPC_CLIENT) private readonly grpcClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.patientGrpcService =
      this.grpcClient.getService<PatientServiceClient>(PATIENT_SERVICE_NAME);
  }

  @Post("insurance-templates")
  @Roles(UserRole.ADMIN, UserRole.SECRETARY)
  async createInsuranceTemplate(@Body() dto: CreateInsuranceTemplateRequest) {
    try {
      return await lastValueFrom(
        this.patientGrpcService.createInsuranceTemplate(dto),
      );
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }

  @Get("insurance-templates")
  @Roles(
    UserRole.ADMIN,
    UserRole.DOCTOR,
    UserRole.SECRETARY,
    UserRole.DENTAL_ASSISTANT,
  )
  async listInsuranceTemplates(
    @Query("insuranceProviderId") insuranceProviderId?: string,
    @Query("insuranceProviderIds") insuranceProviderIds?: string,
    @Query("search") search?: string,
    @Query("name") name?: string,
  ) {
    try {
      const result = await lastValueFrom(
        this.patientGrpcService.listInsuranceTemplates({
          ...(insuranceProviderId ? {providerId: insuranceProviderId} : {}),
          ...(insuranceProviderIds ? {providerIds: insuranceProviderIds} : {}),
          ...(search ? {search} : {}),
        }),
      );

      if (name) {
        return {
          templates: result.templates.filter(
            (t) => t.name.toLowerCase() === name.toLowerCase(),
          ),
        };
      }

      return result;
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }

  @Get("insurance-templates/:templateId")
  @Roles(
    UserRole.ADMIN,
    UserRole.DOCTOR,
    UserRole.SECRETARY,
    UserRole.DENTAL_ASSISTANT,
  )
  async getInsuranceTemplate(
    @Param("templateId", ParseUUIDPipe) templateId: string,
  ) {
    try {
      return await lastValueFrom(
        this.patientGrpcService.getInsuranceTemplate({id: templateId}),
      );
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }

  @Put("insurance-templates/:templateId")
  @Roles(UserRole.ADMIN, UserRole.SECRETARY)
  async updateInsuranceTemplate(
    @Param("templateId", ParseUUIDPipe) templateId: string,
    @Body() dto: Omit<UpdateInsuranceTemplateRequest, "templateId">,
  ) {
    try {
      return await lastValueFrom(
        this.patientGrpcService.updateInsuranceTemplate({templateId, ...dto}),
      );
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }

  @Delete("insurance-templates/:templateId")
  @Roles(UserRole.ADMIN, UserRole.SECRETARY)
  async deleteInsuranceTemplate(
    @Param("templateId", ParseUUIDPipe) templateId: string,
  ) {
    try {
      return await lastValueFrom(
        this.patientGrpcService.deleteInsuranceTemplate({id: templateId}),
      );
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }
}
