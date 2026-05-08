export class PatientInsurance {
  constructor(
    public readonly id: string,
    public readonly clinicId: string,
    public readonly patientId: string,
    public readonly insuranceProviderId: string,
    public readonly policyNumber: string | null,
    public readonly memberId: string | null,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
