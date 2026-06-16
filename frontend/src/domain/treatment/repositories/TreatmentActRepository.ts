import type {TreatmentAct} from "../entities/TreatmentAct";

export interface TreatmentActRepository {
  getById(id: string): Promise<TreatmentAct>;
  getByVisitId(visitId: string): Promise<TreatmentAct[]>;
  save(act: Partial<TreatmentAct>): Promise<TreatmentAct>;
  update(
    id: string,
    updates: Partial<TreatmentAct>,
  ): Promise<TreatmentAct>;
  delete(id: string): Promise<void>;
  calculateVisitTotal(visitId: string): Promise<number>;
}
