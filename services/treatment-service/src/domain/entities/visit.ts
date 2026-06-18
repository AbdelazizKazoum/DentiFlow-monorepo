import {VisitStatus} from "../enums/visit-status.enum";

export class Visit {
  constructor(
    public readonly id: string,
    public readonly clinicId: string,
    public readonly appointmentId: string,
    public readonly patientId: string,
    public readonly patientName: string,
    public readonly doctorId: string,
    public readonly doctorName: string,
    public readonly assistantId: string | null,
    public readonly assistantName: string | null,
    public readonly status: VisitStatus,
    public readonly totalAmount: number,
    public readonly confirmedAt: Date | null,
    public readonly confirmedBy: string | null,
    public readonly voidedAt: Date | null,
    public readonly voidReason: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
