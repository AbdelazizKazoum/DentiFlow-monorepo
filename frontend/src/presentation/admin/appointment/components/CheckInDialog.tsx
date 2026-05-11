"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { LogIn, X } from "lucide-react";
import type { Appointment } from "@/domain/appointment/entities/appointment";
import type { QueuePriority } from "@/domain/queue/entities/queueEntry";

export interface CheckInFormState {
  priority: QueuePriority;
  notes: string;
}

interface CheckInDialogProps {
  open: boolean;
  appointment: Appointment | null;
  form: CheckInFormState;
  isChecking: boolean;
  error: string;
  onChange: (form: CheckInFormState) => void;
  onClose: () => void;
  onSubmit: () => void;
}

const PRIORITY_CONFIG: {
  value: QueuePriority;
  label: string;
  color: string;
}[] = [
  { value: "NORMAL", label: "Normal", color: "#64748b" },
  { value: "URGENT", label: "Urgent", color: "#f59e0b" },
  { value: "EMERGENCY", label: "Emergency", color: "#dc2626" },
];

export function CheckInDialog({
  open,
  appointment,
  form,
  isChecking,
  error,
  onChange,
  onClose,
  onSubmit,
}: CheckInDialogProps) {
  if (!appointment) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: "16px",
            boxShadow:
              "0 20px 40px -10px rgba(0,0,0,0.15), 0 10px 20px -15px rgba(0,0,0,0.1)",
            border: "1px solid var(--border-ui)",
            backgroundColor: "var(--surface-card)",
          },
        },
      }}
    >
      {/* Green accent bar */}
      <div
        style={{
          height: 4,
          borderRadius: "16px 16px 0 0",
          background: "linear-gradient(90deg, #279C41, #22c55e88)",
        }}
      />

      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: "18px 24px 14px",
        }}
      >
        <div>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: "var(--foreground)",
              fontSize: "1rem",
            }}
          >
            Check In Patient
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "var(--text-muted)", fontSize: "0.8rem", mt: 0.25 }}
          >
            {appointment.patientName} · {appointment.type ?? "Visit"}
          </Typography>
        </div>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ color: "var(--text-muted)" }}
        >
          <X size={18} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: "8px 24px 20px" }}>
        {error && (
          <div
            style={{
              marginBottom: 14,
              padding: "10px 14px",
              background: "#fee2e2",
              border: "1px solid #fca5a5",
              borderRadius: 8,
              fontSize: "0.82rem",
              color: "#991b1b",
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <FormControl fullWidth size="small">
            <InputLabel sx={{ fontSize: "0.875rem" }}>Priority</InputLabel>
            <Select
              label="Priority"
              value={form.priority}
              onChange={(e) =>
                onChange({ ...form, priority: e.target.value as QueuePriority })
              }
              sx={{ fontSize: "0.875rem", borderRadius: "10px" }}
            >
              {PRIORITY_CONFIG.map(({ value, label, color }) => (
                <MenuItem key={value} value={value}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: "50%",
                        backgroundColor: color,
                        display: "inline-block",
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                      {label}
                    </span>
                  </div>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Arrival Notes (optional)"
            placeholder="e.g. Patient mentions sensitivity, came early..."
            fullWidth
            size="small"
            multiline
            rows={3}
            value={form.notes}
            onChange={(e) => onChange({ ...form, notes: e.target.value })}
            sx={{
              "& .MuiInputBase-root": {
                borderRadius: "10px",
                fontSize: "0.875rem",
              },
              "& .MuiInputLabel-root": { fontSize: "0.875rem" },
            }}
          />
        </div>
      </DialogContent>

      <DialogActions
        sx={{
          p: "14px 24px",
          borderTop: "1px solid var(--border-ui)",
          gap: 1,
        }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: "8px",
            borderColor: "var(--border-ui)",
            color: "var(--foreground)",
            fontSize: "0.875rem",
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={isChecking}
          startIcon={<LogIn size={15} />}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: "8px",
            fontSize: "0.875rem",
            backgroundColor: "#279C41",
            boxShadow: "0 1px 4px rgba(39,156,65,0.3)",
            "&:hover": {
              backgroundColor: "#1e7a32",
              boxShadow: "0 2px 8px rgba(39,156,65,0.4)",
            },
            "&.Mui-disabled": { opacity: 0.65 },
          }}
        >
          {isChecking ? "Checking in..." : "Confirm Check In"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
