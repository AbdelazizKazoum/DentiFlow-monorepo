export class WorkingHours {
  constructor(
    public readonly id: string,
    public readonly clinicId: string,
    /** 0 = Sunday … 6 = Saturday */
    public readonly dayOfWeek: number,
    public readonly openTime: string | null,
    public readonly closeTime: string | null,
    public readonly isClosed: boolean,
  ) {}
}
