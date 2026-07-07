import {AlertTriangle, CreditCard, Printer} from "lucide-react";
import {useTranslations} from "next-intl";

interface TreatmentHeaderPatient {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  alerts: string[];
}

interface TreatmentHeaderProps {
  patient: TreatmentHeaderPatient;
  pendingTreatmentChargeTotal: number;
  totalPatientAmountDue: number;
}

export function TreatmentHeader({
  patient,
  pendingTreatmentChargeTotal,
  totalPatientAmountDue,
}: TreatmentHeaderProps) {
  const t = useTranslations("admin.treatment.header");

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-6 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-soft rounded-full flex items-center justify-center text-primary font-bold text-lg">
            {patient.name
              .split(" ")
              .map((namePart) => namePart[0])
              .join("")}
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              {patient.name}
              <span className="text-xs font-normal px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                {patient.id}
              </span>
            </h1>
            <div className="text-sm text-slate-500 flex items-center gap-3">
              <span>
                {t("age", {age: patient.age})} · {patient.gender}
              </span>
              <span>{patient.phone}</span>
            </div>
          </div>
        </div>

        {patient.alerts.length > 0 && (
          <div className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1.5 rounded-md border border-red-200">
            <AlertTriangle size={16} />
            <span className="text-sm font-semibold">
              {t("alerts", {alerts: patient.alerts.join(", ")})}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
          <Printer size={16} /> {t("printReport")}
        </button>
        <div className="flex items-center gap-2 rounded-md border border-teal-200 bg-teal-50 px-4 py-2 text-sm text-teal-800">
          <CreditCard size={16} />
          <div>
            <p className="font-bold">
              {t("amountDue", {amount: totalPatientAmountDue.toFixed(2)})}
            </p>
            <p className="text-[11px] font-semibold text-teal-700">
              {t("newCharges", {
                amount: pendingTreatmentChargeTotal.toFixed(2),
              })}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
