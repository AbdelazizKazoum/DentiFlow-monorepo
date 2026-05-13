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
    <section className="app-card p-5">
      <div className="flex justify-between items-center pb-4 mb-4 border-b border-ui-border">
        <h3 className="text-[1rem] font-semibold text-foreground">
          Appointment Requests
        </h3>
        <button className="text-primary text-xs font-semibold hover:underline">
          See All
        </button>
      </div>
      <div className="divide-y divide-ui-border">
        {requests.map((req) => (
          <div
            key={req.id}
            className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
          >
            <div className="flex items-center space-x-3 min-w-0">
              <img
                src={req.avatar}
                className="w-10 h-10 rounded-full object-cover"
                alt=""
              />
              <div className="min-w-0">
                <h4 className="font-semibold text-[0.9375rem] text-foreground truncate">
                  {req.name}
                </h4>
                <p className="text-[0.875rem] text-text-muted font-normal truncate">
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
