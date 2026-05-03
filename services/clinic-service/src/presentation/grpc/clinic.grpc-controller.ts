import {Controller} from "@nestjs/common";
import {GrpcMethod, RpcException} from "@nestjs/microservices";
import {status} from "@grpc/grpc-js";
import {GetClinicUseCase} from "../../application/use-cases/get-clinic.use-case";
import {GetStaffMemberUseCase} from "../../application/use-cases/get-staff-member.use-case";
import {GetWorkingHoursUseCase} from "../../application/use-cases/get-working-hours.use-case";

interface GetClinicRequest {
  id: string;
}

interface GetStaffMemberRequest {
  user_id: string;
  clinic_id: string;
}

interface GetWorkingHoursRequest {
  clinic_id: string;
}

@Controller()
export class ClinicGrpcController {
  constructor(
    private readonly getClinic: GetClinicUseCase,
    private readonly getStaffMember: GetStaffMemberUseCase,
    private readonly getWorkingHours: GetWorkingHoursUseCase,
  ) {}

  @GrpcMethod("ClinicService", "GetClinic")
  async handleGetClinic(data: GetClinicRequest) {
    try {
      const clinic = await this.getClinic.execute(data.id);
      return {
        id: clinic.id,
        slug: clinic.slug,
        name: clinic.name,
        timezone: clinic.timezone,
        locale: clinic.locale,
        is_active: clinic.isActive,
      };
    } catch {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: `Clinic "${data.id}" not found`,
      });
    }
  }

  @GrpcMethod("ClinicService", "GetStaffMember")
  async handleGetStaffMember(data: GetStaffMemberRequest) {
    try {
      const sm = await this.getStaffMember.execute(
        data.user_id,
        data.clinic_id,
      );
      return {
        id: sm.id,
        clinic_id: sm.clinicId,
        user_id: sm.userId,
        role: sm.role,
        status: sm.status,
        first_name: sm.firstName,
        last_name: sm.lastName,
        phone: sm.phone ?? "",
        email: sm.email ?? "",
        specialization: sm.specialization ?? "",
        avatar: sm.avatar ?? "",
        is_active: sm.isActive,
      };
    } catch {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: `Staff member not found for user "${data.user_id}" in clinic "${data.clinic_id}"`,
      });
    }
  }

  @GrpcMethod("ClinicService", "GetWorkingHours")
  async handleGetWorkingHours(data: GetWorkingHoursRequest) {
    const entries = await this.getWorkingHours.execute(data.clinic_id);
    return {
      entries: entries.map((e) => ({
        id: e.id,
        clinic_id: e.clinicId,
        day_of_week: e.dayOfWeek,
        open_time: e.openTime ?? "",
        close_time: e.closeTime ?? "",
        is_closed: e.isClosed,
      })),
    };
  }
}
