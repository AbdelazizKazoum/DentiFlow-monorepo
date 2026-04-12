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
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-50 dark:border-slate-800 relative">
      <div className="flex justify-between items-start mb-8">
        <h3 className="font-semibold text-slate-400 dark:text-slate-500 text-[11px] uppercase tracking-wide">
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
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                {patient.name}
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-medium leading-relaxed">
                {patient.address}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-y-6 gap-x-4 mb-8">
            {[
              {label: "D.O.B", value: patient.dob},
              {label: "Sex", value: patient.sex},
              {label: "Weight", value: patient.weight},
              {label: "Height", value: patient.height},
              {label: "Last Appointment", value: patient.lastAppointment},
              {label: "Register Date", value: patient.registerDate},
            ].map((item, idx) => (
              <div key={idx}>
                <p className="text-[10px] text-slate-400 font-medium mb-1">
                  {item.label}
                </p>
                <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">
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
                    ? "bg-amber-50 text-amber-600"
                    : i === 1
                      ? "bg-teal-50 text-teal-600"
                      : "bg-purple-50 text-purple-600"
                } dark:bg-opacity-10`}
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="flex items-center space-x-2 bg-[#1e56d0] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all">
              <Phone size={14} />
              <span>(308) 555-0121</span>
            </button>
            <button className="flex items-center space-x-2 bg-white dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-blue-500 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all">
              <FileText size={14} />
              <span>Documents</span>
            </button>
            <button className="flex items-center space-x-2 bg-white dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-blue-500 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all">
              <MessageCircle size={14} />
              <span>Chat</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
