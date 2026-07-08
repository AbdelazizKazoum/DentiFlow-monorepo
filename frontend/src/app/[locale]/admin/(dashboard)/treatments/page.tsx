"use client";

import {useEffect, useMemo, useState} from "react";
import {useLocale, useTranslations} from "next-intl";
import {useRouter} from "next/navigation";
import axios from "axios";
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
      } catch (err) {
        if (!cancelled) {
          setVisits([]);
          const serverMessage = axios.isAxiosError(err)
            ? err.response?.data?.message ?? err.response?.data?.error
            : undefined;
          setError(
            typeof serverMessage === "string" && serverMessage.trim()
              ? t("errors.loadFailed", {message: serverMessage})
              : t("errors.loadFailedGeneric"),
          );
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

  const statusTone = (visit: TreatmentVisitListItem) => {
    const needsCoding =
      visit.status === "NEEDS_CODING" ||
      visit.handoff?.status === "NEEDS_CODING";

    if (needsCoding) {
      return {
        label: t("statuses.NEEDS_CODING"),
        icon: <FileText size={12} />,
        className: "bg-amber-50 text-amber-700 ring-amber-200",
      };
    }
    if (visit.status === "CLOSED") {
      return {
        label: t("statuses.CLOSED"),
        icon: <CheckCircle2 size={12} />,
        className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      };
    }
    if (visit.status === "CANCELLED") {
      return {
        label: t("statuses.CANCELLED"),
        icon: <AlertCircle size={12} />,
        className: "bg-page text-text-muted ring-ui-border",
      };
    }
    return {
      label: t("statuses.OPEN"),
      icon: <Clock size={12} />,
      className: "bg-primary-soft text-primary ring-primary/20",
    };
  };

  return (
    <div className="min-h-screen bg-page">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-4 p-4 lg:p-6">
        <header className="flex flex-col gap-3 border-b border-ui-border pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-normal text-foreground">
              {t("header.title")}
            </h1>
            <p className="mt-1 text-sm text-text-muted">
              {t("header.subtitle")}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-text-muted">
            <ClipboardList size={16} />
            {t("header.visitCount", {count: filteredVisits.length})}
          </div>
        </header>

        <section className="app-card flex flex-col gap-3 p-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-1 rounded-md bg-page p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`h-9 rounded px-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-card text-foreground shadow-sm"
                    : "text-text-muted hover:bg-surface-hover hover:text-foreground"
                }`}
              >
                <span>{tab.label}</span>
                <span className="ml-2 rounded bg-primary-soft px-1.5 py-0.5 text-xs text-primary">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="relative w-full lg:max-w-md">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-placeholder"
            />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("search.placeholder")}
              className="h-9 w-full rounded-md border border-ui-border bg-card pl-9 pr-3 text-sm text-foreground outline-none transition placeholder:text-text-placeholder focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </section>

        {error && (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          </div>
        )}

        <section className="app-card overflow-hidden">
          {isLoading ? (
            <div className="flex items-center gap-2 p-6 text-sm font-medium text-text-muted">
              <Loader2 size={16} className="animate-spin" />
              {t("loading")}
            </div>
          ) : filteredVisits.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 p-10 text-center">
              <Stethoscope size={38} className="text-text-placeholder" />
              <p className="text-sm font-semibold text-foreground">
                {t("empty.title")}
              </p>
              <p className="max-w-md text-sm text-text-muted">
                {t("empty.description")}
              </p>
            </div>
          ) : (
            <div>
              <div className="hidden grid-cols-[minmax(220px,1.35fr)_minmax(140px,.85fr)_minmax(110px,.55fr)_minmax(150px,.75fr)_minmax(120px,.55fr)_160px] gap-4 border-b border-ui-border bg-page px-4 py-2.5 text-xs font-semibold uppercase text-text-placeholder lg:grid">
                <div>{t("columns.patient")}</div>
                <div>{t("columns.started")}</div>
                <div>{t("columns.status")}</div>
                <div>{t("columns.treatments")}</div>
                <div>{t("columns.remaining")}</div>
                <div className="text-right">{t("columns.actions")}</div>
              </div>

              <div className="divide-y divide-ui-border">
                {filteredVisits.map((visit) => {
                  const isExpanded = expandedVisitId === visit.id;
                  const tone = statusTone(visit);
                  const latestProcedure = visit.procedures[0];

                  return (
                    <article key={visit.id} className="bg-card">
                      <div className="grid gap-3 px-4 py-3 transition-colors hover:bg-surface-hover lg:grid-cols-[minmax(220px,1.35fr)_minmax(140px,.85fr)_minmax(110px,.55fr)_minmax(150px,.75fr)_minmax(120px,.55fr)_160px] lg:items-center lg:gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-primary-soft text-primary">
                            <UserRound size={18} />
                          </div>
                          <div className="min-w-0">
                            <h2 className="truncate text-sm font-semibold text-foreground">
                              {visit.patient.fullName}
                            </h2>
                            <p className="truncate text-xs text-text-muted">
                              {visit.patient.phone || visit.patientId}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 lg:block">
                          <span className="text-xs font-medium text-text-muted lg:hidden">
                            {t("columns.started")}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {formatDateTime(visit.startedAt)}
                            </p>
                            <p className="truncate text-xs text-text-muted">
                              {visit.provider?.fullName
                                ? visit.provider.fullName
                                : t("visit.noProvider")}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 lg:block">
                          <span className="text-xs font-medium text-text-muted lg:hidden">
                            {t("columns.status")}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold ring-1 ${tone.className}`}
                          >
                            {tone.icon}
                            {tone.label}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {t("metrics.procedureCount", {
                              count: visit.procedures.length,
                            })}
                          </p>
                          <p className="truncate text-xs text-text-muted">
                            {latestProcedure?.actName ??
                              (visit.handoff
                                ? t(`handoffStatuses.${visit.handoff.status}`)
                                : t("handoffStatuses.none"))}
                          </p>
                        </div>

                        <div className="flex items-center justify-between gap-2 lg:block">
                          <span className="text-xs font-medium text-text-muted lg:hidden">
                            {t("columns.remaining")}
                          </span>
                          <p className="text-sm font-semibold text-foreground">
                            {visit.chargesSummary
                              ? formatMoney(visit.chargesSummary.remaining)
                              : t("metrics.noCharges")}
                          </p>
                          {visit.handoff && (
                            <p className="truncate text-xs text-text-muted">
                              {t(`handoffStatuses.${visit.handoff.status}`)}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedVisitId(isExpanded ? null : visit.id)
                            }
                            className="inline-flex h-8 items-center gap-1 rounded border border-ui-border bg-card px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-surface-hover"
                          >
                            <ChevronDown
                              size={14}
                              className={
                                isExpanded ? "rotate-180 transition" : "transition"
                              }
                            />
                            {isExpanded
                              ? t("actions.hideDetails")
                              : t("actions.viewDetails")}
                          </button>
                          <button
                            type="button"
                            onClick={() => openWorkspace(visit)}
                            className="inline-flex h-8 items-center gap-1 rounded bg-primary px-2.5 text-xs font-medium text-white transition-colors hover:bg-primary-dark"
                          >
                            <Stethoscope size={14} />
                            {t("actions.openWorkspace")}
                          </button>
                          {visit.handoff?.status === "NEEDS_CODING" && (
                            <button
                              type="button"
                              onClick={() => void markHandoffCoded(visit)}
                              disabled={codingHandoffId === visit.handoff.id}
                              className="inline-flex h-8 items-center gap-1 rounded border border-emerald-200 bg-emerald-50 px-2.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-60"
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
                        <div className="border-t border-ui-border bg-page px-4 py-4">
                          <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
                            <div>
                              <h3 className="text-xs font-semibold uppercase text-text-placeholder">
                                {t("details.procedures")}
                              </h3>
                              <div className="mt-2 overflow-hidden rounded border border-ui-border bg-card">
                                {visit.procedures.length === 0 ? (
                                  <p className="p-3 text-sm text-text-muted">
                                    {t("details.noProcedures")}
                                  </p>
                                ) : (
                                  <div className="divide-y divide-ui-border">
                                    {visit.procedures.map((procedure) => (
                                      <div
                                        key={procedure.id}
                                        className="grid gap-1 px-3 py-2.5 sm:grid-cols-[1fr_auto] sm:items-center"
                                      >
                                        <p className="text-sm font-medium text-foreground">
                                          {procedure.actName}
                                        </p>
                                        <p className="text-xs text-text-muted">
                                          {procedure.locationLabel ??
                                            t("details.noLocation")}{" "}
                                          · {t(`procedureStatuses.${procedure.status}`)}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div>
                              <h3 className="text-xs font-semibold uppercase text-text-placeholder">
                                {t("details.handoff")}
                              </h3>
                              <div className="mt-2 rounded border border-ui-border bg-card p-3 text-sm">
                                {visit.handoff?.text ? (
                                  <>
                                    <p className="max-h-40 overflow-auto whitespace-pre-wrap text-foreground">
                                      {visit.handoff.text}
                                    </p>
                                    <p className="mt-3 text-xs text-text-muted">
                                      {visit.handoff.savedAt
                                        ? t("details.savedAt", {
                                            date: formatDateTime(
                                              visit.handoff.savedAt,
                                            ),
                                          })
                                        : t("details.notSaved")}
                                    </p>
                                  </>
                                ) : (
                                  <p className="text-text-muted">
                                    {t("details.noHandoff")}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
