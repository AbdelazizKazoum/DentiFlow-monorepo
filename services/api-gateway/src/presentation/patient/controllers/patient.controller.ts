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
  toNumber,
} from "../patient-grpc.helper";

type CreatePatientRequest = PatientProto.CreatePatientRequest;
type UpdatePatientRequest = PatientProto.UpdatePatientRequest;

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
      handleGrpcError(err);
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
    },
  ) {
    try {
      return await lastValueFrom(
        this.patientGrpcService.listPatients({
          clinicId,
          ...(query.page ? {page: toNumber(query.page)} : {}),
          ...(query.limit ? {limit: toNumber(query.limit)} : {}),
          ...(query.status ? {status: query.status} : {}),
          ...(query.gender ? {gender: query.gender} : {}),
          ...(query.search ? {search: query.search} : {}),
          ...(query.isNew !== undefined ? {isNew: toBoolean(query.isNew)} : {}),
          ...(query.createdFrom ? {createdFrom: query.createdFrom} : {}),
          ...(query.createdTo ? {createdTo: query.createdTo} : {}),
          ...(query.sortBy ? {sortBy: query.sortBy} : {}),
          ...(query.sortOrder ? {sortOrder: query.sortOrder} : {}),
        }),
      );
    } catch (err: unknown) {
      handleGrpcError(err);
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
      handleGrpcError(err);
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
      handleGrpcError(err);
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
      return await lastValueFrom(
        this.patientGrpcService.getPatient({id: patientId}),
      );
    } catch (err: unknown) {
      handleGrpcError(err);
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
      handleGrpcError(err);
    }
  }

  @Delete("patients/:patientId")
  @Roles(UserRole.ADMIN, UserRole.SECRETARY)
  async deletePatient(@Param("patientId", ParseUUIDPipe) patientId: string) {
    try {
      return await lastValueFrom(
        this.patientGrpcService.deletePatient({id: patientId}),
      );
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }

  @Put("patients/:patientId/soft-delete")
  @Roles(UserRole.ADMIN, UserRole.SECRETARY)
  async softDeletePatient(
    @Param("patientId", ParseUUIDPipe) patientId: string,
  ) {
    try {
      return await lastValueFrom(
        this.patientGrpcService.softDeletePatient({id: patientId}),
      );
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }

  @Put("patients/:patientId/restore")
  @Roles(UserRole.ADMIN, UserRole.SECRETARY)
  async restorePatient(@Param("patientId", ParseUUIDPipe) patientId: string) {
    try {
      return await lastValueFrom(
        this.patientGrpcService.restorePatient({id: patientId}),
      );
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }
}
