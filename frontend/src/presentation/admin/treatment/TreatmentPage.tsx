"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  FileText,
  History,
  Paperclip,
  Pill,
  Play,
  Plus,
  Printer,
  Save,
  Search,
  Stethoscope,
  X,
  Activity,
  GripVertical,
  Info,
} from "lucide-react";

type SurfaceCode = "V" | "P" | "L" | "M" | "D" | "O" | "R";
type VisualState = "planned" | "progress" | "completed";
type VisualType = "extraction" | "implant" | "crown";
type DentitionMode = "adult" | "child" | "mixed";
type InspectorMode = "act" | "diagnosis" | "details";
type Priority = "Low" | "Normal" | "High";
type TreatmentStatus =
  | "proposed"
  | "accepted"
  | "scheduled"
  | "in_progress"
  | "completed"
  | "declined"
  | "cancelled"
  | "voided";
type ProcedureStatus = "in-progress" | "completed";
type BillingStatus = "not_charged" | "charged";
type VisitCodingStatus = "structured" | "draft_note" | "needs_coding" | "coded";
type VisitLifecycleStatus = "open" | "needs_coding" | "closed";
type DiagnosisCertainty = "Suspected" | "Confirmed" | "Ruled out";
type DiagnosisStatus = "Active" | "Resolved" | "Monitoring";
type DiagnosisSeverity = "Mild" | "Moderate" | "Severe";
type DocumentRequestTypeId =
  | "prescription"
  | "medical_certificate"
  | "clinical_report";
type RequestStatus = "requested";
type FollowUpUrgency = "Routine" | "Soon" | "Urgent";

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  alerts: string[];
  balance: number;
}

interface DentalAct {
  id: string;
  name: string;
  category: string;
  price: number;
  groupableTeeth?: boolean;
  visualType?: VisualType;
}

interface ActVisualStyle {
  affectsTooth: boolean;
  colors?: Partial<Record<VisualState, string>>;
}

interface MouthRegionOption {
  id: MouthRegionId;
  label: string;
  hint: string;
}

interface DentitionModeOption {
  id: DentitionMode;
  label: string;
}

interface ActiveVisit {
  id: string;
  patientId: string;
  chairId: string;
  providerId: string;
  status: "open";
  startedAt: string;
}

interface TreatmentBase {
  id: string;
  tooth: number | string;
  toothIds?: number[];
  surfaces: SurfaceCode[];
  surfacesByTooth?: Record<number, SurfaceCode[]>;
  act: string;
  price: number;
  notes?: string;
  date?: string;
  treatmentGroupId?: string | null;
  isGroupedTeeth?: boolean;
  dentition?: DentitionMode;
}

interface TreatmentPlanItem extends TreatmentBase {
  status: TreatmentStatus;
  priority: Priority;
  estimatedVisits: number;
  completedVisits: number;
  visitProcedureIds: string[];
  createdAt: string;
  createdBy: string;
  startedAt?: string;
  billingStatus?: BillingStatus;
  chargeId?: string;
  statusReason?: string;
  statusChangedAt?: string;
  statusChangedBy?: string;
}

interface VisitProcedure extends TreatmentBase {
  status: ProcedureStatus;
  visitId: string;
  treatmentPlanItemId: string;
  action: "started" | "continued" | "completed";
  performedAt: string;
  providerId: string;
  priority?: Priority;
  completedAt?: string;
}

interface Diagnosis {
  id: string;
  tooth: number | string;
  toothIds?: number[];
  surfaces: SurfaceCode[];
  surfacesByTooth?: Record<number, SurfaceCode[]>;
  diagnosis: string;
  severity: DiagnosisSeverity;
  certainty?: DiagnosisCertainty;
  status?: DiagnosisStatus;
  evidence?: string[];
  attachmentIds?: string[];
  symptoms?: string[];
  painLevel?: number;
  notes?: string;
  date: string;
  dentition?: DentitionMode;
  isGroupedTeeth?: boolean;
}

interface ClinicalAttachment {
  id: string;
  type: "radiology";
  title: string;
  fileName: string;
  fileUrl: string;
  visitId: string;
  uploadedAt: string;
  uploadedBy: string;
}

interface VisitHandoff {
  id: string;
  visitId: string;
  patientId: string;
  treatmentPlanItemId?: string;
  text: string;
  status: VisitCodingStatus;
  authoredBy: string;
  savedAt: string;
  codedAt?: string;
  codedBy?: string;
}

interface TreatmentGroup {
  id: string;
  patientId: string;
  label: string;
  act: string;
  toothIds: number[];
  billingMode: "package" | "per_item";
  createdAt: string;
  createdBy: string;
}

interface TreatmentCharge {
  id: string;
  patientId: string;
  visitId: string;
  sourceType: "treatment_plan_item";
  sourceId: string;
  label: string;
  location: string;
  originalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: "unpaid";
  createdAt: string;
  createdBy: string;
}

interface FollowUpRequest {
  id: string;
  patientId: string;
  visitId: string;
  treatmentPlanItemId: string;
  reason: string;
  preferredDate: string;
  urgency: FollowUpUrgency;
  status: RequestStatus;
  requestedAt: string;
  requestedBy: string;
}

interface DocumentRequest {
  id: string;
  patientId: string;
  visitId: string;
  treatmentPlanItemId: string;
  type: DocumentRequestTypeId;
  reason: string;
  status: RequestStatus;
  source: "visit_close";
  requestedAt: string;
  requestedBy: string;
}

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

const PATIENT: Patient = {
  id: "PT-88392",
  name: "Sarah Connor",
  age: 34,
  gender: "Female",
  phone: "+212 600 123456",
  alerts: ["Penicillin Allergy", "Asthma (Mild)"],
  balance: 150.0,
};

// Comprehensive list of professional dental acts
const EXTENDED_ACTS: DentalAct[] = [
  { id: "a1", name: "Consultation", category: "General", price: 50 },
  { id: "a2", name: "Panoramic X-Ray", category: "Radiography", price: 80 },
  {
    id: "a3",
    name: "Scaling and Polishing",
    category: "Preventive",
    price: 120,
    groupableTeeth: true,
  },
  {
    id: "a4",
    name: "Fluoride Treatment",
    category: "Preventive",
    price: 60,
    groupableTeeth: true,
  },
  {
    id: "a5",
    name: "Composite Filling (1 Surface)",
    category: "Restorative",
    price: 80,
  },
  {
    id: "a6",
    name: "Composite Filling (2 Surfaces)",
    category: "Restorative",
    price: 120,
  },
  {
    id: "a7",
    name: "Composite Filling (3+ Surfaces)",
    category: "Restorative",
    price: 160,
  },
  {
    id: "a8",
    name: "Root Canal Treatment (Anterior)",
    category: "Endodontics",
    price: 250,
  },
  {
    id: "a9",
    name: "Root Canal Treatment (Premolar)",
    category: "Endodontics",
    price: 350,
  },
  {
    id: "a10",
    name: "Root Canal Treatment (Molar)",
    category: "Endodontics",
    price: 450,
  },
  {
    id: "a11",
    name: "Simple Extraction",
    category: "Surgery",
    price: 100,
    visualType: "extraction",
  },
  {
    id: "a12",
    name: "Surgical Extraction",
    category: "Surgery",
    price: 250,
    visualType: "extraction",
  },
  {
    id: "a13",
    name: "Wisdom Tooth Extraction",
    category: "Surgery",
    price: 350,
    visualType: "extraction",
  },
  {
    id: "a14",
    name: "Ceramic Crown",
    category: "Prosthetics",
    price: 600,
    visualType: "crown",
  },
  {
    id: "a15",
    name: "Zirconia Crown",
    category: "Prosthetics",
    price: 800,
    visualType: "crown",
  },
  {
    id: "a16",
    name: "Temporary Crown",
    category: "Prosthetics",
    price: 150,
    visualType: "crown",
  },
  {
    id: "a17",
    name: "Dental Implant Placement",
    category: "Surgery",
    price: 1200,
    visualType: "implant",
  },
  { id: "a18", name: "Bone Grafting", category: "Surgery", price: 400 },
  {
    id: "a19",
    name: "Teeth Whitening (In-Office)",
    category: "Aesthetic",
    price: 300,
    groupableTeeth: true,
  },
  {
    id: "a20",
    name: "Orthodontic Consultation",
    category: "Orthodontics",
    price: 80,
  },
];

const ACT_VISUAL_STYLES: Record<string, ActVisualStyle> = {
  Consultation: { affectsTooth: false },
  "Panoramic X-Ray": { affectsTooth: false },
  "Scaling and Polishing": { affectsTooth: false },
  "Fluoride Treatment": { affectsTooth: false },
  "Teeth Whitening (In-Office)": { affectsTooth: false },
  "Orthodontic Consultation": { affectsTooth: false },
  "Bone Grafting": {
    affectsTooth: true,
    colors: {
      planned: "#c084fc",
      progress: "#a855f7",
      completed: "#7e22ce",
    },
  },
  "Composite Filling (1 Surface)": {
    affectsTooth: true,
    colors: {
      planned: "#22c55e",
      progress: "#16a34a",
      completed: "#15803d",
    },
  },
  "Composite Filling (2 Surfaces)": {
    affectsTooth: true,
    colors: {
      planned: "#14b8a6",
      progress: "#0d9488",
      completed: "#0f766e",
    },
  },
  "Composite Filling (3+ Surfaces)": {
    affectsTooth: true,
    colors: {
      planned: "#06b6d4",
      progress: "#0891b2",
      completed: "#0e7490",
    },
  },
  "Root Canal Treatment (Anterior)": {
    affectsTooth: true,
    colors: {
      planned: "#f59e0b",
      progress: "#d97706",
      completed: "#b45309",
    },
  },
  "Root Canal Treatment (Premolar)": {
    affectsTooth: true,
    colors: {
      planned: "#f97316",
      progress: "#ea580c",
      completed: "#c2410c",
    },
  },
  "Root Canal Treatment (Molar)": {
    affectsTooth: true,
    colors: {
      planned: "#fb7185",
      progress: "#e11d48",
      completed: "#be123c",
    },
  },
  "Simple Extraction": {
    affectsTooth: true,
    colors: {
      planned: "#ef4444",
      progress: "#dc2626",
      completed: "#991b1b",
    },
  },
  "Surgical Extraction": {
    affectsTooth: true,
    colors: {
      planned: "#f43f5e",
      progress: "#e11d48",
      completed: "#9f1239",
    },
  },
  "Wisdom Tooth Extraction": {
    affectsTooth: true,
    colors: {
      planned: "#d946ef",
      progress: "#c026d3",
      completed: "#86198f",
    },
  },
  "Ceramic Crown": {
    affectsTooth: true,
    colors: {
      planned: "#eab308",
      progress: "#ca8a04",
      completed: "#a16207",
    },
  },
  "Zirconia Crown": {
    affectsTooth: true,
    colors: {
      planned: "#84cc16",
      progress: "#65a30d",
      completed: "#4d7c0f",
    },
  },
  "Temporary Crown": {
    affectsTooth: true,
    colors: {
      planned: "#facc15",
      progress: "#eab308",
      completed: "#a16207",
    },
  },
  "Dental Implant Placement": {
    affectsTooth: true,
    colors: {
      planned: "#38bdf8",
      progress: "#0284c7",
      completed: "#0369a1",
    },
  },
};

const getActVisualStyle = (actName: string): ActVisualStyle =>
  ACT_VISUAL_STYLES[actName] ?? { affectsTooth: true };

const getActVisualColor = (
  actName: string | undefined,
  state: VisualState,
): string | null => {
  if (!actName) return null;
  const visualStyle = getActVisualStyle(actName);
  if (!visualStyle.affectsTooth) return null;

  return (
    visualStyle.colors?.[state] ||
    {
      planned: "#64748b",
      progress: "#475569",
      completed: "#334155",
    }[state] ||
    "#64748b"
  );
};

const getTreatmentLocationLabel = (
  item: Pick<TreatmentBase, "tooth" | "toothIds">,
): string =>
  item.toothIds?.length
    ? `Teeth ${item.toothIds.join(", ")}`
    : String(item.tooth);

const getTreatmentAreaLabel = (
  item: Pick<TreatmentBase, "surfaces" | "toothIds">,
): string => {
  if (item.surfaces?.length) return item.surfaces.join(", ");
  if (item.toothIds?.length) return "Full selected teeth";
  return "Full tooth";
};

const DIAGNOSES_CATALOG: string[] = [
  "Dental Caries",
  "Pulpitis",
  "Gingivitis",
  "Periodontitis",
  "Fractured Tooth",
  "Impacted Tooth",
  "Abscess",
  "Bone Loss",
];

const DIAGNOSIS_CERTAINTY_OPTIONS: DiagnosisCertainty[] = [
  "Suspected",
  "Confirmed",
  "Ruled out",
];
const DIAGNOSIS_STATUS_OPTIONS: DiagnosisStatus[] = [
  "Active",
  "Resolved",
  "Monitoring",
];
const DIAGNOSIS_EVIDENCE_OPTIONS: string[] = [
  "Visual exam",
  "X-ray",
  "Percussion test",
  "Cold test",
  "Periodontal probing",
];
const DIAGNOSIS_SYMPTOM_OPTIONS: string[] = [
  "Pain",
  "Sensitivity",
  "Swelling",
  "Bleeding",
  "Mobility",
];

// FDI Notation for Adult Teeth
const UPPER_RIGHT: number[] = [18, 17, 16, 15, 14, 13, 12, 11];
const UPPER_LEFT: number[] = [21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_RIGHT: number[] = [48, 47, 46, 45, 44, 43, 42, 41];
const LOWER_LEFT: number[] = [31, 32, 33, 34, 35, 36, 37, 38];

// FDI Notation for Primary Teeth
const PRIMARY_UPPER_RIGHT: number[] = [55, 54, 53, 52, 51];
const PRIMARY_UPPER_LEFT: number[] = [61, 62, 63, 64, 65];
const PRIMARY_LOWER_RIGHT: number[] = [85, 84, 83, 82, 81];
const PRIMARY_LOWER_LEFT: number[] = [71, 72, 73, 74, 75];

const DENTITION_MODES: DentitionModeOption[] = [
  { id: "adult", label: "Adult" },
  { id: "child", label: "Child" },
  { id: "mixed", label: "Mixed" },
];

const MOUTH_REGION_OPTIONS: MouthRegionOption[] = [
  { id: "whole_mouth", label: "Whole Mouth", hint: "All teeth" },
  { id: "upper_arch", label: "Upper Arch", hint: "Top side" },
  { id: "lower_arch", label: "Lower Arch", hint: "Bottom side" },
  { id: "upper_right", label: "Upper Right", hint: "Quadrant 1" },
  { id: "upper_left", label: "Upper Left", hint: "Quadrant 2" },
  { id: "lower_left", label: "Lower Left", hint: "Quadrant 3" },
  { id: "lower_right", label: "Lower Right", hint: "Quadrant 4" },
];

// Local contracts mirror the API entities that will replace this state later.
// A treatment plan item survives across visits; a visit procedure records one
// concrete clinical step carried out during the active encounter.
const ACTIVE_VISIT: ActiveVisit = {
  id: "visit_2026_06_23_001",
  patientId: PATIENT.id,
  chairId: "chair_01",
  providerId: "provider_current",
  status: "open",
  startedAt: "2026-06-23T09:30:00.000Z",
};

const PRIOR_VISIT_PROCEDURES: VisitProcedure[] = [
  {
    id: "vp_prev_rct_16_1",
    tooth: 16,
    act: "Root Canal Treatment (Molar)",
    surfaces: ["R"],
    status: "completed",
    price: 450,
    notes:
      "Access opened, canals located and irrigated. Calcium hydroxide placed. Temporary filling.",
    visitId: "visit_2026_06_22_001",
    treatmentPlanItemId: "tp_1",
    action: "started",
    performedAt: "2026-06-22T10:35:00.000Z",
    providerId: "provider_current",
  },
];

const PRIOR_VISIT_HANDOFFS: VisitHandoff[] = [
  {
    id: "handoff_visit_2026_06_22_001",
    visitId: "visit_2026_06_22_001",
    patientId: PATIENT.id,
    treatmentPlanItemId: "tp_1",
    text: "RCT started on 16. Patient tolerated anesthesia. Continue canal shaping next visit and check symptoms.",
    status: "coded",
    authoredBy: "provider_current",
    savedAt: "2026-06-22T10:40:00.000Z",
  },
];

const DOCUMENT_REQUEST_TYPES: Array<{
  id: DocumentRequestTypeId;
  label: string;
}> = [
  { id: "prescription", label: "Prescription" },
  { id: "medical_certificate", label: "Medical certificate" },
  { id: "clinical_report", label: "Clinical report" },
];

export default function TreatmentPage() {
  const router = useRouter();
  const params = useParams();
  const rawLocale = params?.locale;
  const locale = Array.isArray(rawLocale) ? rawLocale[0] : rawLocale || "en";
  const waitingRoomPath = `/${locale}/admin/waiting-room`;
  const [activeTab, setActiveTab] = useState<"session" | "plan" | "history">(
    "session",
  );
  const [dentitionMode, setDentitionMode] = useState<DentitionMode>("adult");

  // Selection State
  const [selectedTeeth, setSelectedTeeth] = useState<number[]>([]);
  const [selectedMouthRegion, setSelectedMouthRegion] =
    useState<MouthRegionId | null>(null);
  const [dragHoverTooth, setDragHoverTooth] = useState<number | null>(null);

  // Treatment Data State
  const [treatmentPlan, setTreatmentPlan] = useState<TreatmentPlanItem[]>([
    {
      id: "tp_1",
      tooth: 16,
      act: "Root Canal Treatment (Molar)",
      surfaces: ["R"],
      priority: "High",
      price: 450,
      date: "2026-06-22",
      estimatedVisits: 3,
      completedVisits: 1,
      visitProcedureIds: ["vp_prev_rct_16_1"],
      createdAt: "2026-06-22T10:00:00.000Z",
      createdBy: "provider_current",
      startedAt: "2026-06-22T10:05:00.000Z",
      status: "in_progress",
      billingStatus: "charged",
      chargeId: "charge_tp_1",
    },
    {
      id: "tp_2",
      tooth: 16,
      act: "Ceramic Crown",
      surfaces: ["V", "L", "M", "D", "O"],
      status: "accepted",
      priority: "Normal",
      price: 600,
      date: "2026-06-22",
      estimatedVisits: 2,
      completedVisits: 0,
      visitProcedureIds: [],
      createdAt: "2026-06-22T10:00:00.000Z",
      createdBy: "provider_current",
      billingStatus: "not_charged",
    },
  ]);
  const [treatmentGroups, setTreatmentGroups] = useState<TreatmentGroup[]>([]);
  const [treatmentCharges, setTreatmentCharges] = useState<TreatmentCharge[]>([
    {
      id: "charge_tp_1",
      patientId: PATIENT.id,
      visitId: "visit_2026_06_22_001",
      sourceType: "treatment_plan_item",
      sourceId: "tp_1",
      label: "Root Canal Treatment (Molar)",
      location: "16",
      originalAmount: 450,
      paidAmount: 0,
      remainingAmount: 450,
      status: "unpaid",
      createdAt: "2026-06-22T10:05:00.000Z",
      createdBy: ACTIVE_VISIT.providerId,
    },
  ]);

  const [currentSession, setCurrentSession] = useState<VisitProcedure[]>([
    {
      id: "cs_1",
      tooth: 45,
      act: "Composite Filling (1 Surface)",
      surfaces: ["O"],
      status: "completed",
      price: 80,
      notes: "Used A2 shade",
      visitId: ACTIVE_VISIT.id,
      treatmentPlanItemId: "historical_filling_45",
      action: "completed",
      performedAt: "2026-06-23T09:45:00.000Z",
      providerId: "provider_current",
    },
    {
      id: "cs_2",
      tooth: 11,
      act: "Root Canal Treatment (Anterior)",
      surfaces: ["R"],
      status: "completed",
      price: 250,
      notes: "Canal cleaned and sealed",
      visitId: ACTIVE_VISIT.id,
      treatmentPlanItemId: "historical_root_canal_11",
      action: "completed",
      performedAt: "2026-06-23T10:15:00.000Z",
      providerId: "provider_current",
    },
  ]);
  const [visitHandoffNote, setVisitHandoffNote] = useState("");
  const [visitHandoffRecord, setVisitHandoffRecord] =
    useState<VisitHandoff | null>(null);
  const [visitCodingStatus, setVisitCodingStatus] =
    useState<VisitCodingStatus>("structured");
  const [visitLifecycleStatus, setVisitLifecycleStatus] =
    useState<VisitLifecycleStatus>("open");
  const [isSendAssistantModalOpen, setIsSendAssistantModalOpen] =
    useState(false);
  const [isCloseVisitModalOpen, setIsCloseVisitModalOpen] = useState(false);
  const [followUpRequests, setFollowUpRequests] = useState<FollowUpRequest[]>(
    [],
  );
  const [documentRequests, setDocumentRequests] = useState<DocumentRequest[]>(
    [],
  );
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

  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([
    {
      id: "d_1",
      tooth: 16,
      diagnosis: "Pulpitis",
      surfaces: ["R"],
      severity: "Severe",
      date: "2026-06-22",
    },
    {
      id: "d_2",
      tooth: 36,
      diagnosis: "Dental Caries",
      surfaces: ["O", "V"],
      severity: "Moderate",
      date: "2026-06-15",
    },
  ]);
  const [clinicalAttachments, setClinicalAttachments] = useState<
    ClinicalAttachment[]
  >([]);

  // Inspector State
  const [inspectorMode, setInspectorMode] = useState<InspectorMode>("act");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedActId, setSelectedActId] = useState("");
  const [activeSurfaces, setActiveSurfaces] = useState<SurfaceCode[]>([]);
  const [toothSurfaces, setToothSurfaces] = useState<
    Record<number, SurfaceCode[]>
  >({});
  const [surfacePickerTooth, setSurfacePickerTooth] = useState<number | null>(
    null,
  );
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
  const selectedMouthRegionOption = MOUTH_REGION_OPTIONS.find(
    (option) => option.id === selectedMouthRegion,
  );
  const isWholeMouth = selectedMouthRegion === "whole_mouth";
  const hasTargetSelection =
    selectedTeeth.length > 0 || Boolean(selectedMouthRegion);
  const dentitionLabel =
    DENTITION_MODES.find((mode) => mode.id === dentitionMode)?.label ?? "Adult";
  const chartRows = useMemo<ChartRows>(() => {
    if (dentitionMode === "child") {
      return {
        upper: [
          {
            id: "primary-upper",
            label: "Primary upper arch",
            right: PRIMARY_UPPER_RIGHT,
            left: PRIMARY_UPPER_LEFT,
            compact: false,
          },
        ],
        lower: [
          {
            id: "primary-lower",
            label: "Primary lower arch",
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
            label: "Permanent upper arch",
            right: UPPER_RIGHT,
            left: UPPER_LEFT,
            compact: false,
          },
          {
            id: "primary-upper",
            label: "Primary upper arch",
            right: PRIMARY_UPPER_RIGHT,
            left: PRIMARY_UPPER_LEFT,
            compact: true,
          },
        ],
        lower: [
          {
            id: "primary-lower",
            label: "Primary lower arch",
            right: PRIMARY_LOWER_RIGHT,
            left: PRIMARY_LOWER_LEFT,
            compact: true,
          },
          {
            id: "adult-lower",
            label: "Permanent lower arch",
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
          label: "Permanent upper arch",
          right: UPPER_RIGHT,
          left: UPPER_LEFT,
          compact: false,
        },
      ],
      lower: [
        {
          id: "adult-lower",
          label: "Permanent lower arch",
          right: LOWER_RIGHT,
          left: LOWER_LEFT,
          compact: false,
        },
      ],
    };
  }, [dentitionMode]);

  const handleDentitionModeChange = (mode: DentitionMode) => {
    setDentitionMode(mode);
    setSelectedTeeth([]);
    setSelectedMouthRegion(null);
    setActiveSurfaces([]);
    setSurfacePickerTooth(null);
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
    setToothSurfaces((prev) => ({
      ...prev,
      [surfacePickerTooth]: selectedSurfaces,
    }));
    setSelectedMouthRegion(null);
    if (pendingDroppedAct) {
      setTreatmentPlan((prev) => [
        ...prev,
        {
          id: `act_${Date.now()}_${surfacePickerTooth}`,
          tooth: surfacePickerTooth,
          surfaces: selectedSurfaces,
          act: pendingDroppedAct.name,
          status: "proposed",
          priority: actForm.priority,
          price: pendingDroppedAct.price,
          notes: actForm.notes,
          date: new Date().toISOString().split("T")[0],
          estimatedVisits: 1,
          completedVisits: 0,
          visitProcedureIds: [],
          createdAt: new Date().toISOString(),
          createdBy: "provider_current",
          dentition: dentitionMode,
          billingStatus: "not_charged",
        },
      ]);
      setPendingDroppedAct(null);
      setSelectedTeeth([surfacePickerTooth]);
    } else {
      setSelectedTeeth((prev) =>
        prev.includes(surfacePickerTooth)
          ? prev
          : [...prev, surfacePickerTooth],
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

  const handleSelectWholeMouth = () => {
    handleSelectMouthRegion("whole_mouth");
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
      visitId: ACTIVE_VISIT.id,
      uploadedAt,
      uploadedBy: ACTIVE_VISIT.providerId,
    }));

    setClinicalAttachments((prev) => [...prev, ...newAttachments]);
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

  const saveVisitHandoffNote = (status: VisitCodingStatus = "draft_note") => {
    const note = visitHandoffNote.trim();
    if (!note) return;

    setVisitHandoffRecord({
      id: visitHandoffRecord?.id || `handoff_${ACTIVE_VISIT.id}`,
      visitId: ACTIVE_VISIT.id,
      patientId: PATIENT.id,
      text: note,
      status,
      authoredBy: ACTIVE_VISIT.providerId,
      savedAt: new Date().toISOString(),
    });
    setVisitCodingStatus(status);
  };

  const confirmSendToAssistant = () => {
    saveVisitHandoffNote("needs_coding");
    setVisitLifecycleStatus("needs_coding");
    setIsSendAssistantModalOpen(false);
    router.push(waitingRoomPath);
  };

  const markVisitCodingComplete = () => {
    if (!visitHandoffRecord) return;
    setVisitHandoffRecord(
      (prev) =>
        prev && {
          ...prev,
          status: "coded",
          codedAt: new Date().toISOString(),
          codedBy: ACTIVE_VISIT.providerId,
        },
    );
    setVisitCodingStatus("coded");
    setVisitLifecycleStatus("open");
  };

  const createDocumentRequest = ({
    type,
    reason,
    treatmentPlanItemId = "",
    source = "visit_close",
  }: {
    type: DocumentRequestTypeId;
    reason: string;
    treatmentPlanItemId?: string;
    source?: "visit_close";
  }): DocumentRequest => {
    const request: DocumentRequest = {
      id: `doc_req_${Date.now()}`,
      patientId: PATIENT.id,
      visitId: ACTIVE_VISIT.id,
      treatmentPlanItemId,
      type,
      reason,
      status: "requested",
      source,
      requestedAt: new Date().toISOString(),
      requestedBy: ACTIVE_VISIT.providerId,
    };

    setDocumentRequests((prev) => [...prev, request]);
    return request;
  };

  const confirmCloseVisit = () => {
    if (closeVisitNextSteps.followUpNeeded) {
      setFollowUpRequests((prev) => [
        ...prev,
        {
          id: `follow_up_${Date.now()}`,
          patientId: PATIENT.id,
          visitId: ACTIVE_VISIT.id,
          treatmentPlanItemId: closeVisitNextSteps.linkedTreatmentId,
          reason: closeVisitNextSteps.followUpReason,
          preferredDate: closeVisitNextSteps.followUpDate,
          urgency: closeVisitNextSteps.followUpUrgency,
          status: "requested" as const,
          requestedAt: new Date().toISOString(),
          requestedBy: ACTIVE_VISIT.providerId,
        },
      ]);
    }

    if (closeVisitNextSteps.documentNeeded) {
      createDocumentRequest({
        type: closeVisitNextSteps.documentType,
        reason: closeVisitNextSteps.documentReason,
        treatmentPlanItemId: closeVisitNextSteps.linkedTreatmentId,
      });
    }

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

  const handleAddAct = () => {
    const actIdToUse = selectedActId;
    if (!actIdToUse) return;

    const actDetails = EXTENDED_ACTS.find((a) => a.id === actIdToUse);
    if (!actDetails) return;
    const targetTeeth = selectedTeeth;
    const targetRegionLabel = selectedMouthRegionOption?.label ?? "Whole Mouth";
    const shouldGroupSelectedTeeth =
      !selectedMouthRegion &&
      targetTeeth.length > 1 &&
      Boolean(actDetails?.groupableTeeth);
    const treatmentGroupId = shouldGroupSelectedTeeth
      ? `group_${Date.now()}`
      : null;

    if (treatmentGroupId) {
      setTreatmentGroups((prev) => [
        ...prev,
        {
          id: treatmentGroupId,
          patientId: PATIENT.id,
          label: `${actDetails.name} — ${targetTeeth.length} teeth`,
          act: actDetails.name,
          toothIds: targetTeeth,
          billingMode: "package",
          createdAt: new Date().toISOString(),
          createdBy: ACTIVE_VISIT.providerId,
        },
      ]);
    }

    let newActs: TreatmentPlanItem[] = [];

    if (selectedMouthRegion || targetTeeth.length === 0) {
      newActs.push({
        id: `act_${Date.now()}_gen`,
        tooth: targetRegionLabel,
        surfaces: [],
        act: actDetails.name,
        status: "proposed",
        priority: actForm.priority,
        price: actDetails.price,
        notes: actForm.notes,
        date: new Date().toISOString().split("T")[0],
        estimatedVisits: 1,
        completedVisits: 0,
        visitProcedureIds: [],
        createdAt: new Date().toISOString(),
        createdBy: "provider_current",
        treatmentGroupId,
        dentition: dentitionMode,
        billingStatus: "not_charged",
      });
    } else if (shouldGroupSelectedTeeth) {
      newActs.push({
        id: `act_${Date.now()}_group`,
        tooth: `${targetTeeth.length} teeth`,
        toothIds: targetTeeth,
        surfaces: [],
        surfacesByTooth: targetTeeth.reduce(
          (acc, tooth) => ({
            ...acc,
            [tooth]: toothSurfaces[tooth] || [],
          }),
          {},
        ),
        act: actDetails.name,
        status: "proposed",
        priority: actForm.priority,
        price: actDetails.price,
        notes: actForm.notes,
        date: new Date().toISOString().split("T")[0],
        estimatedVisits: 1,
        completedVisits: 0,
        visitProcedureIds: [],
        createdAt: new Date().toISOString(),
        createdBy: "provider_current",
        treatmentGroupId,
        isGroupedTeeth: true,
        dentition: dentitionMode,
        billingStatus: "not_charged",
      });
    } else {
      newActs = targetTeeth.map((tooth) => ({
        id: `act_${Date.now()}_${tooth}`,
        tooth,
        surfaces: toothSurfaces[tooth] || [],
        act: actDetails.name,
        status: "proposed",
        priority: actForm.priority,
        price: actDetails.price,
        notes: actForm.notes,
        date: new Date().toISOString().split("T")[0],
        estimatedVisits: 1,
        completedVisits: 0,
        visitProcedureIds: [],
        createdAt: new Date().toISOString(),
        createdBy: "provider_current",
        dentition: dentitionMode,
        billingStatus: "not_charged",
      }));
    }

    setTreatmentPlan((prev) => [...prev, ...newActs]);

    // Reset forms
    setSelectedActId("");
    setActForm({ notes: "", priority: "Normal" });
    setActiveSurfaces([]);
    setPendingConfirmation(false);
  };

  const handleAddDiagnosis = () => {
    if (!diagnosisForm.diagnosis) return;

    const diagnosisDetails = {
      diagnosis: diagnosisForm.diagnosis,
      severity: diagnosisForm.severity,
      certainty: diagnosisForm.certainty,
      status: diagnosisForm.status,
      evidence: diagnosisForm.evidence,
      attachmentIds: diagnosisForm.attachmentIds,
      symptoms: diagnosisForm.symptoms,
      painLevel: diagnosisForm.painLevel,
      notes: diagnosisForm.notes,
      date: new Date().toISOString().split("T")[0],
      dentition: dentitionMode,
    };

    let newDiag: Diagnosis[] = [];
    if (selectedMouthRegion || selectedTeeth.length === 0) {
      newDiag.push({
        id: `d_${Date.now()}_gen`,
        tooth: selectedMouthRegionOption?.label ?? "Whole Mouth",
        surfaces: [],
        ...diagnosisDetails,
      });
    } else if (selectedTeeth.length > 1) {
      newDiag.push({
        id: `d_${Date.now()}_group`,
        tooth: `${selectedTeeth.length} teeth`,
        toothIds: selectedTeeth,
        surfaces: [],
        surfacesByTooth: selectedTeeth.reduce(
          (acc, tooth) => ({
            ...acc,
            [tooth]: toothSurfaces[tooth] || [],
          }),
          {},
        ),
        isGroupedTeeth: true,
        ...diagnosisDetails,
      });
    } else {
      newDiag = selectedTeeth.map((tooth) => ({
        id: `d_${Date.now()}_${tooth}`,
        tooth,
        surfaces: toothSurfaces[tooth] || [],
        ...diagnosisDetails,
      }));
    }

    setDiagnoses((prev) => [...prev, ...newDiag]);
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

  const buildTreatmentCharge = (
    treatmentItem: TreatmentPlanItem,
    chargeId: string,
  ): TreatmentCharge => ({
    id: chargeId,
    patientId: PATIENT.id,
    visitId: ACTIVE_VISIT.id,
    sourceType: "treatment_plan_item",
    sourceId: treatmentItem.id,
    label: treatmentItem.act,
    location: getTreatmentLocationLabel(treatmentItem),
    originalAmount: treatmentItem.price,
    paidAmount: 0,
    remainingAmount: treatmentItem.price,
    status: "unpaid",
    createdAt: new Date().toISOString(),
    createdBy: ACTIVE_VISIT.providerId,
  });

  const shouldPostChargeForTreatment = (treatmentItem: TreatmentPlanItem) =>
    treatmentItem?.price > 0 &&
    !treatmentItem.chargeId &&
    !treatmentCharges.some(
      (charge) =>
        charge.sourceType === "treatment_plan_item" &&
        charge.sourceId === treatmentItem.id,
    );

  const handleStartTreatment = (tpItem: TreatmentPlanItem) => {
    const existingActiveProcedure = currentSession.find(
      (item) =>
        item.treatmentPlanItemId === tpItem.id && item.status !== "completed",
    );
    if (existingActiveProcedure) {
      setActiveTab("session");
      return;
    }

    const shouldPostTreatmentCharge = shouldPostChargeForTreatment(tpItem);
    const chargeId = shouldPostTreatmentCharge
      ? `charge_${tpItem.id}`
      : tpItem.chargeId;

    if (shouldPostTreatmentCharge) {
      const newChargeId = `charge_${tpItem.id}`;
      setTreatmentCharges((prev) => [
        ...prev,
        buildTreatmentCharge(tpItem, newChargeId),
      ]);
    }

    setTreatmentPlan((prev) =>
      prev.map((item) =>
        item.id === tpItem.id
          ? {
              ...item,
              status: "in_progress",
              startedAt: item.startedAt || new Date().toISOString(),
              billingStatus:
                item.chargeId || shouldPostTreatmentCharge
                  ? "charged"
                  : item.billingStatus || "not_charged",
              chargeId: item.chargeId || chargeId,
            }
          : item,
      ),
    );
    setCurrentSession((prev) => [
      ...prev,
      {
        ...tpItem,
        id: `vp_${Date.now()}`,
        treatmentPlanItemId: tpItem.id,
        visitId: ACTIVE_VISIT.id,
        action: tpItem.status === "in_progress" ? "continued" : "started",
        status: "in-progress",
        performedAt: new Date().toISOString(),
        providerId: ACTIVE_VISIT.providerId,
      },
    ]);
    setActiveTab("session");
  };

  const handleCompleteSessionAct = (id: string) => {
    const procedure = currentSession.find((item) => item.id === id);
    setCurrentSession((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "completed",
              action: "completed",
              completedAt: new Date().toISOString(),
            }
          : item,
      ),
    );
    if (procedure?.treatmentPlanItemId) {
      setTreatmentPlan((prev) =>
        prev.map((item) =>
          item.id === procedure.treatmentPlanItemId
            ? {
                ...item,
                completedVisits: (item.completedVisits || 0) + 1,
                status:
                  (item.completedVisits || 0) + 1 >= (item.estimatedVisits || 1)
                    ? "completed"
                    : "in_progress",
              }
            : item,
        ),
      );
    }
  };

  const handleConfirmCompleteSessionAct = () => {
    if (!sessionActToComplete) return;
    handleCompleteSessionAct(sessionActToComplete.id);
    setSessionActToComplete(null);
  };

  const changePlanStatus = (
    id: string,
    status: TreatmentStatus,
    reason = "",
  ) => {
    setTreatmentPlan((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              statusReason: reason,
              statusChangedAt: new Date().toISOString(),
              statusChangedBy: ACTIVE_VISIT.providerId,
            }
          : item,
      ),
    );
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
        const actBase = EXTENDED_ACTS.find((a) => a.name === event.act);
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

  const filteredActs = EXTENDED_ACTS.filter((a) =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const pendingTreatmentChargeTotal = treatmentCharges.reduce(
    (sum, charge) => sum + charge.remainingAmount,
    0,
  );
  const totalPatientAmountDue = PATIENT.balance + pendingTreatmentChargeTotal;

  // Get all active events for currently selected teeth
  const selectedTeethEvents = useMemo<ClinicalEvent[]>(() => {
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
          label: d.diagnosis,
          stateLabel: "Diagnosis",
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
          label: a.act,
          stateLabel: "Planned",
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
          label: a.act,
          stateLabel: a.status === "completed" ? "Completed" : "In Progress",
        })),
    ];
  }, [selectedTeeth, diagnoses, treatmentPlan, currentSession]);

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
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-soft rounded-full flex items-center justify-center text-primary font-bold text-lg">
              {PATIENT.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                {PATIENT.name}
                <span className="text-xs font-normal px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                  {PATIENT.id}
                </span>
              </h1>
              <div className="text-sm text-slate-500 flex items-center gap-3">
                <span>
                  {PATIENT.age} y.o. • {PATIENT.gender}
                </span>
                <span>{PATIENT.phone}</span>
              </div>
            </div>
          </div>

          {PATIENT.alerts.length > 0 && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1.5 rounded-md border border-red-200">
              <AlertTriangle size={16} />
              <span className="text-sm font-semibold">
                Alerts: {PATIENT.alerts.join(", ")}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
            <Printer size={16} /> Print Report
          </button>
          <div className="flex items-center gap-2 rounded-md border border-teal-200 bg-teal-50 px-4 py-2 text-sm text-teal-800">
            <CreditCard size={16} />
            <div>
              <p className="font-bold">
                Amount due ${totalPatientAmountDue.toFixed(2)}
              </p>
              <p className="text-[11px] font-semibold text-teal-700">
                ${pendingTreatmentChargeTotal.toFixed(2)} new treatment charges
                posted for cashier
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN: Chart & Tabs */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Dental Chart Section */}
          <div className="bg-white m-4 rounded-xl border border-slate-200 shadow-sm p-5 select-none">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Stethoscope size={20} className="text-primary" />
                  Odontogram ({dentitionLabel})
                </h2>
                <div className="flex rounded-lg border border-ui-border bg-card p-0.5">
                  {DENTITION_MODES.map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => handleDentitionModeChange(mode.id)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                        dentitionMode === mode.id
                          ? "bg-primary text-white shadow-sm"
                          : "text-slate-500 hover:bg-surface-hover"
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSelectWholeMouth}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors border ${isWholeMouth ? "bg-primary-soft text-primary border-primary/30" : "bg-card text-text-muted hover:bg-surface-hover border-ui-border"}`}
              >
                {isWholeMouth ? "✓ Whole Mouth Selected" : "Select Whole Mouth"}
              </button>

              <div className="flex gap-4 text-xs font-medium text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>{" "}
                  Filling
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-rose-500 rounded-sm"></div> Root
                  Canal
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded-sm"></div> Crown
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded-sm"></div>{" "}
                  Pathology
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-10 items-center py-4">
              {chartRows.upper.map((row) => (
                <div key={row.id} className="flex flex-col items-center gap-2">
                  {dentitionMode === "mixed" && (
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      {row.label}
                    </p>
                  )}
                  <div
                    className={`flex gap-6 ${row.compact ? "scale-90 origin-center" : ""}`}
                  >
                    <div className="flex gap-2">
                      {row.right.map((num) => (
                        <AnatomicalTooth
                          key={`${row.id}-${num}`}
                          number={num}
                        />
                      ))}
                    </div>
                    <div className="w-px bg-slate-300 mx-2"></div>
                    <div className="flex gap-2">
                      {row.left.map((num) => (
                        <AnatomicalTooth
                          key={`${row.id}-${num}`}
                          number={num}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              <div className="w-full max-w-4xl h-px bg-slate-200 relative">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-slate-400 font-bold uppercase tracking-widest rounded-full border border-slate-100">
                  Maxillary / Mandibular
                </div>
              </div>

              {chartRows.lower.map((row) => (
                <div key={row.id} className="flex flex-col items-center gap-2">
                  {dentitionMode === "mixed" && (
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      {row.label}
                    </p>
                  )}
                  <div
                    className={`flex gap-6 ${row.compact ? "scale-90 origin-center" : ""}`}
                  >
                    <div className="flex gap-2">
                      {row.right.map((num) => (
                        <AnatomicalTooth
                          key={`${row.id}-${num}`}
                          number={num}
                        />
                      ))}
                    </div>
                    <div className="w-px bg-slate-300 mx-2"></div>
                    <div className="flex gap-2">
                      {row.left.map((num) => (
                        <AnatomicalTooth
                          key={`${row.id}-${num}`}
                          number={num}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Tabs Area */}
          <div className="bg-white mx-4 mb-4 flex-1 rounded-xl border border-slate-200 shadow-sm flex flex-col min-h-[300px]">
            <div className="flex border-b border-slate-200 px-2 overflow-x-auto bg-slate-50/50 rounded-t-xl">
              {(
                [
                  {
                    id: "session",
                    label: "Current Session",
                    icon: Play,
                    count: currentSession.length,
                  },
                  {
                    id: "plan",
                    label: "Treatment Plan",
                    icon: FileText,
                    count: treatmentPlan.length,
                  },
                  {
                    id: "history",
                    label: "Clinical History",
                    icon: History,
                    count: 12,
                  },
                ] as Array<{
                  id: "session" | "plan" | "history";
                  label: string;
                  icon: typeof Play;
                  count: number;
                }>
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-primary text-primary bg-card"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                  {tab.count > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-xs ${activeTab === tab.id ? "bg-primary-soft text-primary" : "bg-slate-200 text-slate-600"}`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex-1 p-0 overflow-y-auto">
              {/* CURRENT SESSION TAB */}
              {activeTab === "session" && (
                <div className="p-4">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary-soft px-4 py-3">
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        Open visit · Chair 01
                      </p>
                      <p className="text-xs text-text-muted">
                        Visit {ACTIVE_VISIT.id} · Started{" "}
                        {new Date(ACTIVE_VISIT.startedAt).toLocaleTimeString(
                          [],
                          { hour: "2-digit", minute: "2-digit" },
                        )}
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
                          Free-text visit summary for assistant coding before
                          the visit is closed.
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
                              {followUpRequests[followUpRequests.length - 1]
                                ?.reason ||
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
                              {DOCUMENT_REQUEST_TYPES.find(
                                (type) =>
                                  type.id ===
                                  documentRequests[documentRequests.length - 1]
                                    ?.type,
                              )?.label || "Clinical document"}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    <textarea
                      value={visitHandoffNote}
                      onChange={(event) => {
                        setVisitHandoffNote(event.target.value);
                        if (event.target.value.trim()) {
                          setVisitCodingStatus((prev) =>
                            prev === "needs_coding" ? prev : "draft_note",
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
                        onClick={() => saveVisitHandoffNote("draft_note")}
                        disabled={!visitHandoffNote.trim()}
                        className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
                      >
                        <Save size={14} /> Save Draft
                      </button>
                      <button
                        onClick={() => setIsSendAssistantModalOpen(true)}
                        disabled={!visitHandoffNote.trim()}
                        className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 transition-colors hover:bg-amber-100 disabled:opacity-50"
                      >
                        <FileText size={14} /> Send to Assistant
                      </button>
                      {visitHandoffRecord && (
                        <button
                          onClick={markVisitCodingComplete}
                          className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-700"
                        >
                          <CheckCircle size={14} /> Mark Structured
                        </button>
                      )}
                      <button
                        onClick={() => setIsCloseVisitModalOpen(true)}
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
                            <th className="px-4 py-3 font-semibold">
                              Location
                            </th>
                            <th className="px-4 py-3 font-semibold">
                              Treatment Act
                            </th>
                            <th className="px-4 py-3 font-semibold">Notes</th>
                            <th className="px-4 py-3 font-semibold">Status</th>
                            <th className="px-4 py-3 font-semibold text-right">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {currentSession.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50">
                              <td className="px-4 py-3 flex items-center gap-2">
                                <span
                                  className={`inline-flex items-center justify-center h-7 px-2 ${item.tooth === "Whole Mouth" || item.toothIds?.length ? "bg-indigo-50 text-indigo-700" : "bg-slate-100 text-slate-700"} rounded font-bold border border-slate-200`}
                                >
                                  {getTreatmentLocationLabel(item)}
                                </span>
                                {item.surfaces?.length > 0 && (
                                  <div className="flex gap-1">
                                    {item.surfaces.map((s) => (
                                      <span
                                        key={s}
                                        className="px-1.5 py-0.5 text-[10px] font-bold bg-white border border-slate-300 rounded text-slate-600"
                                      >
                                        {s}
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
                                    onClick={() =>
                                      setSessionActToComplete(item)
                                    }
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
              )}

              {/* TREATMENT PLAN TAB */}
              {activeTab === "plan" && (
                <div className="p-4">
                  {treatmentGroups
                    .filter((group) =>
                      treatmentPlan.some(
                        (item) =>
                          item.treatmentGroupId === group.id &&
                          ![
                            "cancelled",
                            "voided",
                            "declined",
                            "completed",
                          ].includes(item.status),
                      ),
                    )
                    .map((group) => {
                      const items = treatmentPlan.filter(
                        (item) => item.treatmentGroupId === group.id,
                      );
                      const completed = items.filter(
                        (item) => item.status === "completed",
                      ).length;
                      return (
                        <div
                          key={group.id}
                          className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary-soft px-4 py-3"
                        >
                          <div>
                            <p className="text-sm font-bold text-foreground">
                              {group.label}
                            </p>
                            <p className="text-xs text-text-muted">
                              Bulk treatment group ·{" "}
                              {group.billingMode === "per_item"
                                ? "Billed per tooth"
                                : "Package billing"}
                            </p>
                          </div>
                          <span className="rounded-full bg-card px-2.5 py-1 text-xs font-bold text-primary">
                            {completed}/{items.length} completed
                          </span>
                        </div>
                      );
                    })}
                  <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Location</th>
                          <th className="px-4 py-3 font-semibold">
                            Treatment Act
                          </th>
                          <th className="px-4 py-3 font-semibold">Priority</th>
                          <th className="px-4 py-3 font-semibold">Price</th>
                          <th className="px-4 py-3 font-semibold text-right">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {treatmentPlan
                          .filter(
                            (item) =>
                              ![
                                "cancelled",
                                "voided",
                                "declined",
                                "completed",
                              ].includes(item.status),
                          )
                          .map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50">
                              <td className="px-4 py-3 flex items-center gap-2">
                                <span className="inline-flex items-center justify-center h-7 px-2 bg-slate-100 rounded font-bold text-slate-700 border border-slate-200">
                                  {getTreatmentLocationLabel(item)}
                                </span>
                                {item.surfaces?.length > 0 && (
                                  <div className="flex gap-1">
                                    {item.surfaces.map((s) => (
                                      <span
                                        key={s}
                                        className="px-1.5 py-0.5 text-[10px] font-bold bg-white border border-slate-300 rounded text-slate-600"
                                      >
                                        {s}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3 font-medium text-slate-800">
                                <div>{item.act}</div>
                                <div className="mt-1 flex items-center gap-2 text-[11px] text-text-muted">
                                  <span className="rounded-full bg-primary-soft px-2 py-0.5 font-semibold text-primary">
                                    {item.status.replace("_", " ")}
                                  </span>
                                  <span
                                    className={`rounded-full px-2 py-0.5 font-semibold ${
                                      item.chargeId
                                        ? "bg-teal-50 text-teal-700"
                                        : "bg-slate-100 text-slate-500"
                                    }`}
                                  >
                                    {item.chargeId
                                      ? "Charge posted"
                                      : "Not charged"}
                                  </span>
                                  {item.treatmentGroupId && (
                                    <span className="rounded-full border border-primary/20 bg-card px-2 py-0.5 font-semibold text-primary">
                                      Grouped teeth
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border
                                 ${item.priority === "High" ? "bg-red-50 text-red-700 border-red-200" : "bg-slate-100 text-slate-700 border-slate-200"}`}
                                >
                                  {item.priority}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-slate-600">
                                ${item.price.toFixed(2)}
                              </td>
                              <td className="px-4 py-3 text-right flex justify-end gap-2">
                                <button
                                  onClick={() => setTreatmentDetailsItem(item)}
                                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded transition-colors"
                                >
                                  <Info size={12} /> Details
                                </button>
                                <button
                                  onClick={() => handleStartTreatment(item)}
                                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-primary bg-primary-soft hover:bg-primary/15 border border-primary/25 rounded transition-colors"
                                >
                                  <Play size={12} fill="currentColor" />{" "}
                                  {item.status === "in_progress"
                                    ? "Continue"
                                    : "Start"}
                                </button>
                                <button
                                  onClick={() =>
                                    changePlanStatus(
                                      item.id,
                                      "cancelled",
                                      "Cancelled from treatment plan",
                                    )
                                  }
                                  className="px-2.5 py-1 text-xs font-semibold text-amber-800 border border-amber-200 bg-amber-50 rounded transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() =>
                                    changePlanStatus(
                                      item.id,
                                      "voided",
                                      "Entered in error",
                                    )
                                  }
                                  className="px-2.5 py-1 text-xs font-semibold text-red-700 border border-red-200 bg-red-50 rounded transition-colors"
                                >
                                  Void
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* CLINICAL HISTORY — records are retained after cancellation or correction */}
              {activeTab === "history" && (
                <div className="p-4">
                  <div className="mb-3 rounded-md border border-ui-border bg-page px-3 py-2 text-xs text-text-muted">
                    This is the clinical audit trail. Cancelled and voided items
                    remain here and cannot be silently removed.
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Location</th>
                          <th className="px-4 py-3 font-semibold">Treatment</th>
                          <th className="px-4 py-3 font-semibold">
                            Final status
                          </th>
                          <th className="px-4 py-3 font-semibold">
                            Reason / audit note
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
                                  ? getTreatmentLocationLabel(item)
                                  : typeof item.tooth === "number"
                                    ? `Tooth ${item.tooth}`
                                    : item.tooth}
                              </td>
                              <td className="px-4 py-3">
                                <div className="font-semibold text-slate-800">
                                  {item.act}
                                </div>
                                <div className="mt-1 text-xs text-slate-500">
                                  {getTreatmentAreaLabel(item)}
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
                                  "Completed clinical treatment"}
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
                  {selectedMouthRegionOption.label} Selected
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
                    <span>Tooth {t}</span>
                    <span className="border-l border-primary/25 pl-1.5 text-[11px] font-semibold">
                      {toothSurfaces[t]?.length
                        ? toothSurfaces[t].join(", ")
                        : "Full tooth"}
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
                  <Info size={16} /> Select teeth or a mouth region
                </div>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                Mouth Region
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
                <option value="">Select a mouth region</option>
                {MOUTH_REGION_OPTIONS.map((region) => (
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
              Treatments
            </button>
            <button
              className={`flex-1 py-3 text-center transition-colors border-b-2 ${inspectorMode === "diagnosis" ? "text-primary border-primary bg-card" : "text-text-muted border-transparent hover:bg-surface-hover"}`}
              onClick={() => setInspectorMode("diagnosis")}
            >
              Diagnoses
            </button>
            <button
              className={`flex-1 py-3 text-center transition-colors border-b-2 ${inspectorMode === "details" ? "text-primary border-primary bg-card" : "text-text-muted border-transparent hover:bg-surface-hover"}`}
              onClick={() => setInspectorMode("details")}
            >
              Details{" "}
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
                      placeholder="Search acts to apply or drag..."
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
                              {act.name}
                            </p>
                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                              {act.category}
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
                    Tip: Drag an act onto a specific tooth.
                  </p>
                </div>

                {/* Configuration Form */}
                <div className="p-4 flex flex-col gap-5 bg-slate-50 flex-1">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Priority
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
                        <option>Low</option>
                        <option>Normal</option>
                        <option>High</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={() => setPendingConfirmation(true)}
                    disabled={!selectedActId || !hasTargetSelection}
                    className="w-full mt-1 flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-md text-sm font-bold hover:bg-primary-dark transition-colors disabled:opacity-50 shadow-sm"
                  >
                    <Plus size={18} /> Apply Treatment Plan
                  </button>
                </div>
              </div>
            )}

            {/* --- DIAGNOSES MODE --- */}
            {inspectorMode === "diagnosis" && (
              <div className="p-4 flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Diagnosis *
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
                    <option value="">-- Choose --</option>
                    {DIAGNOSES_CATALOG.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Severity
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
                    <option>Mild</option>
                    <option>Moderate</option>
                    <option>Severe</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Certainty
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
                      {DIAGNOSIS_CERTAINTY_OPTIONS.map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Status
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
                      {DIAGNOSIS_STATUS_OPTIONS.map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Diagnostic Evidence
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {DIAGNOSIS_EVIDENCE_OPTIONS.map((option) => {
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
                          {option}
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
                          Radiology Attachments
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Upload once, then link to one or more diagnoses.
                        </p>
                      </div>
                      <label className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100">
                        <Paperclip size={13} />
                        Upload
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
                        No X-ray files attached yet.
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
                    Symptoms
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
                          {symptom}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700">
                      Pain Level
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
                    Clinical Notes
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
                    placeholder="Add clinical observations, test response, radiographic notes..."
                    className="w-full resize-none border border-slate-300 rounded-md p-2 text-sm bg-white focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <button
                  onClick={handleAddDiagnosis}
                  disabled={!diagnosisForm.diagnosis || !hasTargetSelection}
                  className="w-full mt-4 flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-md text-sm font-bold hover:bg-red-700 disabled:opacity-50 shadow-md"
                >
                  <Plus size={18} /> Record Diagnosis
                </button>
              </div>
            )}

            {/* --- DETAILS/HISTORY MODE --- */}
            {inspectorMode === "details" && (
              <div className="p-4 flex-1 bg-slate-50">
                {selectedTeeth.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center mt-10">
                    Select a tooth to view its specific history and active
                    treatments.
                  </p>
                ) : selectedTeethEvents.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center mt-10">
                    No records found for the selected teeth.
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
                              ? getTreatmentLocationLabel(ev)
                              : `T${ev.tooth}`}
                          </span>
                          {(ev.surfaces?.length ?? 0) > 0 && ev.surfaces && (
                            <span>Surfaces: {ev.surfaces.join(", ")}</span>
                          )}
                        </div>
                        {ev.type === "pathology" && (
                          <div className="mt-3 space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
                            <div className="flex flex-wrap gap-1.5">
                              <span className="rounded bg-red-50 px-2 py-1 font-semibold text-red-700">
                                {ev.severity}
                              </span>
                              {ev.certainty && (
                                <span className="rounded bg-slate-100 px-2 py-1 font-semibold text-slate-700">
                                  {ev.certainty}
                                </span>
                              )}
                              {ev.status && (
                                <span className="rounded bg-slate-100 px-2 py-1 font-semibold text-slate-700">
                                  {ev.status}
                                </span>
                              )}
                              {typeof ev.painLevel === "number" && (
                                <span className="rounded bg-slate-100 px-2 py-1 font-semibold text-slate-700">
                                  Pain {ev.painLevel}/10
                                </span>
                              )}
                            </div>
                            {(ev.evidence?.length ?? 0) > 0 && (
                              <p>
                                <strong>Evidence:</strong>{" "}
                                {Array.isArray(ev.evidence)
                                  ? ev.evidence.join(", ")
                                  : ev.evidence}
                              </p>
                            )}
                            {(ev.attachmentIds?.length ?? 0) > 0 &&
                              ev.attachmentIds && (
                                <div>
                                  <strong>Attachments:</strong>
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
                                            "Unavailable attachment"}
                                        </span>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            {(ev.symptoms?.length ?? 0) > 0 && ev.symptoms && (
                              <p>
                                <strong>Symptoms:</strong>{" "}
                                {ev.symptoms.join(", ")}
                              </p>
                            )}
                            {ev.notes && (
                              <p className="leading-relaxed">
                                <strong>Note:</strong> {ev.notes}
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

      {/* TOOTH SURFACE PICKER — opened directly from a tooth or a dropped act */}
      {surfacePickerTooth !== null && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/25 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-primary">
                  Tooth {surfacePickerTooth}
                </p>
                <h3 className="mt-1 text-lg font-bold text-slate-800">
                  Select treatment area
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {pendingDroppedAct
                    ? `Choose the treatment area for ${pendingDroppedAct.name}.`
                    : "Choose the full tooth, or select one or more specific surfaces."}
                </p>
              </div>
              <button
                onClick={closeSurfacePicker}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <button
              onClick={() => setActiveSurfaces([])}
              className={`mt-5 flex w-full items-center justify-between rounded-lg border p-3 text-left transition ${activeSurfaces.length === 0 ? "border-primary bg-primary-soft text-primary ring-1 ring-primary/25" : "border-ui-border hover:bg-surface-hover"}`}
            >
              <span>
                <span className="block text-sm font-bold">Full tooth</span>
                <span className="text-xs font-normal text-slate-500">
                  Use for whitening, crowns, extraction, or a complete tooth
                  treatment.
                </span>
              </span>
              {activeSurfaces.length === 0 && <CheckCircle size={18} />}
            </button>

            <div className="mt-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-600">
                Specific surfaces — select multiple
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { id: "V", label: "Vestibular (Outer)" },
                    { id: "L", label: "Palatal / Lingual" },
                    { id: "M", label: "Mesial (Front)" },
                    { id: "D", label: "Distal (Back)" },
                    { id: "O", label: "Occlusal (Biting)" },
                    { id: "R", label: "Root / Canal" },
                  ] as Array<{ id: SurfaceCode; label: string }>
                ).map((surface) => {
                  const selected = activeSurfaces.includes(surface.id);
                  return (
                    <button
                      key={surface.id}
                      onClick={() => toggleFormSurface(surface.id)}
                      className={`rounded-md border px-3 py-2.5 text-left text-xs font-semibold transition ${selected ? "border-primary bg-primary-soft text-primary" : "border-ui-border text-text-muted hover:bg-surface-hover"}`}
                    >
                      {surface.id === "R" && (
                        <Activity
                          size={14}
                          className="mr-1 inline text-red-500"
                        />
                      )}
                      {surface.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={saveToothSurfaces}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-primary py-3 text-sm font-bold text-white shadow-sm transition hover:bg-primary-dark"
            >
              <CheckCircle size={17} /> Confirm selection
            </button>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {pendingConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/25 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-[400px] max-w-[90%] border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary-soft flex items-center justify-center text-primary">
                <AlertTriangle size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                Confirm Treatment Act
              </h3>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 text-sm text-slate-700 flex flex-col gap-2">
              <p>
                <strong>Act:</strong>{" "}
                {EXTENDED_ACTS.find((a) => a.id === selectedActId)?.name}
              </p>
              <p>
                <strong>Target:</strong>{" "}
                {selectedMouthRegionOption
                  ? selectedMouthRegionOption.label
                  : `Tooth ${selectedTeeth.join(", ")}`}
              </p>
              <p>
                <strong>Dentition:</strong> {dentitionLabel}
              </p>
              {!selectedMouthRegion &&
                selectedTeeth.map((tooth) => (
                  <p key={tooth}>
                    <strong>Tooth {tooth}:</strong>{" "}
                    {toothSurfaces[tooth]?.length
                      ? toothSurfaces[tooth].join(", ")
                      : "Full tooth"}
                  </p>
                ))}
              {actForm.priority !== "Normal" && (
                <p>
                  <strong>Priority:</strong> {actForm.priority}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setPendingConfirmation(false)}
                className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAct}
                className="px-4 py-2 text-sm font-bold text-white bg-primary hover:bg-primary-dark rounded-md transition-colors shadow-sm flex items-center gap-2"
              >
                <CheckCircle size={16} /> Confirm & Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TREATMENT DETAILS MODAL */}
      {treatmentDetailsItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/25 p-4">
          <div className="max-h-[92vh] w-[900px] max-w-[96%] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
            <div className="border-b border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
                      Treatment details
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
                        ? "Charge posted"
                        : "Not charged"}
                    </span>
                  </div>
                  <h3 className="truncate text-xl font-bold text-slate-900">
                    {treatmentDetailsItem.act}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {getTreatmentLocationLabel(treatmentDetailsItem)} ·{" "}
                    {getTreatmentAreaLabel(treatmentDetailsItem)}
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
                    Clinical status
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {treatmentDetailsItem.status.replace("_", " ")}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Price
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-800">
                    ${treatmentDetailsItem.price.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Priority
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {treatmentDetailsItem.priority}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Billing
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {treatmentDetailsItem.chargeId
                      ? "Charge posted"
                      : "Not charged"}
                  </p>
                </div>
              </div>

              {(getTreatmentDocumentRequests(treatmentDetailsItem).length > 0 ||
                getTreatmentFollowUpRequests(treatmentDetailsItem).length >
                  0) && (
                <section className="mt-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h4 className="text-sm font-bold text-slate-800">
                      Linked requests
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
                              {DOCUMENT_REQUEST_TYPES.find(
                                (type) => type.id === request.type,
                              )?.label || "Document"}
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
                              Follow-up
                            </span>
                            <span className="rounded-full bg-white px-2 py-0.5 font-bold">
                              {request.urgency}
                            </span>
                          </div>
                          <p className="mt-2 text-blue-700">
                            {request.preferredDate || "No date selected"}
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
                      <p className="font-bold">Posted cashier charge</p>
                      <p className="mt-0.5 text-xs font-semibold text-teal-700">
                        Handled outside the clinical workflow.
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
                      remaining
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-sm font-bold text-slate-800">
                      Related diagnoses
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
                        No diagnosis linked to this location yet.
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
                                {diagnosis.diagnosis}
                              </p>
                              <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-700">
                                {diagnosis.severity}
                              </span>
                            </div>
                            <p className="mt-2 text-xs text-slate-500">
                              <span className="font-bold text-slate-600">
                                Evidence:
                              </span>{" "}
                              {Array.isArray(diagnosis.evidence)
                                ? diagnosis.evidence.join(", ")
                                : diagnosis.evidence || "Not specified"}
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
                      Visit notes and handoff
                    </h4>
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                      {getTreatmentHandoffNotes(treatmentDetailsItem).length}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-col gap-2">
                    {getTreatmentHandoffNotes(treatmentDetailsItem).length ===
                    0 ? (
                      <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-500">
                        No handoff notes recorded for this treatment.
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
                    Procedure timeline
                  </h4>
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                    {getTreatmentProcedureTimeline(treatmentDetailsItem).length}
                  </span>
                </div>
                <div className="mt-4">
                  {getTreatmentProcedureTimeline(treatmentDetailsItem)
                    .length === 0 ? (
                    <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-500">
                      No clinical sessions recorded yet.
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
                                    {procedure.action || procedure.status}
                                  </p>
                                  <p className="mt-1 text-xs font-semibold text-slate-500">
                                    {procedure.visitId} ·{" "}
                                    {procedure.performedAt
                                      ? new Date(
                                          procedure.performedAt,
                                        ).toLocaleString()
                                      : "Time not recorded"}
                                  </p>
                                </div>
                                <span
                                  className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                                    procedure.status === "completed"
                                      ? "bg-sky-100 text-sky-700"
                                      : "bg-blue-100 text-blue-700"
                                  }`}
                                >
                                  {procedure.status}
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
                  Close
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
                      ? "Continue Treatment"
                      : "Start Treatment"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COMPLETE SESSION ACT CONFIRMATION */}
      {sessionActToComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/25 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-[420px] max-w-[90%] border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600">
                <CheckCircle size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                Mark Treatment Done?
              </h3>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 text-sm text-slate-700 flex flex-col gap-2">
              <p>
                <strong>Act:</strong> {sessionActToComplete.act}
              </p>
              <p>
                <strong>Location:</strong>{" "}
                {getTreatmentLocationLabel(sessionActToComplete)}
              </p>
              <p>
                <strong>Area:</strong>{" "}
                {getTreatmentAreaLabel(sessionActToComplete)}
              </p>
              <p className="text-slate-500">
                This will mark the current session procedure as completed and
                update the linked treatment plan progress.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSessionActToComplete(null)}
                className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCompleteSessionAct}
                className="px-4 py-2 text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-md transition-colors shadow-sm flex items-center gap-2"
              >
                <CheckCircle size={16} /> Confirm Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEND TO ASSISTANT CONFIRMATION */}
      {isSendAssistantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/25 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-[440px] max-w-[90%] border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
                <FileText size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                Send Visit to Assistant?
              </h3>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 text-sm text-slate-700">
              <p className="font-semibold text-slate-800">
                The visit will be marked as needing assistant coding.
              </p>
              <p className="mt-2 text-slate-500">
                Your handoff note will be saved, and you will be redirected to
                the waiting room to select the next patient.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsSendAssistantModalOpen(false)}
                className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSendToAssistant}
                className="px-4 py-2 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-md transition-colors shadow-sm flex items-center gap-2"
              >
                <FileText size={16} /> Confirm & Return
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
              <h3 className="text-lg font-bold text-slate-800">Close Visit?</h3>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 text-sm text-slate-700">
              <p className="font-semibold text-slate-800">
                This visit will be marked as closed.
              </p>
              <p className="mt-2 text-slate-500">
                Structured treatments and posted charges will remain available
                for the cashier workflow. You will be redirected to the waiting
                room.
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
                      Request follow-up scheduling
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Creates a scheduling request for the appointment workflow.
                    </p>
                  </div>
                </label>

                {closeVisitNextSteps.followUpNeeded && (
                  <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-bold text-slate-600">
                          Preferred date
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
                          Urgency
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
                          <option>Routine</option>
                          <option>Soon</option>
                          <option>Urgent</option>
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
                      placeholder="Reason for follow-up..."
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
                      Request medical document
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Creates a document task for prescriptions, certificates,
                      or clinical reports.
                    </p>
                  </div>
                </label>

                {closeVisitNextSteps.documentNeeded && (
                  <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-bold text-slate-600">
                          Document type
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
                          {DOCUMENT_REQUEST_TYPES.map((type) => (
                            <option key={type.id} value={type.id}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-bold text-slate-600">
                          Link to treatment
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
                          <option value="">Visit level</option>
                          {treatmentPlan
                            .filter((item) =>
                              ["proposed", "accepted", "in_progress"].includes(
                                item.status,
                              ),
                            )
                            .map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.act} · {getTreatmentLocationLabel(item)}
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
                      placeholder="What should be prepared?"
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
                Cancel
              </button>
              <button
                onClick={confirmCloseVisit}
                className="px-4 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors shadow-sm flex items-center gap-2"
              >
                <CheckCircle size={16} /> Close & Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
