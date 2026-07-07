"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
} from "@mui/material";
import { X } from "lucide-react";
import {useTranslations} from "next-intl";
import { Patient } from "@/domain/patient/entities/patient";
import { getFullName } from "../utils/patientHelpers";

interface DeleteConfirmModalProps {
  open: boolean;
  deleteTargetId: string | null;
  patients: Patient[];
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmModal({
  open,
  deleteTargetId,
  patients,
  isLoading,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  const t = useTranslations("admin.patients.deleteModal");
  const patient = patients.find((x) => x.id === deleteTargetId);
  const name = patient
    ? getFullName(patient.firstName, patient.lastName)
    : t("fallbackPatient");

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
          sx={{ fontWeight: 700, color: "var(--foreground)" }}
        >
          {t("title")}
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <X size={20} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: "24px" }}>
        <Typography
          sx={{
            color: "var(--foreground)",
            fontSize: "0.9375rem",
            lineHeight: 1.6,
          }}
        >
          {t.rich("message", {
            name: () => <strong className="text-primary">{name}</strong>,
          })}
        </Typography>
      </DialogContent>
      <DialogActions
        sx={{ p: "16px 24px", borderTop: "1px solid var(--border-ui)", gap: 2 }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={isLoading}
          sx={{ textTransform: "none", fontWeight: 600, flex: 1 }}
        >
          {t("cancel")}
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          disabled={isLoading}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            flex: 1,
            background: "#dc2626",
            "&:hover": { background: "#b91c1c" },
          }}
        >
          {isLoading ? t("deleting") : t("delete")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
