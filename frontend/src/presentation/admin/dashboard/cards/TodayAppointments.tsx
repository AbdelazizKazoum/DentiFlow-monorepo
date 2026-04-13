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
    <section className="bg-white dark:bg-[#222b44] rounded-3xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-md font-semibold text-slate-700 dark:text-slate-200">
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
                <h4 className="font-semibold text-[14px] text-slate-800 dark:text-slate-200 group-hover:text-blue-500 transition-colors">
                  {appt.name}
                </h4>
                <p className="text-xs font-medium text-slate-400">
                  {appt.type}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span
                className={`text-xs font-semibold block ${appt.status === "ongoing" ? "text-blue-500" : "text-slate-700 dark:text-slate-300"}`}
              >
                {appt.time}
              </span>
              {appt.status === "ongoing" && (
                <span className="text-[9px] text-blue-400 font-semibold uppercase tracking-wider">
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
