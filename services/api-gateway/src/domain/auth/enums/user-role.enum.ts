/**
 * UserRole — mirrors the role values issued by auth-service in JWT payloads.
 * Keep in sync with services/auth-service/src/domain/enums/user-role.enum.ts.
 */
export enum UserRole {
  PATIENT = "patient",
  SECRETARY = "secretary",
  DOCTOR = "doctor",
  ADMIN = "admin",
  DENTAL_ASSISTANT = "dental_assistant",
}
