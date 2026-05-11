import type {CheckInPatientCommand} from "@/domain/queue/commands/CheckInPatientCommand";
import type {UpdateQueueNotesCommand} from "@/domain/queue/commands/UpdateQueueNotesCommand";
import type {UpdateQueueStatusCommand} from "@/domain/queue/commands/UpdateQueueStatusCommand";
import type {QueueEntry} from "@/domain/queue/entities/queueEntry";
import type {QueueRepository} from "@/domain/queue/repositories/QueueRepository";
import {sortQueueEntries} from "@/domain/queue/services/queuePolicy";

const clinicId =
  process.env.NEXT_PUBLIC_DEFAULT_CLINIC_ID ??
  "00000000-0000-4000-8000-000000000001";

function minutesAgo(minutes: number): Date {
  return new Date(Date.now() - minutes * 60_000);
}

const SEED_QUEUE: QueueEntry[] = [
  {
    id: "queue-1",
    clinicId,
    appointmentId: "apt-live-1",
    patientId: "patient-live-1",
    patientName: "Sarah Johnson",
    patientPhone: "+213 555 0101",
    doctorId: "d1",
    doctorName: "Dr. Emily Carter",
    appointmentType: "Root Canal",
    status: "IN_CHAIR",
    priority: "URGENT",
    arrivedAt: minutesAgo(58),
    calledAt: minutesAgo(39),
    seatedAt: minutesAgo(34),
  },
  {
    id: "queue-2",
    clinicId,
    appointmentId: "apt-live-2",
    patientId: "patient-live-2",
    patientName: "Ahmed Meziane",
    patientPhone: "+213 555 0102",
    doctorId: "d2",
    doctorName: "Dr. John Harris",
    appointmentType: "Cleaning",
    status: "WAITING",
    priority: "EMERGENCY",
    notes: "Severe pain, arrived without breakfast.",
    arrivedAt: minutesAgo(24),
    calledAt: minutesAgo(10),
  },
  {
    id: "queue-3",
    clinicId,
    appointmentId: "apt-live-3",
    patientId: "patient-live-3",
    patientName: "Fatima Bouaziz",
    patientPhone: "+213 555 0103",
    doctorId: "d1",
    doctorName: "Dr. Emily Carter",
    appointmentType: "Checkup",
    status: "ARRIVED",
    priority: "NORMAL",
    notes: "First-time patient.",
    arrivedAt: minutesAgo(8),
  },
  {
    id: "queue-4",
    clinicId,
    appointmentId: "apt-live-4",
    patientId: "patient-live-4",
    patientName: "Karim Mansouri",
    patientPhone: "+213 555 0104",
    doctorId: "d3",
    doctorName: "Dr. Sarah Chen",
    appointmentType: "Whitening",
    status: "WAITING",
    priority: "NORMAL",
    arrivedAt: minutesAgo(17),
    calledAt: minutesAgo(6),
  },
  {
    id: "queue-5",
    clinicId,
    appointmentId: "apt-live-5",
    patientId: "patient-live-5",
    patientName: "Nadia Rahmani",
    patientPhone: "+213 555 0105",
    doctorId: "d2",
    doctorName: "Dr. John Harris",
    appointmentType: "Crown fitting",
    status: "DONE",
    priority: "NORMAL",
    arrivedAt: minutesAgo(110),
    calledAt: minutesAgo(96),
    seatedAt: minutesAgo(88),
    completedAt: minutesAgo(32),
  },
];

export class InMemoryQueueRepository implements QueueRepository {
  private store: QueueEntry[] = [...SEED_QUEUE];

  async listByClinic(clinicId: string): Promise<QueueEntry[]> {
    return sortQueueEntries(
      this.store
        .filter((entry) => entry.clinicId === clinicId)
        .map((entry) => ({...entry})),
    );
  }

  async getById(id: string): Promise<QueueEntry> {
    const entry = this.store.find((item) => item.id === id);
    if (!entry) throw new Error(`Queue entry with id "${id}" not found`);
    return {...entry};
  }

  async checkIn(command: CheckInPatientCommand): Promise<QueueEntry> {
    const existing = this.store.find(
      (entry) => entry.appointmentId === command.appointmentId,
    );
    if (existing) {
      throw new Error("This appointment is already in the waiting room queue.");
    }

    const created: QueueEntry = {
      id: `queue-${Date.now()}`,
      clinicId: command.clinicId,
      appointmentId: command.appointmentId,
      patientId: command.patientId,
      patientName: command.patientName,
      patientPhone: command.patientPhone,
      doctorId: command.doctorId,
      doctorName: command.doctorName,
      appointmentType: command.appointmentType,
      status: "ARRIVED",
      priority: command.priority ?? "NORMAL",
      notes: command.notes,
      arrivedAt: command.arrivedAt ?? new Date(),
    };

    this.store.push(created);
    return {...created};
  }

  async updateStatus(command: UpdateQueueStatusCommand): Promise<QueueEntry> {
    const index = this.store.findIndex(
      (entry) => entry.id === command.queueEntryId,
    );
    if (index === -1) {
      throw new Error(`Queue entry with id "${command.queueEntryId}" not found`);
    }

    const current = this.store[index];
    const now = new Date();
    const updated: QueueEntry = {
      ...current,
      status: command.status,
      calledAt:
        command.status === "WAITING" ? current.calledAt ?? now : current.calledAt,
      seatedAt:
        command.status === "IN_CHAIR"
          ? current.seatedAt ?? now
          : current.seatedAt,
      completedAt:
        command.status === "DONE"
          ? current.completedAt ?? now
          : current.completedAt,
    };

    this.store[index] = updated;
    return {...updated};
  }

  async updateNotes(command: UpdateQueueNotesCommand): Promise<QueueEntry> {
    const index = this.store.findIndex(
      (entry) => entry.id === command.queueEntryId,
    );
    if (index === -1) {
      throw new Error(`Queue entry with id "${command.queueEntryId}" not found`);
    }

    const updated = {
      ...this.store[index],
      notes: command.notes?.trim() || undefined,
    };
    this.store[index] = updated;
    return {...updated};
  }
}
