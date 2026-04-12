import React from "react";
import {Check, X} from "lucide-react";
import {Appointment} from "@domain/dashboard/entities";

interface AppointmentRequestsProps {
  requests: Appointment[];
}

export const AppointmentRequests: React.FC<AppointmentRequestsProps> = ({
  requests,
}) => {
  return (
    <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-md font-semibold text-slate-700 dark:text-slate-200">
          Appointment Requests
        </h3>
        <button className="text-blue-500 text-xs font-semibold hover:underline">
          See All
        </button>
      </div>
      <div className="space-y-5">
        {requests.map((req) => (
          <div key={req.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={req.avatar}
                className="w-10 h-10 rounded-full object-cover"
                alt=""
              />
              <div>
                <h4 className="font-semibold text-[14px] text-slate-800 dark:text-slate-200">
                  {req.name}
                </h4>
                <p className="text-[11px] text-slate-400 font-medium">
                  {req.type} • {req.time || "10:00"}
                </p>
              </div>
            </div>
            {req.status === "accepted" ? (
              <div className="px-3 py-1.5 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 text-[10px] font-semibold rounded-lg">
                Accepted
              </div>
            ) : (
              <div className="flex space-x-2">
                <button className="p-2 bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-100 transition-all">
                  <Check size={16} />
                </button>
                <button className="p-2 bg-red-50 text-red-400 rounded-lg hover:bg-red-100 transition-all">
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
