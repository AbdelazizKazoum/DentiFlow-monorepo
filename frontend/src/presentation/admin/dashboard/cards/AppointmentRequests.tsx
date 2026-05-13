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
    <section className="bg-card rounded-lg p-5 shadow-[0_1px_10px_rgba(11,59,73,0.06)] dark:shadow-[0_1px_12px_rgba(0,0,0,0.2)] border border-ui-border">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[0.9375rem] font-semibold text-foreground">
          Appointment Requests
        </h3>
        <button className="text-primary text-xs font-semibold hover:underline">
          See All
        </button>
      </div>
      <div className="space-y-5">
        {requests.map((req) => (
          <div key={req.id} className="flex items-center justify-between gap-3">
            <div className="flex items-center space-x-3 min-w-0">
              <img
                src={req.avatar}
                className="w-10 h-10 rounded-full object-cover"
                alt=""
              />
              <div className="min-w-0">
                <h4 className="font-semibold text-[0.875rem] text-foreground truncate">
                  {req.name}
                </h4>
                <p className="text-[0.8125rem] text-text-muted font-normal truncate">
                  {req.type} / {req.time || "10:00"}
                </p>
              </div>
            </div>
            {req.status === "accepted" ? (
              <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 text-[10px] font-semibold rounded-lg">
                Accepted
              </div>
            ) : (
              <div className="flex space-x-2 shrink-0">
                <button className="p-2 bg-primary-soft text-primary rounded-lg hover:bg-primary/15 transition-all">
                  <Check size={16} />
                </button>
                <button className="p-2 bg-red-50 dark:bg-red-500/15 text-red-500 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/25 transition-all">
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
