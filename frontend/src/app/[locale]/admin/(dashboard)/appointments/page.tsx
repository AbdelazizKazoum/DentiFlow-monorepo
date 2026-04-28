import React from "react";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Plus,
  Filter,
  Search,
} from "lucide-react";

interface Appointment {
  id: string;
  patientName: string;
  time: string;
  date: string;
  type: string;
  status: "confirmed" | "pending" | "cancelled";
  phone: string;
  email: string;
}

const demoAppointments: Appointment[] = [
  {
    id: "1",
    patientName: "Sarah Johnson",
    time: "09:00 AM",
    date: "2024-01-15",
    type: "Cleaning",
    status: "confirmed",
    phone: "+1 (555) 123-4567",
    email: "sarah.j@email.com",
  },
  {
    id: "2",
    patientName: "Michael Chen",
    time: "10:30 AM",
    date: "2024-01-15",
    type: "Root Canal",
    status: "confirmed",
    phone: "+1 (555) 234-5678",
    email: "m.chen@email.com",
  },
  {
    id: "3",
    patientName: "Emma Davis",
    time: "02:00 PM",
    date: "2024-01-15",
    type: "Consultation",
    status: "pending",
    phone: "+1 (555) 345-6789",
    email: "emma.davis@email.com",
  },
  {
    id: "4",
    patientName: "James Wilson",
    time: "03:30 PM",
    date: "2024-01-15",
    type: "Filling",
    status: "confirmed",
    phone: "+1 (555) 456-7890",
    email: "j.wilson@email.com",
  },
];

const statusColors = {
  confirmed: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
};

export default function AppointmentsPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Appointments</h1>
          <p className="text-muted-foreground mt-1">
            Manage your patient appointments and schedule
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            <Plus size={16} />
            New Appointment
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Today&apos;s Appointments</p>
              <p className="text-2xl font-bold text-foreground">12</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-foreground">8</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <User className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-foreground">3</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <Calendar className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cancelled</p>
              <p className="text-2xl font-bold text-foreground">1</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search appointments..."
              className="pl-10 pr-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <button className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded-lg hover:bg-muted transition-colors">
            <Filter size={16} />
            Filter
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">View:</span>
          <button className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md">Today</button>
          <button className="px-3 py-1 text-sm border border-border rounded-md hover:bg-muted">Week</button>
          <button className="px-3 py-1 text-sm border border-border rounded-md hover:bg-muted">Month</button>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Today&apos;s Appointments</h2>
        </div>
        <div className="divide-y divide-border">
          {demoAppointments.map((appointment) => (
            <div key={appointment.id} className="p-6 hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{appointment.patientName}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        {appointment.time}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        {appointment.type}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[appointment.status]}`}>
                    {appointment.status}
                  </span>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                      <Phone size={16} className="text-muted-foreground" />
                    </button>
                    <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                      <Mail size={16} className="text-muted-foreground" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Preview */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Calendar Overview</h2>
        <div className="grid grid-cols-7 gap-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div key={day} className="text-center py-2 text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
          {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => (
            <div
              key={date}
              className={`aspect-square flex items-center justify-center text-sm rounded-lg hover:bg-muted transition-colors cursor-pointer ${
                date === 15 ? "bg-primary text-primary-foreground" : ""
              }`}
            >
              {date}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
