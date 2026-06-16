import type {TreatmentAct} from "./TreatmentAct";

export type VisitStatus = "OPEN" | "CONFIRMED" | "CLOSED";

export interface Visit {
  id: string;
  clinicId: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  assistantId?: string;
  assistantName?: string;
  status: VisitStatus;
  totalAmount: number;
  confirmedAt?: Date;
  confirmedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  treatmentActs?: TreatmentAct[];
}
