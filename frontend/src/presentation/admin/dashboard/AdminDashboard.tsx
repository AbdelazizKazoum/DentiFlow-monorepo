import React, {useState, useEffect} from "react";
import {LoadDashboardDataUseCase} from "../../../application/useCases/admin/dashboard/loadDashboardData";
import {DashboardData} from "../../../domain/dashboard/entities";

// Sub-components (will be created separately)
import {StatsGrid} from "./cards/StatsGrid";
import {TodayAppointments} from "./cards/TodayAppointments";
import {AppointmentRequests} from "./cards/AppointmentRequests";
import {PatientDetailsCard} from "./cards/PatientDetailsCard";
import {ActivityChart} from "./cards/ActivityChart";

export const AdminDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );

  // Load dashboard data
  useEffect(() => {
    const loadData = async () => {
      const data = await LoadDashboardDataUseCase.execute();
      setDashboardData(data);
    };
    loadData();
  }, []);

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <StatsGrid stats={dashboardData.stats} />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-5 space-y-8">
          <TodayAppointments appointments={dashboardData.todayAppointments} />
          <AppointmentRequests requests={dashboardData.appointmentRequests} />
        </div>

        <div className="xl:col-span-7 space-y-8">
          <PatientDetailsCard patient={dashboardData.patientDetails} />
          <ActivityChart data={dashboardData.chartData} />
        </div>
      </div>
    </div>
  );
};
