"use client";

import {ActiveQueueTable} from "./components/ActiveQueueTable";
import {CompletedQueueList} from "./components/CompletedQueueList";
import {CorrectionReasonDialog} from "./components/CorrectionReasonDialog";
import {QueueActionMenu} from "./components/QueueActionMenu";
import {QueueHeader} from "./components/QueueHeader";
import {QueueNotesDialog} from "./components/QueueNotesDialog";
import {QueueSummaryCards} from "./components/QueueSummaryCards";
import {useWaitingRoomPage} from "./hooks/useWaitingRoomPage";

export default function WaitingRoomPage() {
  const hook = useWaitingRoomPage();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 lg:space-y-6">
      <QueueHeader
        activeCount={hook.counts.active}
        completedCount={hook.counts.completed}
        lastUpdatedAt={hook.lastUpdatedAt}
        now={hook.now}
      />

      <QueueSummaryCards
        active={hook.counts.active}
        waiting={hook.counts.waiting}
        inChair={hook.counts.inChair}
        completed={hook.counts.completed}
      />

      <div style={{opacity: hook.isLoading ? 0.68 : 1}}>
        <ActiveQueueTable
          canReorder={hook.canReorder}
          entries={hook.activeQueue}
          lastUpdatedId={hook.lastUpdatedId}
          manualOrder={hook.manualOrder}
          now={hook.now}
          onOpenMenu={hook.openMenu}
          onReorder={hook.setManualOrder}
          onResetOrder={hook.resetManualOrder}
          onSortModeChange={hook.setSortMode}
          sortMode={hook.sortMode}
        />
        <CompletedQueueList
          entries={hook.completedToday}
          onOpenMenu={hook.openMenu}
        />
      </div>

      <QueueActionMenu
        anchor={hook.menuAnchor}
        entry={hook.menuEntry}
        onClose={hook.closeMenu}
        onNotes={hook.openNotes}
        onStatusChange={hook.requestStatusChange}
      />

      <QueueNotesDialog
        open={hook.notesState.open}
        entry={hook.notesState.entry}
        notes={hook.notesState.notes}
        isSaving={hook.isUpdating}
        onClose={hook.closeNotes}
        onNotesChange={(notes) =>
          hook.setNotesState((state) => ({...state, notes}))
        }
        onSave={hook.submitNotes}
      />

      <CorrectionReasonDialog
        open={hook.correctionState.open}
        entry={hook.correctionState.entry}
        targetStatus={hook.correctionState.targetStatus}
        reason={hook.correctionState.reason}
        error={hook.correctionState.error}
        isSaving={hook.isUpdating}
        onClose={() =>
          hook.setCorrectionState({
            open: false,
            entry: null,
            targetStatus: null,
            reason: "",
            error: "",
          })
        }
        onReasonChange={(reason) =>
          hook.setCorrectionState((state) => ({...state, reason, error: ""}))
        }
        onSubmit={hook.submitCorrection}
      />
    </div>
  );
}
