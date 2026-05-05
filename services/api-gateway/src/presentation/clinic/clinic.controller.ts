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
  UseGuards,
} from "@nestjs/common";
import {ClientGrpc} from "@nestjs/microservices";
import {lastValueFrom} from "rxjs";
import {status as GrpcStatus} from "@grpc/grpc-js";
import {ApiTags} from "@nestjs/swagger";
import {CLINIC_GRPC_CLIENT} from "../../infrastructure/grpc/clinic-grpc-client.module";
import {ClinicProto} from "@lib/proto";
import {JwtAuthGuard} from "../../shared/guards/jwt-auth.guard";
import {RolesGuard} from "../../shared/guards/roles.guard";
import {ClinicScopeGuard} from "../../shared/guards/clinic-scope.guard";
import {Roles} from "../../shared/decorators/roles.decorator";
import {UserRole} from "../../domain/auth/enums/user-role.enum";

type ClinicServiceClient = ClinicProto.ClinicServiceClient;
type CreateClinicRequest = ClinicProto.CreateClinicRequest;
type UpsertWorkingHoursRequest = ClinicProto.UpsertWorkingHoursRequest;
type CreateStaffMemberRequest = ClinicProto.CreateStaffMemberRequest;
type UpdateStaffMemberRequest = ClinicProto.UpdateStaffMemberRequest;
const CLINIC_SERVICE_NAME = ClinicProto.CLINIC_SERVICE_NAME;

@ApiTags("clinics")
@Controller("clinics")
@UseGuards(JwtAuthGuard, RolesGuard, ClinicScopeGuard)
export class ClinicController implements OnModuleInit {
  private clinicGrpcService!: ClinicServiceClient;

  constructor(
    @Inject(CLINIC_GRPC_CLIENT) private readonly grpcClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.clinicGrpcService =
      this.grpcClient.getService<ClinicServiceClient>(CLINIC_SERVICE_NAME);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() dto: CreateClinicRequest) {
    try {
      return await lastValueFrom(this.clinicGrpcService.createClinic(dto));
    } catch (err: unknown) {
      this.handleGrpcError(err);
    }
  }

  @Get(":id")
  @Roles(
    UserRole.ADMIN,
    UserRole.DOCTOR,
    UserRole.SECRETARY,
    UserRole.DENTAL_ASSISTANT,
  )
  async findOne(@Param("id", ParseUUIDPipe) id: string) {
    try {
      return await lastValueFrom(this.clinicGrpcService.getClinic({id}));
    } catch (err: unknown) {
      this.handleGrpcError(err);
    }
  }

  @Put(":id/working-hours")
  @Roles(UserRole.ADMIN, UserRole.SECRETARY)
  async upsertHours(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: {entries: UpsertWorkingHoursRequest["entries"]},
  ) {
    try {
      return await lastValueFrom(
        this.clinicGrpcService.upsertWorkingHours({
          clinicId: id,
          entries: dto.entries,
        }),
      );
    } catch (err: unknown) {
      this.handleGrpcError(err);
    }
  }

  @Get(":id/working-hours")
  @Roles(
    UserRole.ADMIN,
    UserRole.DOCTOR,
    UserRole.SECRETARY,
    UserRole.DENTAL_ASSISTANT,
  )
  async getHours(@Param("id", ParseUUIDPipe) id: string) {
    try {
      return await lastValueFrom(
        this.clinicGrpcService.getWorkingHours({clinicId: id}),
      );
    } catch (err: unknown) {
      this.handleGrpcError(err);
    }
  }

  @Post(":id/staff")
  @Roles(UserRole.ADMIN)
  async addStaff(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: Omit<CreateStaffMemberRequest, "clinicId">,
  ) {
    try {
      return await lastValueFrom(
        this.clinicGrpcService.createStaffMember({clinicId: id, ...dto}),
      );
    } catch (err: unknown) {
      this.handleGrpcError(err);
    }
  }

  @Get(":id/staff")
  @Roles(
    UserRole.ADMIN,
    UserRole.DOCTOR,
    UserRole.SECRETARY,
    UserRole.DENTAL_ASSISTANT,
  )
  async listStaff(@Param("id", ParseUUIDPipe) id: string) {
    try {
      return await lastValueFrom(
        this.clinicGrpcService.listStaffMembers({clinicId: id}),
      );
    } catch (err: unknown) {
      this.handleGrpcError(err);
    }
  }

  @Get(":id/staff/:userId")
  @Roles(
    UserRole.ADMIN,
    UserRole.DOCTOR,
    UserRole.SECRETARY,
    UserRole.DENTAL_ASSISTANT,
  )
  async getStaff(
    @Param("id", ParseUUIDPipe) id: string,
    @Param("userId", ParseUUIDPipe) userId: string,
  ) {
    try {
      return await lastValueFrom(
        this.clinicGrpcService.getStaffMember({userId, clinicId: id}),
      );
    } catch (err: unknown) {
      this.handleGrpcError(err);
    }
  }

  @Put(":id/staff/:staffId")
  @Roles(UserRole.ADMIN)
  async updateStaff(
    @Param("id", ParseUUIDPipe) id: string,
    @Param("staffId", ParseUUIDPipe) staffId: string,
    @Body() dto: Omit<UpdateStaffMemberRequest, "staffMemberId" | "clinicId">,
  ) {
    try {
      return await lastValueFrom(
        this.clinicGrpcService.updateStaffMember({
          staffMemberId: staffId,
          clinicId: id,
          ...dto,
        }),
      );
    } catch (err: unknown) {
      this.handleGrpcError(err);
    }
  }

  @Delete(":id/staff/:staffId")
  @Roles(UserRole.ADMIN)
  async deleteStaff(
    @Param("id", ParseUUIDPipe) id: string,
    @Param("staffId", ParseUUIDPipe) staffId: string,
  ) {
    try {
      return await lastValueFrom(
        this.clinicGrpcService.deleteStaffMember({
          staffMemberId: staffId,
          clinicId: id,
        }),
      );
    } catch (err: unknown) {
      this.handleGrpcError(err);
    }
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
      detail ?? "Clinic service unavailable",
    );
  }
}
