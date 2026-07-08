import {useEffect, useState} from "react";
import {
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Save,
  Stethoscope,
  X,
} from "lucide-react";
import {useLocale, useTranslations} from "next-intl";

type VisitCodingStatus = "structured" | "draft_note" | "needs_coding" | "coded";
type VisitLifecycleStatus = "open" | "needs_coding" | "closed";

interface ActiveVisitView {
  id: string;
  startedAt: string;
}

interface VisitHandoffView {
  authoredBy: string;
  savedAt: string;
}

interface FollowUpRequestView {
  reason?: string;
}

interface DocumentRequestView {
  type: string;
}

interface DocumentRequestTypeView {
  id: string;
  label: string;
}

interface VisitProcedureView {
  id: string;
  tooth: number | string;
  toothIds?: number[];
  surfaces: string[];
  act: string;
  notes?: string;
  status: "in-progress" | "completed";
}

interface CurrentSessionPanelProps<TProcedure extends VisitProcedureView> {
  activeVisit: ActiveVisitView;
  currentSession: TProcedure[];
  documentRequests: DocumentRequestView[];
  documentRequestTypes: DocumentRequestTypeView[];
  followUpRequests: FollowUpRequestView[];
  pendingCoordinationCount: number;
  visitCodingStatus: VisitCodingStatus;
  visitHandoffNote: string;
  visitHandoffRecord: VisitHandoffView | null;
  visitLifecycleStatus: VisitLifecycleStatus;
  getTreatmentLocationLabel: (item: TProcedure) => string;
  getTreatmentActLabel: (act: string) => string;
  onChangeHandoffNote: (note: string) => void;
  onSaveHandoffDraft: () => void;
  onSendToAssistant: () => void;
  onMarkStructured: () => void;
  onCloseVisit: () => void;
  onSetSessionActToComplete: (item: TProcedure) => void;
  setVisitCodingStatus: (
    next:
      | VisitCodingStatus
      | ((previous: VisitCodingStatus) => VisitCodingStatus),
  ) => void;
}

export function CurrentSessionPanel<TProcedure extends VisitProcedureView>({
  activeVisit,
  currentSession,
  documentRequests,
  documentRequestTypes,
  followUpRequests,
  pendingCoordinationCount,
  visitCodingStatus,
  visitHandoffNote,
  visitHandoffRecord,
  visitLifecycleStatus,
  getTreatmentLocationLabel,
  getTreatmentActLabel,
  onChangeHandoffNote,
  onSaveHandoffDraft,
  onSendToAssistant,
  onMarkStructured,
  onCloseVisit,
  onSetSessionActToComplete,
  setVisitCodingStatus,
}: CurrentSessionPanelProps<TProcedure>) {
  const locale = useLocale();
  const t = useTranslations("admin.treatment.currentSession");
  const [isHydrated, setIsHydrated] = useState(false);
  const canSubmitHandoff = isHydrated ? Boolean(visitHandoffNote.trim()) : true;
  const isClosedVisit = visitLifecycleStatus === "closed";
  const visitLifecycleLabel =
    isClosedVisit
      ? t("closedVisit")
      : visitLifecycleStatus === "needs_coding"
        ? t("needsCodingVisit")
        : t("openVisit");

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    // Keep SSR and the first client render aligned, then enable live form gating.
    setIsHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  return (
    <div className="p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary-soft px-4 py-3">
        <div>
          <p className="text-sm font-bold text-foreground">
            {visitLifecycleLabel} · {t("chair", {number: "01"})}
          </p>
          <p className="text-xs text-text-muted">
            {t("visitStarted", {
              visitId: activeVisit.id,
              time: new Date(activeVisit.startedAt).toLocaleTimeString(locale, {
                hour: "2-digit",
                minute: "2-digit",
              }),
            })}
          </p>
        </div>
        <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-white">
          {visitLifecycleStatus === "closed"
            ? t("status.closed")
            : visitCodingStatus === "needs_coding"
              ? t("status.needsCoding")
              : t("status.inProgress")}
        </span>
      </div>

      <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-slate-800">
              {t("handoffTitle")}
            </p>
            <p className="text-xs text-slate-500">
              {t("handoffDescription")}
            </p>
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-bold ${
              visitCodingStatus === "needs_coding"
                ? "bg-amber-100 text-amber-800"
                : visitCodingStatus === "coded"
                  ? "bg-emerald-100 text-emerald-800"
                  : visitCodingStatus === "draft_note"
                    ? "bg-slate-100 text-slate-700"
                    : "bg-primary-soft text-primary"
            }`}
          >
            {visitCodingStatus === "needs_coding"
              ? t("codingStatus.needsAssistantCoding")
              : visitCodingStatus === "coded"
                ? t("codingStatus.structured")
                : visitCodingStatus === "draft_note"
                  ? t("codingStatus.draftSaved")
                  : t("codingStatus.structuredWorkflow")}
          </span>
        </div>

        {pendingCoordinationCount > 0 && (
          <div className="mb-3 grid gap-2 md:grid-cols-2">
            {followUpRequests.length > 0 && (
              <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800">
                <div className="flex items-center gap-2 font-bold">
                  <Calendar size={14} /> {t("followUpRequested")}
                </div>
                <p className="mt-1 text-blue-700">
                  {followUpRequests[followUpRequests.length - 1]?.reason ||
                    t("followUpFallback")}
                </p>
              </div>
            )}
            {documentRequests.length > 0 && (
              <div className="rounded-md border border-violet-200 bg-violet-50 px-3 py-2 text-xs text-violet-800">
                <div className="flex items-center gap-2 font-bold">
                  <FileText size={14} /> {t("documentRequested")}
                </div>
                <p className="mt-1 text-violet-700">
                  {documentRequestTypes.find(
                    (type) =>
                      type.id ===
                      documentRequests[documentRequests.length - 1]?.type,
                  )?.label || t("clinicalDocument")}
                </p>
              </div>
            )}
          </div>
        )}

        <textarea
          value={visitHandoffNote}
          onChange={(event) => {
            onChangeHandoffNote(event.target.value);
            if (event.target.value.trim()) {
              setVisitCodingStatus((previous) =>
                previous === "needs_coding" ? previous : "draft_note",
              );
            }
          }}
          rows={3}
          placeholder={t("handoffPlaceholder")}
          className="w-full resize-none rounded-md border border-slate-300 bg-page p-3 text-sm text-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/25"
        />

        {visitHandoffRecord && (
          <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
            {t("savedBy", {
              author: visitHandoffRecord.authoredBy,
              date: new Date(visitHandoffRecord.savedAt).toLocaleString(locale),
            })}
          </div>
        )}

        <div className="mt-3 flex flex-wrap justify-end gap-2">
          <button
            onClick={onSaveHandoffDraft}
            disabled={!canSubmitHandoff}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            <Save size={14} /> {t("saveDraft")}
          </button>
          <button
            onClick={onSendToAssistant}
            disabled={!canSubmitHandoff}
            className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 transition-colors hover:bg-amber-100 disabled:opacity-50"
          >
            <FileText size={14} /> {t("sendToAssistant")}
          </button>
          {visitHandoffRecord && (
            <button
              onClick={onMarkStructured}
              className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-700"
            >
              <CheckCircle size={14} /> {t("markStructured")}
            </button>
          )}
          <button
            onClick={onCloseVisit}
            disabled={visitCodingStatus === "needs_coding"}
            className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <X size={14} /> {t("closeVisit")}
          </button>
        </div>
      </div>

      {currentSession.length === 0 ? (
        <div className="text-center py-8 text-slate-500 flex flex-col items-center">
          <Stethoscope size={32} className="text-slate-300 mb-2" />
          <p className="text-base font-medium text-slate-700">
            {t("empty")}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">{t("table.location")}</th>
                <th className="px-4 py-3 font-semibold">{t("table.treatmentAct")}</th>
                <th className="px-4 py-3 font-semibold">{t("table.notes")}</th>
                <th className="px-4 py-3 font-semibold">{t("table.status")}</th>
                <th className="px-4 py-3 font-semibold text-right">{t("table.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentSession.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 flex items-center gap-2">
                    <span
                      className={`inline-flex items-center justify-center h-7 px-2 ${
                        item.tooth === "Whole Mouth" || item.toothIds?.length
                          ? "bg-indigo-50 text-indigo-700"
                          : "bg-slate-100 text-slate-700"
                      } rounded font-bold border border-slate-200`}
                    >
                      {getTreatmentLocationLabel(item)}
                    </span>
                    {item.surfaces.length > 0 && (
                      <div className="flex gap-1">
                        {item.surfaces.map((surface) => (
                          <span
                            key={surface}
                            className="px-1.5 py-0.5 text-[10px] font-bold bg-white border border-slate-300 rounded text-slate-600"
                          >
                            {surface}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {getTreatmentActLabel(item.act)}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {item.notes || "-"}
                  </td>
                  <td className="px-4 py-3">
                    {item.status === "completed" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-700 border border-sky-200">
                        <CheckCircle size={12} /> {t("procedureStatus.completed")}
                      </span>
                    ) : isClosedVisit ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                        <Clock size={12} /> {t("procedureStatus.carriedForward")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                        <Clock size={12} /> {t("procedureStatus.inProgress")}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!isClosedVisit && item.status !== "completed" && (
                      <button
                        onClick={() => onSetSessionActToComplete(item)}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-sky-500 hover:bg-sky-600 rounded transition-colors shadow-sm"
                      >
                        {t("markDone")}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
