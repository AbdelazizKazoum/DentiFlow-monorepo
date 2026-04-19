export interface IJwtService {
  sign(payload: {
    user_id: string;
    clinic_id: string;
    role: string;
  }): Promise<string>;
  signRefresh(payload: {user_id: string}): Promise<string>;
  verifyRefresh(token: string): Promise<{user_id: string}>;
}
