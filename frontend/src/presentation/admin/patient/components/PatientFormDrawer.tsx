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
  iconBg,
}: {
  icon: React.ReactNode;
  title: string;
  iconColor: string;
  iconBg: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 16,
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          background: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {React.cloneElement(
          icon as React.ReactElement<{ size?: number; color?: string }>,
          { size: 15, color: iconColor },
        )}
      </div>
      <span
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: "var(--foreground)",
          letterSpacing: "0.01em",
        }}
      >
        {title}
      </span>
      <div
        style={{
          flex: 1,
          height: 1,
          background: "var(--border-ui)",
          marginLeft: 2,
        }}
      />
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
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: open
          ? "0 4px 20px rgba(0,0,0,0.08)"
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
            width: 36,
            height: 36,
            borderRadius: 10,
            background: iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {React.cloneElement(
            icon as React.ReactElement<{ size?: number; color?: string }>,
            { size: 16, color: iconColor },
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "var(--foreground)",
            }}
          >
            {title}
          </div>
          {summary && (
            <div
              style={{
                fontSize: 11,
                color: summaryMuted
                  ? "var(--text-placeholder)"
                  : "var(--text-muted)",
                marginTop: 2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {summary}
            </div>
          )}
        </div>
        {savedBadge && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "3px 9px",
              borderRadius: 20,
              background: "#E8F8EC",
              color: "#279C41",
              fontSize: 10,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            <Check size={10} /> Saved
          </span>
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
      setInsurance({
        insuranceProviderId: "",
        isActive: true,
        policyNumber: "",
        memberId: "",
      });
      setInsuranceSaved(false);
      setDocuments([]);
      setDocForm({
        type: DocumentType.GENERAL,
        title: "",
        fileName: "",
        fileUrl: "",
      });
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
    setInsurance({
      insuranceProviderId: "",
      isActive: true,
      policyNumber: "",
      memberId: "",
    });
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
    setDocForm({
      type: DocumentType.GENERAL,
      title: "",
      fileName: "",
      fileUrl: "",
    });
    setShowDocForm(false);
  };

  const handleRemoveDocument = (id: string) =>
    setDocuments((prev) => prev.filter((d) => d.id !== id));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file)
      setDocForm((f) => ({
        ...f,
        fileName: file.name,
        fileUrl: URL.createObjectURL(file),
      }));
  };

  const providerName = (id: string) =>
    insuranceProviders.find((p) => p.id === id)?.name ?? "";

  // ── Shared JSX ──
  const patientFormFields = (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <SectionHeader
          icon={<User />}
          title="Personal Information"
          iconColor="#1e56d0"
          iconBg="#eff6ff"
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
          >
            <TextField
              label="First Name"
              fullWidth
              required
              value={form.firstName}
              onChange={inp("firstName")}
              size="small"
              sx={TF_SX}
            />
            <TextField
              label="Last Name"
              fullWidth
              required
              value={form.lastName}
              onChange={inp("lastName")}
              size="small"
              sx={TF_SX}
            />
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
          >
            <TextField
              label="Date of Birth"
              type="date"
              fullWidth
              value={form.dateOfBirth}
              onChange={inp("dateOfBirth")}
              size="small"
              sx={TF_SX}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <FormControl fullWidth size="small" sx={TF_SX}>
              <InputLabel>Gender</InputLabel>
              <Select
                label="Gender"
                value={form.gender}
                onChange={(e) =>
                  onChange({
                    ...form,
                    gender: e.target.value as PatientGender | "",
                  })
                }
              >
                <MenuItem value="">Not specified</MenuItem>
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
            size="small"
            sx={TF_SX}
            placeholder="e.g. MR-12345"
          />
        </div>
      </div>
      <div>
        <SectionHeader
          icon={<Phone />}
          title="Contact Details"
          iconColor="#0891b2"
          iconBg="#ecfeff"
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
          >
            <TextField
              label="Email Address"
              type="email"
              fullWidth
              required
              value={form.email}
              onChange={inp("email")}
              size="small"
              sx={TF_SX}
            />
            <TextField
              label="Phone Number"
              fullWidth
              value={form.phone}
              onChange={inp("phone")}
              size="small"
              sx={TF_SX}
              placeholder="+212 6XX-XXXXXX"
            />
          </div>
          <TextField
            label="Address"
            fullWidth
            value={form.address}
            onChange={inp("address")}
            size="small"
            sx={TF_SX}
            placeholder="Street, City, Postal Code"
            slotProps={{
              input: {
                startAdornment: (
                  <MapPin
                    size={14}
                    color="var(--text-placeholder)"
                    style={{ marginRight: 6 }}
                  />
                ),
              },
            }}
          />
        </div>
      </div>
      <div>
        <SectionHeader
          icon={<Activity />}
          title="Patient Status"
          iconColor="#279C41"
          iconBg="#E8F8EC"
        />
        <FormControl fullWidth size="small" sx={TF_SX}>
          <InputLabel>Status</InputLabel>
          <Select
            label="Status"
            value={form.status}
            onChange={(e) =>
              onChange({ ...form, status: e.target.value as PatientStatus })
            }
          >
            <MenuItem value={PatientStatus.ACTIVE}>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#279C41",
                    display: "inline-block",
                  }}
                />
                Active — Patient is actively receiving care
              </span>
            </MenuItem>
            <MenuItem value={PatientStatus.INACTIVE}>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#94a3b8",
                    display: "inline-block",
                  }}
                />
                Inactive — Patient is temporarily inactive
              </span>
            </MenuItem>
            <MenuItem value={PatientStatus.ARCHIVED}>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#ea580c",
                    display: "inline-block",
                  }}
                />
                Archived — Record is archived (soft-deleted)
              </span>
            </MenuItem>
          </Select>
        </FormControl>
      </div>
      <div>
        <SectionHeader
          icon={<Heart />}
          title="Medical Information"
          iconColor="#dc2626"
          iconBg="#fff5f5"
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <TextField
            label="Known Allergies"
            fullWidth
            value={form.allergies}
            onChange={inp("allergies")}
            size="small"
            sx={TF_SX}
            placeholder="e.g. Penicillin, Latex, Aspirin"
            helperText="List all known allergies, separated by commas"
          />
          <TextField
            label="Chronic Conditions"
            fullWidth
            value={form.chronicConditions}
            onChange={inp("chronicConditions")}
            size="small"
            sx={TF_SX}
            placeholder="e.g. Diabetes Type 2, Hypertension"
          />
          <TextField
            label="Current Medications"
            fullWidth
            value={form.currentMedications}
            onChange={inp("currentMedications")}
            size="small"
            sx={TF_SX}
            placeholder="e.g. Metformin 500mg, Salbutamol inhaler"
          />
          <TextField
            label="Medical Notes"
            fullWidth
            multiline
            rows={2}
            value={form.medicalNotes}
            onChange={inp("medicalNotes")}
            size="small"
            sx={TF_SX}
            placeholder="Additional medical notes from doctors..."
          />
        </div>
      </div>
      <div>
        <SectionHeader
          icon={<FileText />}
          title="Administrative Notes"
          iconColor="#7c3aed"
          iconBg="#f5f3ff"
        />
        <TextField
          label="Notes"
          fullWidth
          multiline
          rows={2}
          value={form.notes}
          onChange={inp("notes")}
          size="small"
          sx={TF_SX}
          placeholder="Administrative notes (non-medical)..."
        />
      </div>
    </div>
  );

  const insuranceFormFields = (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <FormControl fullWidth size="small" sx={TF_SX}>
        <InputLabel>Insurance Provider *</InputLabel>
        <Select
          label="Insurance Provider *"
          value={insurance.insuranceProviderId}
          onChange={(e) =>
            setInsurance((s) => ({ ...s, insuranceProviderId: e.target.value }))
          }
        >
          <MenuItem value="">
            <em style={{ fontSize: 13, color: "var(--text-placeholder)" }}>
              Select a provider
            </em>
          </MenuItem>
          {insuranceProviders.map((p) => (
            <MenuItem key={p.id} value={p.id} sx={{ fontSize: "0.875rem" }}>
              {p.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <TextField
          label="Policy Number"
          fullWidth
          value={insurance.policyNumber}
          onChange={(e) =>
            setInsurance((s) => ({ ...s, policyNumber: e.target.value }))
          }
          size="small"
          sx={TF_SX}
          placeholder="e.g. POL-12345"
        />
        <TextField
          label="Member ID"
          fullWidth
          value={insurance.memberId}
          onChange={(e) =>
            setInsurance((s) => ({ ...s, memberId: e.target.value }))
          }
          size="small"
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
          gap: 10,
          padding: "10px 14px",
          borderRadius: 8,
          border: `1px solid ${insurance.isActive ? "#86efac" : "var(--border-ui)"}`,
          background: insurance.isActive ? "#f0fdf4" : "var(--surface-page)",
          cursor: "pointer",
          textAlign: "left",
          width: "100%",
        }}
      >
        <Checkbox
          checked={insurance.isActive}
          size="small"
          onChange={(e) =>
            setInsurance((s) => ({ ...s, isActive: e.target.checked }))
          }
          onClick={(e) => e.stopPropagation()}
          sx={{
            padding: 0,
            color: "var(--text-placeholder)",
            "&.Mui-checked": { color: "#279C41" },
          }}
        />
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: insurance.isActive ? "#279C41" : "var(--foreground)",
            }}
          >
            Coverage is Active
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
            Insurance is currently valid and accepted for billing
          </div>
        </div>
      </button>
    </div>
  );

  const insuranceSavedCard = (
    <div
      style={{
        border: "1px solid var(--border-ui)",
        borderRadius: 10,
        overflow: "hidden",
      }}
    >
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
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Shield size={14} color="#0891b2" />
          <span style={{ fontSize: 13, fontWeight: 700, color: "#0891b2" }}>
            {providerName(insurance.insuranceProviderId)}
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "2px 8px",
              borderRadius: 20,
              fontSize: 10,
              fontWeight: 700,
              background: insurance.isActive ? "#E8F8EC" : "#f1f5f9",
              color: insurance.isActive ? "#279C41" : "#64748b",
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: insurance.isActive ? "#279C41" : "#94a3b8",
              }}
            />
            {insurance.isActive ? "Active" : "Inactive"}
          </span>
        </div>
        <button
          onClick={handleRemoveInsurance}
          style={{
            padding: "4px 10px",
            borderRadius: 6,
            border: "1px solid var(--border-ui)",
            background: "var(--surface-card)",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 600,
            color: "var(--foreground)",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <Edit2 size={11} /> Change
        </button>
      </div>
      {(insurance.policyNumber || insurance.memberId) && (
        <div
          style={{
            padding: "12px 16px",
            display: "flex",
            gap: 28,
            background: "var(--surface-card)",
          }}
        >
          {insurance.policyNumber && (
            <div>
              <div
                style={{
                  fontSize: 10,
                  color: "var(--text-placeholder)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 3,
                }}
              >
                Policy Number
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--foreground)",
                }}
              >
                {insurance.policyNumber}
              </div>
            </div>
          )}
          {insurance.memberId && (
            <div>
              <div
                style={{
                  fontSize: 10,
                  color: "var(--text-placeholder)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 3,
                }}
              >
                Member ID
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--foreground)",
                }}
              >
                {insurance.memberId}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const documentsContent = (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* ── Insurance Templates ── */}
      {insuranceTemplates.length > 0 && (
        <div
          style={{
            borderRadius: 10,
            border: "1px solid var(--border-ui)",
            overflow: "hidden",
            marginBottom: 4,
          }}
        >
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
            <span style={{ fontSize: 12, fontWeight: 700, color: "#0891b2" }}>
              Insurance Templates
            </span>
            <span
              style={{
                marginLeft: "auto",
                fontSize: 10,
                color: "#0891b2",
                background: "#cffafe",
                padding: "2px 7px",
                borderRadius: 20,
                fontWeight: 700,
              }}
            >
              {insuranceTemplates.length}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {insuranceTemplates.map((tpl, idx) => (
              <div
                key={tpl.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  borderTop: idx > 0 ? "1px solid var(--border-ui)" : "none",
                  background: "var(--surface-card)",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "#e0f2fe",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <FileText size={14} color="#0891b2" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--foreground)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {tpl.name}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--text-placeholder)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {tpl.getFileName()}
                  </div>
                </div>
                <a
                  href={tpl.fileUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "5px 10px",
                    borderRadius: 7,
                    border: "1px solid var(--border-ui)",
                    background: "var(--surface-card)",
                    color: "var(--foreground)",
                    fontSize: 12,
                    fontWeight: 600,
                    textDecoration: "none",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  <Upload size={11} />
                  Download
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {documents.length === 0 && !showDocForm && (
        <div
          style={{
            textAlign: "center",
            padding: "24px 16px",
            color: "var(--text-placeholder)",
            fontSize: 13,
          }}
        >
          No documents uploaded yet
        </div>
      )}
      {documents.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {documents.map((doc) => {
            const dtCfg =
              DOC_TYPE_CONFIG[doc.type as keyof typeof DOC_TYPE_CONFIG];
            return (
              <div
                key={doc.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "1px solid var(--border-ui)",
                  background: "var(--surface-page)",
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    background: dtCfg?.bg ?? "#f1f5f9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <FileText size={15} color={dtCfg?.color ?? "#64748b"} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--foreground)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {doc.title || doc.fileUrl.split("/").pop() || "Document"}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginTop: 3,
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "1px 7px",
                        borderRadius: 20,
                        fontSize: 10,
                        fontWeight: 700,
                        background: dtCfg?.bg ?? "#f1f5f9",
                        color: dtCfg?.color ?? "#64748b",
                      }}
                    >
                      {dtCfg?.label ?? doc.type}
                    </span>
                    <span
                      style={{ fontSize: 10, color: "var(--text-placeholder)" }}
                    >
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveDocument(doc.id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 5,
                    borderRadius: 6,
                    color: "var(--text-placeholder)",
                    display: "flex",
                    alignItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
      {showDocForm ? (
        <div
          style={{
            border: "1px solid var(--border-ui)",
            borderRadius: 10,
            padding: 16,
            background: "var(--surface-page)",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
          >
            <FormControl fullWidth size="small" sx={TF_SX}>
              <InputLabel>Document Type</InputLabel>
              <Select
                label="Document Type"
                value={docForm.type}
                onChange={(e) =>
                  setDocForm((f) => ({
                    ...f,
                    type: e.target.value as DocumentType,
                  }))
                }
              >
                {Object.values(DocumentType).map((t) => (
                  <MenuItem key={t} value={t} sx={{ fontSize: "0.875rem" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 7,
                      }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background:
                            DOC_TYPE_CONFIG[t as keyof typeof DOC_TYPE_CONFIG]
                              ?.color ?? "#64748b",
                          flexShrink: 0,
                        }}
                      />
                      {DOC_TYPE_CONFIG[t as keyof typeof DOC_TYPE_CONFIG]
                        ?.label ?? t}
                    </span>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Title (optional)"
              fullWidth
              value={docForm.title}
              onChange={(e) =>
                setDocForm((f) => ({ ...f, title: e.target.value }))
              }
              size="small"
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
              padding: "20px 16px",
              borderRadius: 8,
              border: `2px dashed ${docForm.fileName ? "var(--brand-primary)" : "var(--border-ui)"}`,
              background: docForm.fileName ? "#eff6ff" : "var(--surface-card)",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Upload
              size={20}
              color={
                docForm.fileName
                  ? "var(--brand-primary)"
                  : "var(--text-placeholder)"
              }
            />
            {docForm.fileName ? (
              <>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--brand-primary)",
                    maxWidth: "100%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {docForm.fileName}
                </span>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  Click to change file
                </span>
              </>
            ) : (
              <>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--foreground)",
                  }}
                >
                  Click to upload a file
                </span>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  PDF, JPG, PNG, DOC — up to 10 MB
                </span>
              </>
            )}
          </button>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button
              onClick={() => {
                setShowDocForm(false);
                setDocForm({
                  type: DocumentType.GENERAL,
                  title: "",
                  fileName: "",
                  fileUrl: "",
                });
              }}
              style={{
                padding: "7px 16px",
                borderRadius: 8,
                border: "1px solid var(--border-ui)",
                background: "var(--surface-card)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                color: "var(--foreground)",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleAddDocument}
              disabled={!docForm.fileName && !docForm.fileUrl}
              style={{
                padding: "7px 18px",
                borderRadius: 8,
                border: "none",
                background:
                  docForm.fileName || docForm.fileUrl
                    ? "var(--brand-primary)"
                    : "var(--border-ui)",
                color:
                  docForm.fileName || docForm.fileUrl
                    ? "#fff"
                    : "var(--text-placeholder)",
                fontSize: 13,
                fontWeight: 700,
                cursor:
                  docForm.fileName || docForm.fileUrl
                    ? "pointer"
                    : "not-allowed",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Upload size={13} /> Upload Document
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowDocForm(true)}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px dashed var(--border-ui)",
            background: "var(--surface-card)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            fontSize: 13,
            fontWeight: 600,
            color: "var(--text-muted)",
          }}
        >
          <Plus size={14} /> Add Document
        </button>
      )}
    </div>
  );

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: "100vw", sm: 620 },
            display: "flex",
            flexDirection: "column",
            fontFamily: "inherit",
            backgroundColor: "var(--surface-card)",
          },
        },
      }}
    >
      {/* Header */}
      <div
        style={{
          background:
            "linear-gradient(135deg, var(--brand-primary) 0%, #1338a0 100%)",
          padding: "22px 24px 18px",
          flexShrink: 0,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -40,
            top: -40,
            width: 160,
            height: 160,
            borderRadius: "50%",
            border: "32px solid rgba(255,255,255,0.07)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
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
                <span
                  style={{
                    fontSize: 19,
                    fontWeight: 800,
                    color: "#fff",
                    letterSpacing: "-0.03em",
                  }}
                >
                  {avatarInitials}
                </span>
              ) : (
                <UserPlus size={24} color="#fff" />
              )}
            </div>
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.6)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: 2,
                }}
              >
                {isEdit
                  ? "Patient Record"
                  : createStep === 1
                    ? "Step 1 of 3 — Patient Info"
                    : createStep === 2
                      ? "Step 2 of 3 — Insurance"
                      : "Step 3 of 3 — Documents"}
              </div>
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#fff",
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                {isEdit && (form.firstName || form.lastName)
                  ? `${form.firstName} ${form.lastName}`.trim()
                  : "New Patient Registration"}
              </h2>
              {isEdit && form.id && (
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.55)",
                    marginTop: 2,
                  }}
                >
                  ID #{form.id}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.22)",
              borderRadius: 8,
              padding: "6px 7px",
              cursor: "pointer",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <X size={17} />
          </button>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            background:
              "linear-gradient(90deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.1) 100%)",
          }}
        />
      </div>

      {/* Step Indicator (create mode) */}
      {!isEdit && (
        <div
          style={{
            padding: "14px 24px 13px",
            borderBottom: "1px solid var(--border-ui)",
            background: "var(--surface-card)",
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          {CREATE_STEPS.map((step, i) => (
            <React.Fragment key={step.id}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 26,
                    height: 26,
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
                    color:
                      createStep >= step.id
                        ? "#fff"
                        : "var(--text-placeholder)",
                    fontSize: 11,
                    fontWeight: 700,
                    transition: "all 0.2s",
                  }}
                >
                  {createStep > step.id ? <Check size={12} /> : step.id}
                </div>
                <span
                  style={{
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
                </span>
              </div>
              {i < CREATE_STEPS.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: 2,
                    minWidth: 16,
                    margin: "0 8px",
                    borderRadius: 2,
                    background:
                      createStep > step.id ? "#279C41" : "var(--border-ui)",
                    transition: "background 0.3s",
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
        {!isEdit ? (
          <>
            {createStep === 1 && (
              <>
                {(stepError || formError) && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "11px 14px",
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      borderRadius: 10,
                      fontSize: 13,
                      color: "#dc2626",
                      marginBottom: 20,
                    }}
                  >
                    <AlertCircle size={15} style={{ flexShrink: 0 }} />
                    {stepError || formError}
                  </div>
                )}
                {patientFormFields}
              </>
            )}
            {createStep === 2 && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 20 }}
              >
                <div
                  style={{
                    padding: "14px 16px",
                    borderRadius: 10,
                    background:
                      "linear-gradient(135deg, #ecfeff 0%, #eff6ff 100%)",
                    border: "1px solid #bae6fd",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: "rgba(8,145,178,0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Shield size={18} color="#0891b2" />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "var(--foreground)",
                        marginBottom: 2,
                      }}
                    >
                      Insurance Coverage
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      Optionally link a health insurance provider for billing
                      and claims processing.
                    </div>
                  </div>
                </div>
                {insuranceSaved ? insuranceSavedCard : insuranceFormFields}
                {!insuranceSaved && (
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      onClick={handleSaveInsurance}
                      disabled={!insurance.insuranceProviderId}
                      style={{
                        padding: "7px 18px",
                        borderRadius: 8,
                        border: "none",
                        background: insurance.insuranceProviderId
                          ? "var(--brand-primary)"
                          : "var(--border-ui)",
                        color: insurance.insuranceProviderId
                          ? "#fff"
                          : "var(--text-placeholder)",
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: insurance.insuranceProviderId
                          ? "pointer"
                          : "not-allowed",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Shield size={13} /> Save Insurance
                    </button>
                  </div>
                )}
              </div>
            )}
            {createStep === 3 && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 20 }}
              >
                <div
                  style={{
                    padding: "14px 16px",
                    borderRadius: 10,
                    background:
                      "linear-gradient(135deg, #f5f3ff 0%, #faf5ff 100%)",
                    border: "1px solid #ddd6fe",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: "rgba(124,58,237,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <FolderOpen size={18} color="#7c3aed" />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "var(--foreground)",
                        marginBottom: 2,
                      }}
                    >
                      Patient Documents
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      Upload ID cards, insurance policies, medical records, or
                      any relevant documents.
                    </div>
                  </div>
                </div>
                {documentsContent}
              </div>
            )}
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <AccordionSection
              title="Patient Record"
              icon={<User />}
              iconColor="#1e56d0"
              iconBg="#eff6ff"
              savedBadge={savedSection === "patient"}
              summary={
                form.firstName || form.lastName
                  ? `${form.firstName} ${form.lastName}`.trim() +
                    (form.email ? ` · ${form.email}` : "")
                  : "No info recorded"
              }
              summaryMuted={!form.firstName && !form.lastName}
              open={openAccordion === "patient"}
              onToggle={() =>
                setOpenAccordion((p) => (p === "patient" ? null : "patient"))
              }
            >
              {(stepError || formError) && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "11px 14px",
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: 10,
                    fontSize: 13,
                    color: "#dc2626",
                    marginBottom: 20,
                  }}
                >
                  <AlertCircle size={15} style={{ flexShrink: 0 }} />
                  {stepError || formError}
                </div>
              )}
              {patientFormFields}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: 20,
                  paddingTop: 16,
                  borderTop: "1px solid var(--border-ui)",
                }}
              >
                <button
                  onClick={handleSavePatientSection}
                  style={{
                    padding: "8px 22px",
                    borderRadius: 8,
                    border: "none",
                    background:
                      "linear-gradient(135deg, var(--brand-primary) 0%, #1338a0 100%)",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    boxShadow: "0 4px 14px rgba(30,86,208,0.25)",
                  }}
                >
                  <Edit2 size={13} /> Save Patient Record
                </button>
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
                  ? (providerName(insurance.insuranceProviderId) ||
                      "Insurance on file") +
                    (insurance.isActive ? " · Active" : " · Inactive")
                  : "No insurance on file"
              }
              summaryMuted={!insuranceSaved}
              open={openAccordion === "insurance"}
              onToggle={() =>
                setOpenAccordion((p) =>
                  p === "insurance" ? null : "insurance",
                )
              }
            >
              {insuranceSaved ? (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  {insuranceSavedCard}
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      onClick={handleRemoveInsurance}
                      style={{
                        padding: "7px 18px",
                        borderRadius: 8,
                        border: "none",
                        background: "var(--brand-primary)",
                        color: "#fff",
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Edit2 size={13} /> Change Insurance
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  {insuranceFormFields}
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      onClick={handleSaveInsurance}
                      disabled={!insurance.insuranceProviderId}
                      style={{
                        padding: "7px 18px",
                        borderRadius: 8,
                        border: "none",
                        background: insurance.insuranceProviderId
                          ? "var(--brand-primary)"
                          : "var(--border-ui)",
                        color: insurance.insuranceProviderId
                          ? "#fff"
                          : "var(--text-placeholder)",
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: insurance.insuranceProviderId
                          ? "pointer"
                          : "not-allowed",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Shield size={13} /> Save Insurance
                    </button>
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
              onToggle={() =>
                setOpenAccordion((p) =>
                  p === "documents" ? null : "documents",
                )
              }
            >
              {documentsContent}
            </AccordionSection>
          </div>
        )}
      </div>

      {/* Footer */}
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
                <button
                  onClick={onClose}
                  style={{
                    padding: "8px 18px",
                    borderRadius: 8,
                    border: "1px solid var(--border-ui)",
                    background: "var(--surface-card)",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    color: "var(--foreground)",
                  }}
                >
                  Cancel
                </button>
              ) : (
                <button
                  onClick={() => setCreateStep((s) => (s - 1) as 1 | 2 | 3)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "1px solid var(--border-ui)",
                    background: "var(--surface-card)",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    color: "var(--foreground)",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <ChevronLeft size={14} /> Back
                </button>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {createStep === 1 && (
                <button
                  onClick={handleRegisterPatient}
                  style={{
                    padding: "9px 22px",
                    borderRadius: 8,
                    border: "none",
                    background:
                      "linear-gradient(135deg, var(--brand-primary) 0%, #1338a0 100%)",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    boxShadow: "0 4px 14px rgba(30,86,208,0.3)",
                  }}
                >
                  <Plus size={14} /> Register Patient
                </button>
              )}
              {createStep === 2 && (
                <>
                  <button
                    onClick={() => setCreateStep(3)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 8,
                      border: "1px solid var(--border-ui)",
                      background: "var(--surface-card)",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      color: "var(--text-muted)",
                    }}
                  >
                    Skip
                  </button>
                  <button
                    onClick={() => {
                      if (!insuranceSaved && insurance.insuranceProviderId)
                        handleSaveInsurance();
                      setCreateStep(3);
                    }}
                    style={{
                      padding: "9px 22px",
                      borderRadius: 8,
                      border: "none",
                      background:
                        "linear-gradient(135deg, var(--brand-primary) 0%, #1338a0 100%)",
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      boxShadow: "0 4px 14px rgba(30,86,208,0.3)",
                    }}
                  >
                    {insuranceSaved ? "Continue" : "Save & Continue"}{" "}
                    <ChevronRight size={14} />
                  </button>
                </>
              )}
              {createStep === 3 && (
                <button
                  onClick={onClose}
                  style={{
                    padding: "9px 22px",
                    borderRadius: 8,
                    border: "none",
                    background:
                      "linear-gradient(135deg, #279C41 0%, #1d7a30 100%)",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    boxShadow: "0 4px 14px rgba(39,156,65,0.28)",
                  }}
                >
                  <Check size={14} /> Finish
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <button
              onClick={onDelete}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "1px solid #fca5a5",
                background: "#fef2f2",
                color: "#dc2626",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Trash2 size={14} /> Delete Patient
            </button>
            <button
              onClick={onClose}
              style={{
                padding: "8px 20px",
                borderRadius: 8,
                border: "1px solid var(--border-ui)",
                background: "var(--surface-card)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                color: "var(--foreground)",
              }}
            >
              Close
            </button>
          </>
        )}
      </div>
    </Drawer>
  );
}
