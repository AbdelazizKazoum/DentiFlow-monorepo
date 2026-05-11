import {Chip} from "@mui/material";
import type React from "react";
import type {QueueStatus} from "@/domain/queue/entities/queueEntry";
import {QUEUE_STATUS_CONFIG} from "../queueConfig";

interface StatusChipProps {
  status: QueueStatus;
}

export function StatusChip({status}: StatusChipProps) {
  const config = QUEUE_STATUS_CONFIG[status];
  return (
    <Chip
      label={config.label}
      icon={config.icon as React.ReactElement}
      size="small"
      sx={{
        backgroundColor: config.bg,
        color: config.color,
        fontWeight: 700,
        fontSize: "0.75rem",
        border: "none",
        "& .MuiChip-icon": {color: config.color},
      }}
    />
  );
}
