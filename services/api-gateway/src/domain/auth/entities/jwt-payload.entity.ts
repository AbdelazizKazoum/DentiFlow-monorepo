/**
 * JwtPayload — the verified claims extracted from a DentilFlow JWT.
 * Shape is fixed by the auth-service issuer contract.
 * Do NOT rename fields — they match the token payload as-issued.
 */
export interface JwtPayload {
  user_id: string;
  clinic_id: string;
  role: string;
  iat: number;
  exp: number;
}
