"use client";

import React from "react";
import { Menu, MenuItem } from "@mui/material";
import { Edit2, Trash2 } from "lucide-react";
import {useTranslations} from "next-intl";
import { Patient } from "@/domain/patient/entities/patient";
import { SORT_OPTIONS } from "../patientConfig";
import type { SortOption } from "../types";

interface PatientActionMenuProps {
  // Sort menu
  sortMenuAnchor: null | HTMLElement;
  sort: SortOption;
  onSortChange: (v: SortOption) => void;
  onSortClose: () => void;
  // Row action menu
  menuAnchor: null | HTMLElement;
  menuTarget: string | null;
  patients: Patient[];
  onEdit: (p: Patient) => void;
  onDelete: (id: string) => void;
  onMenuClose: () => void;
}

export function PatientActionMenu({
  sortMenuAnchor,
  sort,
  onSortChange,
  onSortClose,
  menuAnchor,
  menuTarget,
  patients,
  onEdit,
  onDelete,
  onMenuClose,
}: PatientActionMenuProps) {
  const t = useTranslations("admin.patients");

  return (
    <>
      <Menu
        anchorEl={sortMenuAnchor}
        open={Boolean(sortMenuAnchor)}
        onClose={onSortClose}
        slotProps={{
          paper: {
            sx: {
              borderRadius: "10px",
              border: "1px solid var(--border-ui)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
              minWidth: 160,
            },
          },
        }}
      >
        {SORT_OPTIONS.map((o) => (
          <MenuItem
            key={o.value}
            onClick={() => {
              onSortChange(o.value);
              onSortClose();
            }}
            sx={{
              fontSize: "0.875rem",
              fontWeight: sort === o.value ? 700 : 400,
              color:
                sort === o.value ? "var(--brand-primary)" : "var(--foreground)",
            }}
          >
            {t(`sort.${o.value}`)}
          </MenuItem>
        ))}
      </Menu>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={onMenuClose}
        slotProps={{
          paper: {
            sx: {
              borderRadius: "10px",
              border: "1px solid var(--border-ui)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
              minWidth: 140,
            },
          },
        }}
      >
        <MenuItem
          onClick={() => {
            const p = patients.find((x) => x.id === menuTarget);
            if (p) onEdit(p);
          }}
          sx={{ fontSize: "0.875rem", gap: 1 }}
        >
          <Edit2 size={15} /> {t("actions.edit")}
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuTarget) onDelete(menuTarget);
          }}
          sx={{ fontSize: "0.875rem", gap: 1, color: "#e53e3e" }}
        >
          <Trash2 size={15} /> {t("actions.delete")}
        </MenuItem>
      </Menu>
    </>
  );
}
