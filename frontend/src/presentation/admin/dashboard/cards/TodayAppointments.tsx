import React from "react";
import {MoreHorizontal} from "lucide-react";
import {Appointment} from "@domain/dashboard/entities";

interface TodayAppointmentsProps {
  appointments: Appointment[];
}

export const TodayAppointments: React.FC<TodayAppointmentsProps> = ({
  appointments,
}) => {
  return (
    <section className="app-card p-5">
      <div className="flex justify-between items-center pb-4 mb-4 border-b border-ui-border">
        <h3 className="text-[1rem] font-semibold text-foreground">
          Today Appointments
        </h3>
        <button className="text-text-muted hover:text-foreground transition-colors rounded-lg p-1">
          <MoreHorizontal size={20} />
        </button>
      </div>
      <div className="divide-y divide-ui-border">
        {appointments.map((appt) => (
          <div
            key={appt.id}
            className="flex items-center justify-between gap-3 group cursor-pointer py-3 first:pt-0 last:pb-0"
          >
            <div className="flex items-center space-x-3 min-w-0">
              <img
                src={appt.avatar}
                className="w-10 h-10 rounded-full object-cover"
                alt=""
              />
              <div className="min-w-0">
                <h4 className="font-semibold text-[0.9375rem] text-foreground group-hover:text-primary transition-colors truncate">
                  {appt.name}
                </h4>
                <p className="text-[0.875rem] font-normal text-text-muted truncate">
                  {appt.type}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span
                className={`text-[0.9375rem] font-semibold block ${appt.status === "ongoing" ? "text-primary" : "text-foreground"}`}
              >
                {appt.time}
              </span>
              {appt.status === "ongoing" && (
                <span className="text-[0.6875rem] text-primary/80 font-medium uppercase tracking-wider">
                  On Going
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
