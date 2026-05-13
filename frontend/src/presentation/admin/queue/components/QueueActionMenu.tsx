import {CheckCircle2, Clock, FileText, RotateCcw, UserCheck} from "lucide-react";
import {Menu, MenuItem} from "@mui/material";
import type {
  QueueEntry,
  QueueStatus,
} from "@/domain/queue/entities/queueEntry";

interface QueueActionMenuProps {
  anchor: HTMLElement | null;
  entry: QueueEntry | null;
  onClose: () => void;
  onNotes: (entry: QueueEntry) => void;
  onStatusChange: (entry: QueueEntry, status: QueueStatus) => void;
}

export function QueueActionMenu({
  anchor,
  entry,
  onClose,
  onNotes,
  onStatusChange,
}: QueueActionMenuProps) {
  return (
    <Menu
      anchorEl={anchor}
      open={Boolean(anchor)}
      onClose={onClose}
      slotProps={{
        paper: {
          elevation: 2,
          sx: {
            mt: 1,
            borderRadius: "12px",
            border: "1px solid var(--border-ui)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          },
        },
      }}
    >
      {entry && (
        <>
          {entry.status !== "ARRIVED" && (
            <MenuItem
              onClick={() => onStatusChange(entry, "ARRIVED")}
              sx={{fontSize: "0.875rem", py: 1.5}}
            >
              <RotateCcw size={16} className="mr-3 text-primary" />
              Correct to Arrived
            </MenuItem>
          )}
          {entry.status !== "WAITING" && (
            <MenuItem
              onClick={() => onStatusChange(entry, "WAITING")}
              sx={{fontSize: "0.875rem", py: 1.5}}
            >
              <Clock size={16} className="mr-3 text-amber-500" />
              Mark as Waiting
            </MenuItem>
          )}
          {entry.status !== "IN_CHAIR" && (
            <MenuItem
              onClick={() => onStatusChange(entry, "IN_CHAIR")}
              sx={{fontSize: "0.875rem", py: 1.5}}
            >
              <UserCheck size={16} className="mr-3 text-brand-accent" />
              Mark as In Chair
            </MenuItem>
          )}
          {entry.status !== "DONE" && (
            <MenuItem
              onClick={() => onStatusChange(entry, "DONE")}
              sx={{fontSize: "0.875rem", py: 1.5}}
            >
              <CheckCircle2 size={16} className="mr-3 text-green-500" />
              Mark as Done
            </MenuItem>
          )}
          <MenuItem
            onClick={() => onNotes(entry)}
            sx={{fontSize: "0.875rem", py: 1.5}}
          >
            <FileText size={16} className="mr-3 text-gray-500" />
            {entry.notes ? "Edit Notes" : "Add/View Notes"}
          </MenuItem>
        </>
      )}
    </Menu>
  );
}
