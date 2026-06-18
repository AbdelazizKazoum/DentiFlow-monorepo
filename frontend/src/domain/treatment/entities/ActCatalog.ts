export interface ActCatalog {
  id: string;
  clinicId: string;
  code: string;
  nameAr: string;
  nameFr: string;
  nameEn: string;
  defaultPrice: number;
  isActive: boolean;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}
