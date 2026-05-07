"use client";

import React, { useState, useRef } from "react";
import {
  Drawer,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Button,
  IconButton,
  Typography,
  InputAdornment,
  Chip,
  Divider,
} from "@mui/material";
import {
  X,
  Plus,
  Upload,
  Check,
  Shield,
  FolderOpen,
  User,
  Phone,
  Activity,
  Heart,
  FileText,
  MapPin,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Edit2,
  Trash2,
  UserPlus,
} from "lucide-react";
import {
  PatientStatus,
  PatientGender,
} from "@/domain/patient/entities/patient";
import { InsuranceProvider } from "@/domain/patient/entities/insuranceProvider";
import { InsuranceTemplate } from "@/domain/patient/entities/insuranceTemplate";
import { TF_SX, DOC_TYPE_CONFIG } from "../patientConfig";
import type { PatientFormState, DocumentItemState } from "../types";

// ── Local types ───────────────────────────────────────────────────────────────
interface InsuranceState {
  insuranceProviderId: string;
  isActive: boolean;
  policyNumber: string;
  memberId: string;
}

// ── SectionHeader ─────────────────────────────────────────────────────────────
function SectionHeader({
  icon,
  title,
  iconColor,
}: {
  icon?: React.ReactNode;
  title: string;
  iconColor?: string;
  iconBg?: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {icon && iconColor && (
        <span style={{ color: iconColor, display: "flex", alignItems: "center" }}>
          {React.cloneElement(
            icon as React.ReactElement<{ size?: number; color?: string }>,
            { size: 14, color: iconColor },
          )}
        </span>
      )}
      <p
        className="text-xs font-semibold uppercase tracking-widest"
        style={{ color: "var(--text-muted)", margin: 0 }}
      >
        {title}
      </p>
    </div>
  );
}

// ── AccordionSection ──────────────────────────────────────────────────────────
function AccordionSection({
  title,
  icon,
  iconColor,
  iconBg,
  summary,
  summaryMuted = false,
  savedBadge = false,
  open,
  onToggle,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
  summary?: string;
  summaryMuted?: boolean;
  savedBadge?: boolean;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        border: "1px solid var(--border-ui)",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: open
          ? "0 4px 24px rgba(30,86,208,0.09)"
          : "0 1px 3px rgba(0,0,0,0.04)",
        transition: "box-shadow 0.2s",
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          padding: "14px 16px",
          background: open ? "var(--surface-page)" : "var(--surface-card)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 12,
          textAlign: "left",
          transition: "background 0.15s",
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 11,
            background: iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {React.cloneElement(
            icon as React.ReactElement<{ size?: number; color?: string }>,
            { size: 17, color: iconColor },
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: "var(--foreground)" }}>
            {title}
          </Typography>
          {summary && (
            <Typography
              sx={{
                fontSize: 11,
                color: summaryMuted ? "var(--text-placeholder)" : "var(--text-muted)",
                mt: "2px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {summary}
            </Typography>
          )}
        </div>
        {savedBadge && (
          <Chip
            icon={<Check size={10} />}
            label="Saved"
            size="small"
            sx={{
              height: 22,
              fontSize: 10,
              fontWeight: 700,
              background: "#E8F8EC",
              color: "#279C41",
              "& .MuiChip-icon": { color: "#279C41", ml: "6px" },
              flexShrink: 0,
            }}
          />
        )}
        <ChevronDown
          size={16}
          color="var(--text-placeholder)"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
            flexShrink: 0,
          }}
        />
      </button>
      <div
        style={{
          maxHeight: open ? "3000px" : 0,
          overflow: "hidden",
          transition: open
            ? "max-height 0.4s cubic-bezier(0.0, 0, 0.2, 1)"
            : "max-height 0.25s cubic-bezier(0.4, 0, 1, 1)",
        }}
      >
        <div
          style={{
            padding: "20px",
            borderTop: "1px solid var(--border-ui)",
            background: "var(--surface-card)",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface PatientFormDrawerProps {
  open: boolean;
  form: PatientFormState;
  formError: string;
  isEdit: boolean;
  insuranceProviders: InsuranceProvider[];
  insuranceTemplates: InsuranceTemplate[];
  onClose: () => void;
  onSave: () => void;
  onDelete: () => void;
  onChange: (form: PatientFormState) => void;
}

const CREATE_STEPS = [
  { id: 1 as const, label: "Patient Record" },
  { id: 2 as const, label: "Insurance" },
  { id: 3 as const, label: "Documents" },
];

// ── DocumentType enum (local mirror) ─────────────────────────────────────────
enum DocumentType {
  GENERAL = "GENERAL",
  INSURANCE = "INSURANCE",
  MEDICAL = "MEDICAL",
  OTHER = "OTHER",
}

// ── Error Banner ────────────────────────────────────────────────────────────
function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 p-3 mb-5 rounded-xl text-sm text-red-700 bg-red-50 border border-red-200">
      <AlertCircle size={15} className="shrink-0" />
      {message}
    </div>
  );
}

// ── Shared button styles ──────────────────────────────────────────────────────
const primaryBtnSx = {
  textTransform: "none",
  fontWeight: 700,
  borderRadius: "10px",
  padding: "8px 20px",
  fontSize: "0.8125rem",
  backgroundColor: "var(--brand-primary)",
  boxShadow: "0 2px 8px rgba(30,86,208,0.25)",
  "&:hover": {
    backgroundColor: "var(--brand-primary-dark)",
    boxShadow: "0 4px 14px rgba(30,86,208,0.35)",
  },
  "&.Mui-disabled": { backgroundColor: "var(--brand-primary)", opacity: 0.5 },
} as const;

const outlinedBtnSx = {
  textTransform: "none",
  fontWeight: 600,
  borderRadius: "10px",
  padding: "8px 18px",
  fontSize: "0.8125rem",
  borderColor: "var(--border-ui)",
  color: "var(--foreground)",
  "&:hover": { borderColor: "var(--text-muted)", background: "var(--surface-page)" },
} as const;

// ── Component ─────────────────────────────────────────────────────────────────
export function PatientFormDrawer({
  open,
  form,
  formError,
  isEdit,
  insuranceProviders,
  insuranceTemplates,
  onClose,
  onSave,
  onDelete,
  onChange,
}: PatientFormDrawerProps) {
  const inp =
    (field: keyof PatientFormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange({ ...form, [field]: e.target.value });

  const avatarInitials = isEdit
    ? (form.firstName.charAt(0) || "").toUpperCase() +
      (form.lastName.charAt(0) || "").toUpperCase()
    : "";

  const [createStep, setCreateStep] = useState<1 | 2 | 3>(1);
  const [stepError, setStepError] = useState("");

  const [insurance, setInsurance] = useState<InsuranceState>({
    insuranceProviderId: "",
    isActive: true,
    policyNumber: "",
    memberId: "",
  });
  const [insuranceSaved, setInsuranceSaved] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<DocumentItemState[]>([]);
  const [docForm, setDocForm] = useState<{
    type: DocumentType;
    title: string;
    fileName: string;
    fileUrl: string;
  }>({ type: DocumentType.GENERAL, title: "", fileName: "", fileUrl: "" });
  const [showDocForm, setShowDocForm] = useState(false);

  const [openAccordion, setOpenAccordion] = useState<string | null>("patient");
  const [savedSection, setSavedSection] = useState<string | null>(null);

  React.useEffect(() => {
    if (!open) {
      setCreateStep(1);
      setStepError("");
      setInsurance({ insuranceProviderId: "", isActive: true, policyNumber: "", memberId: "" });
      setInsuranceSaved(false);
      setDocuments([]);
      setDocForm({ type: DocumentType.GENERAL, title: "", fileName: "", fileUrl: "" });
      setShowDocForm(false);
      setOpenAccordion("patient");
      setSavedSection(null);
    }
  }, [open]);

  const handleRegisterPatient = () => {
    setStepError("");
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setStepError("First and last name are required.");
      return;
    }
    if (!form.email.trim()) {
      setStepError("Email address is required.");
      return;
    }
    onSave();
    setCreateStep(2);
  };

  const handleSavePatientSection = () => {
    onSave();
    setOpenAccordion(null);
    setSavedSection("patient");
    setTimeout(() => setSavedSection(null), 3000);
  };

  const handleSaveInsurance = () => {
    if (!insurance.insuranceProviderId) return;
    setInsuranceSaved(true);
    if (isEdit) {
      setSavedSection("insurance");
      setTimeout(() => setSavedSection(null), 3000);
    }
  };

  const handleRemoveInsurance = () => {
    setInsurance({ insuranceProviderId: "", isActive: true, policyNumber: "", memberId: "" });
    setInsuranceSaved(false);
  };

  const handleAddDocument = () => {
    if (!docForm.fileName && !docForm.fileUrl) return;
    setDocuments((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        type: docForm.type,
        fileUrl: docForm.fileUrl || docForm.fileName,
        title: docForm.title,
        createdAt: new Date().toISOString(),
      },
    ]);
    setDocForm({ type: DocumentType.GENERAL, title: "", fileName: "", fileUrl: "" });
    setShowDocForm(false);
  };

  const handleRemoveDocument = (id: string) =>
    setDocuments((prev) => prev.filter((d) => d.id !== id));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file)
      setDocForm((f) => ({ ...f, fileName: file.name, fileUrl: URL.createObjectURL(file) }));
  };

  const providerName = (id: string) =>
    insuranceProviders.find((p) => p.id === id)?.name ?? "";

  // ── Patient Form Fields ──
  const patientFormFields = (
    <div className="flex flex-col gap-4">
      {/* Personal Information */}
      <div>
        <SectionHeader icon={<User />} title="Personal Information" iconColor="#1e56d0" iconBg="#eff6ff" />
        <div className="flex flex-col gap-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
            <TextField
              label="First Name"
              fullWidth
              required
              value={form.firstName}
              onChange={inp("firstName")}
              sx={TF_SX}
              placeholder="e.g. Fatima"
            />
            <TextField
              label="Last Name"
              fullWidth
              required
              value={form.lastName}
              onChange={inp("lastName")}
              sx={TF_SX}
              placeholder="e.g. Benali"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
            <TextField
              label="Date of Birth"
              type="date"
              fullWidth
              value={form.dateOfBirth}
              onChange={inp("dateOfBirth")}
              sx={TF_SX}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <FormControl fullWidth sx={TF_SX}>
              <InputLabel>Gender</InputLabel>
              <Select
                label="Gender"
                value={form.gender}
                onChange={(e) =>
                  onChange({ ...form, gender: e.target.value as PatientGender | "" })
                }
              >
                <MenuItem value=""><em style={{ fontSize: 14, color: "var(--text-placeholder)" }}>Not specified</em></MenuItem>
                <MenuItem value={PatientGender.MALE}>Male</MenuItem>
                <MenuItem value={PatientGender.FEMALE}>Female</MenuItem>
                <MenuItem value={PatientGender.OTHER}>Other</MenuItem>
              </Select>
            </FormControl>
          </div>
          <TextField
            label="CNIE (National Identity Number)"
            fullWidth
            value={form.cnie}
            onChange={inp("cnie")}
            sx={TF_SX}
            placeholder="e.g. MR-12345"
          />
        </div>
      </div>

      <Divider sx={{ borderColor: "var(--border-ui)" }} />

      {/* Contact Details */}
      <div>
        <SectionHeader icon={<Phone />} title="Contact Details" iconColor="#0891b2" iconBg="#ecfeff" />
        <div className="flex flex-col gap-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
            <TextField
              label="Email Address"
              type="email"
              fullWidth
              required
              value={form.email}
              onChange={inp("email")}
              sx={TF_SX}
              placeholder="e.g. fatima@email.com"
            />
            <TextField
              label="Phone Number"
              fullWidth
              value={form.phone}
              onChange={inp("phone")}
              sx={TF_SX}
              placeholder="+212 6XX-XXXXXX"
            />
          </div>
          <TextField
            label="Address"
            fullWidth
            value={form.address}
            onChange={inp("address")}
            sx={TF_SX}
            placeholder="Street, City, Postal Code"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <MapPin size={14} color="var(--text-placeholder)" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </div>
      </div>

      <Divider sx={{ borderColor: "var(--border-ui)" }} />

      {/* Patient Status */}
      <div>
        <SectionHeader icon={<Activity />} title="Patient Status" iconColor="#279C41" iconBg="#E8F8EC" />
        <FormControl fullWidth sx={TF_SX}>
          <InputLabel>Status</InputLabel>
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => onChange({ ...form, status: e.target.value as PatientStatus })}
          >
            <MenuItem value={PatientStatus.ACTIVE}>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                Active — Currently receiving care
              </span>
            </MenuItem>
            <MenuItem value={PatientStatus.INACTIVE}>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
                Inactive — Temporarily inactive
              </span>
            </MenuItem>
            <MenuItem value={PatientStatus.ARCHIVED}>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
                Archived — Record archived
              </span>
            </MenuItem>
          </Select>
        </FormControl>
      </div>

      <Divider sx={{ borderColor: "var(--border-ui)" }} />

      {/* Medical Information */}
      <div>
        <SectionHeader icon={<Heart />} title="Medical Information" iconColor="#dc2626" iconBg="#fff5f5" />
        <div className="flex flex-col gap-1">
          <TextField
            label="Known Allergies"
            fullWidth
            value={form.allergies}
            onChange={inp("allergies")}
            sx={{ ...TF_SX, mb: 2 }}
            placeholder="e.g. Penicillin, Latex, Aspirin"
            helperText="List all known allergies, separated by commas"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
            <TextField
              label="Chronic Conditions"
              fullWidth
              value={form.chronicConditions}
              onChange={inp("chronicConditions")}
              sx={TF_SX}
              placeholder="e.g. Diabetes Type 2"
            />
            <TextField
              label="Current Medications"
              fullWidth
              value={form.currentMedications}
              onChange={inp("currentMedications")}
              sx={TF_SX}
              placeholder="e.g. Metformin 500mg"
            />
          </div>
          <TextField
            label="Medical Notes"
            fullWidth
            multiline
            rows={3}
            value={form.medicalNotes}
            onChange={inp("medicalNotes")}
            sx={TF_SX}
            placeholder="Additional medical notes from doctors..."
          />
        </div>
      </div>

      <Divider sx={{ borderColor: "var(--border-ui)" }} />

      {/* Administrative Notes */}
      <div>
        <SectionHeader icon={<FileText />} title="Administrative Notes" iconColor="#7c3aed" iconBg="#f5f3ff" />
        <TextField
          label="Notes"
          fullWidth
          multiline
          rows={3}
          value={form.notes}
          onChange={inp("notes")}
          sx={TF_SX}
          placeholder="Administrative notes (non-medical)..."
        />
      </div>
    </div>
  );

  // ── Insurance Form Fields ──
  const insuranceFormFields = (
    <div className="flex flex-col gap-4">
      <FormControl fullWidth sx={TF_SX}>
        <InputLabel>Insurance Provider *</InputLabel>
        <Select
          label="Insurance Provider *"
          value={insurance.insuranceProviderId}
          onChange={(e) =>
            setInsurance((s) => ({ ...s, insuranceProviderId: e.target.value }))
          }
        >
          <MenuItem value="">
            <em style={{ fontSize: 13, color: "var(--text-placeholder)" }}>Select a provider</em>
          </MenuItem>
          {insuranceProviders.map((p) => (
            <MenuItem key={p.id} value={p.id} sx={{ fontSize: "0.875rem" }}>
              {p.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          label="Policy Number"
          fullWidth
          value={insurance.policyNumber}
          onChange={(e) => setInsurance((s) => ({ ...s, policyNumber: e.target.value }))}
          sx={TF_SX}
          placeholder="e.g. POL-12345"
        />
        <TextField
          label="Member ID"
          fullWidth
          value={insurance.memberId}
          onChange={(e) => setInsurance((s) => ({ ...s, memberId: e.target.value }))}
          sx={TF_SX}
          placeholder="e.g. MBR-67890"
        />
      </div>
      <button
        type="button"
        onClick={() => setInsurance((s) => ({ ...s, isActive: !s.isActive }))}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 14px",
          borderRadius: 10,
          border: `1.5px solid ${insurance.isActive ? "#86efac" : "var(--border-ui)"}`,
          background: insurance.isActive ? "#f0fdf4" : "var(--surface-page)",
          cursor: "pointer",
          textAlign: "left",
          width: "100%",
          transition: "all 0.15s",
        }}
      >
        <Checkbox
          checked={insurance.isActive}
          size="small"
          onChange={(e) => setInsurance((s) => ({ ...s, isActive: e.target.checked }))}
          onClick={(e) => e.stopPropagation()}
          sx={{ padding: 0, color: "var(--text-placeholder)", "&.Mui-checked": { color: "#279C41" } }}
        />
        <div>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: insurance.isActive ? "#279C41" : "var(--foreground)" }}>
            Coverage is Active
          </Typography>
          <Typography sx={{ fontSize: 11, color: "var(--text-muted)" }}>
            Insurance is currently valid and accepted for billing
          </Typography>
        </div>
        {insurance.isActive && (
          <Chip
            label="Active"
            size="small"
            sx={{ ml: "auto", height: 20, fontSize: 10, fontWeight: 700, background: "#dcfce7", color: "#279C41" }}
          />
        )}
      </button>
    </div>
  );

  // ── Insurance Saved Card ──
  const insuranceSavedCard = (
    <div style={{ border: "1px solid var(--border-ui)", borderRadius: 12, overflow: "hidden" }}>
      <div
        style={{
          background: "linear-gradient(135deg, #ecfeff 0%, #e0f2fe 100%)",
          borderBottom: "1px solid var(--border-ui)",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div className="flex items-center gap-2">
          <Shield size={15} color="#0891b2" />
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#0891b2" }}>
            {providerName(insurance.insuranceProviderId)}
          </Typography>
          <Chip
            label={insurance.isActive ? "Active" : "Inactive"}
            size="small"
            sx={{
              height: 20,
              fontSize: 10,
              fontWeight: 700,
              background: insurance.isActive ? "#E8F8EC" : "#f1f5f9",
              color: insurance.isActive ? "#279C41" : "#64748b",
            }}
          />
        </div>
        <Button
          size="small"
          variant="outlined"
          startIcon={<Edit2 size={11} />}
          onClick={handleRemoveInsurance}
          sx={{ ...outlinedBtnSx, padding: "4px 12px", fontSize: "0.75rem" }}
        >
          Change
        </Button>
      </div>
      {(insurance.policyNumber || insurance.memberId) && (
        <div className="flex gap-7 p-4" style={{ background: "var(--surface-card)" }}>
          {insurance.policyNumber && (
            <div>
              <Typography sx={{ fontSize: 10, color: "var(--text-placeholder)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", mb: "3px" }}>
                Policy Number
              </Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>
                {insurance.policyNumber}
              </Typography>
            </div>
          )}
          {insurance.memberId && (
            <div>
              <Typography sx={{ fontSize: 10, color: "var(--text-placeholder)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", mb: "3px" }}>
                Member ID
              </Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>
                {insurance.memberId}
              </Typography>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // ── Documents Content ──
  const documentsContent = (
    <div className="flex flex-col gap-3">
      {insuranceTemplates.length > 0 && (
        <div style={{ borderRadius: 12, border: "1px solid var(--border-ui)", overflow: "hidden", marginBottom: 4 }}>
          <div
            style={{
              padding: "10px 14px",
              background: "linear-gradient(135deg, #ecfeff 0%, #e0f2fe 100%)",
              borderBottom: "1px solid var(--border-ui)",
              display: "flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            <Shield size={13} color="#0891b2" />
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#0891b2" }}>
              Insurance Templates
            </Typography>
            <Chip
              label={insuranceTemplates.length}
              size="small"
              sx={{ ml: "auto", height: 20, fontSize: 10, fontWeight: 700, background: "#cffafe", color: "#0891b2" }}
            />
          </div>
          <div className="flex flex-col">
            {insuranceTemplates.map((tpl, idx) => (
              <div
                key={tpl.id}
                className="flex items-center gap-3 p-3"
                style={{
                  borderTop: idx > 0 ? "1px solid var(--border-ui)" : "none",
                  background: "var(--surface-card)",
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    background: "#e0f2fe",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <FileText size={14} color="#0891b2" />
                </div>
                <div className="flex-1 min-w-0">
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {tpl.name}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: "var(--text-placeholder)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {tpl.getFileName()}
                  </Typography>
                </div>
                <Button
                  component="a"
                  href={tpl.fileUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  variant="outlined"
                  startIcon={<Upload size={11} />}
                  sx={{ ...outlinedBtnSx, padding: "4px 12px", fontSize: "0.75rem", flexShrink: 0 }}
                >
                  Download
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {documents.length === 0 && !showDocForm && (
        <div
          style={{
            textAlign: "center",
            padding: "28px 16px",
            borderRadius: 12,
            border: "1px dashed var(--border-ui)",
            background: "var(--surface-page)",
          }}
        >
          <FolderOpen size={28} color="var(--text-placeholder)" style={{ margin: "0 auto 8px" }} />
          <Typography sx={{ fontSize: 13, color: "var(--text-placeholder)", fontWeight: 500 }}>
            No documents uploaded yet
          </Typography>
        </div>
      )}

      {documents.length > 0 && (
        <div className="flex flex-col gap-2">
          {documents.map((doc) => {
            const dtCfg = DOC_TYPE_CONFIG[doc.type as keyof typeof DOC_TYPE_CONFIG];
            return (
              <div
                key={doc.id}
                className="flex items-center gap-3 p-3"
                style={{ borderRadius: 10, border: "1px solid var(--border-ui)", background: "var(--surface-page)" }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9,
                    background: dtCfg?.bg ?? "#f1f5f9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <FileText size={15} color={dtCfg?.color ?? "#64748b"} />
                </div>
                <div className="flex-1 min-w-0">
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {doc.title || doc.fileUrl.split("/").pop() || "Document"}
                  </Typography>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Chip
                      label={dtCfg?.label ?? doc.type}
                      size="small"
                      sx={{ height: 18, fontSize: 10, fontWeight: 700, background: dtCfg?.bg ?? "#f1f5f9", color: dtCfg?.color ?? "#64748b" }}
                    />
                    <Typography sx={{ fontSize: 10, color: "var(--text-placeholder)" }}>
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </Typography>
                  </div>
                </div>
                <IconButton
                  size="small"
                  onClick={() => handleRemoveDocument(doc.id)}
                  sx={{ color: "var(--text-placeholder)", "&:hover": { color: "#dc2626", background: "#fef2f2" } }}
                >
                  <X size={14} />
                </IconButton>
              </div>
            );
          })}
        </div>
      )}

      {showDocForm ? (
        <div
          style={{ border: "1px solid var(--border-ui)", borderRadius: 12, padding: 16, background: "var(--surface-page)" }}
          className="flex flex-col gap-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormControl fullWidth sx={TF_SX}>
              <InputLabel>Document Type</InputLabel>
              <Select
                label="Document Type"
                value={docForm.type}
                onChange={(e) => setDocForm((f) => ({ ...f, type: e.target.value as DocumentType }))}
              >
                {Object.values(DocumentType).map((t) => (
                  <MenuItem key={t} value={t} sx={{ fontSize: "0.875rem" }}>
                    <span className="flex items-center gap-2">
                      <span
                        style={{
                          display: "inline-block",
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: DOC_TYPE_CONFIG[t as keyof typeof DOC_TYPE_CONFIG]?.color ?? "#64748b",
                          flexShrink: 0,
                        }}
                      />
                      {DOC_TYPE_CONFIG[t as keyof typeof DOC_TYPE_CONFIG]?.label ?? t}
                    </span>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Title (optional)"
              fullWidth
              value={docForm.title}
              onChange={(e) => setDocForm((f) => ({ ...f, title: e.target.value }))}
              sx={TF_SX}
              placeholder="e.g. Insurance Card"
            />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            style={{ display: "none" }}
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: "100%",
              padding: "22px 16px",
              borderRadius: 10,
              border: `2px dashed ${docForm.fileName ? "var(--brand-primary)" : "var(--border-ui)"}`,
              background: docForm.fileName ? "#eff6ff" : "var(--surface-card)",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              transition: "all 0.15s",
            }}
          >
            <Upload size={22} color={docForm.fileName ? "var(--brand-primary)" : "var(--text-placeholder)"} />
            {docForm.fileName ? (
              <>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "var(--brand-primary)", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {docForm.fileName}
                </Typography>
                <Typography sx={{ fontSize: 11, color: "var(--text-muted)" }}>Click to change file</Typography>
              </>
            ) : (
              <>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>
                  Click to upload a file
                </Typography>
                <Typography sx={{ fontSize: 11, color: "var(--text-muted)" }}>
                  PDF, JPG, PNG, DOC — up to 10 MB
                </Typography>
              </>
            )}
          </button>
          <div className="flex justify-end gap-2">
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setShowDocForm(false);
                setDocForm({ type: DocumentType.GENERAL, title: "", fileName: "", fileUrl: "" });
              }}
              sx={outlinedBtnSx}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              size="small"
              disabled={!docForm.fileName && !docForm.fileUrl}
              onClick={handleAddDocument}
              startIcon={<Upload size={13} />}
              sx={primaryBtnSx}
            >
              Upload Document
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outlined"
          fullWidth
          onClick={() => setShowDocForm(true)}
          startIcon={<Plus size={14} />}
          sx={{
            ...outlinedBtnSx,
            borderStyle: "dashed",
            padding: "10px 14px",
            color: "var(--text-muted)",
            "&:hover": { borderColor: "var(--brand-primary)", color: "var(--brand-primary)", background: "#eff6ff" },
          }}
        >
          Add Document
        </Button>
      )}
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: "100vw", sm: 640 },
            display: "flex",
            flexDirection: "column",
            fontFamily: "inherit",
            backgroundColor: "var(--surface-card)",
          },
        },
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          background: "linear-gradient(135deg, var(--brand-primary) 0%, #1338a0 100%)",
          padding: "22px 24px 18px",
          flexShrink: 0,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", right: -40, top: -40, width: 180, height: 180, borderRadius: "50%", border: "36px solid rgba(255,255,255,0.07)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 60, bottom: -20, width: 80, height: 80, borderRadius: "50%", border: "18px solid rgba(255,255,255,0.05)", pointerEvents: "none" }} />

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 15,
                background: "rgba(255,255,255,0.18)",
                border: "2px solid rgba(255,255,255,0.28)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                backdropFilter: "blur(4px)",
              }}
            >
              {isEdit && avatarInitials ? (
                <span style={{ fontSize: 19, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>
                  {avatarInitials}
                </span>
              ) : (
                <UserPlus size={24} color="#fff" />
              )}
            </div>
            <div>
              <Typography
                sx={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.1em", mb: "2px" }}
              >
                {isEdit
                  ? "Patient Record"
                  : createStep === 1
                  ? "Step 1 of 3 — Patient Info"
                  : createStep === 2
                  ? "Step 2 of 3 — Insurance"
                  : "Step 3 of 3 — Documents"}
              </Typography>
              <Typography component="h2" sx={{ fontSize: 18, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>
                {isEdit && (form.firstName || form.lastName)
                  ? `${form.firstName} ${form.lastName}`.trim()
                  : "New Patient Registration"}
              </Typography>
              {isEdit && form.id && (
                <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.5)", mt: "2px" }}>
                  ID #{form.id}
                </Typography>
              )}
            </div>
          </div>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.22)",
              color: "#fff",
              "&:hover": { background: "rgba(255,255,255,0.25)" },
            }}
          >
            <X size={17} />
          </IconButton>
        </div>

        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.05) 100%)" }} />
      </div>

      {/* ── Step Indicator (create mode) ── */}
      {!isEdit && (
        <div
          style={{
            padding: "14px 24px",
            borderBottom: "1px solid var(--border-ui)",
            background: "var(--surface-card)",
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          {CREATE_STEPS.map((step, i) => (
            <React.Fragment key={step.id}>
              <div className="flex items-center gap-2">
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    background:
                      createStep > step.id
                        ? "#279C41"
                        : createStep === step.id
                        ? "var(--brand-primary)"
                        : "var(--surface-page)",
                    border:
                      createStep > step.id
                        ? "none"
                        : createStep === step.id
                        ? "2px solid var(--brand-primary)"
                        : "2px solid var(--border-ui)",
                    color: createStep >= step.id ? "#fff" : "var(--text-placeholder)",
                    fontSize: 11,
                    fontWeight: 700,
                    transition: "all 0.2s",
                    boxShadow: createStep === step.id ? "0 0 0 4px rgba(30,86,208,0.12)" : "none",
                  }}
                >
                  {createStep > step.id ? <Check size={13} /> : step.id}
                </div>
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: createStep === step.id ? 700 : 400,
                    whiteSpace: "nowrap",
                    transition: "color 0.2s",
                    color:
                      createStep > step.id
                        ? "#279C41"
                        : createStep === step.id
                        ? "var(--foreground)"
                        : "var(--text-placeholder)",
                  }}
                >
                  {step.label}
                </Typography>
              </div>
              {i < CREATE_STEPS.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: 2,
                    minWidth: 16,
                    margin: "0 10px",
                    borderRadius: 2,
                    background: createStep > step.id ? "#279C41" : "var(--border-ui)",
                    transition: "background 0.3s",
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* ── Body ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
        {!isEdit ? (
          <>
            {createStep === 1 && (
              <>
                {(stepError || formError) && <ErrorBanner message={stepError || formError} />}
                {patientFormFields}
              </>
            )}

            {createStep === 2 && (
              <div className="flex flex-col gap-5">
                <div
                  style={{
                    padding: "14px 16px",
                    borderRadius: 12,
                    background: "linear-gradient(135deg, #ecfeff 0%, #eff6ff 100%)",
                    border: "1px solid #bae6fd",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(8,145,178,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Shield size={18} color="#0891b2" />
                  </div>
                  <div>
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: "var(--foreground)", mb: "2px" }}>
                      Insurance Coverage
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "var(--text-muted)" }}>
                      Optionally link a health insurance provider for billing and claims processing.
                    </Typography>
                  </div>
                </div>
                {insuranceSaved ? insuranceSavedCard : insuranceFormFields}
                {!insuranceSaved && (
                  <div className="flex justify-end">
                    <Button
                      variant="contained"
                      disabled={!insurance.insuranceProviderId}
                      onClick={handleSaveInsurance}
                      startIcon={<Shield size={13} />}
                      sx={primaryBtnSx}
                    >
                      Save Insurance
                    </Button>
                  </div>
                )}
              </div>
            )}

            {createStep === 3 && (
              <div className="flex flex-col gap-5">
                <div
                  style={{
                    padding: "14px 16px",
                    borderRadius: 12,
                    background: "linear-gradient(135deg, #f5f3ff 0%, #faf5ff 100%)",
                    border: "1px solid #ddd6fe",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(124,58,237,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <FolderOpen size={18} color="#7c3aed" />
                  </div>
                  <div>
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: "var(--foreground)", mb: "2px" }}>
                      Patient Documents
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "var(--text-muted)" }}>
                      Upload ID cards, insurance policies, medical records, or any relevant documents.
                    </Typography>
                  </div>
                </div>
                {documentsContent}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col gap-3">
            <AccordionSection
              title="Patient Record"
              icon={<User />}
              iconColor="#1e56d0"
              iconBg="#eff6ff"
              savedBadge={savedSection === "patient"}
              summary={
                form.firstName || form.lastName
                  ? `${form.firstName} ${form.lastName}`.trim() + (form.email ? ` · ${form.email}` : "")
                  : "No info recorded"
              }
              summaryMuted={!form.firstName && !form.lastName}
              open={openAccordion === "patient"}
              onToggle={() => setOpenAccordion((p) => (p === "patient" ? null : "patient"))}
            >
              {(stepError || formError) && <ErrorBanner message={stepError || formError} />}
              {patientFormFields}
              <Divider sx={{ mt: 3, mb: 2, borderColor: "var(--border-ui)" }} />
              <div className="flex justify-end">
                <Button variant="contained" onClick={handleSavePatientSection} startIcon={<Edit2 size={13} />} sx={primaryBtnSx}>
                  Save Patient Record
                </Button>
              </div>
            </AccordionSection>

            <AccordionSection
              title="Insurance Coverage"
              icon={<Shield />}
              iconColor="#0891b2"
              iconBg="#ecfeff"
              savedBadge={savedSection === "insurance"}
              summary={
                insuranceSaved
                  ? (providerName(insurance.insuranceProviderId) || "Insurance on file") + (insurance.isActive ? " · Active" : " · Inactive")
                  : "No insurance on file"
              }
              summaryMuted={!insuranceSaved}
              open={openAccordion === "insurance"}
              onToggle={() => setOpenAccordion((p) => (p === "insurance" ? null : "insurance"))}
            >
              {insuranceSaved ? (
                <div className="flex flex-col gap-4">
                  {insuranceSavedCard}
                  <div className="flex justify-end">
                    <Button variant="contained" onClick={handleRemoveInsurance} startIcon={<Edit2 size={13} />} sx={primaryBtnSx}>
                      Change Insurance
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {insuranceFormFields}
                  <div className="flex justify-end">
                    <Button variant="contained" disabled={!insurance.insuranceProviderId} onClick={handleSaveInsurance} startIcon={<Shield size={13} />} sx={primaryBtnSx}>
                      Save Insurance
                    </Button>
                  </div>
                </div>
              )}
            </AccordionSection>

            <AccordionSection
              title="Documents"
              icon={<FolderOpen />}
              iconColor="#7c3aed"
              iconBg="#f5f3ff"
              summary={
                documents.length > 0
                  ? `${documents.length} document${documents.length > 1 ? "s" : ""} on file`
                  : "No documents uploaded"
              }
              summaryMuted={documents.length === 0}
              open={openAccordion === "documents"}
              onToggle={() => setOpenAccordion((p) => (p === "documents" ? null : "documents"))}
            >
              {documentsContent}
            </AccordionSection>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div
        style={{
          padding: "14px 24px",
          borderTop: "1px solid var(--border-ui)",
          background: "var(--surface-card)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          flexShrink: 0,
        }}
      >
        {!isEdit ? (
          <>
            <div>
              {createStep === 1 ? (
                <Button variant="outlined" onClick={onClose} sx={outlinedBtnSx}>
                  Cancel
                </Button>
              ) : (
                <Button variant="outlined" onClick={() => setCreateStep((s) => (s - 1) as 1 | 2 | 3)} startIcon={<ChevronLeft size={14} />} sx={outlinedBtnSx}>
                  Back
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {createStep === 1 && (
                <Button variant="contained" onClick={handleRegisterPatient} startIcon={<Plus size={14} />} sx={primaryBtnSx}>
                  Register Patient
                </Button>
              )}
              {createStep === 2 && (
                <>
                  <Button variant="outlined" onClick={() => setCreateStep(3)} sx={{ ...outlinedBtnSx, color: "var(--text-muted)" }}>
                    Skip
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => {
                      if (!insuranceSaved && insurance.insuranceProviderId) handleSaveInsurance();
                      setCreateStep(3);
                    }}
                    endIcon={<ChevronRight size={14} />}
                    sx={primaryBtnSx}
                  >
                    {insuranceSaved ? "Continue" : "Save & Continue"}
                  </Button>
                </>
              )}
              {createStep === 3 && (
                <Button
                  variant="contained"
                  onClick={onClose}
                  startIcon={<Check size={14} />}
                  sx={{
                    ...primaryBtnSx,
                    backgroundColor: "#279C41",
                    "&:hover": { backgroundColor: "#1d7a30", boxShadow: "0 4px 14px rgba(39,156,65,0.35)" },
                    boxShadow: "0 2px 8px rgba(39,156,65,0.28)",
                  }}
                >
                  Finish
                </Button>
              )}
            </div>
          </>
        ) : (
          <>
            <Button
              variant="outlined"
              color="error"
              onClick={onDelete}
              startIcon={<Trash2 size={14} />}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "10px",
                padding: "8px 16px",
                fontSize: "0.8125rem",
                borderColor: "#fca5a5",
                color: "#dc2626",
                background: "#fef2f2",
                "&:hover": { borderColor: "#f87171", background: "#fee2e2" },
              }}
            >
              Delete Patient
            </Button>
            <Button variant="outlined" onClick={onClose} sx={outlinedBtnSx}>
              Close
            </Button>
          </>
        )}
      </div>
    </Drawer>
  );
}
