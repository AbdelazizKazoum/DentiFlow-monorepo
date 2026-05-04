export interface StaffDTO {
  id: string;
  clinicId: string;
  userId: string;
  role: string;
  status: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  specialization: string;
  avatar: string;
  isActive: boolean;
}

export interface StaffListDTO {
  staffMembers: StaffDTO[];
}

export interface CreateStaffDTO {
  role: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  specialization?: string;
  avatar?: string;
}

export interface UpdateStaffDTO {
  role?: string;
  status?: string;
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  specialization?: string | null;
  avatar?: string | null;
}
