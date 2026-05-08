import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  Inject,
  InternalServerErrorException,
  NotFoundException,
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
import {status as GrpcStatus} from "@grpc/grpc-js";
import {ApiTags} from "@nestjs/swagger";
import {PATIENT_GRPC_CLIENT} from "../../infrastructure/grpc/patient-grpc-client.module";
import {PatientProto} from "@lib/proto";
import {JwtAuthGuard} from "../../shared/guards/jwt-auth.guard";
import {RolesGuard} from "../../shared/guards/roles.guard";
import {ClinicScopeGuard} from "../../shared/guards/clinic-scope.guard";
import {Roles} from "../../shared/decorators/roles.decorator";
import {UserRole} from "../../domain/auth/enums/user-role.enum";

type PatientServiceClient = PatientProto.PatientServiceClient;
type CreatePatientRequest = PatientProto.CreatePatientRequest;
type UpdatePatientRequest = PatientProto.UpdatePatientRequest;
type CreateInsuranceProviderRequest = PatientProto.CreateInsuranceProviderRequest;
type UpdateInsuranceProviderRequest = PatientProto.UpdateInsuranceProviderRequest;
type CreateInsuranceTemplateRequest = PatientProto.CreateInsuranceTemplateRequest;
type UpdateInsuranceTemplateRequest = PatientProto.UpdateInsuranceTemplateRequest;
type CreatePatientInsuranceRequest = PatientProto.CreatePatientInsuranceRequest;
type UpdatePatientInsuranceRequest = PatientProto.UpdatePatientInsuranceRequest;
type CreatePatientDocumentRequest = PatientProto.CreatePatientDocumentRequest;
type UpdatePatientDocumentRequest = PatientProto.UpdatePatientDocumentRequest;
const PATIENT_SERVICE_NAME = PatientProto.PATIENT_SERVICE_NAME;

@ApiTags("patients")
@Controller("clinics/:id")
@UseGuards(JwtAuthGuard, RolesGuard, ClinicScopeGuard)
export class PatientController implements OnModuleInit {
  private patientGrpcService!: PatientServiceClient;

  constructor(
    @Inject(PATIENT_GRPC_CLIENT) private readonly grpcClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.patientGrpcService =
      this.grpcClient.getService<PatientServiceClient>(PATIENT_SERVICE_NAME);
  }

  @Post("patients")
  @Roles(UserRole.ADMIN, UserRole.SECRETARY, UserRole.DOCTOR)
  async createPatient(
    @Param("id", ParseUUIDPipe) clinicId: string,
    @Body() dto: Omit<CreatePatientRequest, "clinicId">,
  ) {
    try {
      return await lastValueFrom(
        this.patientGrpcService.createPatient({clinicId, ...dto}),
      );
    } catch (err: unknown) {
      this.handleGrpcError(err);
    }
  }

  @Get("patients/:patientId([0-9a-fA-F-]{36})")
  @Roles(
    UserRole.ADMIN,
    UserRole.DOCTOR,
    UserRole.SECRETARY,
    UserRole.DENTAL_ASSISTANT,
  )
  async getPatient(@Param("patientId", ParseUUIDPipe) patientId: string) {
    try {
      return await lastValueFrom(this.patientGrpcService.getPatient({id: patientId}));
    } catch (err: unknown) {
      this.handleGrpcError(err);
    }
  }

  @Get("patients")
  @Roles(
    UserRole.ADMIN,
    UserRole.DOCTOR,
    UserRole.SECRETARY,
    UserRole.DENTAL_ASSISTANT,
  )
  async listPatients(
    @Param("id", ParseUUIDPipe) clinicId: string,
    @Query()
    query: {
      page?: string;
      limit?: string;
      status?: string;
      gender?: string;
      search?: string;
      isNew?: string;
      createdFrom?: string;
      createdTo?: string;
      sortBy?: string;
      sortOrder?: string;
      hasMedicalInfo?: string;
      daysThreshold?: string;
    },
  ) {
    try {
      const result = await lastValueFrom(
        this.patientGrpcService.listPatients({
          clinicId,
          ...(query.page ? {page: this.toNumber(query.page)} : {}),
          ...(query.limit ? {limit: this.toNumber(query.limit)} : {}),
          ...(query.status ? {status: query.status} : {}),
          ...(query.gender ? {gender: query.gender} : {}),
          ...(query.search ? {search: query.search} : {}),
          ...(query.isNew !== undefined
            ? {isNew: this.toBoolean(query.isNew)}
            : {}),
          ...(query.createdFrom ? {createdFrom: query.createdFrom} : {}),
          ...(query.createdTo ? {createdTo: query.createdTo} : {}),
          ...(query.sortBy ? {sortBy: query.sortBy} : {}),
          ...(query.sortOrder ? {sortOrder: query.sortOrder} : {}),
        }),
      );

      return result;
    } catch (err: unknown) {
      this.handleGrpcError(err);
    }
  }

  @Get("patients/search")
  @Roles(
    UserRole.ADMIN,
    UserRole.DOCTOR,
    UserRole.SECRETARY,
    UserRole.DENTAL_ASSISTANT,
  )
  async searchPatientsByName(
    @Param("id", ParseUUIDPipe) clinicId: string,
    @Query("firstName") firstName?: string,
    @Query("lastName") lastName?: string,
  ) {
    try {
      const result = await lastValueFrom(
        this.patientGrpcService.searchPatientsByName({
          clinicId,
          ...(firstName ? {firstName} : {}),
          ...(lastName ? {lastName} : {}),
        }),
      );
      return {items: result.items};
    } catch (err: unknown) {
      this.handleGrpcError(err);
    }
  }

  @Get("patients/by-user/:userId")
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.SECRETARY)
  async getPatientByUserId(@Param("userId", ParseUUIDPipe) userId: string) {
    try {
      return await lastValueFrom(
        this.patientGrpcService.getPatientByUserId({userId}),
      );
    } catch (err: unknown) {
      this.handleGrpcError(err);
    }
  }

  @Put("patients/:patientId")
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.SECRETARY)
  async updatePatient(
    @Param("patientId", ParseUUIDPipe) patientId: string,
    @Body() dto: Omit<UpdatePatientRequest, "patientId">,
  ) {
    try {
      return await lastValueFrom(
        this.patientGrpcService.updatePatient({patientId, ...dto}),
      );
    } catch (err: unknown) {
      this.handleGrpcError(err);
    }
  }

  @Delete("patients/:patientId")
  @Roles(UserRole.ADMIN, UserRole.SECRETARY)
  async deletePatient(@Param("patientId", ParseUUIDPipe) patientId: string) {
    try {
      return await lastValueFrom(this.patientGrpcService.deletePatient({id: patientId}));
    } catch (err: unknown) {
      this.handleGrpcError(err);
    }
  }

  @Put("patients/:patientId/soft-delete")
  @Roles(UserRole.ADMIN, UserRole.SECRETARY)
  async softDeletePatient(@Param("patientId", ParseUUIDPipe) patientId: string) {
    try {
      return await lastValueFrom(
        this.patientGrpcService.softDeletePatient({id: patientId}),
      );
    } catch (err: unknown) {
      this.handleGrpcError(err);
    }
  }

  @Put("patients/:patientId/restore")
  @Roles(UserRole.ADMIN, UserRole.SECRETARY)
  async restorePatient(@Param("patientId", ParseUUIDPipe) patientId: string) {
    try {
      return await lastValueFrom(this.patientGrpcService.restorePatient({id: patientId}));
    } catch (err: unknown) {
      this.handleGrpcError(err);
    }
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
      this.handleGrpcError(err);
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
      this.handleGrpcError(err);
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
          ...(isActive !== undefined ? {isActive: this.toBoolean(isActive)} : {}),
          ...(search ? {search} : {}),
        }),
      );

      if (name) {
        return {
          providers: result.providers.filter(
            (provider) => provider.name.toLowerCase() === name.toLowerCase(),
          ),
        };
      }

      if (code) {
        return {
          providers: result.providers.filter(
            (provider) => provider.code.toLowerCase() === code.toLowerCase(),
          ),
        };
      }

      return result;
    } catch (err: unknown) {
      this.handleGrpcError(err);
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
      this.handleGrpcError(err);
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
      this.handleGrpcError(err);
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
      this.handleGrpcError(err);
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
      this.handleGrpcError(err);
    }
  }

  @Post("insurance-templates")
  @Roles(UserRole.ADMIN, UserRole.SECRETARY)
  async createInsuranceTemplate(@Body() dto: CreateInsuranceTemplateRequest) {
    try {
      return await lastValueFrom(
        this.patientGrpcService.createInsuranceTemplate(dto),
      );
    } catch (err: unknown) {
      this.handleGrpcError(err);
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
      this.handleGrpcError(err);
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
          ...(name ? {search: name} : {}),
        }),
      );

      if (name) {
        return {
          templates: result.templates.filter(
            (template) => template.name.toLowerCase() === name.toLowerCase(),
          ),
        };
      }

      return result;
    } catch (err: unknown) {
      this.handleGrpcError(err);
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
      this.handleGrpcError(err);
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
      this.handleGrpcError(err);
    }
  }

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
      this.handleGrpcError(err);
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
          ...(isActive !== undefined ? {isActive: this.toBoolean(isActive)} : {}),
        }),
      );
    } catch (err: unknown) {
      this.handleGrpcError(err);
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
      this.handleGrpcError(err);
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
      this.handleGrpcError(err);
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
      this.handleGrpcError(err);
    }
  }

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
          ...(isActive !== undefined ? {isActive: this.toBoolean(isActive)} : {}),
        }),
      );

      if (policyNumber) {
        return {
          insurances: result.insurances.filter(
            (insurance) => insurance.policyNumber === policyNumber,
          ),
        };
      }

      if (memberId) {
        return {
          insurances: result.insurances.filter(
            (insurance) => insurance.memberId === memberId,
          ),
        };
      }

      return result;
    } catch (err: unknown) {
      this.handleGrpcError(err);
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
      this.handleGrpcError(err);
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
      this.handleGrpcError(err);
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
      this.handleGrpcError(err);
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
      this.handleGrpcError(err);
    }
  }

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
      this.handleGrpcError(err);
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
      this.handleGrpcError(err);
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
      this.handleGrpcError(err);
    }
  }

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
        const set = new Set(ids.split(",").map((value) => value.trim()));
        return {
          documents: result.documents.filter((document) => set.has(document.id)),
        };
      }

      return result;
    } catch (err: unknown) {
      this.handleGrpcError(err);
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
      this.handleGrpcError(err);
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
      this.handleGrpcError(err);
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
      this.handleGrpcError(err);
    }
  }

  private toBoolean(value: string): boolean {
    return value === "true" || value === "1";
  }

  private toNumber(value: string): number {
    const numeric = Number(value);
    if (Number.isNaN(numeric)) {
      throw new BadRequestException(`Invalid numeric query value: ${value}`);
    }
    return numeric;
  }

  private handleGrpcError(err: unknown): never {
    const grpcErr = err as {code?: number; details?: string; message?: string};
    const detail = grpcErr?.details ?? grpcErr?.message;

    if (grpcErr?.code === GrpcStatus.NOT_FOUND) {
      throw new NotFoundException(detail ?? "Not found");
    }
    if (grpcErr?.code === GrpcStatus.ALREADY_EXISTS) {
      throw new ConflictException(detail ?? "Already exists");
    }
    if (grpcErr?.code === GrpcStatus.INVALID_ARGUMENT) {
      throw new BadRequestException(detail ?? "Invalid argument");
    }

    throw new InternalServerErrorException(
      detail ?? "Patient service unavailable",
    );
  }
}
