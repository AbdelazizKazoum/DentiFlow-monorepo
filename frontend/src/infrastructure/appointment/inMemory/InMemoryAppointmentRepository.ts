import type {Appointment} from "@/domain/appointment/entities/appointment";
import type {MoveAppointmentCommand} from "@/domain/appointment/commands/MoveAppointmentCommand";
import type {GetAppointmentsQuery} from "@/domain/appointment/queries/GetAppointmentsQuery";
import type {
  AppointmentRepository,
  PaginatedAppointments,
} from "@/domain/appointment/repositories/AppointmentRepository";
import {isBlockingOverlap} from "@/domain/appointment/services/appointmentConflictPolicy";

const clinicId =
  process.env.NEXT_PUBLIC_DEFAULT_CLINIC_ID ??
  "00000000-0000-4000-8000-000000000001";

const todayAt = (hour: number, minute: number, dayOffset = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour, minute, 0, 0);
  return date;
};

const SEED_APPOINTMENTS: Appointment[] = [
  {
    id: "apt-1",
    clinicId,
    patientId: "patient-1",
    patientName: "Alice Johnson",
    patientPhone: "555-0101",
    doctorId: "d1",
    doctorName: "Dr. Emily Carter",
    startAt: todayAt(10, 0),
    endAt: todayAt(10, 30),
    isEmergency: false,
    type: "Checkup",
    channel: "PHONE",
    status: "CONFIRMED",
    notes: "Patient reports minor sensitivity on the upper left side.",
  },
  {
    id: "apt-2",
    clinicId,
    patientId: "patient-2",
    patientName: "Bob Smith",
    patientPhone: "555-0102",
    doctorId: "d2",
    doctorName: "Dr. John Harris",
    startAt: todayAt(14, 0),
    endAt: todayAt(15, 0),
    isEmergency: false,
    type: "Scaling",
    channel: "ONLINE",
    status: "PENDING",
    notes: "New patient, requires full mouth x-ray.",
  },
  {
    id: "apt-3",
    clinicId,
    patientId: "patient-3",
    patientName: "Diana Lee",
    patientPhone: "555-0103",
    doctorId: "d1",
    doctorName: "Dr. Emily Carter",
    startAt: todayAt(11, 0, 1),
    endAt: todayAt(12, 0, 1),
    isEmergency: false,
    type: "Root Canal",
    channel: "PHONE",
    status: "CANCELLED",
    notes: "Patient cancelled, needs to reschedule.",
    cancelledAt: todayAt(16, 10, -1),
    cancellationReason: "Patient requested another day.",
  },
  {
    id: "apt-4",
    clinicId,
    patientId: "patient-4",
    patientName: "Mark Davis",
    patientPhone: "555-0104",
    doctorId: "d3",
    doctorName: "Dr. Sarah Chen",
    startAt: todayAt(9, 0),
    endAt: todayAt(9, 45),
    isEmergency: false,
    type: "Whitening",
    channel: "WALK_IN",
    status: "CONFIRMED",
  },
  {
    id: "apt-5",
    clinicId,
    patientId: "patient-5",
    patientName: "Nora Patel",
    patientPhone: "555-0105",
    doctorId: "d1",
    doctorName: "Dr. Emily Carter",
    startAt: todayAt(10, 15),
    endAt: todayAt(10, 45),
    isEmergency: true,
    type: "Emergency pain",
    channel: "WALK_IN",
    status: "CONFIRMED",
    notes: "Emergency override example, allowed to overlap.",
  },
];

export class InMemoryAppointmentRepository implements AppointmentRepository {
  private store: Appointment[] = [...SEED_APPOINTMENTS];

  async getById(id: string): Promise<Appointment> {
    const appointment = this.store.find((item) => item.id === id);
    if (!appointment) throw new Error(`Appointment with id "${id}" not found`);
    return {...appointment};
  }

  async getByRange(
    clinicId: string,
    start: Date,
    end: Date,
    doctorId?: string,
  ): Promise<Appointment[]> {
    return this.store
      .filter((item) => item.clinicId === clinicId)
      .filter((item) => !doctorId || item.doctorId === doctorId)
      .filter((item) => item.startAt < end && item.endAt > start)
      .map((item) => ({...item}));
  }

  async getPaginated(
    query: GetAppointmentsQuery,
  ): Promise<PaginatedAppointments> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    const matching = this.store
      .filter((item) => item.clinicId === query.clinicId)
      .filter((item) => !query.doctorId || item.doctorId === query.doctorId)
      .filter((item) => !query.status || item.status === query.status)
      .filter(
        (item) =>
          !query.startDate ||
          !query.endDate ||
          (item.startAt < query.endDate && item.endAt > query.startDate),
      )
      .sort((a, b) => a.startAt.getTime() - b.startAt.getTime());

    const start = (page - 1) * limit;
    return {
      items: matching.slice(start, start + limit).map((item) => ({...item})),
      total: matching.length,
    };
  }

  async save(appointment: Partial<Appointment>): Promise<Appointment> {
    if (appointment.id) {
      const index = this.store.findIndex((item) => item.id === appointment.id);
      if (index === -1) {
        throw new Error(`Appointment with id "${appointment.id}" not found`);
      }
      const updated = {...this.store[index], ...appointment} as Appointment;
      this.store[index] = updated;
      return {...updated};
    }

    const created: Appointment = {
      id: `apt-${Date.now()}`,
      clinicId: appointment.clinicId ?? clinicId,
      patientId: appointment.patientId ?? `patient-${Date.now()}`,
      patientName: appointment.patientName ?? "",
      patientPhone: appointment.patientPhone,
      doctorId: appointment.doctorId ?? "",
      doctorName: appointment.doctorName ?? "",
      startAt: appointment.startAt ?? new Date(),
      endAt:
        appointment.endAt ??
        new Date((appointment.startAt ?? new Date()).getTime() + 30 * 60_000),
      isEmergency: appointment.isEmergency ?? false,
      type: appointment.type,
      channel: appointment.channel ?? "PHONE",
      status: appointment.status ?? "PENDING",
      notes: appointment.notes,
      cancelledAt: appointment.cancelledAt,
      cancellationReason: appointment.cancellationReason,
    };

    this.store.push(created);
    return {...created};
  }

  async updateTiming(command: MoveAppointmentCommand): Promise<void> {
    const index = this.store.findIndex(
      (item) => item.id === command.appointmentId,
    );
    if (index === -1) {
      throw new Error(`Appointment with id "${command.appointmentId}" not found`);
    }

    this.store[index] = {
      ...this.store[index],
      doctorId: command.doctorId,
      doctorName: command.doctorName ?? this.store[index].doctorName,
      startAt: command.newStartAt,
      endAt: command.newEndAt,
    };
  }

  async checkConflicts(
    doctorId: string,
    start: Date,
    end: Date,
  ): Promise<boolean> {
    return this.store.some(
      (item) =>
        item.doctorId === doctorId &&
        isBlockingOverlap(item, start, end),
    );
  }
}
