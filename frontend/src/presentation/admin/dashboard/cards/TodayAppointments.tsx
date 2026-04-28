import React from "react";
import { MoreHorizontal } from "lucide-react";
import { Appointment } from "@domain/dashboard/entities";

interface TodayAppointmentsProps {
  appointments: Appointment[];
}

export const TodayAppointments: React.FC<TodayAppointmentsProps> = ({
  appointments,
}) => {
  return (
    <section className="bg-card rounded-3xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[1rem] font-semibold text-slate-700 dark:text-slate-200">
          Today Appointment
        </h3>
        <button className="text-slate-300 hover:text-slate-500 transition-colors">
          <MoreHorizontal size={20} />
        </button>
      </div>
      <div className="space-y-5">
        {appointments.map((appt) => (
          <div
            key={appt.id}
            className="flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <img
                src={appt.avatar}
                className="w-10 h-10 rounded-full object-cover"
                alt=""
              />
              <div>
                <h4 className="font-semibold text-[0.9375rem] text-slate-700 dark:text-slate-200 group-hover:text-primary transition-colors">
                  {appt.name}
                </h4>
                <p className="text-[0.8125rem] font-normal text-[#6d6b77] dark:text-slate-400">
                  {appt.type}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span
                className={`text-[0.875rem] font-semibold block ${appt.status === "ongoing" ? "text-primary" : "text-slate-600 dark:text-slate-300"}`}
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
