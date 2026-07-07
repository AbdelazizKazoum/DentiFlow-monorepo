"use client";

import React, {useEffect, useMemo, useState} from "react";
import {useParams, useRouter, useSearchParams} from "next/navigation";
import {useTranslations} from "next-intl";
import {
  Calendar,
  CheckCircle,
  CreditCard,
  FileText,
  Paperclip,
  Pill,
  Play,
  Plus,
  Search,
  X,
  GripVertical,
  Info,
} from "lucide-react";
import {
  DENTITION_MODES,
  DIAGNOSES_CATALOG,
  DIAGNOSIS_CERTAINTY_OPTIONS,
  DIAGNOSIS_EVIDENCE_OPTIONS,
  DIAGNOSIS_STATUS_OPTIONS,
  DIAGNOSIS_SYMPTOM_OPTIONS,
  DOCUMENT_REQUEST_TYPES as DOMAIN_DOCUMENT_REQUEST_TYPES,
  LOWER_LEFT,
  LOWER_RIGHT,
  MOUTH_REGION_OPTIONS,
  PRIMARY_LOWER_LEFT,
  PRIMARY_LOWER_RIGHT,
  PRIMARY_UPPER_LEFT,
  PRIMARY_UPPER_RIGHT,
  TREATMENT_ACTS,
  UPPER_LEFT,
  UPPER_RIGHT,
} from "@/domain/treatment/catalogs";
import type {TreatmentStatus as DomainTreatmentStatus} from "@/domain/treatment/entities";
import { getActVisualColor } from "@/domain/treatment/services";
import {
  TREATMENT_DEMO_ACTIVE_VISIT,
  TREATMENT_DEMO_PRIOR_VISIT_HANDOFFS,
  TREATMENT_DEMO_PRIOR_VISIT_PROCEDURES,
} from "@/infrastructure/treatment/inMemory";
import {
  fromDomainDentalAct,
  fromDomainDiagnosisCertainty,
  fromDomainDiagnosisStatus,
  fromDomainDocumentType,
  fromDomainEvidence,
  getTreatmentLocationLabel,
  toDomainDentition,
  toDomainDiagnosisCertainty,
  toDomainDiagnosisSeverity,
  toDomainDiagnosisStatus,
  toDomainDocumentType,
  toDomainEvidence,
  toDomainFollowUpUrgency,
  toDomainPriority,
  toDomainTreatmentStatus,
  toDomainVisitCodingStatus,
} from "@/infrastructure/treatment/mappers";
import type {
  TreatmentPageClinicalAttachmentDTO,
  TreatmentPageDentalActDTO,
  TreatmentPageDentitionMode,
  TreatmentPageDiagnosisCertainty,
  TreatmentPageDiagnosisSeverity,
  TreatmentPageDiagnosisStatus,
  TreatmentPageDocumentRequestTypeId,
  TreatmentPageFollowUpUrgency,
  TreatmentPagePriority,
  TreatmentPageStatus,
  TreatmentPageSurfaceCode,
  TreatmentPageTreatmentBaseDTO,
  TreatmentPageTreatmentPlanItemDTO,
  TreatmentPageVisitCodingStatus,
  TreatmentPageVisitHandoffDTO,
  TreatmentPageVisitLifecycleStatus,
  TreatmentPageVisitProcedureDTO,
  TreatmentPageVisualState,
} from "@/infrastructure/treatment/dtos";
import { CurrentSessionPanel } from "./CurrentSessionPanel";
import { OdontogramPanel } from "./OdontogramPanel";
import { TreatmentHeader } from "./TreatmentHeader";
import { TreatmentPlanPanel } from "./TreatmentPlanPanel";
import { TreatmentTabs } from "./TreatmentTabs";
import {
  CompleteSessionActDialog,
  ConfirmTreatmentDialog,
  SurfacePickerDialog,
} from "./TreatmentWorkspaceDialogs";
import { useTreatmentPage } from "../hooks/useTreatmentPage";

type SurfaceCode = TreatmentPageSurfaceCode;
type VisualState = TreatmentPageVisualState;
type DentitionMode = TreatmentPageDentitionMode;
type Priority = TreatmentPagePriority;
type TreatmentStatus = TreatmentPageStatus;
type VisitCodingStatus = TreatmentPageVisitCodingStatus;
type VisitLifecycleStatus = TreatmentPageVisitLifecycleStatus;
type DiagnosisCertainty = TreatmentPageDiagnosisCertainty;
type DiagnosisStatus = TreatmentPageDiagnosisStatus;
type DiagnosisSeverity = TreatmentPageDiagnosisSeverity;
type DocumentRequestTypeId = TreatmentPageDocumentRequestTypeId;
type FollowUpUrgency = TreatmentPageFollowUpUrgency;

type DentalAct = TreatmentPageDentalActDTO;

type TreatmentBase = TreatmentPageTreatmentBaseDTO;
type TreatmentPlanItem = TreatmentPageTreatmentPlanItemDTO;
type VisitProcedure = TreatmentPageVisitProcedureDTO;
type ClinicalAttachment = TreatmentPageClinicalAttachmentDTO;
type VisitHandoff = TreatmentPageVisitHandoffDTO;

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

interface ActForm {
  notes: string;
  priority: Priority;
}

interface DiagnosisForm {
  diagnosis: string;
  severity: DiagnosisSeverity;
  certainty: DiagnosisCertainty;
  status: DiagnosisStatus;
  evidence: string[];
  attachmentIds: string[];
  symptoms: string[];
  painLevel: number;
  notes: string;
}

interface ChartRow {
  id: string;
  label: string;
  right: number[];
  left: number[];
  compact: boolean;
}

interface ChartRows {
  upper: ChartRow[];
  lower: ChartRow[];
}

interface ClinicalEvent {
  id: string;
  type: "pathology" | "planned" | "progress" | "completed";
  label: string;
  stateLabel: string;
  tooth: number | string;
  toothIds?: number[];
  surfaces?: SurfaceCode[];
  act?: string;
  diagnosis?: string;
  severity?: DiagnosisSeverity;
  certainty?: DiagnosisCertainty;
  evidence?: string[];
  attachmentIds?: string[];
  symptoms?: string[];
  painLevel?: number;
  notes?: string;
  status?: string;
  price?: number;
}

type MouthRegionId =
  | "whole_mouth"
  | "upper_arch"
  | "lower_arch"
  | "upper_right"
  | "upper_left"
  | "lower_left"
  | "lower_right";

const toTranslationKey = (value: string): string =>
  value
    .toLowerCase()
    .replace(/\+/g, " plus ")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const ACTIVE_VISIT = TREATMENT_DEMO_ACTIVE_VISIT;
const EXTENDED_ACTS = TREATMENT_ACTS.map(fromDomainDentalAct);
const PRIOR_VISIT_PROCEDURES = TREATMENT_DEMO_PRIOR_VISIT_PROCEDURES;
const PRIOR_VISIT_HANDOFFS = TREATMENT_DEMO_PRIOR_VISIT_HANDOFFS;
const DOCUMENT_REQUEST_TYPES = DOMAIN_DOCUMENT_REQUEST_TYPES.map((type) => ({
  id: fromDomainDocumentType(type.id),
  label: type.label,
}));
const DIAGNOSIS_CERTAINTY_DISPLAY_OPTIONS = DIAGNOSIS_CERTAINTY_OPTIONS.map(
  fromDomainDiagnosisCertainty,
);
const DIAGNOSIS_STATUS_DISPLAY_OPTIONS = DIAGNOSIS_STATUS_OPTIONS.map(
  fromDomainDiagnosisStatus,
);
const DIAGNOSIS_EVIDENCE_DISPLAY_OPTIONS = fromDomainEvidence(
  DIAGNOSIS_EVIDENCE_OPTIONS,
);

const TREATMENT_CLINIC_ID =
  process.env.NEXT_PUBLIC_DEFAULT_CLINIC_ID ??
  "00000000-0000-4000-8000-000000000001";

export function TreatmentWorkspace() {
  const tx = useTranslations("admin.treatment.workspace");
  const tp = useTranslations("admin.treatment.plan");
  const translate = (
    key: string,
    fallback: string,
    values?: Record<string, string | number>,
    translator: typeof tx = tx,
  ) => {
    if (!key || key.endsWith(".")) return fallback;

    try {
      return translator(key, values);
    } catch {
      return fallback;
    }
  };
  const getActLabel = (act: string) =>
    act
      ? translate(`acts.names.${toTranslationKey(act)}`, act)
      : "";
  const getActCategoryLabel = (category: string) =>
    category
      ? translate(`acts.categories.${toTranslationKey(category)}`, category)
      : "";
  const getDiagnosisLabel = (diagnosis: string) =>
    diagnosis
      ? translate(`diagnoses.names.${toTranslationKey(diagnosis)}`, diagnosis)
      : "";
  const getSeverityLabel = (severity: string) =>
    severity
      ? translate(`diagnoses.severity.${toTranslationKey(severity)}`, severity)
      : "";
  const getCertaintyLabel = (certainty: string) =>
    certainty
      ? translate(`diagnoses.certainty.${toTranslationKey(certainty)}`, certainty)
      : "";
  const getDiagnosisStatusLabel = (status: string) =>
    status
      ? translate(`diagnoses.status.${toTranslationKey(status)}`, status)
      : "";
  const getEvidenceLabel = (evidence: string) =>
    evidence
      ? translate(`diagnoses.evidence.${toTranslationKey(evidence)}`, evidence)
      : "";
  const getSymptomLabel = (symptom: string) =>
    symptom
      ? translate(`diagnoses.symptoms.${toTranslationKey(symptom)}`, symptom)
      : "";
  const getPriorityLabel = (priority: string) =>
    translate(`priorities.${priority}`, priority);
  const getProcedureStatusLabel = (status: string) =>
    translate(`procedureStatus.${toTranslationKey(status)}`, status);
  const getToothName = (tooth: number | string) =>
    typeof tooth === "number"
      ? translate(`teeth.tooth_${tooth}`, tx("tooth", {tooth}))
      : String(tooth);
  const getMouthRegionLabel = (regionId: string) =>
    translate(`mouthRegions.${regionId}.label`, regionId);
  const getMouthRegionHint = (regionId: string) =>
    translate(`mouthRegions.${regionId}.hint`, "");
  const getSurfaceLabel = (surface: string) =>
    translate(`surfaces.${surface}`, surface);
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const rawLocale = params?.locale;
  const locale = Array.isArray(rawLocale) ? rawLocale[0] : rawLocale || "en";
  const rawPatientId = params?.id;
  const routePatientId = Array.isArray(rawPatientId)
    ? rawPatientId[0]
    : rawPatientId;
  const routeVisitId = searchParams.get("visitId") ?? undefined;
  const waitingRoomPath = `/${locale}/admin/waiting-room`;
  const {
    patient,
    activeVisit: storeActiveVisit,
    acts,
    treatmentPlan,
    treatmentGroups,
    treatmentCharges,
    currentSession,
    diagnoses,
    clinicalAttachments,
    visitHandoffRecord,
    followUpRequests,
    documentRequests,
    activeTab,
    setActiveTab,
    dentitionMode,
    setDentitionMode,
    selectedTeeth,
    setSelectedTeeth,
    selectedMouthRegion: selectedMouthRegionValue,
    setSelectedMouthRegion,
    activeSurfaces,
    setActiveSurfaces,
    selectedActId,
    setSelectedActId,
    surfacePickerTooth,
    setSurfacePickerTooth,
    inspectorMode,
    setInspectorMode,
    isSendAssistantModalOpen,
    setIsSendAssistantModalOpen,
    isCloseVisitModalOpen,
    setIsCloseVisitModalOpen,
    loadPatient,
    loadWorkspace,
    addTreatmentPlanItem,
    addDiagnosis,
    startTreatment,
    completeVisitProcedure,
    changeTreatmentStatus,
    saveVisitHandoff,
    closeVisit,
    addClinicalAttachments,
    clearSelection,
  } = useTreatmentPage();
  const workspacePatientId = routePatientId || patient.id;
  const workspacePatient = useMemo(
    () => ({...patient, id: workspacePatientId}),
    [patient, workspacePatientId],
  );
  const activeVisit =
    storeActiveVisit ??
    ({
      ...ACTIVE_VISIT,
      id: routeVisitId ?? ACTIVE_VISIT.id,
      patientId: workspacePatientId,
    });
  const availableActs = acts.length > 0 ? acts : EXTENDED_ACTS;
  const localizedDentitionModes = DENTITION_MODES.map((mode) => ({
    ...mode,
    label: translate(`dentition.${mode.id}`, mode.label),
  }));
  const localizedMouthRegionOptions = MOUTH_REGION_OPTIONS.map((region) => ({
    ...region,
    label: getMouthRegionLabel(region.id),
    hint: getMouthRegionHint(region.id),
  }));
  const localizedDocumentRequestTypes = DOCUMENT_REQUEST_TYPES.map((type) => ({
    ...type,
    label: translate(`documents.${type.id}`, type.label),
  }));
  const selectedMouthRegion = selectedMouthRegionValue as MouthRegionId | null;
  const [dragHoverTooth, setDragHoverTooth] = useState<number | null>(null);
  const [visitHandoffNote, setVisitHandoffNote] = useState("");
  const [visitCodingStatus, setVisitCodingStatus] =
    useState<VisitCodingStatus>("structured");
  const [visitLifecycleStatus, setVisitLifecycleStatus] =
    useState<VisitLifecycleStatus>("open");
  const [closeVisitNextSteps, setCloseVisitNextSteps] =
    useState<CloseVisitNextSteps>({
      followUpNeeded: false,
      followUpReason: "",
      followUpDate: "",
      followUpUrgency: "Routine",
      documentNeeded: false,
      documentType: "prescription",
      documentReason: "",
      linkedTreatmentId: "",
    });

  const [searchTerm, setSearchTerm] = useState("");
  const [toothSurfaces, setToothSurfaces] = useState<
    Record<number, SurfaceCode[]>
  >({});
  const [pendingDroppedAct, setPendingDroppedAct] = useState<DentalAct | null>(
    null,
  );
  const [actForm, setActForm] = useState<ActForm>({
    notes: "",
    priority: "Normal",
  });
  const [diagnosisForm, setDiagnosisForm] = useState<DiagnosisForm>({
    diagnosis: "",
    severity: "Moderate",
    certainty: "Confirmed",
    status: "Active",
    evidence: ["Visual exam"],
    attachmentIds: [],
    symptoms: [],
    painLevel: 0,
    notes: "",
  });
  const [pendingConfirmation, setPendingConfirmation] = useState(false);
  const [sessionActToComplete, setSessionActToComplete] =
    useState<VisitProcedure | null>(null);
  const [treatmentDetailsItem, setTreatmentDetailsItem] =
    useState<TreatmentPlanItem | null>(null);

  useEffect(() => {
    void loadPatient(workspacePatientId);
    void loadWorkspace({
      clinicId: TREATMENT_CLINIC_ID,
      patientId: workspacePatientId,
      activeVisitId: routeVisitId ?? activeVisit.id,
    });
  }, [
    activeVisit.id,
    loadPatient,
    loadWorkspace,
    routeVisitId,
    workspacePatientId,
  ]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    // Hydrate editable handoff fields when the persisted visit handoff changes.
    if (!visitHandoffRecord) {
      setVisitHandoffNote("");
      setVisitCodingStatus("structured");
      setVisitLifecycleStatus("open");
      return;
    }

    setVisitHandoffNote(visitHandoffRecord.text);
    setVisitCodingStatus(visitHandoffRecord.status);
    setVisitLifecycleStatus(
      visitHandoffRecord.status === "needs_coding" ? "needs_coding" : "open",
    );
  }, [visitHandoffRecord]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const selectedMouthRegionOption = localizedMouthRegionOptions.find(
    (option) => option.id === selectedMouthRegion,
  );
  const hasTargetSelection =
    selectedTeeth.length > 0 || Boolean(selectedMouthRegion);
  const dentitionLabel =
    localizedDentitionModes.find((mode) => mode.id === dentitionMode)?.label ??
    translate("dentition.adult", "Adult");
  const getLocalizedTreatmentLocationLabel = (item: TreatmentBase): string => {
    if (item.toothIds?.length) {
      return tx("location.teeth", {teeth: item.toothIds.join(", ")});
    }

    if (typeof item.tooth === "number") {
      return getToothName(item.tooth);
    }

    if (typeof item.tooth === "string") {
      const region = localizedMouthRegionOptions.find(
        (option) => option.id === item.tooth,
      );
      return region?.label ?? item.tooth;
    }

    return getTreatmentLocationLabel(item);
  };
  const getLocalizedTreatmentAreaLabel = (item: TreatmentBase): string => {
    if (item.surfaces?.length) {
      return item.surfaces.map(getSurfaceLabel).join(", ");
    }
    if (item.toothIds?.length) return tx("location.fullSelectedTeeth");
    return tx("fullTooth");
  };
  const chartRows = useMemo<ChartRows>(() => {
    if (dentitionMode === "child") {
      return {
        upper: [
          {
            id: "primary-upper",
            label: tx("chart.primaryUpperArch"),
            right: PRIMARY_UPPER_RIGHT,
            left: PRIMARY_UPPER_LEFT,
            compact: false,
          },
        ],
        lower: [
          {
            id: "primary-lower",
            label: tx("chart.primaryLowerArch"),
            right: PRIMARY_LOWER_RIGHT,
            left: PRIMARY_LOWER_LEFT,
            compact: false,
          },
        ],
      };
    }

    if (dentitionMode === "mixed") {
      return {
        upper: [
          {
            id: "adult-upper",
            label: tx("chart.permanentUpperArch"),
            right: UPPER_RIGHT,
            left: UPPER_LEFT,
            compact: false,
          },
          {
            id: "primary-upper",
            label: tx("chart.primaryUpperArch"),
            right: PRIMARY_UPPER_RIGHT,
            left: PRIMARY_UPPER_LEFT,
            compact: true,
          },
        ],
        lower: [
          {
            id: "primary-lower",
            label: tx("chart.primaryLowerArch"),
            right: PRIMARY_LOWER_RIGHT,
            left: PRIMARY_LOWER_LEFT,
            compact: true,
          },
          {
            id: "adult-lower",
            label: tx("chart.permanentLowerArch"),
            right: LOWER_RIGHT,
            left: LOWER_LEFT,
            compact: false,
          },
        ],
      };
    }

    return {
      upper: [
        {
          id: "adult-upper",
          label: tx("chart.permanentUpperArch"),
          right: UPPER_RIGHT,
          left: UPPER_LEFT,
          compact: false,
        },
      ],
      lower: [
        {
          id: "adult-lower",
          label: tx("chart.permanentLowerArch"),
          right: LOWER_RIGHT,
          left: LOWER_LEFT,
          compact: false,
        },
      ],
    };
  }, [dentitionMode, tx]);

  const handleDentitionModeChange = (mode: DentitionMode) => {
    setDentitionMode(mode);
    clearSelection();
    setPendingDroppedAct(null);
  };

  const toggleToothSelection = (toothNumber: number) => {
    setSelectedMouthRegion(null);
    setSelectedTeeth((prev) =>
      prev.includes(toothNumber)
        ? prev.filter((t) => t !== toothNumber)
        : [...prev, toothNumber],
    );
  };

  const openSurfacePicker = (toothNumber: number) => {
    setSelectedMouthRegion(null);
    setActiveSurfaces(toothSurfaces[toothNumber] || []);
    setSurfacePickerTooth(toothNumber);
  };

  const saveToothSurfaces = () => {
    if (surfacePickerTooth === null) return;
    const selectedSurfaces = [...activeSurfaces];
    const tooth = surfacePickerTooth;
    setToothSurfaces((prev) => ({
      ...prev,
      [tooth]: selectedSurfaces,
    }));
    setSelectedMouthRegion(null);
    if (pendingDroppedAct) {
      void addTreatmentPlanItem(
        {
          clinicId: TREATMENT_CLINIC_ID,
          patientId: workspacePatientId,
          actId: pendingDroppedAct.id,
          selectedTeeth: [tooth],
          surfacesByTooth: {[tooth]: selectedSurfaces},
          priority: toDomainPriority(actForm.priority),
          notes: actForm.notes,
          dentition: toDomainDentition(dentitionMode),
          providerId: activeVisit.providerId,
        },
        pendingDroppedAct,
      );
      setPendingDroppedAct(null);
      setSelectedTeeth([tooth]);
    } else {
      setSelectedTeeth((prev) =>
        prev.includes(tooth)
          ? prev
          : [...prev, tooth],
      );
    }
    setSurfacePickerTooth(null);
  };
  const closeSurfacePicker = () => {
    setPendingDroppedAct(null);
    setSurfacePickerTooth(null);
  };

  const handleSelectMouthRegion = (regionId: MouthRegionId) => {
    setSelectedMouthRegion(regionId);
    setSelectedTeeth([]);
    setActiveSurfaces([]);
    setSurfacePickerTooth(null);
  };

  const toggleFormSurface = (surface: SurfaceCode) => {
    setActiveSurfaces((prev) =>
      prev.includes(surface)
        ? prev.filter((s) => s !== surface)
        : [...prev, surface],
    );
  };

  const toggleDiagnosisSymptom = (symptom: string) => {
    setDiagnosisForm((prev) => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter((item) => item !== symptom)
        : [...prev.symptoms, symptom],
    }));
  };

  const toggleDiagnosisEvidence = (evidence: string) => {
    setDiagnosisForm((prev) => ({
      ...prev,
      evidence: prev.evidence.includes(evidence)
        ? prev.evidence.filter((item) => item !== evidence)
        : [...prev.evidence, evidence],
    }));
  };

  const toggleDiagnosisAttachment = (attachmentId: string) => {
    setDiagnosisForm((prev) => ({
      ...prev,
      attachmentIds: prev.attachmentIds.includes(attachmentId)
        ? prev.attachmentIds.filter((id) => id !== attachmentId)
        : [...prev.attachmentIds, attachmentId],
    }));
  };

  const handleUploadRadiologyFiles = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const uploadedAt = new Date().toISOString();
    const newAttachments: ClinicalAttachment[] = files.map((file) => ({
      id: `scan_${Date.now()}_${file.name}`,
      type: "radiology",
      title: file.name,
      fileName: file.name,
      fileUrl: URL.createObjectURL(file),
      visitId: activeVisit.id,
      uploadedAt,
      uploadedBy: activeVisit.providerId,
    }));

    void addClinicalAttachments({
      clinicId: TREATMENT_CLINIC_ID,
      patientId: workspacePatientId,
      attachments: newAttachments,
    });
    setDiagnosisForm((prev) => ({
      ...prev,
      evidence: prev.evidence.includes("X-ray")
        ? prev.evidence
        : [...prev.evidence, "X-ray"],
      attachmentIds: [
        ...prev.attachmentIds,
        ...newAttachments.map((attachment) => attachment.id),
      ],
    }));
    event.target.value = "";
  };

  const saveVisitHandoffNote = async (
    status: VisitCodingStatus = "draft_note",
  ) => {
    try {
      await saveVisitHandoff(
        {
          clinicId: TREATMENT_CLINIC_ID,
          patientId: workspacePatientId,
          visitId: activeVisit.id,
          text: visitHandoffNote,
          status: toDomainVisitCodingStatus(status),
          providerId: activeVisit.providerId,
        },
        visitHandoffRecord,
      );
    } catch {
      return;
    }
    setVisitCodingStatus(status);
  };

  const confirmSendToAssistant = () => {
    void saveVisitHandoffNote("needs_coding");
    setVisitLifecycleStatus("needs_coding");
    setIsSendAssistantModalOpen(false);
    router.push(waitingRoomPath);
  };

  const markVisitCodingComplete = () => {
    if (!visitHandoffRecord) return;
    void saveVisitHandoffNote("coded");
    setVisitCodingStatus("coded");
    setVisitLifecycleStatus("open");
  };

  const confirmCloseVisit = async () => {
    await closeVisit({
      clinicId: TREATMENT_CLINIC_ID,
      patientId: workspacePatientId,
      visitId: activeVisit.id,
      providerId: activeVisit.providerId,
      followUpRequest: closeVisitNextSteps.followUpNeeded
        ? {
            treatmentPlanItemId:
              closeVisitNextSteps.linkedTreatmentId || undefined,
            reason: closeVisitNextSteps.followUpReason,
            preferredDate: closeVisitNextSteps.followUpDate
              ? new Date(closeVisitNextSteps.followUpDate)
              : undefined,
            urgency: toDomainFollowUpUrgency(
              closeVisitNextSteps.followUpUrgency,
            ),
          }
        : undefined,
      documentRequest: closeVisitNextSteps.documentNeeded
        ? {
            treatmentPlanItemId:
              closeVisitNextSteps.linkedTreatmentId || undefined,
            type: toDomainDocumentType(closeVisitNextSteps.documentType),
            reason: closeVisitNextSteps.documentReason,
          }
        : undefined,
    });

    setVisitLifecycleStatus("closed");
    setIsCloseVisitModalOpen(false);
    setCloseVisitNextSteps({
      followUpNeeded: false,
      followUpReason: "",
      followUpDate: "",
      followUpUrgency: "Routine",
      documentNeeded: false,
      documentType: "prescription",
      documentReason: "",
      linkedTreatmentId: "",
    });
    router.push(waitingRoomPath);
  };

  const handleAddAct = async () => {
    const actIdToUse = selectedActId;
    if (!actIdToUse) return;

    const actDetails = availableActs.find((a) => a.id === actIdToUse);
    if (!actDetails) return;

    await addTreatmentPlanItem(
      {
        clinicId: TREATMENT_CLINIC_ID,
        patientId: workspacePatientId,
        actId: actDetails.id,
        selectedTeeth,
        mouthRegionId: selectedMouthRegion ?? undefined,
        surfacesByTooth: toothSurfaces,
        priority: toDomainPriority(actForm.priority),
        notes: actForm.notes,
        dentition: toDomainDentition(dentitionMode),
        providerId: activeVisit.providerId,
      },
      actDetails,
    );

    // Reset forms
    setSelectedActId("");
    setActForm({ notes: "", priority: "Normal" });
    setActiveSurfaces([]);
    setPendingConfirmation(false);
  };

  const handleAddDiagnosis = async () => {
    if (!diagnosisForm.diagnosis) return;

    await addDiagnosis({
      clinicId: TREATMENT_CLINIC_ID,
      patientId: workspacePatientId,
      diagnosis: diagnosisForm.diagnosis,
      selectedTeeth,
      mouthRegionId: selectedMouthRegion ?? undefined,
      surfacesByTooth: toothSurfaces,
      severity: toDomainDiagnosisSeverity(diagnosisForm.severity),
      certainty: toDomainDiagnosisCertainty(diagnosisForm.certainty),
      status: toDomainDiagnosisStatus(diagnosisForm.status),
      evidence: toDomainEvidence(diagnosisForm.evidence),
      attachmentIds: diagnosisForm.attachmentIds,
      symptoms: diagnosisForm.symptoms,
      painLevel: diagnosisForm.painLevel,
      notes: diagnosisForm.notes,
      dentition: toDomainDentition(dentitionMode),
      providerId: activeVisit.providerId,
    });

    setDiagnosisForm({
      diagnosis: "",
      severity: "Moderate",
      certainty: "Confirmed",
      status: "Active",
      evidence: ["Visual exam"],
      attachmentIds: [],
      symptoms: [],
      painLevel: 0,
      notes: "",
    });
    setActiveSurfaces([]);
  };

  const handleStartTreatment = async (tpItem: TreatmentPlanItem) => {
    await startTreatment({
      clinicId: TREATMENT_CLINIC_ID,
      patientId: workspacePatientId,
      visitId: activeVisit.id,
      treatmentPlanItemId: tpItem.id,
      providerId: activeVisit.providerId,
    });
  };

  const handleCompleteSessionAct = async (id: string) => {
    await completeVisitProcedure({
      clinicId: TREATMENT_CLINIC_ID,
      patientId: workspacePatientId,
      visitProcedureId: id,
      providerId: activeVisit.providerId,
    });
  };

  const handleConfirmCompleteSessionAct = () => {
    if (!sessionActToComplete) return;
    void handleCompleteSessionAct(sessionActToComplete.id);
    setSessionActToComplete(null);
  };

  const changePlanStatus = (
    id: string,
    status: TreatmentStatus,
    reason = "",
  ) => {
    void changeTreatmentStatus({
      clinicId: TREATMENT_CLINIC_ID,
      treatmentPlanItemId: id,
      status: toDomainTreatmentStatus(status) as Extract<
        DomainTreatmentStatus,
        "CANCELLED" | "VOIDED" | "DECLINED"
      >,
      reason,
      providerId: activeVisit.providerId,
    });
  };

  const onDragStart = (e: React.DragEvent<HTMLDivElement>, act: DentalAct) => {
    e.dataTransfer.setData("application/json", JSON.stringify(act));
    e.dataTransfer.effectAllowed = "copy";
  };

  const onDragOverTooth = (
    e: React.DragEvent<HTMLDivElement>,
    toothNumber: number,
  ) => {
    e.preventDefault();
    setDragHoverTooth(toothNumber);
  };

  const onDragLeaveTooth = () => {
    setDragHoverTooth(null);
  };

  const onDropTooth = (
    e: React.DragEvent<HTMLDivElement>,
    toothNumber: number,
  ) => {
    e.preventDefault();
    setDragHoverTooth(null);
    const actData = e.dataTransfer.getData("application/json");
    if (actData) {
      const act = JSON.parse(actData) as DentalAct;
      setSelectedMouthRegion(null);
      setSelectedTeeth([toothNumber]);
      // Select the act in the right panel context
      setSelectedActId(act.id);
      setInspectorMode("act");
      // Reset surfaces so dentist can specify them manually
      setActiveSurfaces([]);
      setPendingDroppedAct(act);
      setSurfacePickerTooth(toothNumber);
    }
  };

  const getToothSurfaceColors = (toothNumber: number) => {
    const colors: Record<SurfaceCode, string | null> = {
      V: null,
      P: null,
      L: null,
      M: null,
      D: null,
      O: null,
      R: null,
    };

    const allEvents: Array<{
      act?: string;
      type: VisualState | "pathology";
      surfaces?: SurfaceCode[];
    }> = [
      ...diagnoses
        .filter(
          (d) =>
            d.tooth === toothNumber ||
            d.toothIds?.some((tooth) => tooth === toothNumber),
        )
        .map((d) => ({ ...d, type: "pathology" as const })),
      ...treatmentPlan
        .filter(
          (a) =>
            a.tooth === toothNumber &&
            !["cancelled", "voided", "declined"].includes(a.status),
        )
        .map((a) => ({
          ...a,
          type:
            a.status === "completed"
              ? ("completed" as const)
              : a.status === "in_progress"
                ? ("progress" as const)
                : ("planned" as const),
        })),
      ...currentSession
        .filter((a) => a.tooth === toothNumber && a.status === "in-progress")
        .map((a) => ({ ...a, type: "progress" as const })),
      ...currentSession
        .filter((a) => a.tooth === toothNumber && a.status === "completed")
        .map((a) => ({ ...a, type: "completed" as const })),
    ];

    allEvents.forEach((event) => {
      const color =
        event.type === "pathology"
          ? "#ef4444"
          : getActVisualColor(event.act, event.type);

      if (!color) return;

      // Ensure Root color inherits the status color correctly
      if (event.surfaces?.includes("R")) {
        colors.R = color;
      }

      event.surfaces?.forEach((surface) => {
        if (surface !== "R") colors[surface] = color;
      });
    });

    return colors;
  };

  const AnatomicalTooth = ({ number }: { number: number }) => {
    const isSelected = selectedTeeth.includes(number);
    const isDragHovered = dragHoverTooth === number;
    const surfaceColors = getToothSurfaceColors(number);

    // Check for structural treatment acts (Crowns, Implants, Extractions)
    const getToothModifiers = () => {
      const modifiers: {
        isExtracted: boolean;
        isImplanted: boolean;
        isCrowned: boolean;
        extColor: string;
        impColor: string;
        crownColor: string;
      } = {
        isExtracted: false,
        isImplanted: false,
        isCrowned: false,
        extColor: "",
        impColor: "",
        crownColor: "",
      };

      const allEvents: Array<{
        act: string;
        type: VisualState;
      }> = [
        ...treatmentPlan
          .filter(
            (a) =>
              a.tooth === number &&
              !["cancelled", "voided", "declined"].includes(a.status),
          )
          .map((a) => ({
            ...a,
            type:
              a.status === "completed"
                ? ("completed" as const)
                : a.status === "in_progress"
                  ? ("progress" as const)
                  : ("planned" as const),
          })),
        ...currentSession
          .filter((a) => a.tooth === number && a.status === "in-progress")
          .map((a) => ({ ...a, type: "progress" as const })),
        ...currentSession
          .filter((a) => a.tooth === number && a.status === "completed")
          .map((a) => ({ ...a, type: "completed" as const })),
      ];

      allEvents.forEach((event) => {
        const actBase = availableActs.find((a) => a.name === event.act);
        const color = getActVisualColor(event.act, event.type);
        if (!actBase || !color) return;

        if (actBase.visualType === "extraction") {
          modifiers.isExtracted = true;
          modifiers.extColor = color;
        }
        if (actBase.visualType === "implant") {
          modifiers.isImplanted = true;
          modifiers.impColor = color;
        }
        if (actBase.visualType === "crown") {
          modifiers.isCrowned = true;
          modifiers.crownColor = color;
        }
      });
      return modifiers;
    };

    const {
      isExtracted,
      isImplanted,
      isCrowned,
      extColor,
      impColor,
      crownColor,
    } = getToothModifiers();

    const isPrimaryTooth = number >= 51 && number <= 85;
    const isUpper =
      (!isPrimaryTooth && number <= 28) ||
      (isPrimaryTooth && number >= 51 && number <= 65);
    const isRight =
      (number >= 11 && number <= 18) ||
      (number >= 41 && number <= 48) ||
      (number >= 51 && number <= 55) ||
      (number >= 81 && number <= 85);

    // Determine tooth anatomy based on number
    const toothType = [
      18, 17, 16, 26, 27, 28, 38, 37, 36, 46, 47, 48, 55, 54, 64, 65, 75, 74,
      84, 85,
    ].includes(number)
      ? "molar"
      : [15, 14, 24, 25, 35, 34, 44, 45].includes(number)
        ? "premolar"
        : "anterior";

    let rootCount = 1;
    if (isUpper && toothType === "molar") rootCount = 3;
    else if (
      (!isUpper && toothType === "molar") ||
      (isUpper && [14, 24].includes(number))
    )
      rootCount = 2;

    const map: Record<
      "Top" | "Bottom" | "Left" | "Right" | "Center",
      SurfaceCode
    > = {
      Top: isUpper ? "V" : "L",
      Bottom: isUpper ? "P" : "V",
      Left: isRight ? "D" : "M",
      Right: isRight ? "M" : "D",
      Center: "O",
    };

    const getFill = (surfaceKey: keyof typeof map) =>
      surfaceColors[map[surfaceKey]] || "#ffffff";

    const rootVeinColor = surfaceColors.R || "transparent";
    const hasVein = surfaceColors.R !== null && !isImplanted; // Hide veins if there's an implant

    return (
      <div
        className="flex flex-col items-center gap-1 cursor-pointer group relative"
        title={getToothName(number)}
        aria-label={getToothName(number)}
        onClick={() => openSurfacePicker(number)}
        onDragOver={(e) => onDragOverTooth(e, number)}
        onDragLeave={onDragLeaveTooth}
        onDrop={(e) => onDropTooth(e, number)}
      >
        <span
          className={`text-xs font-bold transition-colors z-10 ${isSelected ? "text-primary" : "text-slate-500 group-hover:text-slate-800"}`}
        >
          {number}
        </span>

        <svg
          width="44"
          height="100"
          viewBox="0 0 50 100"
          className={`transition-all duration-200 ${isSelected || isDragHovered ? "scale-110 drop-shadow-xl z-20" : "hover:scale-105 drop-shadow-sm z-10"}`}
        >
          {/* Highlight aura for selection or drag hover */}
          {(isSelected || isDragHovered) && (
            <rect
              x="-5"
              y="-5"
              width="60"
              height="110"
              fill={isDragHovered ? "#fef08a" : "#e0e7ff"}
              rx="8"
              opacity="0.5"
            />
          )}

          <g
            stroke={isSelected ? "#4f46e5" : "#94a3b8"}
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          >
            {/* --- Structural Base (fades if extracted) --- */}
            <g opacity={isExtracted ? 0.3 : 1}>
              {isUpper ? (
                <>
                  {/* UPPER ROOTS OR IMPLANT */}
                  {isImplanted ? (
                    <g stroke={impColor} strokeWidth="1.5">
                      <rect
                        x="20"
                        y="15"
                        width="10"
                        height="30"
                        rx="2"
                        fill="#e2e8f0"
                      />
                      <line x1="17" y1="20" x2="33" y2="20" />
                      <line x1="17" y1="25" x2="33" y2="25" />
                      <line x1="17" y1="30" x2="33" y2="30" />
                      <line x1="17" y1="35" x2="33" y2="35" />
                      <line x1="17" y1="40" x2="33" y2="40" />
                    </g>
                  ) : (
                    <>
                      <g fill="#f8fafc">
                        {rootCount === 3 && (
                          <path d="M 12 50 C 5 25, 10 5, 15 5 C 20 5, 22 25, 25 50 M 25 50 C 25 25, 25 5, 30 5 C 35 5, 45 25, 38 50" />
                        )}
                        {rootCount === 2 && (
                          <path d="M 15 50 C 10 20, 15 5, 20 5 C 25 5, 25 20, 25 50 M 25 50 C 25 20, 25 5, 30 5 C 35 5, 40 20, 35 50" />
                        )}
                        {rootCount === 1 && (
                          <path d="M 15 50 C 15 15, 20 5, 25 5 C 30 5, 35 15, 35 50 Z" />
                        )}
                      </g>

                      {/* UPPER ROOT VEINS */}
                      {hasVein && (
                        <g
                          stroke={rootVeinColor}
                          strokeWidth="3.5"
                          fill="none"
                          opacity="0.9"
                          style={{
                            filter: `drop-shadow(0px 0px 4px ${rootVeinColor})`,
                          }}
                        >
                          {rootCount === 3 && (
                            <>
                              <path d="M 15 10 Q 18 30 20 50" />
                              <path d="M 30 10 Q 28 30 30 50" />
                            </>
                          )}
                          {rootCount === 2 && (
                            <>
                              <path d="M 20 10 Q 22 30 22 50" />
                              <path d="M 30 10 Q 28 30 28 50" />
                            </>
                          )}
                          {rootCount === 1 && <path d="M 25 10 L 25 50" />}
                        </g>
                      )}
                    </>
                  )}

                  {/* UPPER CROWN */}
                  <g transform="translate(5, 50)">
                    {isCrowned ? (
                      <path
                        d="M 0 10 C 0 -5, 40 -5, 40 10 C 40 40, 30 45, 20 45 C 10 45, 0 40, 0 10 Z"
                        fill={crownColor}
                        opacity="0.8"
                      />
                    ) : (
                      <>
                        <path
                          d="M 0 10 C 0 -5, 40 -5, 40 10 C 40 40, 30 45, 20 45 C 10 45, 0 40, 0 10 Z"
                          fill="#ffffff"
                        />
                        <path
                          d="M 5 10 Q 20 0 35 10 L 28 18 Q 20 12 12 18 Z"
                          fill={getFill("Top")}
                          className="hover:brightness-90 transition-all"
                        />
                        <path
                          d="M 5 35 Q 20 45 35 35 L 28 27 Q 20 33 12 27 Z"
                          fill={getFill("Bottom")}
                          className="hover:brightness-90 transition-all"
                        />
                        <path
                          d="M 5 10 L 12 18 Q 8 22 12 27 L 5 35 Q 0 22 5 10 Z"
                          fill={getFill("Left")}
                          className="hover:brightness-90 transition-all"
                        />
                        <path
                          d="M 35 10 L 28 18 Q 32 22 28 27 L 35 35 Q 40 22 35 10 Z"
                          fill={getFill("Right")}
                          className="hover:brightness-90 transition-all"
                        />
                        <path
                          d="M 12 18 Q 20 12 28 18 Q 32 22 28 27 Q 20 33 12 27 Q 8 22 12 18 Z"
                          fill={getFill("Center")}
                          className="hover:brightness-90 transition-all"
                        />
                      </>
                    )}
                  </g>
                </>
              ) : (
                <>
                  {/* LOWER CROWN */}
                  <g transform="translate(5, 5)">
                    {isCrowned ? (
                      <path
                        d="M 0 35 C 0 50, 40 50, 40 35 C 40 5, 30 0, 20 0 C 10 0, 0 5, 0 35 Z"
                        fill={crownColor}
                        opacity="0.8"
                      />
                    ) : (
                      <>
                        <path
                          d="M 0 35 C 0 50, 40 50, 40 35 C 40 5, 30 0, 20 0 C 10 0, 0 5, 0 35 Z"
                          fill="#ffffff"
                        />
                        <path
                          d="M 5 10 Q 20 0 35 10 L 28 18 Q 20 12 12 18 Z"
                          fill={getFill("Top")}
                          className="hover:brightness-90 transition-all"
                        />
                        <path
                          d="M 5 35 Q 20 45 35 35 L 28 27 Q 20 33 12 27 Z"
                          fill={getFill("Bottom")}
                          className="hover:brightness-90 transition-all"
                        />
                        <path
                          d="M 5 10 L 12 18 Q 8 22 12 27 L 5 35 Q 0 22 5 10 Z"
                          fill={getFill("Left")}
                          className="hover:brightness-90 transition-all"
                        />
                        <path
                          d="M 35 10 L 28 18 Q 32 22 28 27 L 35 35 Q 40 22 35 10 Z"
                          fill={getFill("Right")}
                          className="hover:brightness-90 transition-all"
                        />
                        <path
                          d="M 12 18 Q 20 12 28 18 Q 32 22 28 27 Q 20 33 12 27 Q 8 22 12 18 Z"
                          fill={getFill("Center")}
                          className="hover:brightness-90 transition-all"
                        />
                      </>
                    )}
                  </g>

                  {/* LOWER ROOTS OR IMPLANT */}
                  {isImplanted ? (
                    <g stroke={impColor} strokeWidth="1.5">
                      <rect
                        x="20"
                        y="55"
                        width="10"
                        height="30"
                        rx="2"
                        fill="#e2e8f0"
                      />
                      <line x1="17" y1="60" x2="33" y2="60" />
                      <line x1="17" y1="65" x2="33" y2="65" />
                      <line x1="17" y1="70" x2="33" y2="70" />
                      <line x1="17" y1="75" x2="33" y2="75" />
                      <line x1="17" y1="80" x2="33" y2="80" />
                    </g>
                  ) : (
                    <>
                      <g fill="#f8fafc">
                        {rootCount === 3 && (
                          <path d="M 12 50 C 5 75, 10 95, 15 95 C 20 95, 22 75, 25 50 M 25 50 C 25 75, 25 95, 30 95 C 35 95, 45 75, 38 50" />
                        )}
                        {rootCount === 2 && (
                          <path d="M 15 50 C 10 80, 15 95, 20 95 C 25 95, 25 80, 25 50 M 25 50 C 25 80, 25 95, 30 95 C 35 95, 40 80, 35 50" />
                        )}
                        {rootCount === 1 && (
                          <path d="M 15 50 C 15 85, 20 95, 25 95 C 30 95, 35 85, 35 50 Z" />
                        )}
                      </g>

                      {/* LOWER ROOT VEINS */}
                      {hasVein && (
                        <g
                          stroke={rootVeinColor}
                          strokeWidth="3.5"
                          fill="none"
                          opacity="0.9"
                          style={{
                            filter: `drop-shadow(0px 0px 4px ${rootVeinColor})`,
                          }}
                        >
                          {rootCount === 3 && (
                            <>
                              <path d="M 15 90 Q 18 70 20 50" />
                              <path d="M 30 90 Q 28 70 30 50" />
                            </>
                          )}
                          {rootCount === 2 && (
                            <>
                              <path d="M 20 90 Q 22 70 22 50" />
                              <path d="M 30 90 Q 28 70 28 50" />
                            </>
                          )}
                          {rootCount === 1 && <path d="M 25 90 L 25 50" />}
                        </g>
                      )}
                    </>
                  )}
                </>
              )}
            </g>

            {/* EXTRACTION OVERLAY X */}
            {isExtracted && (
              <g
                stroke={extColor}
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.9"
              >
                <line x1="5" y1="5" x2="45" y2="95" />
                <line x1="45" y1="5" x2="5" y2="95" />
              </g>
            )}
          </g>
        </svg>
      </div>
    );
  };

  const filteredActs = availableActs.filter((act) => {
    const query = searchTerm.toLowerCase();
    return [
      act.name,
      act.category,
      getActLabel(act.name),
      getActCategoryLabel(act.category),
    ]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });
  const pendingTreatmentChargeTotal = treatmentCharges.reduce(
    (sum, charge) => sum + charge.remainingAmount,
    0,
  );
  const totalPatientAmountDue = patient.balance + pendingTreatmentChargeTotal;

  // Get all active events for currently selected teeth
  const selectedTeethEvents: ClinicalEvent[] = (() => {
    if (selectedTeeth.length === 0) return [];

    return [
      ...diagnoses
        .filter(
          (d) =>
            (typeof d.tooth === "number" && selectedTeeth.includes(d.tooth)) ||
            d.toothIds?.some((tooth) => selectedTeeth.includes(tooth)),
        )
        .map((d) => ({
          ...d,
          type: "pathology" as const,
          label: getDiagnosisLabel(d.diagnosis),
          stateLabel: tx("eventStates.diagnosis"),
        })),
      ...treatmentPlan
        .filter(
          (a) =>
            (typeof a.tooth === "number" && selectedTeeth.includes(a.tooth)) ||
            a.toothIds?.some((tooth) => selectedTeeth.includes(tooth)),
        )
        .map((a) => ({
          ...a,
          type: "planned" as const,
          label: getActLabel(a.act),
          stateLabel: tx("eventStates.planned"),
        })),
      ...currentSession
        .filter(
          (a) =>
            (typeof a.tooth === "number" && selectedTeeth.includes(a.tooth)) ||
            a.toothIds?.some((tooth) => selectedTeeth.includes(tooth)),
        )
        .map((a) => ({
          ...a,
          type:
            a.status === "completed"
              ? ("completed" as const)
              : ("progress" as const),
          label: getActLabel(a.act),
          stateLabel:
            a.status === "completed"
              ? tx("eventStates.completed")
              : tx("eventStates.inProgress"),
        })),
    ];
  })();

  const getTreatmentToothIds = (item: TreatmentBase): number[] => {
    if (item?.toothIds?.length) return item.toothIds;
    return typeof item?.tooth === "number" ? [item.tooth] : [];
  };

  const getRelatedTreatmentDiagnoses = (item: TreatmentBase) => {
    const toothIds = getTreatmentToothIds(item);
    if (toothIds.length === 0) {
      return diagnoses.filter((diagnosis) => diagnosis.tooth === item.tooth);
    }

    return diagnoses.filter(
      (diagnosis) =>
        (typeof diagnosis.tooth === "number" &&
          toothIds.includes(diagnosis.tooth)) ||
        diagnosis.toothIds?.some((tooth) => toothIds.includes(tooth)),
    );
  };

  const getTreatmentProcedureTimeline = (item: TreatmentBase) => {
    const toothIds = getTreatmentToothIds(item);
    return [...PRIOR_VISIT_PROCEDURES, ...currentSession].filter(
      (procedure) => {
        if (procedure.treatmentPlanItemId === item.id) return true;
        if (procedure.act !== item.act || toothIds.length === 0) return false;
        if (procedure.toothIds?.some((tooth) => toothIds.includes(tooth))) {
          return true;
        }
        return (
          typeof procedure.tooth === "number" &&
          toothIds.includes(procedure.tooth)
        );
      },
    );
  };

  const getTreatmentHandoffNotes = (item: TreatmentPlanItem): VisitHandoff[] =>
    [
      ...PRIOR_VISIT_HANDOFFS,
      ...(visitHandoffRecord ? [visitHandoffRecord] : []),
    ].filter(
      (note) =>
        !note.treatmentPlanItemId || note.treatmentPlanItemId === item.id,
    );

  const getTreatmentCharge = (item: TreatmentPlanItem) =>
    treatmentCharges.find(
      (charge) =>
        charge.sourceType === "treatment_plan_item" &&
        charge.sourceId === item.id,
    );

  const getTreatmentDocumentRequests = (item: TreatmentPlanItem) =>
    documentRequests.filter(
      (request) => request.treatmentPlanItemId === item.id,
    );

  const getTreatmentFollowUpRequests = (item: TreatmentPlanItem) =>
    followUpRequests.filter(
      (request) => request.treatmentPlanItemId === item.id,
    );

  const pendingCoordinationCount =
    followUpRequests.filter((request) => request.status === "requested")
      .length +
    documentRequests.filter((request) => request.status === "requested").length;

  return (
    <div className="min-h-screen bg-page flex flex-col font-sans text-foreground">
      <TreatmentHeader
        patient={workspacePatient}
        pendingTreatmentChargeTotal={pendingTreatmentChargeTotal}
        totalPatientAmountDue={totalPatientAmountDue}
      />

      <main className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN: Chart & Tabs */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <OdontogramPanel
            chartRows={chartRows}
            dentitionLabel={dentitionLabel}
            dentitionMode={dentitionMode}
            dentitionModes={localizedDentitionModes}
            ToothComponent={AnatomicalTooth}
            labels={{
              title: tx("odontogram.title"),
              midline: tx("odontogram.midline"),
              legend: {
                filling: tx("odontogram.legend.filling"),
                rootCanal: tx("odontogram.legend.rootCanal"),
                crown: tx("odontogram.legend.crown"),
                pathology: tx("odontogram.legend.pathology"),
              },
            }}
            onDentitionModeChange={handleDentitionModeChange}
          />

          {/* Bottom Tabs Area */}
          <div className="bg-white mx-4 mb-4 flex-1 rounded-xl border border-slate-200 shadow-sm flex flex-col min-h-[300px]">
            <TreatmentTabs
              activeTab={activeTab}
              currentSessionCount={currentSession.length}
              treatmentPlanCount={treatmentPlan.length}
              onChange={setActiveTab}
            />

            <div className="flex-1 p-0 overflow-y-auto">
              {/* CURRENT SESSION TAB */}
              {activeTab === "session" && (
                <CurrentSessionPanel
                  activeVisit={activeVisit}
                  currentSession={currentSession}
                  documentRequests={documentRequests}
                  documentRequestTypes={localizedDocumentRequestTypes}
                  followUpRequests={followUpRequests}
                  pendingCoordinationCount={pendingCoordinationCount}
                  visitCodingStatus={visitCodingStatus}
                  visitHandoffNote={visitHandoffNote}
                  visitHandoffRecord={visitHandoffRecord}
                  visitLifecycleStatus={visitLifecycleStatus}
                  getTreatmentLocationLabel={getLocalizedTreatmentLocationLabel}
                  getTreatmentActLabel={getActLabel}
                  onChangeHandoffNote={setVisitHandoffNote}
                  onSaveHandoffDraft={() => saveVisitHandoffNote("draft_note")}
                  onSendToAssistant={() => setIsSendAssistantModalOpen(true)}
                  onMarkStructured={markVisitCodingComplete}
                  onCloseVisit={() => setIsCloseVisitModalOpen(true)}
                  onSetSessionActToComplete={setSessionActToComplete}
                  setVisitCodingStatus={setVisitCodingStatus}
                />
              )}

              {/* TREATMENT PLAN TAB */}
              {activeTab === "plan" && (
                <TreatmentPlanPanel
                  treatmentPlan={treatmentPlan}
                  treatmentGroups={treatmentGroups}
                  getTreatmentLocationLabel={getLocalizedTreatmentLocationLabel}
                  getTreatmentActLabel={getActLabel}
                  onStartTreatment={handleStartTreatment}
                  onOpenDetails={setTreatmentDetailsItem}
                  onChangeStatus={changePlanStatus}
                />
              )}

              {/* CLINICAL HISTORY — records are retained after cancellation or correction */}
      {activeTab === "history" && (
        <div className="p-4">
          <div className="mb-3 rounded-md border border-ui-border bg-page px-3 py-2 text-xs text-text-muted">
            {tx("history.auditTrail")}
          </div>
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">
                    {tx("history.table.location")}
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    {tx("history.table.treatment")}
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    {tx("history.table.finalStatus")}
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    {tx("history.table.reason")}
                  </th>
                </tr>
              </thead>
                      <tbody className="divide-y divide-slate-100">
                        {treatmentPlan
                          .filter((item) =>
                            [
                              "cancelled",
                              "voided",
                              "declined",
                              "completed",
                            ].includes(item.status),
                          )
                          .map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50">
                              <td className="px-4 py-3 font-bold text-slate-700">
                                {item.toothIds?.length
                                  ? getLocalizedTreatmentLocationLabel(item)
                                  : typeof item.tooth === "number"
                                    ? tx("tooth", {tooth: item.tooth})
                                    : item.tooth}
                              </td>
                              <td className="px-4 py-3">
                                <div className="font-semibold text-slate-800">
                                  {item.act}
                                </div>
                                <div className="mt-1 text-xs text-slate-500">
                                  {getLocalizedTreatmentAreaLabel(item)}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${item.status === "voided" ? "border-red-200 bg-red-50 text-red-700" : item.status === "cancelled" ? "border-amber-200 bg-amber-50 text-amber-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}
                                >
                                  {item.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-slate-500">
                                {item.statusReason ||
                                  tx("history.completedReason")}
                                <div className="mt-1 text-[11px] text-slate-400">
                                  {item.statusChangedAt
                                    ? new Date(
                                        item.statusChangedAt,
                                      ).toLocaleString()
                                    : ""}
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {}
        <div className="w-[380px] border-l border-slate-200 bg-white flex flex-col shadow-[-4px_0_15px_-10px_rgba(0,0,0,0.1)] z-10">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider">
                Context & Selection
              </h2>
            </div>

            <div className="flex gap-2 flex-wrap min-h-[32px] items-center">
              {selectedMouthRegionOption ? (
                <span className="inline-flex items-center gap-1 bg-primary text-white text-sm font-bold px-3 py-1 rounded shadow-sm">
                  {tx("selectedRegion", {region: selectedMouthRegionOption.label})}
                  <X
                    size={14}
                    className="cursor-pointer ml-1 opacity-80 hover:opacity-100"
                    onClick={() => setSelectedMouthRegion(null)}
                  />
                </span>
              ) : selectedTeeth.length > 0 ? (
                selectedTeeth.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 bg-primary-soft text-primary text-sm font-bold px-2.5 py-1 rounded border border-primary/25 shadow-sm"
                  >
                    <span>{getToothName(t)}</span>
                    <span className="border-l border-primary/25 pl-1.5 text-[11px] font-semibold">
                      {toothSurfaces[t]?.length
                        ? toothSurfaces[t].join(", ")
                        : tx("fullTooth")}
                    </span>
                    <X
                      size={14}
                      className="cursor-pointer hover:text-indigo-900 ml-1"
                      onClick={() => toggleToothSelection(t)}
                    />
                  </span>
                ))
              ) : (
                <div className="text-sm text-slate-500 italic flex items-center gap-2">
                  <Info size={16} /> {tx("selectTarget")}
                </div>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                {tx("mouthRegion")}
              </label>
              <select
                value={selectedMouthRegion || ""}
                onChange={(event) => {
                  if (event.target.value) {
                    handleSelectMouthRegion(
                      event.target.value as MouthRegionId,
                    );
                  } else {
                    setSelectedMouthRegion(null);
                  }
                }}
                className="w-full rounded-md border border-ui-border bg-white px-3 py-2 text-sm font-semibold text-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/25"
              >
                <option value="">{tx("selectMouthRegion")}</option>
                {localizedMouthRegionOptions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.label} - {region.hint}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex text-sm font-bold border-b border-slate-200 bg-slate-50">
            <button
              className={`flex-1 py-3 text-center transition-colors border-b-2 ${inspectorMode === "act" ? "text-primary border-primary bg-card" : "text-text-muted border-transparent hover:bg-surface-hover"}`}
              onClick={() => setInspectorMode("act")}
            >
              {tx("inspector.treatments")}
            </button>
            <button
              className={`flex-1 py-3 text-center transition-colors border-b-2 ${inspectorMode === "diagnosis" ? "text-primary border-primary bg-card" : "text-text-muted border-transparent hover:bg-surface-hover"}`}
              onClick={() => setInspectorMode("diagnosis")}
            >
              {tx("inspector.diagnoses")}
            </button>
            <button
              className={`flex-1 py-3 text-center transition-colors border-b-2 ${inspectorMode === "details" ? "text-primary border-primary bg-card" : "text-text-muted border-transparent hover:bg-surface-hover"}`}
              onClick={() => setInspectorMode("details")}
            >
              {tx("inspector.details")}{" "}
              <span className="ml-1 bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full text-[10px]">
                {selectedTeethEvents.length}
              </span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-white flex flex-col">
            {/* --- TREATMENTS MODE --- */}
            {inspectorMode === "act" && (
              <div className="flex flex-col h-full">
                {/* Search & List (Draggable) */}
                <div className="p-4 border-b border-slate-200 flex flex-col gap-3">
                  <div className="relative">
                    <Search
                      size={16}
                      className="absolute left-3 top-2.5 text-slate-400"
                    />
                    <input
                      type="text"
                      placeholder={tx("searchActs")}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full border border-ui-border rounded-md py-2 pl-9 pr-3 text-sm focus:ring-2 focus:ring-primary/25 focus:border-primary bg-page"
                    />
                  </div>

                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-md bg-white divide-y divide-slate-100">
                    {filteredActs.map((act) => (
                      <div
                        key={act.id}
                        draggable
                        onDragStart={(e) => onDragStart(e, act)}
                        onClick={() => setSelectedActId(act.id)}
                        className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors
                          ${selectedActId === act.id ? "bg-primary-soft border-l-4 border-primary" : "hover:bg-surface-hover border-l-4 border-transparent"}`}
                      >
                        <div className="flex items-center gap-2">
                          <GripVertical
                            size={14}
                            className="text-slate-300 cursor-grab active:cursor-grabbing"
                          />
                          <div>
                            <p
                              className={`text-sm font-semibold ${selectedActId === act.id ? "text-primary" : "text-foreground"}`}
                            >
                              {getActLabel(act.name)}
                            </p>
                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                              {getActCategoryLabel(act.category)}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm text-slate-500 font-medium">
                          ${act.price}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-400 text-center italic">
                    {tx("dragTip")}
                  </p>
                </div>

                {/* Configuration Form */}
                <div className="p-4 flex flex-col gap-5 bg-slate-50 flex-1">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {tx("priority")}
                      </label>
                      <select
                        value={actForm.priority}
                        onChange={(e) =>
                          setActForm({
                            ...actForm,
                            priority: e.target.value as Priority,
                          })
                        }
                        className="w-full border border-slate-300 rounded-md p-2 text-sm bg-white"
                      >
                        <option value="Low">{tx("priorities.Low")}</option>
                        <option value="Normal">{tx("priorities.Normal")}</option>
                        <option value="High">{tx("priorities.High")}</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={() => setPendingConfirmation(true)}
                    disabled={!selectedActId || !hasTargetSelection}
                    className="w-full mt-1 flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-md text-sm font-bold hover:bg-primary-dark transition-colors disabled:opacity-50 shadow-sm"
                  >
                    <Plus size={18} /> {tx("applyTreatmentPlan")}
                  </button>
                </div>
              </div>
            )}

            {/* --- DIAGNOSES MODE --- */}
            {inspectorMode === "diagnosis" && (
              <div className="p-4 flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {tx("selectDiagnosis")}
                  </label>
                  <select
                    value={diagnosisForm.diagnosis}
                    onChange={(e) =>
                      setDiagnosisForm({
                        ...diagnosisForm,
                        diagnosis: e.target.value,
                      })
                    }
                    className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-red-500 bg-white"
                  >
                    <option value="">{tx("choose")}</option>
                    {DIAGNOSES_CATALOG.map((d) => (
                      <option key={d} value={d}>
                        {getDiagnosisLabel(d)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {tx("diagnoses.labels.severity")}
                  </label>
                  <select
                    value={diagnosisForm.severity}
                    onChange={(e) =>
                      setDiagnosisForm({
                        ...diagnosisForm,
                        severity: e.target.value as DiagnosisSeverity,
                      })
                    }
                    className="w-full border border-slate-300 rounded-md p-2 text-sm bg-white"
                  >
                    <option value="Mild">{getSeverityLabel("Mild")}</option>
                    <option value="Moderate">
                      {getSeverityLabel("Moderate")}
                    </option>
                    <option value="Severe">{getSeverityLabel("Severe")}</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {tx("diagnoses.labels.certainty")}
                    </label>
                    <select
                      value={diagnosisForm.certainty}
                      onChange={(e) =>
                        setDiagnosisForm({
                          ...diagnosisForm,
                          certainty: e.target.value as DiagnosisCertainty,
                        })
                      }
                      className="w-full border border-slate-300 rounded-md p-2 text-sm bg-white"
                    >
                      {DIAGNOSIS_CERTAINTY_DISPLAY_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {getCertaintyLabel(option)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {tx("diagnoses.labels.status")}
                    </label>
                    <select
                      value={diagnosisForm.status}
                      onChange={(e) =>
                        setDiagnosisForm({
                          ...diagnosisForm,
                          status: e.target.value as DiagnosisStatus,
                        })
                      }
                      className="w-full border border-slate-300 rounded-md p-2 text-sm bg-white"
                    >
                      {DIAGNOSIS_STATUS_DISPLAY_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {getDiagnosisStatusLabel(option)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    {tx("diagnoses.labels.evidence")}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {DIAGNOSIS_EVIDENCE_DISPLAY_OPTIONS.map((option) => {
                      const selected = diagnosisForm.evidence.includes(option);
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => toggleDiagnosisEvidence(option)}
                          className={`rounded-md border px-3 py-2 text-left text-xs font-semibold transition ${
                            selected
                              ? "border-red-300 bg-red-50 text-red-700"
                              : "border-ui-border text-text-muted hover:bg-surface-hover"
                          }`}
                        >
                          {getEvidenceLabel(option)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {diagnosisForm.evidence.includes("X-ray") && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-slate-700">
                          {tx("diagnoses.radiology.title")}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {tx("diagnoses.radiology.description")}
                        </p>
                      </div>
                      <label className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100">
                        <Paperclip size={13} />
                        {tx("diagnoses.radiology.upload")}
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          multiple
                          onChange={handleUploadRadiologyFiles}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {clinicalAttachments.filter(
                      (attachment) => attachment.type === "radiology",
                    ).length === 0 ? (
                      <p className="rounded-md border border-dashed border-slate-300 bg-white p-2 text-xs text-slate-500">
                        {tx("diagnoses.radiology.empty")}
                      </p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {clinicalAttachments
                          .filter(
                            (attachment) => attachment.type === "radiology",
                          )
                          .map((attachment) => {
                            const selected =
                              diagnosisForm.attachmentIds.includes(
                                attachment.id,
                              );
                            return (
                              <button
                                key={attachment.id}
                                type="button"
                                onClick={() =>
                                  toggleDiagnosisAttachment(attachment.id)
                                }
                                className={`flex items-center justify-between gap-2 rounded-md border px-2.5 py-2 text-left text-xs transition ${
                                  selected
                                    ? "border-red-300 bg-red-50 text-red-700"
                                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                                }`}
                              >
                                <span className="min-w-0 truncate font-semibold">
                                  {attachment.title}
                                </span>
                                {selected && <CheckCircle size={14} />}
                              </button>
                            );
                          })}
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    {tx("diagnoses.labels.symptoms")}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {DIAGNOSIS_SYMPTOM_OPTIONS.map((symptom) => {
                      const selected = diagnosisForm.symptoms.includes(symptom);
                      return (
                        <button
                          key={symptom}
                          type="button"
                          onClick={() => toggleDiagnosisSymptom(symptom)}
                          className={`rounded-md border px-3 py-2 text-left text-xs font-semibold transition ${
                            selected
                              ? "border-red-300 bg-red-50 text-red-700"
                              : "border-ui-border text-text-muted hover:bg-surface-hover"
                          }`}
                        >
                          {getSymptomLabel(symptom)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700">
                      {tx("diagnoses.labels.painLevel")}
                    </label>
                    <span className="text-xs font-bold text-slate-500">
                      {diagnosisForm.painLevel}/10
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={diagnosisForm.painLevel}
                    onChange={(e) =>
                      setDiagnosisForm({
                        ...diagnosisForm,
                        painLevel: Number(e.target.value),
                      })
                    }
                    className="w-full accent-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {tx("diagnoses.labels.clinicalNotes")}
                  </label>
                  <textarea
                    value={diagnosisForm.notes}
                    onChange={(e) =>
                      setDiagnosisForm({
                        ...diagnosisForm,
                        notes: e.target.value,
                      })
                    }
                    rows={4}
                    placeholder={tx("diagnoses.notesPlaceholder")}
                    className="w-full resize-none border border-slate-300 rounded-md p-2 text-sm bg-white focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <button
                  onClick={handleAddDiagnosis}
                  disabled={!diagnosisForm.diagnosis || !hasTargetSelection}
                  className="w-full mt-4 flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-md text-sm font-bold hover:bg-red-700 disabled:opacity-50 shadow-md"
                >
                  <Plus size={18} /> {tx("diagnoses.record")}
                </button>
              </div>
            )}

            {/* --- DETAILS/HISTORY MODE --- */}
            {inspectorMode === "details" && (
              <div className="p-4 flex-1 bg-slate-50">
                {selectedTeeth.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center mt-10">
                    {tx("details.selectTooth")}
                  </p>
                ) : selectedTeethEvents.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center mt-10">
                    {tx("details.noRecords")}
                  </p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {selectedTeethEvents.map((ev, i) => (
                      <div
                        key={i}
                        className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-bold text-slate-800">
                            {ev.label}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider
                            ${
                              ev.type === "pathology"
                                ? "bg-red-100 text-red-700"
                                : ev.type === "planned"
                                  ? "bg-orange-100 text-orange-700"
                                  : ev.type === "completed"
                                    ? "bg-sky-100 text-sky-700"
                                    : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {ev.stateLabel}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="font-semibold text-slate-700 border border-slate-200 px-1 rounded">
                            {ev.toothIds?.length
                              ? tx("location.teeth", {
                                  teeth: ev.toothIds.join(", "),
                                })
                              : typeof ev.tooth === "number"
                                ? getToothName(ev.tooth)
                                : ev.tooth}
                          </span>
                          {(ev.surfaces?.length ?? 0) > 0 && ev.surfaces && (
                            <span>
                              {tx("details.surfaces", {
                                surfaces: ev.surfaces
                                  .map(getSurfaceLabel)
                                  .join(", "),
                              })}
                            </span>
                          )}
                        </div>
                        {ev.type === "pathology" && (
                          <div className="mt-3 space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
                            <div className="flex flex-wrap gap-1.5">
                              {ev.severity && (
                                <span className="rounded bg-red-50 px-2 py-1 font-semibold text-red-700">
                                  {getSeverityLabel(ev.severity)}
                                </span>
                              )}
                              {ev.certainty && (
                                <span className="rounded bg-slate-100 px-2 py-1 font-semibold text-slate-700">
                                  {getCertaintyLabel(ev.certainty)}
                                </span>
                              )}
                              {ev.status && (
                                <span className="rounded bg-slate-100 px-2 py-1 font-semibold text-slate-700">
                                  {getDiagnosisStatusLabel(ev.status)}
                                </span>
                              )}
                              {typeof ev.painLevel === "number" && (
                                <span className="rounded bg-slate-100 px-2 py-1 font-semibold text-slate-700">
                                  {tx("details.pain", {
                                    level: ev.painLevel,
                                  })}
                                </span>
                              )}
                            </div>
                            {(ev.evidence?.length ?? 0) > 0 && (
                              <p>
                                <strong>{tx("details.evidence")}:</strong>{" "}
                                {ev.evidence?.map(getEvidenceLabel).join(", ")}
                              </p>
                            )}
                            {(ev.attachmentIds?.length ?? 0) > 0 &&
                              ev.attachmentIds && (
                                <div>
                                  <strong>{tx("details.attachments")}:</strong>
                                  <div className="mt-1 flex flex-col gap-1">
                                    {ev.attachmentIds.map((attachmentId) => {
                                      const attachment =
                                        clinicalAttachments.find(
                                          (item) => item.id === attachmentId,
                                        );
                                      return (
                                        <span
                                          key={attachmentId}
                                          className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 font-semibold text-slate-600"
                                        >
                                          <Paperclip size={12} />
                                          {attachment?.title ||
                                            tx("details.unavailableAttachment")}
                                        </span>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            {(ev.symptoms?.length ?? 0) > 0 && ev.symptoms && (
                              <p>
                                <strong>{tx("details.symptoms")}:</strong>{" "}
                                {ev.symptoms.map(getSymptomLabel).join(", ")}
                              </p>
                            )}
                            {ev.notes && (
                              <p className="leading-relaxed">
                                <strong>{tx("details.note")}:</strong>{" "}
                                {ev.notes}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <SurfacePickerDialog
        tooth={surfacePickerTooth}
        activeSurfaces={activeSurfaces}
        pendingDroppedAct={pendingDroppedAct}
        getActLabel={getActLabel}
        onClearSurfaces={() => setActiveSurfaces([])}
        onClose={closeSurfacePicker}
        onConfirm={saveToothSurfaces}
        onToggleSurface={toggleFormSurface}
      />

      <ConfirmTreatmentDialog
        open={pendingConfirmation}
        actName={getActLabel(
          availableActs.find((act) => act.id === selectedActId)?.name ?? "",
        )}
        targetLabel={
          selectedMouthRegionOption
            ? selectedMouthRegionOption.label
            : selectedTeeth.map(getToothName).join(", ")
        }
        dentitionLabel={dentitionLabel}
        selectedMouthRegion={selectedMouthRegion}
        selectedTeeth={selectedTeeth}
        toothSurfaces={toothSurfaces}
        priority={actForm.priority}
        onCancel={() => setPendingConfirmation(false)}
        onConfirm={handleAddAct}
      />

      {/* TREATMENT DETAILS MODAL */}
      {treatmentDetailsItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/25 p-4">
          <div className="max-h-[92vh] w-[900px] max-w-[96%] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
            <div className="border-b border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
                      {tx("details.treatmentDetails")}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
                        treatmentDetailsItem.status === "completed"
                          ? "bg-emerald-100 text-emerald-800"
                          : treatmentDetailsItem.status === "in_progress"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {treatmentDetailsItem.status.replace("_", " ")}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
                        treatmentDetailsItem.chargeId
                          ? "bg-teal-100 text-teal-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {treatmentDetailsItem.chargeId
                        ? tx("details.chargePosted")
                        : tx("details.notCharged")}
                    </span>
                  </div>
                  <h3 className="truncate text-xl font-bold text-slate-900">
                    {getActLabel(treatmentDetailsItem.act)}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {getLocalizedTreatmentLocationLabel(treatmentDetailsItem)} ·{" "}
                    {getLocalizedTreatmentAreaLabel(treatmentDetailsItem)}
                  </p>
                </div>
                <button
                  onClick={() => setTreatmentDetailsItem(null)}
                  className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="max-h-[calc(92vh-178px)] overflow-y-auto bg-slate-50 p-5">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    {tx("details.clinicalStatus")}
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {translate(
                      `statuses.${treatmentDetailsItem.status}`,
                      treatmentDetailsItem.status.replace("_", " "),
                      undefined,
                      tp,
                    )}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    {tx("details.price")}
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-800">
                    ${treatmentDetailsItem.price.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    {tx("details.priority")}
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {getPriorityLabel(treatmentDetailsItem.priority)}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    {tx("details.billing")}
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {treatmentDetailsItem.chargeId
                      ? tx("details.chargePosted")
                      : tx("details.notCharged")}
                  </p>
                </div>
              </div>

              {(getTreatmentDocumentRequests(treatmentDetailsItem).length > 0 ||
                getTreatmentFollowUpRequests(treatmentDetailsItem).length >
                  0) && (
                <section className="mt-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h4 className="text-sm font-bold text-slate-800">
                      {tx("details.linkedRequests")}
                    </h4>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                      {getTreatmentDocumentRequests(treatmentDetailsItem)
                        .length +
                        getTreatmentFollowUpRequests(treatmentDetailsItem)
                          .length}
                    </span>
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    {getTreatmentDocumentRequests(treatmentDetailsItem).map(
                      (request) => (
                        <div
                          key={request.id}
                          className="rounded-md border border-violet-200 bg-violet-50 p-3 text-xs text-violet-800"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="flex items-center gap-2 font-bold">
                              <FileText size={14} />
                              {localizedDocumentRequestTypes.find(
                                (type) => type.id === request.type,
                              )?.label || tx("details.document")}
                            </span>
                            <span className="rounded-full bg-white px-2 py-0.5 font-bold">
                              {request.status}
                            </span>
                          </div>
                          {request.reason && (
                            <p className="mt-2 text-violet-700">
                              {request.reason}
                            </p>
                          )}
                        </div>
                      ),
                    )}
                    {getTreatmentFollowUpRequests(treatmentDetailsItem).map(
                      (request) => (
                        <div
                          key={request.id}
                          className="rounded-md border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="flex items-center gap-2 font-bold">
                              <Calendar size={14} />
                              {tx("details.followUp")}
                            </span>
                            <span className="rounded-full bg-white px-2 py-0.5 font-bold">
                              {request.urgency}
                            </span>
                          </div>
                          <p className="mt-2 text-blue-700">
                            {request.preferredDate || tx("details.noDate")}
                            {request.reason ? ` · ${request.reason}` : ""}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                </section>
              )}

              {getTreatmentCharge(treatmentDetailsItem) && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-teal-200 bg-teal-50 p-4 text-sm text-teal-800">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-teal-700">
                      <CreditCard size={18} />
                    </div>
                    <div>
                      <p className="font-bold">
                        {tx("details.postedCashierCharge")}
                      </p>
                      <p className="mt-0.5 text-xs font-semibold text-teal-700">
                        {tx("details.cashierWorkflow")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold">
                      $
                      {getTreatmentCharge(
                        treatmentDetailsItem,
                      )?.originalAmount.toFixed(2)}
                    </p>
                    <p className="text-xs font-semibold text-teal-700">
                      $
                      {getTreatmentCharge(
                        treatmentDetailsItem,
                      )?.remainingAmount.toFixed(2)}{" "}
                      {tx("details.remaining")}
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-sm font-bold text-slate-800">
                      {tx("details.relatedDiagnoses")}
                    </h4>
                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-700">
                      {
                        getRelatedTreatmentDiagnoses(treatmentDetailsItem)
                          .length
                      }
                    </span>
                  </div>
                  <div className="mt-3 flex flex-col gap-2">
                    {getRelatedTreatmentDiagnoses(treatmentDetailsItem)
                      .length === 0 ? (
                      <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-500">
                        {tx("details.noLinkedDiagnosis")}
                      </p>
                    ) : (
                      getRelatedTreatmentDiagnoses(treatmentDetailsItem).map(
                        (diagnosis) => (
                          <div
                            key={diagnosis.id}
                            className="rounded-md border border-slate-200 bg-white p-3 text-sm shadow-sm"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-bold text-slate-800">
                                {getDiagnosisLabel(diagnosis.diagnosis)}
                              </p>
                              <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-700">
                                {getSeverityLabel(diagnosis.severity)}
                              </span>
                            </div>
                            <p className="mt-2 text-xs text-slate-500">
                              <span className="font-bold text-slate-600">
                                {tx("details.evidence")}:
                              </span>{" "}
                              {Array.isArray(diagnosis.evidence)
                                ? diagnosis.evidence
                                    .map(getEvidenceLabel)
                                    .join(", ")
                                : diagnosis.evidence
                                  ? getEvidenceLabel(diagnosis.evidence)
                                  : tx("details.notSpecified")}
                            </p>
                            {diagnosis.notes && (
                              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                                {diagnosis.notes}
                              </p>
                            )}
                          </div>
                        ),
                      )
                    )}
                  </div>
                </section>

                <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-sm font-bold text-slate-800">
                      {tx("details.visitNotes")}
                    </h4>
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                      {getTreatmentHandoffNotes(treatmentDetailsItem).length}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-col gap-2">
                    {getTreatmentHandoffNotes(treatmentDetailsItem).length ===
                    0 ? (
                      <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-500">
                        {tx("details.noHandoff")}
                      </p>
                    ) : (
                      getTreatmentHandoffNotes(treatmentDetailsItem).map(
                        (note) => (
                          <div
                            key={note.id}
                            className="rounded-md border border-slate-200 bg-white p-3 shadow-sm"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                {note.visitId}
                              </span>
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                                {note.status}
                              </span>
                            </div>
                            <p className="mt-1 text-sm leading-relaxed text-slate-700">
                              {note.text}
                            </p>
                          </div>
                        ),
                      )
                    )}
                  </div>
                </section>
              </div>

              <section className="mt-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-bold text-slate-800">
                    {tx("details.procedureTimeline")}
                  </h4>
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                    {getTreatmentProcedureTimeline(treatmentDetailsItem).length}
                  </span>
                </div>
                <div className="mt-4">
                  {getTreatmentProcedureTimeline(treatmentDetailsItem)
                    .length === 0 ? (
                    <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-500">
                      {tx("details.noClinicalSessions")}
                    </p>
                  ) : (
                    <div className="relative ml-2 border-l border-slate-200 pl-5">
                      {getTreatmentProcedureTimeline(treatmentDetailsItem).map(
                        (procedure) => (
                          <div
                            key={procedure.id}
                            className="relative pb-5 last:pb-0"
                          >
                            <div
                              className={`absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-white ${
                                procedure.status === "completed"
                                  ? "bg-sky-500"
                                  : "bg-blue-500"
                              }`}
                            />
                            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-bold text-slate-800">
                                    {procedure.action
                                      ? getProcedureStatusLabel(
                                          procedure.action,
                                        )
                                      : getProcedureStatusLabel(
                                          procedure.status,
                                        )}
                                  </p>
                                  <p className="mt-1 text-xs font-semibold text-slate-500">
                                    {procedure.visitId} ·{" "}
                                    {procedure.performedAt
                                      ? new Date(
                                          procedure.performedAt,
                                        ).toLocaleString()
                                      : tx("details.timeNotRecorded")}
                                  </p>
                                </div>
                                <span
                                  className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                                    procedure.status === "completed"
                                      ? "bg-sky-100 text-sky-700"
                                      : "bg-blue-100 text-blue-700"
                                  }`}
                                >
                                  {getProcedureStatusLabel(procedure.status)}
                                </span>
                              </div>
                              {procedure.notes && (
                                <p className="mt-3 rounded-md bg-white p-2 text-sm leading-relaxed text-slate-700">
                                  {procedure.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </div>
              </section>

              <div className="sticky bottom-0 -mx-5 -mb-5 mt-5 flex justify-end gap-3 border-t border-slate-200 bg-white px-5 py-4">
                <button
                  onClick={() => setTreatmentDetailsItem(null)}
                  className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"
                >
                  {tx("details.close")}
                </button>
                {!["completed", "cancelled", "voided", "declined"].includes(
                  treatmentDetailsItem.status,
                ) && (
                  <button
                    onClick={() => {
                      handleStartTreatment(treatmentDetailsItem);
                      setTreatmentDetailsItem(null);
                    }}
                    className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-primary-dark"
                  >
                    <Play size={16} fill="currentColor" />
                    {treatmentDetailsItem.status === "in_progress"
                      ? tx("details.continueTreatment")
                      : tx("details.startTreatment")}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <CompleteSessionActDialog
        procedure={sessionActToComplete}
        getActLabel={getActLabel}
        getLocationLabel={getLocalizedTreatmentLocationLabel}
        getAreaLabel={getLocalizedTreatmentAreaLabel}
        onCancel={() => setSessionActToComplete(null)}
        onConfirm={handleConfirmCompleteSessionAct}
      />

      {/* SEND TO ASSISTANT CONFIRMATION */}
      {isSendAssistantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/25 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-[440px] max-w-[90%] border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
                <FileText size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                {tx("dialogs.sendAssistant.title")}
              </h3>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 text-sm text-slate-700">
              <p className="font-semibold text-slate-800">
                {tx("dialogs.sendAssistant.summary")}
              </p>
              <p className="mt-2 text-slate-500">
                {tx("dialogs.sendAssistant.description")}
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsSendAssistantModalOpen(false)}
                className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition-colors"
              >
                {tx("dialogs.sendAssistant.cancel")}
              </button>
              <button
                onClick={confirmSendToAssistant}
                className="px-4 py-2 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-md transition-colors shadow-sm flex items-center gap-2"
              >
                <FileText size={16} /> {tx("dialogs.sendAssistant.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLOSE VISIT CONFIRMATION */}
      {isCloseVisitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/25 p-4">
          <div className="max-h-[92vh] w-[620px] max-w-[96%] overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                <CheckCircle size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                {tx("dialogs.closeVisit.title")}
              </h3>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 text-sm text-slate-700">
              <p className="font-semibold text-slate-800">
                {tx("dialogs.closeVisit.summary")}
              </p>
              <p className="mt-2 text-slate-500">
                {tx("dialogs.closeVisit.description")}
              </p>
            </div>

            <div className="mb-6 grid gap-3">
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={closeVisitNextSteps.followUpNeeded}
                    onChange={(event) =>
                      setCloseVisitNextSteps((prev) => ({
                        ...prev,
                        followUpNeeded: event.target.checked,
                      }))
                    }
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                      <Calendar size={16} className="text-blue-600" />
                      {tx("dialogs.closeVisit.followUp.title")}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {tx("dialogs.closeVisit.followUp.description")}
                    </p>
                  </div>
                </label>

                {closeVisitNextSteps.followUpNeeded && (
                  <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-bold text-slate-600">
                          {tx("dialogs.closeVisit.followUp.preferredDate")}
                        </label>
                        <input
                          type="date"
                          value={closeVisitNextSteps.followUpDate}
                          onChange={(event) =>
                            setCloseVisitNextSteps((prev) => ({
                              ...prev,
                              followUpDate: event.target.value,
                            }))
                          }
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-bold text-slate-600">
                          {tx("dialogs.closeVisit.followUp.urgency")}
                        </label>
                        <select
                          value={closeVisitNextSteps.followUpUrgency}
                          onChange={(event) =>
                            setCloseVisitNextSteps((prev) => ({
                              ...prev,
                              followUpUrgency: event.target
                                .value as FollowUpUrgency,
                            }))
                          }
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                        >
                          <option value="Routine">
                            {tx("dialogs.closeVisit.followUp.urgencies.Routine")}
                          </option>
                          <option value="Soon">
                            {tx("dialogs.closeVisit.followUp.urgencies.Soon")}
                          </option>
                          <option value="Urgent">
                            {tx("dialogs.closeVisit.followUp.urgencies.Urgent")}
                          </option>
                        </select>
                      </div>
                    </div>
                    <textarea
                      value={closeVisitNextSteps.followUpReason}
                      onChange={(event) =>
                        setCloseVisitNextSteps((prev) => ({
                          ...prev,
                          followUpReason: event.target.value,
                        }))
                      }
                      rows={2}
                      placeholder={tx("dialogs.closeVisit.followUp.reason")}
                      className="w-full resize-none rounded-md border border-slate-300 bg-slate-50 p-3 text-sm text-slate-700"
                    />
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={closeVisitNextSteps.documentNeeded}
                    onChange={(event) =>
                      setCloseVisitNextSteps((prev) => ({
                        ...prev,
                        documentNeeded: event.target.checked,
                      }))
                    }
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                      <Pill size={16} className="text-violet-600" />
                      {tx("dialogs.closeVisit.document.title")}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {tx("dialogs.closeVisit.document.description")}
                    </p>
                  </div>
                </label>

                {closeVisitNextSteps.documentNeeded && (
                  <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-bold text-slate-600">
                          {tx("dialogs.closeVisit.document.documentType")}
                        </label>
                        <select
                          value={closeVisitNextSteps.documentType}
                          onChange={(event) =>
                            setCloseVisitNextSteps((prev) => ({
                              ...prev,
                              documentType: event.target
                                .value as DocumentRequestTypeId,
                            }))
                          }
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                        >
                          {localizedDocumentRequestTypes.map((type) => (
                            <option key={type.id} value={type.id}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-bold text-slate-600">
                          {tx("dialogs.closeVisit.document.linkToTreatment")}
                        </label>
                        <select
                          value={closeVisitNextSteps.linkedTreatmentId}
                          onChange={(event) =>
                            setCloseVisitNextSteps((prev) => ({
                              ...prev,
                              linkedTreatmentId: event.target.value,
                            }))
                          }
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                        >
                          <option value="">
                            {tx("dialogs.closeVisit.document.visitLevel")}
                          </option>
                          {treatmentPlan
                            .filter((item) =>
                              ["proposed", "accepted", "in_progress"].includes(
                                item.status,
                              ),
                            )
                            .map((item) => (
                              <option key={item.id} value={item.id}>
                                {getActLabel(item.act)} ·{" "}
                                {getLocalizedTreatmentLocationLabel(item)}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                    <textarea
                      value={closeVisitNextSteps.documentReason}
                      onChange={(event) =>
                        setCloseVisitNextSteps((prev) => ({
                          ...prev,
                          documentReason: event.target.value,
                        }))
                      }
                      rows={2}
                      placeholder={tx("dialogs.closeVisit.document.reason")}
                      className="w-full resize-none rounded-md border border-slate-300 bg-slate-50 p-3 text-sm text-slate-700"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsCloseVisitModalOpen(false)}
                className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition-colors"
              >
                {tx("dialogs.closeVisit.cancel")}
              </button>
              <button
                onClick={confirmCloseVisit}
                className="px-4 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors shadow-sm flex items-center gap-2"
              >
                <CheckCircle size={16} /> {tx("dialogs.closeVisit.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
