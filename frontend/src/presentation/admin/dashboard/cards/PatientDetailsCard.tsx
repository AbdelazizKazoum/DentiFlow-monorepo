import React from "react";
import {Phone, FileText, MessageCircle} from "lucide-react";
import {Patient} from "@domain/dashboard/entities";

interface PatientDetailsCardProps {
  patient: Patient;
}

export const PatientDetailsCard: React.FC<PatientDetailsCardProps> = ({
  patient,
}) => {
  return (
    <div className="bg-card rounded-lg p-5 sm:p-6 shadow-[0_1px_10px_rgba(11,59,73,0.06)] dark:shadow-[0_1px_12px_rgba(0,0,0,0.2)] border border-ui-border relative">
      <div className="flex justify-between items-start mb-6">
        <h3 className="font-semibold text-[0.75rem] text-text-muted uppercase tracking-widest">
          Next Patient Details
        </h3>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <div className="flex items-center space-x-4 mb-6">
            <img
              src={patient.avatar}
              className="w-16 h-16 rounded-lg object-cover shadow-sm"
              alt=""
            />
            <div className="min-w-0">
              <h2 className="text-[1.125rem] font-semibold text-foreground truncate">
                {patient.name}
              </h2>
              <p className="text-[0.8125rem] text-text-muted mt-1 font-normal leading-relaxed">
                {patient.address}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-5 gap-x-4 mb-6">
            {[
              { label: "D.O.B", value: patient.dob },
              { label: "Sex", value: patient.sex },
              { label: "Weight", value: patient.weight },
              { label: "Height", value: patient.height },
              { label: "Last Appointment", value: patient.lastAppointment },
              { label: "Register Date", value: patient.registerDate },
            ].map((item, idx) => (
              <div key={idx}>
                <p className="text-[0.75rem] text-text-muted font-normal mb-1">
                  {item.label}
                </p>
                <p className="text-[0.875rem] font-semibold text-foreground">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {patient.conditions?.map((tag: string, i: number) => (
              <span
                key={i}
                className={`px-3 py-1 rounded-lg text-[10px] font-semibold ${
                  i === 0
                    ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                    : i === 1
                      ? "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
                      : "bg-primary-soft text-primary"
                }`}
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="flex items-center space-x-2 bg-primary text-white px-4 py-2.5 rounded-lg text-[0.875rem] font-medium hover:bg-primary-dark transition-all shadow-sm">
              <Phone size={14} />
              <span>(308) 555-0121</span>
            </button>
            <button className="flex items-center space-x-2 bg-card border border-ui-border text-primary px-4 py-2.5 rounded-lg text-[0.875rem] font-medium hover:bg-surface-hover transition-all">
              <FileText size={15} />
              <span>Documents</span>
            </button>
            <button className="flex items-center space-x-2 bg-card border border-ui-border text-primary px-4 py-2.5 rounded-lg text-[0.875rem] font-medium hover:bg-surface-hover transition-all">
              <MessageCircle size={14} />
              <span>Chat</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
