import {Controller, UsePipes, ValidationPipe} from "@nestjs/common";
import {GrpcMethod, RpcException} from "@nestjs/microservices";
import {status} from "@grpc/grpc-js";
import {GetClinicUseCase} from "../../application/use-cases/get-clinic.use-case";
import {GetStaffMemberUseCase} from "../../application/use-cases/get-staff-member.use-case";
import {GetWorkingHoursUseCase} from "../../application/use-cases/get-working-hours.use-case";
import {CreateClinicUseCase} from "../../application/use-cases/create-clinic.use-case";
import {UpsertWorkingHoursUseCase} from "../../application/use-cases/upsert-working-hours.use-case";
import {CreateStaffMemberUseCase} from "../../application/use-cases/create-staff-member.use-case";
import {ListStaffMembersUseCase} from "../../application/use-cases/list-staff-members.use-case";
import {Locale} from "../../domain/enums/locale.enum";
import {StaffRole} from "../../domain/enums/staff-role.enum";
import {ClinicProto} from "@lib/proto";
import {ClinicGrpcMapper} from "./clinic.grpc-mapper";
import {
  CreateClinicInput,
  CreateStaffMemberInput,
  UpsertWorkingHoursInput,
} from "./clinic.grpc-inputs";

type GetClinicRequest = ClinicProto.GetClinicRequest;
type GetStaffMemberRequest = ClinicProto.GetStaffMemberRequest;
type GetWorkingHoursRequest = ClinicProto.GetWorkingHoursRequest;
type ListStaffMembersRequest = ClinicProto.ListStaffMembersRequest;

@UsePipes(new ValidationPipe({transform: true, whitelist: true}))
@Controller()
export class ClinicGrpcController {
  constructor(
    private readonly getClinicUC: GetClinicUseCase,
    private readonly getStaffMemberUC: GetStaffMemberUseCase,
    private readonly getWorkingHoursUC: GetWorkingHoursUseCase,
    private readonly createClinicUC: CreateClinicUseCase,
    private readonly upsertWorkingHoursUC: UpsertWorkingHoursUseCase,
    private readonly createStaffMemberUC: CreateStaffMemberUseCase,
    private readonly listStaffMembersUC: ListStaffMembersUseCase,
  ) {}

  @GrpcMethod("ClinicService", "GetClinic")
  async handleGetClinic(data: GetClinicRequest) {
    try {
      const clinic = await this.getClinicUC.execute(data.id);
      return ClinicGrpcMapper.toClinicReply(clinic);
    } catch (error) {
      const httpErr = error as {status?: number; message?: string};
      if (httpErr?.status === 404) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: `Clinic "${data.id}" not found`,
        });
      }
      throw new RpcException({
        code: status.INTERNAL,
        message: httpErr?.message ?? "Internal server error",
      });
    }
  }

  @GrpcMethod("ClinicService", "GetStaffMember")
  async handleGetStaffMember(data: GetStaffMemberRequest) {
    try {
      const sm = await this.getStaffMemberUC.execute(
        data.userId,
        data.clinicId,
      );
      return ClinicGrpcMapper.toStaffMemberReply(sm);
    } catch (error) {
      const httpErr = error as {status?: number; message?: string};
      if (httpErr?.status === 404) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: `Staff member not found for user "${data.userId}" in clinic "${data.clinicId}"`,
        });
      }
      throw new RpcException({
        code: status.INTERNAL,
        message: httpErr?.message ?? "Internal server error",
      });
    }
  }

  @GrpcMethod("ClinicService", "GetWorkingHours")
  async handleGetWorkingHours(data: GetWorkingHoursRequest) {
    const entries = await this.getWorkingHoursUC.execute(data.clinicId);
    return {entries: entries.map(ClinicGrpcMapper.toWorkingHoursEntry)};
  }

  @GrpcMethod("ClinicService", "CreateClinic")
  async handleCreateClinic(data: CreateClinicInput) {
    try {
      const clinic = await this.createClinicUC.execute({
        ...data,
        locale: data.locale as Locale,
      });
      return ClinicGrpcMapper.toClinicReply(clinic);
    } catch (error) {
      throw new RpcException({
        code: status.INTERNAL,
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  @GrpcMethod("ClinicService", "UpsertWorkingHours")
  async handleUpsertWorkingHours(data: UpsertWorkingHoursInput) {
    try {
      const entries = await this.upsertWorkingHoursUC.execute(
        data.clinicId,
        data.entries,
      );
      return {entries: entries.map(ClinicGrpcMapper.toWorkingHoursEntry)};
    } catch (error) {
      throw new RpcException({
        code: status.INTERNAL,
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  @GrpcMethod("ClinicService", "CreateStaffMember")
  async handleCreateStaffMember(data: CreateStaffMemberInput) {
    try {
      const {clinicId, role, ...staffInput} = data;
      const sm = await this.createStaffMemberUC.execute(clinicId, {
        ...staffInput,
        role: role as StaffRole,
      });
      return ClinicGrpcMapper.toStaffMemberReply(sm);
    } catch (error) {
      this.rethrowAsRpc(error);
    }
  }

  @GrpcMethod("ClinicService", "ListStaffMembers")
  async handleListStaffMembers(data: ListStaffMembersRequest) {
    const staffMembers = await this.listStaffMembersUC.execute(data.clinicId);
    return {
      staffMembers: staffMembers.map(ClinicGrpcMapper.toStaffMemberReply),
    };
  }

  private rethrowAsRpc(err: unknown): never {
    if (err instanceof RpcException) throw err;

    const httpErr = err as {status?: number; message?: string};
    const httpStatus = httpErr?.status;
    const message = httpErr?.message ?? "Unknown error";

    if (httpStatus === 409) {
      throw new RpcException({code: status.ALREADY_EXISTS, message});
    }
    if (httpStatus === 404) {
      throw new RpcException({code: status.NOT_FOUND, message});
    }
    if (httpStatus === 400) {
      throw new RpcException({code: status.INVALID_ARGUMENT, message});
    }
    throw new RpcException({
      code: status.INTERNAL,
      message: "Internal server error",
    });
  }
}
