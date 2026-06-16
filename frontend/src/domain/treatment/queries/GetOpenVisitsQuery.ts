export interface GetOpenVisitsQuery {
  clinicId: string;
  doctorId?: string;
  page?: number;
  limit?: number;
}
