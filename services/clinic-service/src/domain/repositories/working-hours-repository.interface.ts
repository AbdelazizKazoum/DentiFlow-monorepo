import {WorkingHours} from "../entities/working-hours";

export interface IWorkingHoursRepository {
  findByClinic(clinicId: string): Promise<WorkingHours[]>;
  upsertEntries(entries: WorkingHours[]): Promise<WorkingHours[]>;
}
