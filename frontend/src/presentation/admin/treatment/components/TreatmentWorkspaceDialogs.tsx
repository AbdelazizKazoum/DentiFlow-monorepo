import type {Dispatch, SetStateAction} from "react";
import {
  Activity,
  AlertTriangle,
  Calendar,
  CheckCircle,
  FileText,
  Pill,
  X,
} from "lucide-react";
import {useTranslations} from "next-intl";
import type {
  TreatmentPageDentalActDTO,
  TreatmentPageDocumentRequestTypeId,
  TreatmentPageFollowUpUrgency,
  TreatmentPageSurfaceCode,
  TreatmentPageTreatmentPlanItemDTO,
  TreatmentPageVisitProcedureDTO,
} from "@/infrastructure/treatment/dtos";
import {getTreatmentLocationLabel} from "@/infrastructure/treatment/mappers";

type SurfaceCode = TreatmentPageSurfaceCode;
type DocumentRequestTypeId = TreatmentPageDocumentRequestTypeId;
type FollowUpUrgency = TreatmentPageFollowUpUrgency;
type TreatmentPlanItem = TreatmentPageTreatmentPlanItemDTO;
type VisitProcedure = TreatmentPageVisitProcedureDTO;

interface CloseVisitNextSteps {
  followUpNeeded: boolean;
  followUpReason: string;
  followUpDate: string;
  followUpUrgency: FollowUpUrgency;
  documentNeeded: boolean;
  documentType: DocumentRequestTypeId;
  documentReason: string;
  linkedTreatmentId: string;
}

interface SurfacePickerDialogProps {
  tooth: number | null;
  activeSurfaces: SurfaceCode[];
  pendingDroppedAct: TreatmentPageDentalActDTO | null;
  onClearSurfaces: () => void;
  onClose: () => void;
  onConfirm: () => void;
  onToggleSurface: (surface: SurfaceCode) => void;
}

const SURFACE_OPTIONS: Array<{id: SurfaceCode; labelKey: string}> = [
  {id: "V", labelKey: "surfaces.V"},
  {id: "L", labelKey: "surfaces.L"},
  {id: "M", labelKey: "surfaces.M"},
  {id: "D", labelKey: "surfaces.D"},
  {id: "O", labelKey: "surfaces.O"},
  {id: "R", labelKey: "surfaces.R"},
];

export function SurfacePickerDialog({
  tooth,
  activeSurfaces,
  pendingDroppedAct,
  onClearSurfaces,
  onClose,
  onConfirm,
  onToggleSurface,
}: SurfacePickerDialogProps) {
  const t = useTranslations("admin.treatment.dialogs.surfacePicker");

  if (tooth === null) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/25 p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              {t("tooth", {tooth})}
            </p>
            <h3 className="mt-1 text-lg font-bold text-slate-800">
              {t("title")}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {pendingDroppedAct
                ? t("descriptionForAct", {act: pendingDroppedAct.name})
                : t("description")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        <button
          onClick={onClearSurfaces}
          className={`mt-5 flex w-full items-center justify-between rounded-lg border p-3 text-left transition ${
            activeSurfaces.length === 0
              ? "border-primary bg-primary-soft text-primary ring-1 ring-primary/25"
              : "border-ui-border hover:bg-surface-hover"
          }`}
        >
          <span>
            <span className="block text-sm font-bold">{t("fullTooth")}</span>
            <span className="text-xs font-normal text-slate-500">
              {t("fullToothHint")}
            </span>
          </span>
          {activeSurfaces.length === 0 && <CheckCircle size={18} />}
        </button>

        <div className="mt-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-600">
            {t("specificSurfaces")}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {SURFACE_OPTIONS.map((surface) => {
              const selected = activeSurfaces.includes(surface.id);
              return (
                <button
                  key={surface.id}
                  onClick={() => onToggleSurface(surface.id)}
                  className={`rounded-md border px-3 py-2.5 text-left text-xs font-semibold transition ${
                    selected
                      ? "border-primary bg-primary-soft text-primary"
                      : "border-ui-border text-text-muted hover:bg-surface-hover"
                  }`}
                >
                  {surface.id === "R" && (
                    <Activity size={14} className="mr-1 inline text-red-500" />
                  )}
                  {t(surface.labelKey)}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={onConfirm}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-primary py-3 text-sm font-bold text-white shadow-sm transition hover:bg-primary-dark"
        >
          <CheckCircle size={17} /> {t("confirm")}
        </button>
      </div>
    </div>
  );
}

interface ConfirmTreatmentDialogProps {
  open: boolean;
  actName?: string;
  targetLabel: string;
  dentitionLabel: string;
  selectedMouthRegion: string | null;
  selectedTeeth: number[];
  toothSurfaces: Record<number, SurfaceCode[]>;
  priority: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmTreatmentDialog({
  open,
  actName,
  targetLabel,
  dentitionLabel,
  selectedMouthRegion,
  selectedTeeth,
  toothSurfaces,
  priority,
  onCancel,
  onConfirm,
}: ConfirmTreatmentDialogProps) {
  const t = useTranslations("admin.treatment.dialogs.confirmTreatment");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/25 p-4">
      <div className="w-[400px] max-w-[90%] rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary">
            <AlertTriangle size={20} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            {t("title")}
          </h3>
        </div>

        <div className="mb-6 flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <p>
            <strong>{t("act")}:</strong> {actName}
          </p>
          <p>
            <strong>{t("target")}:</strong> {targetLabel}
          </p>
          <p>
            <strong>{t("dentition")}:</strong> {dentitionLabel}
          </p>
          {!selectedMouthRegion &&
            selectedTeeth.map((tooth) => (
              <p key={tooth}>
                <strong>{t("tooth", {tooth})}:</strong>{" "}
                {toothSurfaces[tooth]?.length
                  ? toothSurfaces[tooth].join(", ")
                  : t("fullTooth")}
              </p>
            ))}
          {priority !== "Normal" && (
            <p>
              <strong>{t("priority")}:</strong> {priority}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
          >
            {t("cancel")}
          </button>
          <button
            onClick={onConfirm}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primary-dark"
          >
            <CheckCircle size={16} /> {t("confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}

interface CompleteSessionActDialogProps {
  procedure: VisitProcedure | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export function CompleteSessionActDialog({
  procedure,
  onCancel,
  onConfirm,
}: CompleteSessionActDialogProps) {
  const t = useTranslations("admin.treatment.dialogs.completeSessionAct");

  if (!procedure) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/25 p-4">
      <div className="w-[420px] max-w-[90%] rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sky-600">
            <CheckCircle size={20} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            {t("title")}
          </h3>
        </div>

        <div className="mb-6 flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <p>
            <strong>{t("act")}:</strong> {procedure.act}
          </p>
          <p>
            <strong>{t("location")}:</strong> {getTreatmentLocationLabel(procedure)}
          </p>
          <p>
            <strong>{t("area")}:</strong>{" "}
            {procedure.surfaces.length ? procedure.surfaces.join(", ") : t("fullTooth")}
          </p>
          <p className="text-slate-500">
            {t("description")}
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
          >
            {t("cancel")}
          </button>
          <button
            onClick={onConfirm}
            className="flex items-center gap-2 rounded-md bg-sky-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-sky-700"
          >
            <CheckCircle size={16} /> {t("confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}

interface SendAssistantDialogProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function SendAssistantDialog({
  open,
  onCancel,
  onConfirm,
}: SendAssistantDialogProps) {
  const t = useTranslations("admin.treatment.dialogs.sendAssistant");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/25 p-4">
      <div className="w-[440px] max-w-[90%] rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <FileText size={20} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            {t("title")}
          </h3>
        </div>

        <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <p className="font-semibold text-slate-800">
            {t("summary")}
          </p>
          <p className="mt-2 text-slate-500">
            {t("description")}
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
          >
            {t("cancel")}
          </button>
          <button
            onClick={onConfirm}
            className="flex items-center gap-2 rounded-md bg-amber-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-amber-700"
          >
            <FileText size={16} /> {t("confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}

interface CloseVisitDialogProps {
  open: boolean;
  nextSteps: CloseVisitNextSteps;
  setNextSteps: Dispatch<SetStateAction<CloseVisitNextSteps>>;
  documentRequestTypes: Array<{id: DocumentRequestTypeId; label: string}>;
  treatmentPlan: TreatmentPlanItem[];
  onCancel: () => void;
  onConfirm: () => void;
}

export function CloseVisitDialog({
  open,
  nextSteps,
  setNextSteps,
  documentRequestTypes,
  treatmentPlan,
  onCancel,
  onConfirm,
}: CloseVisitDialogProps) {
  const t = useTranslations("admin.treatment.dialogs.closeVisit");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/25 p-4">
      <div className="max-h-[92vh] w-[620px] max-w-[96%] overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle size={20} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">{t("title")}</h3>
        </div>

        <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <p className="font-semibold text-slate-800">
            {t("summary")}
          </p>
          <p className="mt-2 text-slate-500">
            {t("description")}
          </p>
        </div>

        <div className="mb-6 grid gap-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={nextSteps.followUpNeeded}
                onChange={(event) =>
                  setNextSteps((previous) => ({
                    ...previous,
                    followUpNeeded: event.target.checked,
                  }))
                }
                className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  <Calendar size={16} className="text-blue-600" />
                  {t("followUp.title")}
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {t("followUp.description")}
                </p>
              </div>
            </label>

            {nextSteps.followUpNeeded && (
              <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-600">
                      {t("followUp.preferredDate")}
                    </label>
                    <input
                      type="date"
                      value={nextSteps.followUpDate}
                      onChange={(event) =>
                        setNextSteps((previous) => ({
                          ...previous,
                          followUpDate: event.target.value,
                        }))
                      }
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-600">
                      {t("followUp.urgency")}
                    </label>
                    <select
                      value={nextSteps.followUpUrgency}
                      onChange={(event) =>
                        setNextSteps((previous) => ({
                          ...previous,
                          followUpUrgency: event.target.value as FollowUpUrgency,
                        }))
                      }
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                    >
                      <option value="Routine">
                        {t("followUp.urgencies.Routine")}
                      </option>
                      <option value="Soon">{t("followUp.urgencies.Soon")}</option>
                      <option value="Urgent">
                        {t("followUp.urgencies.Urgent")}
                      </option>
                    </select>
                  </div>
                </div>
                <textarea
                  value={nextSteps.followUpReason}
                  onChange={(event) =>
                    setNextSteps((previous) => ({
                      ...previous,
                      followUpReason: event.target.value,
                    }))
                  }
                  rows={2}
                  placeholder={t("followUp.reason")}
                  className="w-full resize-none rounded-md border border-slate-300 bg-slate-50 p-3 text-sm text-slate-700"
                />
              </div>
            )}
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={nextSteps.documentNeeded}
                onChange={(event) =>
                  setNextSteps((previous) => ({
                    ...previous,
                    documentNeeded: event.target.checked,
                  }))
                }
                className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  <Pill size={16} className="text-violet-600" />
                  {t("document.title")}
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {t("document.description")}
                </p>
              </div>
            </label>

            {nextSteps.documentNeeded && (
              <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-600">
                      {t("document.documentType")}
                    </label>
                    <select
                      value={nextSteps.documentType}
                      onChange={(event) =>
                        setNextSteps((previous) => ({
                          ...previous,
                          documentType: event.target
                            .value as DocumentRequestTypeId,
                        }))
                      }
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                    >
                      {documentRequestTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-600">
                      {t("document.linkToTreatment")}
                    </label>
                    <select
                      value={nextSteps.linkedTreatmentId}
                      onChange={(event) =>
                        setNextSteps((previous) => ({
                          ...previous,
                          linkedTreatmentId: event.target.value,
                        }))
                      }
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                    >
                      <option value="">{t("document.visitLevel")}</option>
                      {treatmentPlan
                        .filter((item) =>
                          ["proposed", "accepted", "in_progress"].includes(
                            item.status,
                          ),
                        )
                        .map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.act} - {getTreatmentLocationLabel(item)}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
                <textarea
                  value={nextSteps.documentReason}
                  onChange={(event) =>
                    setNextSteps((previous) => ({
                      ...previous,
                      documentReason: event.target.value,
                    }))
                  }
                  rows={2}
                  placeholder={t("document.reason")}
                  className="w-full resize-none rounded-md border border-slate-300 bg-slate-50 p-3 text-sm text-slate-700"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
          >
            {t("cancel")}
          </button>
          <button
            onClick={onConfirm}
            className="flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-emerald-700"
          >
            <CheckCircle size={16} /> {t("confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
