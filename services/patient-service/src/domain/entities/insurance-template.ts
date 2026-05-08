export class InsuranceTemplate {
  constructor(
    public readonly id: string,
    public readonly insuranceProviderId: string,
    public readonly name: string,
    public readonly fileUrl: string,
    public readonly createdAt: Date,
  ) {}
}
