import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import {FileText, X} from "lucide-react";
import type {QueueEntry} from "@/domain/queue/entities/queueEntry";

interface QueueNotesDialogProps {
  open: boolean;
  entry: QueueEntry | null;
  notes: string;
  isSaving: boolean;
  onClose: () => void;
  onNotesChange: (notes: string) => void;
  onSave: () => void;
}

export function QueueNotesDialog({
  open,
  entry,
  notes,
  isSaving,
  onClose,
  onNotesChange,
  onSave,
}: QueueNotesDialogProps) {
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
            p: 1,
            border: "1px solid var(--border-ui)",
          },
        },
      }}
    >
      <DialogTitle sx={{pb: 1}}>
        <div className="flex items-center justify-between">
          <div>
            <Typography
              component="span"
              variant="h6"
              sx={{fontWeight: 700, fontSize: "1.125rem"}}
            >
              Patient Notes
            </Typography>
            {entry && (
              <p className="text-xs mt-1" style={{color: "var(--text-muted)"}}>
                {entry.patientName}
              </p>
            )}
          </div>
          <IconButton onClick={onClose} size="small" sx={{color: "var(--text-muted)"}}>
            <X size={18} />
          </IconButton>
        </div>
      </DialogTitle>
      <DialogContent sx={{pb: 2}}>
        <div className="flex items-center gap-2 text-xs mb-2 text-amber-600 font-semibold">
          <FileText size={14} />
          Reception notes for this waiting session
        </div>
        <TextField
          fullWidth
          multiline
          rows={4}
          value={notes}
          onChange={(event) => onNotesChange(event.target.value)}
          placeholder="Add any notes or special instructions..."
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
            },
          }}
        />
      </DialogContent>
      <DialogActions sx={{px: 3, pb: 2}}>
        <Button
          onClick={onClose}
          sx={{
            color: "var(--text-muted)",
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onSave}
          variant="contained"
          disabled={isSaving}
          sx={{
            backgroundColor: "var(--brand-primary)",
            textTransform: "none",
            fontWeight: 600,
            borderRadius: "8px",
            boxShadow: "none",
            "&:hover": {
              backgroundColor: "var(--brand-primary-dark)",
              boxShadow: "none",
            },
          }}
        >
          {isSaving ? "Saving..." : "Save Notes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
