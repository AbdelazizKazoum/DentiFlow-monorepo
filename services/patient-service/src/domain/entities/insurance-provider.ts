export class InsuranceProvider {
  constructor(
    public readonly id: string,
    public readonly clinicId: string,
    public readonly name: string,
    public readonly code: string | null,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
