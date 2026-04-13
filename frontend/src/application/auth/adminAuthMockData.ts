// No React imports — pure data
import type {AdminUser} from "@/domain/auth/entities";

export const MOCK_ADMIN_PASSWORD = "admin123";

export const MOCK_ADMIN_USERS: AdminUser[] = [
  {
    id: "1",
    firstName: "Abdelaziz",
    lastName: "Admin",
    email: "admin@dentiflow.com",
    role: "admin",
  },
  {
    id: "2",
    firstName: "Dr. Sara",
    lastName: "Hassan",
    email: "doctor@dentiflow.com",
    role: "doctor",
  },
];
