import type {Appointment} from "@/domain/appointment/entities/appointment";
import type {MoveAppointmentCommand} from "@/domain/appointment/commands/MoveAppointmentCommand";
import type {GetAppointmentsQuery} from "@/domain/appointment/queries/GetAppointmentsQuery";

export interface PaginatedAppointments {
  items: Appointment[];
  total: number;
}

export interface AppointmentRepository {
  getById(id: string): Promise<Appointment>;
  getByRange(
    clinicId: string,
    start: Date,
    end: Date,
    doctorId?: string,
  ): Promise<Appointment[]>;
  getPaginated(query: GetAppointmentsQuery): Promise<PaginatedAppointments>;
  save(appointment: Partial<Appointment>): Promise<Appointment>;
  updateTiming(command: MoveAppointmentCommand): Promise<void>;
  checkConflicts(doctorId: string, start: Date, end: Date): Promise<boolean>;
}
