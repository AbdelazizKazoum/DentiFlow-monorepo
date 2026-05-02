import {Menu, MenuItem} from "@mui/material";
import {Edit2, Trash2} from "lucide-react";

interface StaffActionMenuProps {
  anchor: HTMLElement | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function StaffActionMenu({
  anchor,
  onClose,
  onEdit,
  onDelete,
}: StaffActionMenuProps) {
  return (
    <Menu
      anchorEl={anchor}
      open={Boolean(anchor)}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            borderRadius: "10px",
            border: "1px solid var(--border-ui)",
            backgroundColor: "var(--surface-card)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            minWidth: 140,
          },
        },
      }}
    >
      <MenuItem
        onClick={onEdit}
        sx={{fontSize: "0.875rem", gap: 1, color: "var(--foreground)"}}
      >
        <Edit2 size={15} /> Edit
      </MenuItem>
      <MenuItem
        onClick={onDelete}
        sx={{fontSize: "0.875rem", gap: 1, color: "#e53e3e"}}
      >
        <Trash2 size={15} /> Delete
      </MenuItem>
    </Menu>
  );
}
