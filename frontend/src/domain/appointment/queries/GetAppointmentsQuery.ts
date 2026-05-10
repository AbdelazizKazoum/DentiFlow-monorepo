import type {AppointmentStatus} from "@/domain/appointment/entities/appointment";

export interface GetAppointmentsQuery {
  clinicId: string;
  page?: number;
  limit?: number;
  startDate?: Date;
  endDate?: Date;
  doctorId?: string;
  status?: AppointmentStatus;
}
