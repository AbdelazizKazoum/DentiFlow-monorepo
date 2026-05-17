import type {ITreatmentRepository} from "@/domain/treatment/repositories/ITreatmentRepository";
import type {ToothTreatment} from "@/domain/treatment/entities/toothTreatment";
import {useDentalChartStore} from "@/presentation/stores/dentalChartStore";

export class LocalTreatmentRepository implements ITreatmentRepository {
  async getTreatmentsByPatient(patientId: string): Promise<ToothTreatment[]> {
    void patientId;
    return useDentalChartStore.getState().treatments;
  }

  async saveTreatment(treatment: ToothTreatment): Promise<ToothTreatment> {
    useDentalChartStore.getState().addTreatment(treatment);
    return treatment;
  }

  async updateTreatment(
    id: string,
    patch: Partial<ToothTreatment>,
  ): Promise<ToothTreatment> {
    const store = useDentalChartStore.getState();
    store.updateTreatment(id, patch);

    const updated = useDentalChartStore
      .getState()
      .treatments.find((treatment) => treatment.id === id);

    if (!updated) {
      throw new Error("Treatment not found.");
    }

    return updated;
  }

  async deleteTreatment(id: string): Promise<void> {
    useDentalChartStore.getState().removeTreatment(id);
  }
}
