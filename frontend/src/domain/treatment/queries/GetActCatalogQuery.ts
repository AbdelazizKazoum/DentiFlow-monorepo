export interface GetActCatalogQuery {
  clinicId: string;
  locale: "ar" | "fr" | "en";
  page?: number;
  limit?: number;
}
