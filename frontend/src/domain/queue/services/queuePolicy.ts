import type {
  QueueEntry,
  QueuePriority,
  QueueStatus,
} from "@/domain/queue/entities/queueEntry";

const statusRank: Record<QueueStatus, number> = {
  IN_CHAIR: 0,
  WAITING: 1,
  ARRIVED: 2,
  DONE: 3,
};

const priorityRank: Record<QueuePriority, number> = {
  EMERGENCY: 0,
  URGENT: 1,
  NORMAL: 2,
};

export function isBackwardStatusMove(
  currentStatus: QueueStatus,
  nextStatus: QueueStatus,
): boolean {
  const flow: QueueStatus[] = ["ARRIVED", "WAITING", "IN_CHAIR", "DONE"];
  return flow.indexOf(nextStatus) < flow.indexOf(currentStatus);
}

export function sortQueueEntries(entries: QueueEntry[]): QueueEntry[] {
  return [...entries].sort((first, second) => {
    const statusDelta = statusRank[first.status] - statusRank[second.status];
    if (statusDelta !== 0) return statusDelta;

    const priorityDelta =
      priorityRank[first.priority] - priorityRank[second.priority];
    if (priorityDelta !== 0) return priorityDelta;

    return first.arrivedAt.getTime() - second.arrivedAt.getTime();
  });
}
