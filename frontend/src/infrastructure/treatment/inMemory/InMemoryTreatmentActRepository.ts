import type {TreatmentAct} from "@/domain/treatment/entities/TreatmentAct";
import type {TreatmentActRepository} from "@/domain/treatment/repositories/TreatmentActRepository";
import {treatmentMemoryStore} from "./treatmentMemoryStore";

function cloneAct(act: TreatmentAct): TreatmentAct {
  return {
    ...act,
    createdAt: new Date(act.createdAt),
    updatedAt: new Date(act.updatedAt),
  };
}

export class InMemoryTreatmentActRepository
  implements TreatmentActRepository
{
  async getById(id: string): Promise<TreatmentAct> {
    const act = treatmentMemoryStore.treatmentActs.find(
      (item) => item.id === id,
    );

    if (!act) {
      throw new Error(`Treatment act with id "${id}" not found.`);
    }

    return cloneAct(act);
  }

  async getByVisitId(visitId: string): Promise<TreatmentAct[]> {
    return treatmentMemoryStore.treatmentActs
      .filter((act) => act.visitId === visitId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map(cloneAct);
  }

  async save(act: Partial<TreatmentAct>): Promise<TreatmentAct> {
    const created: TreatmentAct = {
      id: act.id ?? `treatment-act-${Date.now()}-${crypto.randomUUID()}`,
      clinicId: act.clinicId ?? "",
      visitId: act.visitId ?? "",
      actCatalogId: act.actCatalogId ?? "",
      toothFdi: act.toothFdi,
      quantity: act.quantity ?? 1,
      unitPrice: act.unitPrice ?? 0,
      surface: act.surface,
      toothPart: act.toothPart,
      dentition: act.dentition ?? "PERMANENT",
      status: act.status ?? "DONE",
      notes: act.notes,
      enteredBy: act.enteredBy ?? "",
      createdAt: act.createdAt ?? new Date(),
      updatedAt: act.updatedAt ?? new Date(),
    };

    treatmentMemoryStore.treatmentActs.push(created);
    return cloneAct(created);
  }

  async update(
    id: string,
    updates: Partial<TreatmentAct>,
  ): Promise<TreatmentAct> {
    const index = treatmentMemoryStore.treatmentActs.findIndex(
      (act) => act.id === id,
    );

    if (index === -1) {
      throw new Error(`Treatment act with id "${id}" not found.`);
    }

    const updated = {
      ...treatmentMemoryStore.treatmentActs[index],
      ...updates,
      id,
      unitPrice: treatmentMemoryStore.treatmentActs[index].unitPrice,
      updatedAt: new Date(),
    };

    treatmentMemoryStore.treatmentActs[index] = updated;
    return cloneAct(updated);
  }

  async delete(id: string): Promise<void> {
    const index = treatmentMemoryStore.treatmentActs.findIndex(
      (act) => act.id === id,
    );

    if (index === -1) {
      throw new Error(`Treatment act with id "${id}" not found.`);
    }

    treatmentMemoryStore.treatmentActs.splice(index, 1);
  }

  async calculateVisitTotal(visitId: string): Promise<number> {
    return treatmentMemoryStore.treatmentActs
      .filter((act) => act.visitId === visitId)
      .filter((act) => act.status !== "CANCELLED")
      .reduce((sum, act) => sum + act.quantity * act.unitPrice, 0);
  }
}
