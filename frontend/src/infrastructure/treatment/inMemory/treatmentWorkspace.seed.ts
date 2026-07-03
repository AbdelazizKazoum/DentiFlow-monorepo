import type {
  TreatmentPageActiveVisitDTO,
  TreatmentPagePatientDTO,
  TreatmentPageTreatmentChargeDTO,
  TreatmentPageDiagnosisDTO,
  TreatmentPageTreatmentPlanItemDTO,
  TreatmentPageVisitHandoffDTO,
  TreatmentPageVisitProcedureDTO,
} from "../dtos";

export const TREATMENT_DEMO_PATIENT: TreatmentPagePatientDTO = {
  id: "PT-88392",
  name: "Sarah Connor",
  age: 34,
  gender: "Female",
  phone: "+212 600 123456",
  alerts: ["Penicillin Allergy", "Asthma (Mild)"],
  balance: 150.0,
};

export const TREATMENT_DEMO_ACTIVE_VISIT: TreatmentPageActiveVisitDTO = {
  id: "visit_2026_06_23_001",
  patientId: TREATMENT_DEMO_PATIENT.id,
  chairId: "chair_01",
  providerId: "provider_current",
  status: "open",
  startedAt: "2026-06-23T09:30:00.000Z",
};

export const TREATMENT_DEMO_PLAN: TreatmentPageTreatmentPlanItemDTO[] = [
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
];

export const TREATMENT_DEMO_CHARGES: TreatmentPageTreatmentChargeDTO[] = [
  {
    id: "charge_tp_1",
    patientId: TREATMENT_DEMO_PATIENT.id,
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
    createdBy: TREATMENT_DEMO_ACTIVE_VISIT.providerId,
  },
];

export const TREATMENT_DEMO_CURRENT_SESSION: TreatmentPageVisitProcedureDTO[] = [
  {
    id: "cs_1",
    tooth: 45,
    act: "Composite Filling (1 Surface)",
    surfaces: ["O"],
    status: "completed",
    price: 80,
    notes: "Used A2 shade",
    visitId: TREATMENT_DEMO_ACTIVE_VISIT.id,
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
    visitId: TREATMENT_DEMO_ACTIVE_VISIT.id,
    treatmentPlanItemId: "historical_root_canal_11",
    action: "completed",
    performedAt: "2026-06-23T10:15:00.000Z",
    providerId: "provider_current",
  },
];

export const TREATMENT_DEMO_DIAGNOSES: TreatmentPageDiagnosisDTO[] = [
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
];

export const TREATMENT_DEMO_PRIOR_VISIT_PROCEDURES: TreatmentPageVisitProcedureDTO[] =
  [
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

export const TREATMENT_DEMO_PRIOR_VISIT_HANDOFFS: TreatmentPageVisitHandoffDTO[] =
  [
    {
      id: "handoff_visit_2026_06_22_001",
      visitId: "visit_2026_06_22_001",
      patientId: TREATMENT_DEMO_PATIENT.id,
      treatmentPlanItemId: "tp_1",
      text: "RCT started on 16. Patient tolerated anesthesia. Continue canal shaping next visit and check symptoms.",
      status: "coded",
      authoredBy: "provider_current",
      savedAt: "2026-06-22T10:40:00.000Z",
    },
  ];
