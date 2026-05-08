import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  Checkbox,
  Chip,
  Button,
} from "@mui/material";
import { Shield, Edit2 } from "lucide-react";
import { InsuranceProvider } from "@/domain/patient/entities/insuranceProvider";
import { TF_SX } from "../../patientConfig";
import { InsuranceState, outlinedBtnSx } from "./SharedUI";

interface InsuranceSectionProps {
  insurance: InsuranceState;
  setInsurance: React.Dispatch<React.SetStateAction<InsuranceState>>;
  insuranceSaved: boolean;
  insuranceProviders: InsuranceProvider[];
  onRemoveInsurance: () => void;
}

export function InsuranceSection({
  insurance,
  setInsurance,
  insuranceSaved,
  insuranceProviders,
  onRemoveInsurance,
}: InsuranceSectionProps) {
  const providerName = (id: string) =>
    insuranceProviders.find((p) => p.id === id)?.name ?? "";

  if (insuranceSaved) {
    return (
      <div
        style={{
          border: "1px solid var(--border-ui)",
          borderRadius: 12,
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
            onClick={onRemoveInsurance}
            sx={{ ...outlinedBtnSx, padding: "4px 12px", fontSize: "0.75rem" }}
          >
            Change
          </Button>
        </div>
        {(insurance.policyNumber || insurance.memberId) && (
          <div
            className="flex gap-7 p-4"
            style={{ background: "var(--surface-card)" }}
          >
            {insurance.policyNumber && (
              <div>
                <Typography
                  sx={{
                    fontSize: 10,
                    color: "var(--text-placeholder)",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    mb: "3px",
                  }}
                >
                  Policy Number
                </Typography>
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--foreground)",
                  }}
                >
                  {insurance.policyNumber}
                </Typography>
              </div>
            )}
            {insurance.memberId && (
              <div>
                <Typography
                  sx={{
                    fontSize: 10,
                    color: "var(--text-placeholder)",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    mb: "3px",
                  }}
                >
                  Member ID
                </Typography>
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--foreground)",
                  }}
                >
                  {insurance.memberId}
                </Typography>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          label="Policy Number"
          fullWidth
          value={insurance.policyNumber}
          onChange={(e) =>
            setInsurance((s) => ({ ...s, policyNumber: e.target.value }))
          }
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
          border: `1.5px solid ${
            insurance.isActive ? "#86efac" : "var(--border-ui)"
          }`,
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
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 600,
              color: insurance.isActive ? "#279C41" : "var(--foreground)",
            }}
          >
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
            sx={{
              ml: "auto",
              height: 20,
              fontSize: 10,
              fontWeight: 700,
              background: "#dcfce7",
              color: "#279C41",
            }}
          />
        )}
      </button>
    </div>
  );
}
