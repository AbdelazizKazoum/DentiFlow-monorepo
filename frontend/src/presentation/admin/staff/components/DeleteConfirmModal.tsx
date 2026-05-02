import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
} from "@mui/material";
import {X} from "lucide-react";

interface DeleteConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  staffName: string;
}

export function DeleteConfirmModal({
  open,
  onClose,
  onConfirm,
  staffName,
}: DeleteConfirmModalProps) {
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
          sx={{fontWeight: 700, color: "var(--foreground)"}}
        >
          Delete Staff Member
        </Typography>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{color: "var(--text-muted)"}}
        >
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{p: "24px"}}>
        <Typography
          sx={{
            color: "var(--foreground)",
            fontSize: "0.9375rem",
            lineHeight: 1.6,
          }}
        >
          Are you sure you want to delete{" "}
          <strong style={{color: "var(--brand-primary)"}}>{staffName}</strong>?
          This action cannot be undone.
        </Typography>
      </DialogContent>

      <DialogActions
        sx={{p: "16px 24px", borderTop: "1px solid var(--border-ui)", gap: 2}}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: "8px",
            padding: "8px 16px",
            flex: 1,
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: "8px",
            padding: "8px 16px",
            flex: 1,
            backgroundColor: "#e53e3e",
            "&:hover": {backgroundColor: "#c53030"},
          }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
