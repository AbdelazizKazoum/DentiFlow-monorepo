"use client";

import {useEffect, useMemo, useState} from "react";
import type {ReactNode} from "react";
import {useLocale, useTranslations} from "next-intl";
import {useRouter} from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Clock,
  FileText,
  Loader2,
  Search,
  Stethoscope,
  UserRound,
} from "lucide-react";
import {axiosClient} from "@/infrastructure/http/axiosClient";

type VisitStatus = "OPEN" | "NEEDS_CODING" | "CLOSED" | "CANCELLED";
type HandoffStatus = "STRUCTURED" | "DRAFT_NOTE" | "NEEDS_CODING" | "CODED";
type ProcedureStatus = "IN_PROGRESS" | "COMPLETED" | "in-progress" | "completed";

interface TreatmentVisitPatient {
  id: string;
  fullName: string;
  phone?: string;
}

interface TreatmentVisitProvider {
  id: string;
  fullName: string;
}

interface TreatmentVisitHandoff {
  id: string;
  text: string;
  status: HandoffStatus;
  authoredBy?: string;
  savedAt?: string;
  codedAt?: string;
  codedBy?: string;
  treatmentPlanItemId?: string;
}

interface TreatmentVisitProcedure {
  id: string;
  actName: string;
  locationLabel?: string;
  status: ProcedureStatus;
  completedAt?: string;
}

interface TreatmentVisitChargeSummary {
  total: number;
  remaining: number;
  status?: string;
}

interface TreatmentVisitListItem {
  id: string;
  patientId: string;
  patient: TreatmentVisitPatient;
  provider?: TreatmentVisitProvider;
  status: VisitStatus;
  startedAt: string;
  closedAt?: string;
  handoff?: TreatmentVisitHandoff | null;
  procedures: TreatmentVisitProcedure[];
  chargesSummary?: TreatmentVisitChargeSummary;
}

type WorklistTab = "needsCoding" | "open" | "closed" | "all";

const DEFAULT_CLINIC_ID =
  process.env.NEXT_PUBLIC_DEFAULT_CLINIC_ID ??
  "00000000-0000-4000-8000-000000000001";

type ApiRecord = Record<string, unknown>;

const asRecord = (value: unknown): ApiRecord =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as ApiRecord)
    : {};

const asString = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : fallback;

const normalizeVisit = (rawValue: unknown): TreatmentVisitListItem => {
  const raw = asRecord(rawValue);
  const patient = asRecord(raw.patient);
  const provider = asRecord(raw.provider ?? raw.doctor);
  const handoffRecord = asRecord(
    raw.handoff ?? raw.latestHandoff ?? raw.latest_handoff,
  );
  const charges = asRecord(raw.chargesSummary ?? raw.charges_summary);
  const proceduresRaw = raw.procedures ?? raw.currentSession ?? raw.current_session;
  const procedures = Array.isArray(proceduresRaw) ? proceduresRaw : [];

  return {
    id: asString(raw.id),
    patientId: asString(raw.patientId ?? raw.patient_id ?? patient.id),
    patient: {
      id: asString(patient.id ?? raw.patientId ?? raw.patient_id),
      fullName:
        asString(
          patient.fullName ??
            patient.full_name ??
            patient.name ??
            raw.patientName ??
            raw.patient_name,
        ) ||
        "Unknown patient",
      phone: asString(patient.phone ?? raw.patientPhone ?? raw.patient_phone),
    },
    provider: Object.keys(provider).length > 0
      ? {
          id: asString(provider.id ?? raw.providerId ?? raw.provider_id),
          fullName:
            asString(
              provider.fullName ??
                provider.full_name ??
                provider.name ??
                raw.providerName ??
                raw.provider_name,
            ) ||
            "Provider",
        }
      : undefined,
    status: (asString(raw.status, "OPEN")) as VisitStatus,
    startedAt: asString(raw.startedAt ?? raw.started_at, new Date().toISOString()),
    closedAt: asString(raw.closedAt ?? raw.closed_at) || undefined,
    handoff: Object.keys(handoffRecord).length > 0
      ? {
          id: asString(handoffRecord.id),
          text: asString(handoffRecord.text),
          status: asString(handoffRecord.status, "STRUCTURED") as HandoffStatus,
          authoredBy: asString(handoffRecord.authoredBy ?? handoffRecord.authored_by),
          savedAt: asString(handoffRecord.savedAt ?? handoffRecord.saved_at),
          codedAt: asString(handoffRecord.codedAt ?? handoffRecord.coded_at),
          codedBy: asString(handoffRecord.codedBy ?? handoffRecord.coded_by),
          treatmentPlanItemId:
            asString(
              handoffRecord.treatmentPlanItemId ??
                handoffRecord.treatment_plan_item_id,
            ) || undefined,
        }
      : null,
    procedures: procedures.map((procedureValue) => {
      const procedure = asRecord(procedureValue);
      const location = asRecord(procedure.location);
      return {
        id: asString(procedure.id),
        actName:
          asString(
            procedure.actName ??
              procedure.act_name ??
              procedure.act ??
              procedure.label,
          ) ||
          "Treatment",
        locationLabel:
          asString(
            procedure.locationLabel ??
              procedure.location_label ??
              location.label,
          ) || undefined,
        status: asString(procedure.status, "IN_PROGRESS") as ProcedureStatus,
        completedAt:
          asString(procedure.completedAt ?? procedure.completed_at) || undefined,
      };
    }),
    chargesSummary: Object.keys(charges).length > 0
      ? {
          total: Number(charges.total ?? 0),
          remaining: Number(charges.remaining ?? 0),
          status: asString(charges.status) || undefined,
        }
      : undefined,
  };
};

const tabToStatus = (tab: WorklistTab): string | undefined => {
  if (tab === "needsCoding") return "NEEDS_CODING";
  if (tab === "open") return "OPEN";
  if (tab === "closed") return "CLOSED";
  return undefined;
};

export default function TreatmentsPage() {
  const t = useTranslations("admin.treatmentVisits");
  const locale = useLocale();
  const router = useRouter();
  const [visits, setVisits] = useState<TreatmentVisitListItem[]>([]);
  const [activeTab, setActiveTab] = useState<WorklistTab>("needsCoding");
  const [search, setSearch] = useState("");
  const [expandedVisitId, setExpandedVisitId] = useState<string | null>(null);
  const [codingHandoffId, setCodingHandoffId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadVisits = async () => {
      setIsLoading(true);
      setError("");
      try {
        const {data} = await axiosClient.get("/api/v1/treatment/visits", {
          params: {
            clinicId: DEFAULT_CLINIC_ID,
            status: tabToStatus(activeTab),
            handoffStatus:
              activeTab === "needsCoding" ? "NEEDS_CODING" : undefined,
          },
        });
        const rawVisits = Array.isArray(data) ? data : data.visits ?? [];
        if (!cancelled) setVisits(rawVisits.map(normalizeVisit));
      } catch {
        if (!cancelled) {
          setVisits([]);
          setError(t("errors.listEndpointMissing"));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void loadVisits();
    return () => {
      cancelled = true;
    };
  }, [activeTab, t]);

  const counts = useMemo(
    () => ({
      needsCoding: visits.filter(
        (visit) =>
          visit.status === "NEEDS_CODING" ||
          visit.handoff?.status === "NEEDS_CODING",
      ).length,
      open: visits.filter((visit) => visit.status === "OPEN").length,
      closed: visits.filter((visit) => visit.status === "CLOSED").length,
      all: visits.length,
    }),
    [visits],
  );

  const filteredVisits = useMemo(() => {
    const term = search.trim().toLowerCase();
    return visits.filter((visit) => {
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "needsCoding" &&
          (visit.status === "NEEDS_CODING" ||
            visit.handoff?.status === "NEEDS_CODING")) ||
        (activeTab === "open" && visit.status === "OPEN") ||
        (activeTab === "closed" && visit.status === "CLOSED");

      if (!matchesTab) return false;
      if (!term) return true;

      return (
        visit.patient.fullName.toLowerCase().includes(term) ||
        visit.patient.phone?.toLowerCase().includes(term) ||
        visit.provider?.fullName.toLowerCase().includes(term) ||
        visit.procedures.some((procedure) =>
          procedure.actName.toLowerCase().includes(term),
        ) ||
        visit.handoff?.text.toLowerCase().includes(term)
      );
    });
  }, [activeTab, search, visits]);

  const openWorkspace = (visit: TreatmentVisitListItem) => {
    router.push(
      `/${locale}/admin/patients/${visit.patientId}/treatment?visitId=${visit.id}`,
    );
  };

  const markHandoffCoded = async (visit: TreatmentVisitListItem) => {
    if (!visit.handoff) return;
    setCodingHandoffId(visit.handoff.id);
    setError("");
    try {
      const {data} = await axiosClient.post(
        `/api/v1/treatment/handoffs/${visit.handoff.id}/coded`,
      );
      const updated = normalizeVisit({
        ...visit,
        handoff: data,
      });
      setVisits((current) =>
        current.map((item) =>
          item.id === visit.id
            ? {
                ...item,
                handoff: updated.handoff,
                status: item.status === "NEEDS_CODING" ? "OPEN" : item.status,
              }
            : item,
        ),
      );
    } catch {
      setError(t("errors.markCodedMissing"));
    } finally {
      setCodingHandoffId(null);
    }
  };

  const formatDateTime = (value?: string) => {
    if (!value) return "-";
    return new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  };

  const formatMoney = (value: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);

  const tabs: Array<{id: WorklistTab; label: string; count: number}> = [
    {id: "needsCoding", label: t("tabs.needsCoding"), count: counts.needsCoding},
    {id: "open", label: t("tabs.open"), count: counts.open},
    {id: "closed", label: t("tabs.closed"), count: counts.closed},
    {id: "all", label: t("tabs.all"), count: counts.all},
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("header.title")}
          </h1>
          <p className="text-sm" style={{color: "var(--text-muted)"}}>
            {t("header.subtitle")}
          </p>
        </div>
        <div
          className="inline-flex w-fit items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold"
          style={{
            borderColor: "var(--border-ui)",
            color: "var(--text-muted)",
            backgroundColor: "var(--surface-card)",
          }}
        >
          <ClipboardList size={16} />
          {t("header.visitCount", {count: filteredVisits.length})}
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className="rounded-xl border p-4 text-left transition-colors"
            style={{
              borderColor:
                activeTab === tab.id
                  ? "var(--brand-primary)"
                  : "var(--border-ui)",
              backgroundColor:
                activeTab === tab.id ? "rgba(15, 138, 163, 0.08)" : "var(--card-bg)",
            }}
          >
            <p className="text-xs font-semibold" style={{color: "var(--text-muted)"}}>
              {tab.label}
            </p>
            <p className="mt-1 text-2xl font-bold text-foreground">{tab.count}</p>
          </button>
        ))}
      </section>

      <section
        className="rounded-xl border bg-card p-4"
        style={{borderColor: "var(--border-ui)"}}
      >
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{color: "var(--text-muted)"}}
          />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("search.placeholder")}
            className="h-10 w-full rounded-lg border bg-transparent pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            style={{
              borderColor: "var(--border-ui)",
              color: "var(--foreground)",
            }}
          />
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        </div>
      )}

      <section
        className="overflow-hidden rounded-xl border bg-card"
        style={{borderColor: "var(--border-ui)"}}
      >
        {isLoading ? (
          <div className="flex items-center gap-2 p-6 text-sm font-semibold" style={{color: "var(--text-muted)"}}>
            <Loader2 size={16} className="animate-spin" />
            {t("loading")}
          </div>
        ) : filteredVisits.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-12 text-center">
            <Stethoscope size={42} style={{color: "var(--text-muted)"}} />
            <p className="text-sm font-semibold text-foreground">
              {t("empty.title")}
            </p>
            <p className="max-w-md text-sm" style={{color: "var(--text-muted)"}}>
              {t("empty.description")}
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{borderColor: "var(--border-ui)"}}>
            {filteredVisits.map((visit) => {
              const isExpanded = expandedVisitId === visit.id;
              const needsCoding =
                visit.status === "NEEDS_CODING" ||
                visit.handoff?.status === "NEEDS_CODING";

              return (
                <article key={visit.id} className="p-4 sm:p-5">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold"
                          style={{
                            backgroundColor: needsCoding
                              ? "#fef3c7"
                              : visit.status === "CLOSED"
                                ? "#E8F8EC"
                                : "#e8f0fe",
                            color: needsCoding
                              ? "#b45309"
                              : visit.status === "CLOSED"
                                ? "#279C41"
                                : "#0f8aa3",
                          }}
                        >
                          {needsCoding ? (
                            <FileText size={12} />
                          ) : visit.status === "CLOSED" ? (
                            <CheckCircle2 size={12} />
                          ) : (
                            <Clock size={12} />
                          )}
                          {needsCoding
                            ? t("statuses.NEEDS_CODING")
                            : t(`statuses.${visit.status}`)}
                        </span>
                        <span className="text-xs" style={{color: "var(--text-muted)"}}>
                          {t("visit.started", {date: formatDateTime(visit.startedAt)})}
                        </span>
                      </div>

                      <div className="mt-3 flex items-start gap-3">
                        <div
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                          style={{
                            backgroundColor: "rgba(15, 138, 163, 0.12)",
                            color: "var(--brand-primary)",
                          }}
                        >
                          <UserRound size={20} />
                        </div>
                        <div className="min-w-0">
                          <h2 className="truncate text-base font-bold text-foreground">
                            {visit.patient.fullName}
                          </h2>
                          <p className="text-sm" style={{color: "var(--text-muted)"}}>
                            {visit.provider?.fullName
                              ? t("visit.provider", {provider: visit.provider.fullName})
                              : t("visit.noProvider")}
                            {visit.patient.phone ? ` · ${visit.patient.phone}` : ""}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-3">
                        <Metric
                          icon={<Stethoscope size={15} />}
                          label={t("metrics.procedures")}
                          value={t("metrics.procedureCount", {
                            count: visit.procedures.length,
                          })}
                        />
                        <Metric
                          icon={<FileText size={15} />}
                          label={t("metrics.handoff")}
                          value={
                            visit.handoff
                              ? t(`handoffStatuses.${visit.handoff.status}`)
                              : t("handoffStatuses.none")
                          }
                        />
                        <Metric
                          icon={<ClipboardList size={15} />}
                          label={t("metrics.charges")}
                          value={
                            visit.chargesSummary
                              ? formatMoney(visit.chargesSummary.remaining)
                              : t("metrics.noCharges")
                          }
                        />
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedVisitId(isExpanded ? null : visit.id)
                        }
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-bold transition-colors hover:bg-gray-50"
                        style={{
                          borderColor: "var(--border-ui)",
                          color: "var(--foreground)",
                        }}
                      >
                        <ChevronDown
                          size={14}
                          className={isExpanded ? "rotate-180 transition" : "transition"}
                        />
                        {isExpanded ? t("actions.hideDetails") : t("actions.viewDetails")}
                      </button>
                      <button
                        type="button"
                        onClick={() => openWorkspace(visit)}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-bold text-white transition-colors hover:bg-primary-dark"
                      >
                        <Stethoscope size={14} />
                        {t("actions.openWorkspace")}
                      </button>
                      {visit.handoff?.status === "NEEDS_CODING" && (
                        <button
                          type="button"
                          onClick={() => void markHandoffCoded(visit)}
                          disabled={codingHandoffId === visit.handoff.id}
                          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-60"
                        >
                          {codingHandoffId === visit.handoff.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={14} />
                          )}
                          {t("actions.markCoded")}
                        </button>
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div
                      className="mt-5 grid gap-4 border-t pt-4 lg:grid-cols-[1.2fr_1fr]"
                      style={{borderColor: "var(--border-ui)"}}
                    >
                      <div>
                        <h3 className="text-sm font-bold text-foreground">
                          {t("details.procedures")}
                        </h3>
                        <div className="mt-3 space-y-2">
                          {visit.procedures.length === 0 ? (
                            <p className="text-sm" style={{color: "var(--text-muted)"}}>
                              {t("details.noProcedures")}
                            </p>
                          ) : (
                            visit.procedures.map((procedure) => (
                              <div
                                key={procedure.id}
                                className="rounded-lg border p-3"
                                style={{borderColor: "var(--border-ui)"}}
                              >
                                <p className="text-sm font-semibold text-foreground">
                                  {procedure.actName}
                                </p>
                                <p className="mt-1 text-xs" style={{color: "var(--text-muted)"}}>
                                  {procedure.locationLabel ?? t("details.noLocation")} ·{" "}
                                  {t(`procedureStatuses.${procedure.status}`)}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-foreground">
                          {t("details.handoff")}
                        </h3>
                        <div
                          className="mt-3 rounded-lg border p-3 text-sm"
                          style={{borderColor: "var(--border-ui)"}}
                        >
                          {visit.handoff?.text ? (
                            <>
                              <p className="whitespace-pre-wrap text-foreground">
                                {visit.handoff.text}
                              </p>
                              <p className="mt-3 text-xs" style={{color: "var(--text-muted)"}}>
                                {visit.handoff.savedAt
                                  ? t("details.savedAt", {
                                      date: formatDateTime(visit.handoff.savedAt),
                                    })
                                  : t("details.notSaved")}
                              </p>
                            </>
                          ) : (
                            <p style={{color: "var(--text-muted)"}}>
                              {t("details.noHandoff")}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      className="rounded-lg border px-3 py-2"
      style={{borderColor: "var(--border-ui)"}}
    >
      <div className="flex items-center gap-1.5 text-xs font-semibold" style={{color: "var(--text-muted)"}}>
        {icon}
        {label}
      </div>
      <p className="mt-1 text-sm font-bold text-foreground">{value}</p>
    </div>
  );
}
