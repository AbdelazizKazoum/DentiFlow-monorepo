import {
  Avatar,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { X } from "lucide-react";
import type { AppointmentStatus } from "@/domain/appointment/entities/appointment";
import type { AppointmentProvider } from "../appointmentConfig";
import type { AppointmentFormState } from "../types";
import { TF_SX } from "../../patient/patientConfig";

interface AppointmentFormModalProps {
  open: boolean;
  form: AppointmentFormState;
  providers: AppointmentProvider[];
  error: string;
  isSaving: boolean;
  onClose: () => void;
  onChange: (form: AppointmentFormState) => void;
  onSave: () => void;
  onDelete: () => void;
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("");
}

export function AppointmentFormModal({
  open,
  form,
  providers,
  error,
  isSaving,
  onClose,
  onChange,
  onSave,
  onDelete,
}: AppointmentFormModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: "16px",
            boxShadow:
              "0 20px 40px -10px rgba(0, 0, 0, 0.15), 0 10px 20px -15px rgba(0, 0, 0, 0.1)",
            border: "1px solid var(--border-ui)",
            backgroundColor: "var(--surface-card)",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: "20px 24px",
          borderBottom: "1px solid var(--border-ui)",
        }}
      >
        <Typography
          variant="h6"
          component="div"
          sx={{ fontWeight: 700, color: "var(--foreground)" }}
        >
          {form.id ? "Edit Appointment" : "Book New Appointment"}
        </Typography>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ color: "var(--text-muted)" }}
        >
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          p: "28px 24px 24px",
        }}
      >
        {error && (
          <div
            style={{
              marginBottom: 16,
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

        <div className="flex flex-col gap-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              label="Patient Name"
              fullWidth
              value={form.patientName}
              onChange={(e) =>
                onChange({ ...form, patientName: e.target.value })
              }
              placeholder="e.g. Jane Doe"
              required
              sx={TF_SX}
            />
            <TextField
              label="Service / Procedure"
              fullWidth
              value={form.type}
              onChange={(e) => onChange({ ...form, type: e.target.value })}
              placeholder="e.g. Annual Checkup"
              required
              sx={TF_SX}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              label="Start Time"
              type="datetime-local"
              fullWidth
              value={form.startAt}
              onChange={(e) => onChange({ ...form, startAt: e.target.value })}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={TF_SX}
            />
            <TextField
              label="End Time"
              type="datetime-local"
              fullWidth
              value={form.endAt}
              onChange={(e) => onChange({ ...form, endAt: e.target.value })}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={TF_SX}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormControl fullWidth sx={TF_SX}>
              <InputLabel>Provider</InputLabel>
              <Select
                label="Provider"
                value={form.doctorId}
                onChange={(e) => {
                  const provider = providers.find(
                    (item) => item.id === e.target.value,
                  );
                  onChange({
                    ...form,
                    doctorId: e.target.value,
                    doctorName: provider?.name ?? form.doctorName,
                  });
                }}
                renderValue={(value) => {
                  const provider = providers.find((item) => item.id === value);
                  return provider ? (
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <Avatar
                        src={provider.avatar}
                        sx={{
                          width: 22,
                          height: 22,
                          fontSize: "0.6rem",
                          border: `1px solid ${provider.color}`,
                        }}
                      >
                        {initials(provider.name)}
                      </Avatar>
                      {provider.name}
                    </div>
                  ) : (
                    value
                  );
                }}
              >
                {providers.map((provider) => (
                  <MenuItem key={provider.id} value={provider.id}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <Avatar
                        src={provider.avatar}
                        sx={{
                          width: 26,
                          height: 26,
                          fontSize: "0.65rem",
                          border: `1.5px solid ${provider.color}`,
                        }}
                      >
                        {initials(provider.name)}
                      </Avatar>
                      <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                        {provider.name}
                      </span>
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: provider.color,
                          display: "inline-block",
                          marginLeft: "auto",
                        }}
                      />
                    </div>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={TF_SX}>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={form.status}
                onChange={(e) =>
                  onChange({
                    ...form,
                    status: e.target.value as AppointmentStatus,
                  })
                }
              >
                <MenuItem value="PENDING">Pending Confirmation</MenuItem>
                <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              label="Patient Phone"
              fullWidth
              value={form.patientPhone}
              onChange={(e) =>
                onChange({ ...form, patientPhone: e.target.value })
              }
              placeholder="e.g. 555-0101"
              sx={TF_SX}
            />
            <TextField
              label="Patient Email"
              type="email"
              fullWidth
              value={form.patientEmail}
              onChange={(e) =>
                onChange({ ...form, patientEmail: e.target.value })
              }
              placeholder="e.g. jane.d@example.com"
              sx={TF_SX}
            />
          </div>

          <FormControlLabel
            control={
              <Checkbox
                checked={form.isEmergency}
                onChange={(e) =>
                  onChange({ ...form, isEmergency: e.target.checked })
                }
                sx={{
                  color: "var(--text-muted)",
                  "&.Mui-checked": { color: "var(--brand-primary)" },
                }}
              />
            }
            label="Emergency override"
            sx={{
              "& .MuiFormControlLabel-label": {
                fontSize: "0.875rem",
                color: "var(--foreground)",
                fontWeight: 600,
              },
            }}
          />

          <TextField
            label="Notes / Comments"
            fullWidth
            multiline
            rows={3}
            value={form.notes}
            onChange={(e) => onChange({ ...form, notes: e.target.value })}
            placeholder="e.g. Patient mentioned tooth sensitivity..."
            sx={TF_SX}
          />
        </div>
      </DialogContent>

      <DialogActions
        sx={{
          p: "16px 24px",
          borderTop: "1px solid var(--border-ui)",
          justifyContent: "space-between",
        }}
      >
        <div>
          {form.id && (
            <Button
              color="error"
              variant="text"
              onClick={onDelete}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "8px",
              }}
            >
              Delete
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "8px",
              padding: "8px 16px",
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={onSave}
            disabled={isSaving}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "8px",
              padding: "8px 16px",
              boxShadow: "0 1px 3px rgba(30,86,208,0.3)",
              backgroundColor: "var(--brand-primary)",
              "&:hover": {
                backgroundColor: "var(--brand-primary-dark)",
                boxShadow: "0 2px 6px rgba(30,86,208,0.4)",
              },
            }}
          >
            {isSaving
              ? "Saving..."
              : form.id
                ? "Save Changes"
                : "Create Appointment"}
          </Button>
        </div>
      </DialogActions>
    </Dialog>
  );
}
