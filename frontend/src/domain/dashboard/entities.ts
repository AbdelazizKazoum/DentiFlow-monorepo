// Domain entities for dashboard

export interface Patient {
  id: string;
  name: string;
  avatar: string;
  type?: string;
  time?: string;
  status?: "ongoing" | "upcoming";
  address?: string;
  dob?: string;
  sex?: string;
  weight?: string;
  height?: string;
  lastAppointment?: string;
  registerDate?: string;
  conditions?: string[];
}

export interface Appointment {
  id: string;
  name: string;
  type: string;
  time: string;
  status: "ongoing" | "upcoming" | "accepted";
  avatar: string;
  date?: string;
}

export interface StatsCard {
  id: number;
  label: string;
  value: string;
  icon: string;
  bgColor: string;
}

export interface ChartData {
  name: string;
  value: number;
}

export interface DashboardData {
  stats: StatsCard[];
  todayAppointments: Appointment[];
  appointmentRequests: Appointment[];
  patientDetails: Patient;
  chartData: ChartData[];
}
