export interface IJwtService {
  sign(payload: {
    user_id: string;
    clinic_id: string;
    role: string;
  }): Promise<string>;
}
