import type {Visit, VisitStatus} from "@/domain/treatment/entities/Visit";
import type {
  PaginatedVisits,
  VisitRepository,
} from "@/domain/treatment/repositories/VisitRepository";
import {treatmentMemoryStore} from "./treatmentMemoryStore";

function cloneVisit(visit: Visit): Visit {
  return {
    ...visit,
    confirmedAt: visit.confirmedAt ? new Date(visit.confirmedAt) : undefined,
    voidedAt: visit.voidedAt ? new Date(visit.voidedAt) : undefined,
    createdAt: new Date(visit.createdAt),
    updatedAt: new Date(visit.updatedAt),
    treatmentActs: visit.treatmentActs?.map((act) => ({...act})),
  };
}

export class InMemoryVisitRepository implements VisitRepository {
  async getById(id: string): Promise<Visit> {
    const visit = treatmentMemoryStore.visits.find((item) => item.id === id);

    if (!visit) {
      throw new Error(`Visit with id "${id}" not found.`);
    }

    return cloneVisit(visit);
  }

  async getByAppointmentId(appointmentId: string): Promise<Visit | null> {
    // Return the latest non-voided visit. Voided visits are audit records and
    // should not block a real chair encounter from opening later.
    const visit = treatmentMemoryStore.visits
      .filter((item) => item.appointmentId === appointmentId)
      .filter((item) => item.status !== "VOIDED")
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

    return visit ? cloneVisit(visit) : null;
  }

  async getOpenVisits(
    clinicId: string,
    doctorId?: string,
  ): Promise<PaginatedVisits> {
    const items = treatmentMemoryStore.visits
      .filter((visit) => visit.clinicId === clinicId)
      .filter((visit) => visit.status === "OPEN")
      .filter((visit) => !doctorId || visit.doctorId === doctorId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return {
      items: items.map(cloneVisit),
      total: items.length,
    };
  }

  async save(visit: Partial<Visit>): Promise<Visit> {
    const created: Visit = {
      id: visit.id ?? `visit-${Date.now()}`,
      clinicId: visit.clinicId ?? "",
      appointmentId: visit.appointmentId ?? "",
      patientId: visit.patientId ?? "",
      patientName: visit.patientName ?? "",
      doctorId: visit.doctorId ?? "",
      doctorName: visit.doctorName ?? "",
      assistantId: visit.assistantId,
      assistantName: visit.assistantName,
      status: visit.status ?? "OPEN",
      totalAmount: visit.totalAmount ?? 0,
      confirmedAt: visit.confirmedAt,
      confirmedBy: visit.confirmedBy,
      voidedAt: visit.voidedAt,
      voidReason: visit.voidReason,
      createdAt: visit.createdAt ?? new Date(),
      updatedAt: visit.updatedAt ?? new Date(),
    };

    treatmentMemoryStore.visits.push(created);
    return cloneVisit(created);
  }

  async updateStatus(visitId: string, status: VisitStatus): Promise<Visit> {
    return this.updateVisit(visitId, {status});
  }

  async updateTotalAmount(visitId: string, newTotal: number): Promise<void> {
    await this.updateVisit(visitId, {totalAmount: newTotal});
  }

  async assignAssistant(
    visitId: string,
    assistantId: string,
    assistantName: string,
  ): Promise<Visit> {
    return this.updateVisit(visitId, {assistantId, assistantName});
  }

  async confirm(visitId: string, confirmedBy: string): Promise<Visit> {
    return this.updateVisit(visitId, {
      status: "CONFIRMED",
      confirmedAt: new Date(),
      confirmedBy,
    });
  }

  async close(visitId: string): Promise<Visit> {
    return this.updateVisit(visitId, {status: "CLOSED"});
  }

  async void(visitId: string, reason: string): Promise<Visit> {
    return this.updateVisit(visitId, {
      status: "VOIDED",
      voidedAt: new Date(),
      voidReason: reason.trim(),
    });
  }

  private async updateVisit(
    visitId: string,
    updates: Partial<Visit>,
  ): Promise<Visit> {
    const index = treatmentMemoryStore.visits.findIndex(
      (visit) => visit.id === visitId,
    );

    if (index === -1) {
      throw new Error(`Visit with id "${visitId}" not found.`);
    }

    const updated = {
      ...treatmentMemoryStore.visits[index],
      ...updates,
      id: visitId,
      updatedAt: new Date(),
    };

    treatmentMemoryStore.visits[index] = updated;
    return cloneVisit(updated);
  }
}
