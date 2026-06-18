export class ActCatalog {
  constructor(
    public readonly id: string,
    public readonly clinicId: string,
    public readonly code: string,
    public readonly nameAr: string,
    public readonly nameFr: string,
    public readonly nameEn: string,
    public readonly defaultPrice: number,
    public readonly isActive: boolean,
    public readonly icon: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
