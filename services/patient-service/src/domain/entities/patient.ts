import {PatientGender} from "../enums/patient-gender.enum";
import {PatientStatus} from "../enums/patient-status.enum";

export class Patient {
  constructor(
    public readonly id: string,
    public readonly clinicId: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly status: PatientStatus,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly userId: string | null,
    public readonly phone: string | null,
    public readonly email: string | null,
    public readonly dateOfBirth: Date | null,
    public readonly gender: PatientGender | null,
    public readonly address: string | null,
    public readonly notes: string | null,
    public readonly allergies: string | null,
    public readonly chronicConditions: string | null,
    public readonly currentMedications: string | null,
    public readonly medicalNotes: string | null,
    public readonly deletedAt: Date | null,
  ) {}

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
