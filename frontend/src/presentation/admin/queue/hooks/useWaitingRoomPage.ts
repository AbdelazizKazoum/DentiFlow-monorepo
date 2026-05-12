import {useCallback, useEffect, useMemo, useState} from "react";
import type React from "react";
import {useSession} from "next-auth/react";
import type {
  QueueEntry,
  QueueStatus,
} from "@/domain/queue/entities/queueEntry";
import {
  isBackwardStatusMove,
  sortQueueEntries,
} from "@/domain/queue/services/queuePolicy";
import {useQueueStore} from "@/presentation/stores/queueStore";
import {QUEUE_CLINIC_ID} from "../queueConfig";
import {useQueueStream} from "./useQueueStream";

interface NotesState {
  open: boolean;
  entry: QueueEntry | null;
  notes: string;
}

interface CorrectionState {
  open: boolean;
  entry: QueueEntry | null;
  targetStatus: QueueStatus | null;
  reason: string;
  error: string;
}

export function useWaitingRoomPage() {
  const {data: session} = useSession();
  const {
    entries,
    isLoading,
    isUpdating,
    lastUpdatedId,
    lastUpdatedAt,
    manualOrder,
    resetManualOrder,
    setManualOrder,
    setSortMode,
    sortMode,
    loadQueue,
    changeStatus,
    correctStatus,
    seatPatient,
    saveNotes,
  } = useQueueStore();

  const [now, setNow] = useState(() => new Date());
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuEntry, setMenuEntry] = useState<QueueEntry | null>(null);
  const [notesState, setNotesState] = useState<NotesState>({
    open: false,
    entry: null,
    notes: "",
  });
  const [correctionState, setCorrectionState] = useState<CorrectionState>({
    open: false,
    entry: null,
    targetStatus: null,
    reason: "",
    error: "",
  });

  useEffect(() => {
    loadQueue(QUEUE_CLINIC_ID);
  }, [loadQueue]);

  useQueueStream(QUEUE_CLINIC_ID);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(interval);
  }, []);

  const sortedEntries = useMemo(
    () => sortQueueEntries(entries, sortMode),
    [entries, sortMode],
  );

  const activeQueue = useMemo(
    () => {
      const active = sortedEntries.filter((entry) => entry.status !== "DONE");
      if (!manualOrder || sortMode !== "POLICY") return active;

      const activeById = new Map(active.map((entry) => [entry.id, entry]));
      const ordered = manualOrder
        .map((id) => activeById.get(id))
        .filter((entry): entry is QueueEntry => Boolean(entry));
      const missing = active.filter((entry) => !manualOrder.includes(entry.id));
      return [...ordered, ...missing];
    },
    [manualOrder, sortMode, sortedEntries],
  );
  const completedToday = useMemo(
    () => sortedEntries.filter((entry) => entry.status === "DONE"),
    [sortedEntries],
  );

  const canReorder = useMemo(() => {
    const role = session?.user?.role as string | undefined;
    return role === "admin" || role === "secretary" || role === "secretariat";
  }, [session?.user?.role]);

  const counts = useMemo(
    () => ({
      active: activeQueue.length,
      waiting: entries.filter((entry) => entry.status === "WAITING").length,
      inChair: entries.filter((entry) => entry.status === "IN_CHAIR").length,
      completed: completedToday.length,
    }),
    [activeQueue.length, completedToday.length, entries],
  );

  const openMenu = useCallback(
    (event: React.MouseEvent<HTMLElement>, entry: QueueEntry) => {
      setMenuAnchor(event.currentTarget);
      setMenuEntry(entry);
    },
    [],
  );

  const closeMenu = useCallback(() => {
    setMenuAnchor(null);
    setMenuEntry(null);
  }, []);

  const requestStatusChange = useCallback(
    async (entry: QueueEntry, status: QueueStatus) => {
      closeMenu();
      if (isBackwardStatusMove(entry.status, status)) {
        setCorrectionState({
          open: true,
          entry,
          targetStatus: status,
          reason: "",
          error: "",
        });
        return;
      }

      if (status === "IN_CHAIR") {
        await seatPatient(entry.id);
        return;
      }

      await changeStatus(entry.id, status);
    },
    [changeStatus, closeMenu, seatPatient],
  );

  const submitCorrection = useCallback(async () => {
    const {entry, targetStatus, reason} = correctionState;
    if (!entry || !targetStatus) return;
    if (!reason.trim()) {
      setCorrectionState((state) => ({
        ...state,
        error: "Correction reason is required.",
      }));
      return;
    }

    await correctStatus(entry.id, targetStatus, reason);
    setCorrectionState({
      open: false,
      entry: null,
      targetStatus: null,
      reason: "",
      error: "",
    });
  }, [correctStatus, correctionState]);

  const openNotes = useCallback(
    (entry: QueueEntry) => {
      closeMenu();
      setNotesState({
        open: true,
        entry,
        notes: entry.notes ?? "",
      });
    },
    [closeMenu],
  );

  const closeNotes = useCallback(() => {
    setNotesState({open: false, entry: null, notes: ""});
  }, []);

  const submitNotes = useCallback(async () => {
    if (!notesState.entry) return;
    await saveNotes(notesState.entry.id, notesState.notes);
    closeNotes();
  }, [closeNotes, notesState.entry, notesState.notes, saveNotes]);

  return {
    activeQueue,
    canReorder,
    completedToday,
    counts,
    correctionState,
    entries,
    isLoading,
    isUpdating,
    lastUpdatedId,
    lastUpdatedAt,
    manualOrder,
    menuAnchor,
    menuEntry,
    notesState,
    now,
    closeMenu,
    closeNotes,
    openMenu,
    openNotes,
    requestStatusChange,
    resetManualOrder,
    setCorrectionState,
    setManualOrder,
    setNotesState,
    setSortMode,
    sortMode,
    submitCorrection,
    submitNotes,
  };
}
