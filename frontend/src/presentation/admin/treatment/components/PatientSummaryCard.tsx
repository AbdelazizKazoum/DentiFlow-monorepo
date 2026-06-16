import type {ReactNode} from "react";
import {
  AlertCircle,
  CalendarDays,
  HeartPulse,
  Mail,
  Phone,
  Pill,
  Stethoscope,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import type {Patient} from "@/domain/patient/entities/patient";
import {getAge} from "../utils";

interface PatientSummaryCardProps {
  patient: Patient | undefined;
  isLoading: boolean;
  error: string | null;
}

export function PatientSummaryCard({
  patient,
  isLoading,
  error,
}: PatientSummaryCardProps) {
  if (isLoading && !patient) {
    return (
      <section className="animate-pulse rounded-2xl border border-ui-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-page" />
          <div className="flex-1">
            <div className="h-5 w-48 rounded bg-page" />
            <div className="mt-2 h-4 w-72 max-w-full rounded bg-page" />
          </div>
        </div>
      </section>
    );
  }

  if (!patient) {
    return (
      <section className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700 shadow-sm dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-500/15">
          <AlertCircle size={20} />
        </span>
        <div>
          <p className="font-semibold">Patient information unavailable</p>
          <p className="mt-1 text-sm opacity-80">
            {error ?? "Patient record not found."}
          </p>
        </div>
      </section>
    );
  }

  const initials = `${patient.firstName[0] ?? ""}${patient.lastName[0] ?? ""}`
    .toUpperCase();

  return (
    <section className="rounded-2xl border border-ui-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary">
            {initials || <UserRound size={20} />}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-lg font-semibold text-foreground">
                {patient.fullName}
              </h2>
              <span
                className={`rounded-full px-2 py-0.5 text-[0.68rem] font-semibold capitalize ${
                  patient.isActive()
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200"
                    : "bg-page text-text-muted"
                }`}
              >
                {patient.status.toLowerCase()}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-text-muted">
              <SimplePatientDetail icon={CalendarDays}>
                {patient.dateOfBirth
                  ? `${getAge(patient.dateOfBirth)} years`
                  : "Age not recorded"}
              </SimplePatientDetail>
              {patient.gender && (
                <SimplePatientDetail icon={UserRound}>
                  <span className="capitalize">
                    {patient.gender.toLowerCase()}
                  </span>
                </SimplePatientDetail>
              )}
              <SimplePatientDetail icon={Phone}>
                {patient.phone ?? "No phone"}
              </SimplePatientDetail>
              <SimplePatientDetail icon={Mail}>
                {patient.email ?? "No email"}
              </SimplePatientDetail>
            </div>
          </div>
        </div>

        {patient.cnie && (
          <div className="shrink-0 text-left lg:text-right">
            <p className="text-xs font-medium text-text-muted">CNIE</p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {patient.cnie}
            </p>
          </div>
        )}
      </div>

      <div className="mt-5 grid gap-3 border-t border-ui-border pt-4 sm:grid-cols-2 xl:grid-cols-4">
        <MedicalDetail
          icon={AlertCircle}
          label="Allergies"
          value={patient.allergies}
          alert={Boolean(patient.allergies)}
        />
        <MedicalDetail
          icon={HeartPulse}
          label="Conditions"
          value={patient.chronicConditions}
        />
        <MedicalDetail
          icon={Pill}
          label="Medication"
          value={patient.currentMedications}
        />
        <MedicalDetail
          icon={Stethoscope}
          label="Medical notes"
          value={patient.medicalNotes}
        />
      </div>
    </section>
  );
}

function SimplePatientDetail({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon size={14} />
      {children}
    </span>
  );
}

function MedicalDetail({
  icon: Icon,
  label,
  value,
  alert = false,
}: {
  icon: LucideIcon;
  label: string;
  value?: string;
  alert?: boolean;
}) {
  return (
    <div
      className={`rounded-lg px-3 py-2.5 ${
        alert
          ? "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-200"
          : "bg-page"
      }`}
    >
      <p
        className={`flex items-center gap-1.5 text-xs font-medium ${
          alert ? "text-red-700 dark:text-red-200" : "text-text-muted"
        }`}
      >
        <Icon size={13} />
        {label}
      </p>
      <p className="mt-1.5 line-clamp-2 text-sm font-medium text-foreground">
        {value || "None recorded"}
      </p>
    </div>
  );
}
