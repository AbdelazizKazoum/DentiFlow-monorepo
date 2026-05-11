import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import type {
  QueueEntry,
  QueueStatus,
} from "@/domain/queue/entities/queueEntry";
import {QUEUE_STATUS_CONFIG} from "../queueConfig";

interface CorrectionReasonDialogProps {
  open: boolean;
  entry: QueueEntry | null;
  targetStatus: QueueStatus | null;
  reason: string;
  error: string;
  isSaving: boolean;
  onClose: () => void;
  onReasonChange: (reason: string) => void;
  onSubmit: () => void;
}

export function CorrectionReasonDialog({
  open,
  entry,
  targetStatus,
  reason,
  error,
  isSaving,
  onClose,
  onReasonChange,
  onSubmit,
}: CorrectionReasonDialogProps) {
  const targetLabel = targetStatus
    ? QUEUE_STATUS_CONFIG[targetStatus].label
    : "previous status";

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
            border: "1px solid var(--border-ui)",
          },
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h6" sx={{fontWeight: 700}}>
          Correction Reason Required
        </Typography>
        {entry && (
          <p className="text-xs mt-1" style={{color: "var(--text-muted)"}}>
            Move {entry.patientName} back to {targetLabel}
          </p>
        )}
      </DialogTitle>
      <DialogContent>
        {error && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}
        <TextField
          fullWidth
          multiline
          minRows={3}
          label="Correction reason"
          value={reason}
          onChange={(event) => onReasonChange(event.target.value)}
          placeholder="Explain why this patient is being moved backward..."
        />
      </DialogContent>
      <DialogActions sx={{px: 3, pb: 2}}>
        <Button
          onClick={onClose}
          sx={{textTransform: "none", fontWeight: 600}}
        >
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          disabled={isSaving}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: "8px",
            backgroundColor: "var(--brand-primary)",
            "&:hover": {backgroundColor: "var(--brand-primary-dark)"},
          }}
        >
          {isSaving ? "Saving..." : "Save Correction"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
