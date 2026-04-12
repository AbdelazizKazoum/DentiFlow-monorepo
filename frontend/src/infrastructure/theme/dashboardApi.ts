import {
  DashboardData,
  StatsCard,
  Appointment,
  Patient,
  ChartData,
} from "../../domain/dashboard/entities";

// Mock data - in real app this would come from API
const mockStats: StatsCard[] = [
  {
    id: 1,
    label: "Patients",
    value: "666",
    icon: "users",
    bgColor: "bg-purple-50",
  },
  {
    id: 2,
    label: "Income",
    value: "$2,111",
    icon: "dollar",
    bgColor: "bg-blue-50",
  },
  {
    id: 3,
    label: "Appointments",
    value: "211",
    icon: "calendar",
    bgColor: "bg-teal-50",
  },
  {
    id: 4,
    label: "Treatments",
    value: "402",
    icon: "pill",
    bgColor: "bg-red-50",
  },
];

const mockTodayAppointments: Appointment[] = [
  {
    id: "1",
    name: "Beth Mccoy",
    type: "Scaling",
    time: "On Going",
    status: "ongoing",
    avatar: "https://i.pravatar.cc/150?u=beth",
  },
  {
    id: "2",
    name: "Evan Henry",
    type: "Medical check up",
    time: "12:00",
    status: "upcoming",
    avatar: "https://i.pravatar.cc/150?u=evan",
  },
  {
    id: "3",
    name: "Dwight Murphy",
    type: "Priksa masuk angin",
    time: "14:00",
    status: "upcoming",
    avatar: "https://i.pravatar.cc/150?u=dwight",
  },
  {
    id: "4",
    name: "Bessie Alexander",
    type: "Priksa masuk angin",
    time: "14:00",
    status: "upcoming",
    avatar: "https://i.pravatar.cc/150?u=bessie",
  },
];

const mockAppointmentRequests: Appointment[] = [
  {
    id: "1",
    name: "Devon Cooper",
    type: "Scaling",
    date: "29 February",
    time: "10:00",
    status: "upcoming",
    avatar: "https://i.pravatar.cc/150?u=devon",
  },
  {
    id: "2",
    name: "Ricardo Russell",
    type: "Tambal gigi",
    date: "29 February",
    time: "11:00",
    status: "accepted",
    avatar: "https://i.pravatar.cc/150?u=ricardo",
  },
];

const mockPatientDetails: Patient = {
  id: "1",
  name: "Beth Mccoy",
  avatar: "https://i.pravatar.cc/150?u=beth",
  address: "2235 Avondale Ave Pasadena, Oklahoma 83900",
  dob: "29 February 1999",
  sex: "Female",
  weight: "56 kg",
  height: "172 cm",
  lastAppointment: "02 Jan 2020",
  registerDate: "19 Des 2018",
  conditions: ["Asthma", "Hypertension", "Asam Urat"],
};

const mockChartData: ChartData[] = [
  {name: "Mon", value: 30},
  {name: "Tue", value: 45},
  {name: "Wed", value: 25},
  {name: "Thu", value: 40},
  {name: "Fri", value: 35},
  {name: "Sat", value: 50},
  {name: "Sun", value: 32},
];

export class DashboardApiAdapter {
  static async getDashboardData(): Promise<DashboardData> {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          stats: mockStats,
          todayAppointments: mockTodayAppointments,
          appointmentRequests: mockAppointmentRequests,
          patientDetails: mockPatientDetails,
          chartData: mockChartData,
        });
      }, 100);
    });
  }
}
