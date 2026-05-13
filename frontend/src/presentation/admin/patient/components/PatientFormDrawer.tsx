"use client";

import React, { useState } from "react";
import { Drawer, Button, IconButton, Typography, Divider } from "@mui/material";
import {
  X,
  Plus,
  Check,
  Shield,
  FolderOpen,
  User,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  UserPlus,
} from "lucide-react";
import { InsuranceProvider } from "@/domain/patient/entities/insuranceProvider";
import { InsuranceTemplate } from "@/domain/patient/entities/insuranceTemplate";
import type { PatientFormState, DocumentItemState } from "../types";

import {
  AccordionSection,
  ErrorBanner,
  primaryBtnSx,
  outlinedBtnSx,
  InsuranceState,
} from "./patient-form-drawer/SharedUI";
import { PatientRecordSection } from "./patient-form-drawer/PatientRecordSection";
import { InsuranceSection } from "./patient-form-drawer/InsuranceSection";
import { DocumentsSection } from "./patient-form-drawer/DocumentsSection";

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

  const [documents, setDocuments] = useState<DocumentItemState[]>([]);

  const [openAccordion, setOpenAccordion] = useState<string | null>("patient");
  const [savedSection, setSavedSection] = useState<string | null>(null);

  React.useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
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
        setOpenAccordion("patient");
        setSavedSection(null);
      }, 0);
      return () => clearTimeout(timer);
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

  const providerName = (id: string) =>
    insuranceProviders.find((p) => p.id === id)?.name ?? "";

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: "100vw", sm: 800 },
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
            width: 180,
            height: 180,
            borderRadius: "50%",
            border: "36px solid rgba(255,255,255,0.07)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 60,
            bottom: -20,
            width: 80,
            height: 80,
            borderRadius: "50%",
            border: "18px solid rgba(255,255,255,0.05)",
            pointerEvents: "none",
          }}
        />

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
              <Typography
                sx={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.6)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  mb: "2px",
                }}
              >
                {isEdit
                  ? "Patient Record"
                  : createStep === 1
                  ? "Step 1 of 3 — Patient Info"
                  : createStep === 2
                  ? "Step 2 of 3 — Insurance"
                  : "Step 3 of 3 — Documents"}
              </Typography>
              <Typography
                component="h2"
                sx={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#fff",
                  lineHeight: 1.2,
                }}
              >
                {isEdit && (form.firstName || form.lastName)
                  ? `${form.firstName} ${form.lastName}`.trim()
                  : "New Patient Registration"}
              </Typography>
              {isEdit && form.id && (
                <Typography
                  sx={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.5)",
                    mt: "2px",
                  }}
                >
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

        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            background:
              "linear-gradient(90deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.05) 100%)",
          }}
        />
      </div>

      {/* ── Step Indicator (create mode) ── */}
      {!isEdit && (
        <div
          style={{
            padding: "20px 32px",
            borderBottom: "1px solid var(--border-ui)",
            background: "var(--surface-card)",
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          {CREATE_STEPS.map((step, i) => (
            <React.Fragment key={step.id}>
              <div className="flex items-center gap-3">
                <div
                  style={{
                    width: 38,
                    height: 38,
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
                        ? "2px solid #279C41"
                        : createStep === step.id
                        ? "2px solid var(--brand-primary)"
                        : "2px solid var(--border-ui)",
                    color:
                      createStep >= step.id ? "#fff" : "var(--text-placeholder)",
                    fontSize: 13,
                    fontWeight: 700,
                    transition: "all 0.2s",
                    boxShadow:
                      createStep === step.id
                        ? "0 0 0 5px rgba(30,86,208,0.14)"
                        : "none",
                  }}
                >
                  {createStep > step.id ? <Check size={16} /> : step.id}
                </div>
                <div>
                  <Typography
                    sx={{
                      fontSize: 13,
                      fontWeight: createStep === step.id ? 700 : 500,
                      whiteSpace: "nowrap",
                      transition: "color 0.2s",
                      lineHeight: 1.2,
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
                  <Typography
                    sx={{
                      fontSize: 11,
                      color: "var(--text-placeholder)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {step.id === 1
                      ? "Required"
                      : step.id === 2
                      ? "Optional"
                      : "Optional"}
                  </Typography>
                </div>
              </div>
              {i < CREATE_STEPS.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: 2,
                    minWidth: 24,
                    margin: "0 16px",
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

      {/* ── Body ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
        {!isEdit ? (
          <>
            {createStep === 1 && (
              <>
                {(stepError || formError) && (
                  <ErrorBanner message={stepError || formError} />
                )}
                <PatientRecordSection form={form} onChange={onChange} />
              </>
            )}

            {createStep === 2 && (
              <div className="flex flex-col gap-5">
                <div
                  style={{
                    padding: "14px 16px",
                    borderRadius: 12,
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
                      width: 38,
                      height: 38,
                      borderRadius: 11,
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
                    <Typography
                      sx={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "var(--foreground)",
                        mb: "2px",
                      }}
                    >
                      Insurance Coverage
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "var(--text-muted)" }}>
                      Optionally link a health insurance provider for billing
                      and claims processing.
                    </Typography>
                  </div>
                </div>
                <InsuranceSection
                  insurance={insurance}
                  setInsurance={setInsurance}
                  insuranceSaved={insuranceSaved}
                  insuranceProviders={insuranceProviders}
                  onRemoveInsurance={handleRemoveInsurance}
                />
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
                      width: 38,
                      height: 38,
                      borderRadius: 11,
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
                    <Typography
                      sx={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "var(--foreground)",
                        mb: "2px",
                      }}
                    >
                      Patient Documents
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "var(--text-muted)" }}>
                      Upload ID cards, insurance policies, medical records, or
                      any relevant documents.
                    </Typography>
                  </div>
                </div>
                <DocumentsSection
                  open={open}
                  documents={documents}
                  setDocuments={setDocuments}
                  insuranceTemplates={insuranceTemplates}
                />
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col gap-3">
            <AccordionSection
              title="Patient Record"
              icon={<User />}
              iconColor="#0f8aa3"
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
                <ErrorBanner message={stepError || formError} />
              )}
              <PatientRecordSection form={form} onChange={onChange} />
              <Divider sx={{ mt: 3, mb: 2, borderColor: "var(--border-ui)" }} />
              <div className="flex justify-end">
                <Button
                  variant="contained"
                  onClick={handleSavePatientSection}
                  startIcon={<Edit2 size={13} />}
                  sx={primaryBtnSx}
                >
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
              <div className="flex flex-col gap-4">
                <InsuranceSection
                  insurance={insurance}
                  setInsurance={setInsurance}
                  insuranceSaved={insuranceSaved}
                  insuranceProviders={insuranceProviders}
                  onRemoveInsurance={handleRemoveInsurance}
                />
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
              <DocumentsSection
                open={open}
                documents={documents}
                setDocuments={setDocuments}
                insuranceTemplates={insuranceTemplates}
              />
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
                <Button
                  variant="outlined"
                  onClick={() => setCreateStep((s) => (s - 1) as 1 | 2 | 3)}
                  startIcon={<ChevronLeft size={14} />}
                  sx={outlinedBtnSx}
                >
                  Back
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {createStep === 1 && (
                <Button
                  variant="contained"
                  onClick={handleRegisterPatient}
                  startIcon={<Plus size={14} />}
                  sx={primaryBtnSx}
                >
                  Register Patient
                </Button>
              )}
              {createStep === 2 && (
                <>
                  <Button
                    variant="outlined"
                    onClick={() => setCreateStep(3)}
                    sx={{ ...outlinedBtnSx, color: "var(--text-muted)" }}
                  >
                    Skip
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => {
                      if (!insuranceSaved && insurance.insuranceProviderId)
                        handleSaveInsurance();
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
                    "&:hover": {
                      backgroundColor: "#1d7a30",
                      boxShadow: "0 4px 14px rgba(39,156,65,0.35)",
                    },
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
