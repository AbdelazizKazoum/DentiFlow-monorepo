"use client";

import {motion} from "framer-motion";
import {CheckCircle2, X} from "lucide-react";

interface ConfirmVisitDialogProps {
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

/** Presentation-only clinical sign-off confirmation dialog. */
export function ConfirmVisitDialog({
  isSubmitting,
  onCancel,
  onConfirm,
}: ConfirmVisitDialogProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4"
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      exit={{opacity: 0}}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) onCancel();
      }}
    >
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-visit-title"
        initial={{y: 20, scale: 0.98, opacity: 0}}
        animate={{y: 0, scale: 1, opacity: 1}}
        exit={{y: 12, scale: 0.98, opacity: 0}}
        className="w-full max-w-md border border-ui-border bg-card shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-ui-border p-5">
          <div className="flex gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 size={21} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                Clinical sign-off
              </p>
              <h2 id="confirm-visit-title" className="mt-1 text-lg font-semibold text-foreground">
                Confirm this visit?
              </h2>
            </div>
          </div>
          <button type="button" onClick={onCancel} disabled={isSubmitting} aria-label="Close confirmation dialog" className="text-text-muted hover:text-foreground disabled:opacity-50">
            <X size={19} />
          </button>
        </header>

        <div className="space-y-3 p-5 text-sm text-text-muted">
          <p>This ends the current clinical session. Treatment records in this visit will become read-only.</p>
          <p>Unfinished plans remain available in a future visit. After confirmation, you will return to the waiting room to select the next patient.</p>
        </div>

        <footer className="flex justify-end gap-2 border-t border-ui-border bg-page p-4">
          <button type="button" onClick={onCancel} disabled={isSubmitting} className="h-10 border border-ui-border bg-card px-4 text-sm font-semibold text-foreground hover:bg-surface-hover disabled:opacity-50">
            Keep editing
          </button>
          <button type="button" onClick={onConfirm} disabled={isSubmitting} className="inline-flex h-10 items-center gap-2 bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">
            <CheckCircle2 size={16} /> {isSubmitting ? "Confirming…" : "Confirm visit"}
          </button>
        </footer>
      </motion.section>
    </motion.div>
  );
}
