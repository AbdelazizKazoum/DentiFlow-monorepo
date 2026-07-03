import {
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Save,
  Stethoscope,
  X,
} from "lucide-react";

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
  onChangeHandoffNote,
  onSaveHandoffDraft,
  onSendToAssistant,
  onMarkStructured,
  onCloseVisit,
  onSetSessionActToComplete,
  setVisitCodingStatus,
}: CurrentSessionPanelProps<TProcedure>) {
  return (
    <div className="p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary-soft px-4 py-3">
        <div>
          <p className="text-sm font-bold text-foreground">
            Open visit · Chair 01
          </p>
          <p className="text-xs text-text-muted">
            Visit {activeVisit.id} · Started{" "}
            {new Date(activeVisit.startedAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-white">
          {visitLifecycleStatus === "closed"
            ? "Closed"
            : visitCodingStatus === "needs_coding"
              ? "Needs coding"
              : "In progress"}
        </span>
      </div>

      <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-slate-800">
              Doctor handoff note
            </p>
            <p className="text-xs text-slate-500">
              Free-text visit summary for assistant coding before the visit is
              closed.
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
              ? "Needs assistant coding"
              : visitCodingStatus === "coded"
                ? "Structured"
                : visitCodingStatus === "draft_note"
                  ? "Draft saved"
                  : "Structured workflow"}
          </span>
        </div>

        {pendingCoordinationCount > 0 && (
          <div className="mb-3 grid gap-2 md:grid-cols-2">
            {followUpRequests.length > 0 && (
              <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800">
                <div className="flex items-center gap-2 font-bold">
                  <Calendar size={14} /> Follow-up requested
                </div>
                <p className="mt-1 text-blue-700">
                  {followUpRequests[followUpRequests.length - 1]?.reason ||
                    "Assistant should schedule follow-up."}
                </p>
              </div>
            )}
            {documentRequests.length > 0 && (
              <div className="rounded-md border border-violet-200 bg-violet-50 px-3 py-2 text-xs text-violet-800">
                <div className="flex items-center gap-2 font-bold">
                  <FileText size={14} /> Document requested
                </div>
                <p className="mt-1 text-violet-700">
                  {documentRequestTypes.find(
                    (type) =>
                      type.id ===
                      documentRequests[documentRequests.length - 1]?.type,
                  )?.label || "Clinical document"}
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
          placeholder="Example: Worked on tooth 16, canal cleaned, temporary filling placed. Patient still sensitive; continue RCT next visit."
          className="w-full resize-none rounded-md border border-slate-300 bg-page p-3 text-sm text-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/25"
        />

        {visitHandoffRecord && (
          <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
            Saved by {visitHandoffRecord.authoredBy} ·{" "}
            {new Date(visitHandoffRecord.savedAt).toLocaleString()}
          </div>
        )}

        <div className="mt-3 flex flex-wrap justify-end gap-2">
          <button
            onClick={onSaveHandoffDraft}
            disabled={!visitHandoffNote.trim()}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            <Save size={14} /> Save Draft
          </button>
          <button
            onClick={onSendToAssistant}
            disabled={!visitHandoffNote.trim()}
            className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 transition-colors hover:bg-amber-100 disabled:opacity-50"
          >
            <FileText size={14} /> Send to Assistant
          </button>
          {visitHandoffRecord && (
            <button
              onClick={onMarkStructured}
              className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-700"
            >
              <CheckCircle size={14} /> Mark Structured
            </button>
          )}
          <button
            onClick={onCloseVisit}
            disabled={visitCodingStatus === "needs_coding"}
            className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <X size={14} /> Close Visit
          </button>
        </div>
      </div>

      {currentSession.length === 0 ? (
        <div className="text-center py-8 text-slate-500 flex flex-col items-center">
          <Stethoscope size={32} className="text-slate-300 mb-2" />
          <p className="text-base font-medium text-slate-700">
            No active treatments.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Location</th>
                <th className="px-4 py-3 font-semibold">Treatment Act</th>
                <th className="px-4 py-3 font-semibold">Notes</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
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
                    {item.act}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {item.notes || "-"}
                  </td>
                  <td className="px-4 py-3">
                    {item.status === "completed" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-700 border border-sky-200">
                        <CheckCircle size={12} /> Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                        <Clock size={12} /> In Progress
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {item.status !== "completed" && (
                      <button
                        onClick={() => onSetSessionActToComplete(item)}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-sky-500 hover:bg-sky-600 rounded transition-colors shadow-sm"
                      >
                        Mark Done
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
