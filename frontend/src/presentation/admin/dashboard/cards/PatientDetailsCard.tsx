import React from "react";
import { Phone, FileText, MessageCircle } from "lucide-react";
import { Patient } from "@domain/dashboard/entities";

interface PatientDetailsCardProps {
  patient: Patient;
}

export const PatientDetailsCard: React.FC<PatientDetailsCardProps> = ({
  patient,
}) => {
  return (
    <div className="bg-card rounded-3xl p-8 shadow-sm border border-ui-border relative">
      <div className="flex justify-between items-start mb-8">
        <h3 className="font-semibold text-[0.75rem] text-[#6d6b77] dark:text-slate-400 uppercase tracking-widest">
          Next Patient Details
        </h3>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <div className="flex items-center space-x-5 mb-8">
            <img
              src={patient.avatar}
              className="w-16 h-16 rounded-2xl object-cover shadow-sm"
              alt=""
            />
            <div>
              <h2 className="text-[1.25rem] font-semibold text-slate-700 dark:text-slate-100">
                {patient.name}
              </h2>
              <p className="text-[0.8125rem] text-[#6d6b77] dark:text-slate-400 mt-1 font-normal leading-relaxed">
                {patient.address}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-y-6 gap-x-4 mb-8">
            {[
              { label: "D.O.B", value: patient.dob },
              { label: "Sex", value: patient.sex },
              { label: "Weight", value: patient.weight },
              { label: "Height", value: patient.height },
              { label: "Last Appointment", value: patient.lastAppointment },
              { label: "Register Date", value: patient.registerDate },
            ].map((item, idx) => (
              <div key={idx}>
                <p className="text-[0.75rem] text-[#6d6b77] dark:text-slate-400 font-normal mb-1">
                  {item.label}
                </p>
                <p className="text-[0.875rem] font-semibold text-slate-700 dark:text-slate-200">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {patient.conditions?.map((tag: string, i: number) => (
              <span
                key={i}
                className={`px-3 py-1 rounded-lg text-[10px] font-semibold ${
                  i === 0
                    ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                    : i === 1
                      ? "bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400"
                      : "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                }`}
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="flex items-center space-x-2 bg-primary text-white px-5 py-2.5 rounded-xl text-[0.9375rem] font-medium hover:bg-primary-dark transition-all shadow-sm">
              <Phone size={14} />
              <span>(308) 555-0121</span>
            </button>
            <button className="flex items-center space-x-2 bg-white dark:bg-surface-hover border border-ui-border text-primary px-5 py-2.5 rounded-xl text-[0.9375rem] font-medium hover:bg-surface-hover transition-all">
              <FileText size={15} />
              <span>Documents</span>
            </button>
            <button className="flex items-center space-x-2 bg-white dark:bg-surface-hover border border-ui-border text-primary px-5 py-2.5 rounded-xl text-[0.9375rem] font-medium hover:bg-surface-hover transition-all">
              <MessageCircle size={14} />
              <span>Chat</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
