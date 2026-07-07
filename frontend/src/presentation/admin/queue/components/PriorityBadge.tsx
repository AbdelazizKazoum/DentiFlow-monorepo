import {useTranslations} from "next-intl";
import {QUEUE_PRIORITY_CONFIG} from "../queueConfig";
import type {QueuePriority} from "@/domain/queue/entities/queueEntry";

interface PriorityBadgeProps {
  priority: QueuePriority;
}

export function PriorityBadge({priority}: PriorityBadgeProps) {
  const t = useTranslations("admin.waitingRoom.priority");
  const config = QUEUE_PRIORITY_CONFIG[priority];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold"
      style={{
        color: config.color,
        backgroundColor: config.bg,
      }}
    >
      {config.icon}
      {t(priority)}
    </span>
  );
}
