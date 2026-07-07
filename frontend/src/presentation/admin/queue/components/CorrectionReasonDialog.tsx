import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import {useTranslations} from "next-intl";
import type {
  QueueEntry,
  QueueStatus,
} from "@/domain/queue/entities/queueEntry";

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
  const t = useTranslations("admin.waitingRoom.correctionDialog");
  const statusT = useTranslations("admin.waitingRoom.status");
  const targetLabel = targetStatus
    ? statusT(targetStatus)
    : t("previousStatus");

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
        <Typography component="span" variant="h6" sx={{fontWeight: 700}}>
          {t("title")}
        </Typography>
        {entry && (
          <p className="text-xs mt-1" style={{color: "var(--text-muted)"}}>
            {t("moveBack", {patient: entry.patientName, status: targetLabel})}
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
          label={t("label")}
          value={reason}
          onChange={(event) => onReasonChange(event.target.value)}
          placeholder={t("placeholder")}
        />
      </DialogContent>
      <DialogActions sx={{px: 3, pb: 2}}>
        <Button
          onClick={onClose}
          sx={{textTransform: "none", fontWeight: 600}}
        >
          {t("cancel")}
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
          {isSaving ? t("saving") : t("save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
