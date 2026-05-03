import {Clinic} from "../../domain/entities/clinic";
import {StaffMember} from "../../domain/entities/staff-member";
import {WorkingHours} from "../../domain/entities/working-hours";
import {ClinicProto} from "@lib/proto";

export class ClinicGrpcMapper {
  static toClinicReply(clinic: Clinic): ClinicProto.ClinicReply {
    return {
      id: clinic.id,
      slug: clinic.slug,
      name: clinic.name,
      timezone: clinic.timezone,
      locale: clinic.locale,
      isActive: clinic.isActive,
    };
  }

  static toStaffMemberReply(sm: StaffMember): ClinicProto.StaffMemberReply {
    return {
      id: sm.id,
      clinicId: sm.clinicId,
      userId: sm.userId,
      role: sm.role,
      status: sm.status,
      firstName: sm.firstName,
      lastName: sm.lastName,
      phone: sm.phone ?? "",
      email: sm.email ?? "",
      specialization: sm.specialization ?? "",
      avatar: sm.avatar ?? "",
      isActive: sm.isActive,
    };
  }

  static toWorkingHoursEntry(e: WorkingHours): ClinicProto.WorkingHoursEntry {
    return {
      id: e.id,
      clinicId: e.clinicId,
      dayOfWeek: e.dayOfWeek,
      openTime: e.openTime ?? "",
      closeTime: e.closeTime ?? "",
      isClosed: e.isClosed,
    };
  }
}
