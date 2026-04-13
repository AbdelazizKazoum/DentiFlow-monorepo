// No framework imports — pure TypeScript interfaces only

export interface AdminLoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "admin" | "doctor" | "secretariat";
}

export interface AdminAuthState {
  isAuthenticated: boolean;
  currentUser: AdminUser | null;
  mockLogin: (credentials: AdminLoginCredentials) => boolean;
  mockLogout: () => void;
}
