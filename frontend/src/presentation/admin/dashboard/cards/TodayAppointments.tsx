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
    <section className="bg-card rounded-lg p-5 shadow-[0_1px_10px_rgba(11,59,73,0.06)] dark:shadow-[0_1px_12px_rgba(0,0,0,0.2)] border border-ui-border">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[0.9375rem] font-semibold text-foreground">
          Today Appointments
        </h3>
        <button className="text-text-muted hover:text-foreground transition-colors rounded-lg p-1">
          <MoreHorizontal size={20} />
        </button>
      </div>
      <div className="space-y-5">
        {appointments.map((appt) => (
          <div
            key={appt.id}
            className="flex items-center justify-between gap-3 group cursor-pointer"
          >
            <div className="flex items-center space-x-3 min-w-0">
              <img
                src={appt.avatar}
                className="w-10 h-10 rounded-full object-cover"
                alt=""
              />
              <div className="min-w-0">
                <h4 className="font-semibold text-[0.875rem] text-foreground group-hover:text-primary transition-colors truncate">
                  {appt.name}
                </h4>
                <p className="text-[0.8125rem] font-normal text-text-muted truncate">
                  {appt.type}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span
                className={`text-[0.875rem] font-semibold block ${appt.status === "ongoing" ? "text-primary" : "text-foreground"}`}
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
