export function AppointmentCalendarStyles() {
  return (
    <style>{`
        .fc {
          --fc-border-color: #e2e8f0;
          --fc-today-bg-color: rgba(0,0,0,0.02);
          --fc-now-indicator-color: #1e56d0;
          font-family: inherit;
        }
        .dark .fc-theme-standard td, .dark .fc-theme-standard th, .dark .fc-theme-standard .fc-scrollgrid {
          border-color: rgba(255,255,255,0.08) !important;
          border-width: 1px !important;
        }

        /* --- Toolbar --- */
        .fc .fc-toolbar {
          align-items: center !important;
          padding: 10px 0 16px !important;
          gap: 10px !important;
          flex-wrap: wrap !important;
          background: var(--surface-card) !important;
        }
        .fc .fc-toolbar-chunk {
          display: flex !important;
          align-items: center !important;
          gap: 6px !important;
        }
        .fc .fc-toolbar-title {
          font-size: 1.1rem !important;
          font-weight: 700 !important;
          color: var(--foreground) !important;
          letter-spacing: -0.01em !important;
        }

        /* --- Base button --- */
        .fc .fc-button {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          height: 36px !important;
          padding: 0 14px !important;
          font-size: 0.82rem !important;
          font-weight: 500 !important;
          border-radius: 8px !important;
          border: 1px solid #e2e8f0 !important;
          background: #ffffff !important;
          color: #475569 !important;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important;
          text-transform: none !important;
          transition: all 0.15s !important;
        }
        .fc .fc-button:hover {
          background: #f8fafc !important;
          border-color: #cbd5e1 !important;
          color: #1e293b !important;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08) !important;
        }
        .fc .fc-button:focus,
        .fc .fc-button:focus-visible { outline: none !important; box-shadow: 0 0 0 3px rgba(30,86,208,0.15) !important; }
        .dark .fc .fc-button {
          background: #252b45 !important;
          border-color: #3d4466 !important;
          color: #94a3b8 !important;
          box-shadow: none !important;
        }
        .dark .fc .fc-button:hover {
          background: #2f3757 !important;
          border-color: #4d5a80 !important;
          color: #e2e8f0 !important;
        }

        /* --- Prev / Next --- */
        .fc .fc-prev-button,
        .fc .fc-next-button {
          width: 36px !important;
          padding: 0 !important;
          background: #ffffff !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 8px !important;
          color: #64748b !important;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important;
        }
        .fc .fc-prev-button:hover,
        .fc .fc-next-button:hover {
          background: #f1f5f9 !important;
          border-color: #cbd5e1 !important;
          color: #1e293b !important;
        }
        .dark .fc .fc-prev-button,
        .dark .fc .fc-next-button {
          background: #252b45 !important;
          border-color: #3d4466 !important;
          color: #7a8499 !important;
        }
        .dark .fc .fc-prev-button:hover,
        .dark .fc .fc-next-button:hover {
          background: #2f3757 !important;
          color: #e2e8f0 !important;
        }

        /* --- Today --- */
        .fc .fc-today-button {
          background: #f0f4ff !important;
          border-color: #c7d7fa !important;
          color: #1e56d0 !important;
          font-weight: 600 !important;
          letter-spacing: 0.01em !important;
        }
        .fc .fc-today-button:hover {
          background: #e0eaff !important;
          border-color: #a5beef !important;
          color: #1748b8 !important;
        }
        .fc .fc-today-button:disabled { opacity: 0.38 !important; cursor: not-allowed !important; }
        .dark .fc .fc-today-button {
          background: rgba(30,86,208,0.12) !important;
          border-color: rgba(30,86,208,0.3) !important;
          color: #6395f5 !important;
        }
        .dark .fc .fc-today-button:hover {
          background: rgba(30,86,208,0.2) !important;
        }

        /* --- View switcher: bordered segmented control --- */
        .fc .fc-button-group {
          display: inline-flex !important;
          background: transparent !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 8px !important;
          padding: 0 !important;
          gap: 0 !important;
          overflow: hidden !important;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important;
        }
        .dark .fc .fc-button-group {
          border-color: #3d4466 !important;
          box-shadow: none !important;
        }
        .fc .fc-button-group .fc-button {
          border-radius: 0 !important;
          border: none !important;
          border-right: 1px solid #e2e8f0 !important;
          box-shadow: none !important;
          height: 36px !important;
          padding: 0 16px !important;
          color: #64748b !important;
          background: #ffffff !important;
        }
        .dark .fc .fc-button-group .fc-button {
          background: #252b45 !important;
          border-right-color: #3d4466 !important;
          color: #7a8499 !important;
        }
        .fc .fc-button-group .fc-button:last-child { border-right: none !important; }
        .fc .fc-button-group .fc-button:hover {
          background: #f1f5f9 !important;
          color: #1e293b !important;
        }
        .dark .fc .fc-button-group .fc-button:hover {
          background: #2f3757 !important;
          color: #e2e8f0 !important;
        }
        .fc .fc-button-group .fc-button-primary:not(:disabled).fc-button-active,
        .fc .fc-button-group .fc-button-primary:not(:disabled):active {
          background: #eff6ff !important;
          color: #1e56d0 !important;
          font-weight: 600 !important;
        }
        .dark .fc .fc-button-group .fc-button-primary:not(:disabled).fc-button-active,
        .dark .fc .fc-button-group .fc-button-primary:not(:disabled):active {
          background: rgba(30,86,208,0.18) !important;
          color: #6395f5 !important;
          font-weight: 600 !important;
        }

        /* --- New Appointment button --- */
        .fc .fc-addAppointment-button {
          height: 36px !important;
          padding: 0 16px !important;
          background: #1e56d0 !important;
          color: #ffffff !important;
          border: none !important;
          border-radius: 8px !important;
          font-weight: 600 !important;
          font-size: 0.82rem !important;
          letter-spacing: 0.01em !important;
          cursor: pointer !important;
          margin-left: 4px !important;
          box-shadow: 0 1px 3px rgba(30,86,208,0.3) !important;
          transition: background 0.15s, box-shadow 0.15s !important;
        }
        .fc .fc-addAppointment-button:hover {
          background: #1748b8 !important;
          box-shadow: 0 2px 6px rgba(30,86,208,0.4) !important;
          color: #fff !important;
        }

        /* --- Grid & Events --- */
        .fc-timegrid-slot { height: 3.5rem !important; }
        .fc-event {
          border-width: 0 !important;
          border-left-width: 3px !important;
          border-style: solid !important;
          border-radius: 4px !important;
          font-size: 0.72rem !important;
          font-weight: 600 !important;
          line-height: 1.2 !important;
          box-shadow: none !important;
          cursor: pointer;
          margin-bottom: 2px !important;
          transition: filter 0.15s !important;
        }
        .fc-event:hover { filter: brightness(0.96) !important; }
        .fc-v-event .fc-event-main { padding: 0 !important; }
        .fc-event .fc-event-main, .fc-event .fc-event-main-frame { background: transparent !important; }
        .dark .fc-event { box-shadow: none !important; opacity: 0.9 !important; }

        /* --- Side-by-side concurrent events: add inset gap between cards --- */
        .fc-timegrid-event-harness {
          padding-inline: 1px !important;
        }

        /* --- Month view: match left-border-only style of week/day cards --- */
        .fc-daygrid-event {
          border-width: 0 !important;
          border-left-width: 3px !important;
          border-left-color: var(--fc-event-border-color) !important;
          border-style: solid !important;
          border-radius: 4px !important;
        }

        /* --- Resource header --- */
        .fc-resource-timegrid-day .fc-col-header-cell { position: sticky; top: 0; z-index: 3; }
        .fc .fc-resource-timegrid .fc-col-header { position: sticky; top: 0; z-index: 3; }
        .fc-col-header-cell { background: var(--surface-card, #fff) !important; }

        /* --- Clean minimal grid --- */
        .fc-theme-standard td, .fc-theme-standard th, .fc-theme-standard .fc-scrollgrid {
          border-color: #e2e8f0 !important;
        }
        .fc-col-header-cell {
          padding: 4px 0 !important;
          border-style: solid !important;
          border-color: #e2e8f0 !important;
          border-width: 0 1px 1px 0 !important;
        }
        .fc-col-header-cell:last-child { border-right-width: 0 !important; }
        .dark .fc-col-header-cell { border-color: rgba(255,255,255,0.08) !important; }
        .fc-col-header-cell-cushion {
          font-size: 0.75rem !important;
          font-weight: 500 !important;
          text-transform: uppercase !important;
          color: var(--text-muted) !important;
          text-decoration: none !important;
          padding: 8px 0 !important;
        }
        .fc-day-today .fc-col-header-cell-cushion { color: #1e56d0 !important; }
        .fc-timegrid-axis-cushion,
        .fc-timegrid-slot-label-cushion {
          font-size: 0.8rem !important;
          color: #64748b !important;
          font-weight: 400 !important;
        }
        .fc-scrollgrid { border-radius: 0 !important; }
        .fc-scrollgrid-section > td { border: none !important; }

        /* --- Selection --- */
        :root {
          --fc-highlight-color: rgba(30, 86, 208, 0.15);
          --fc-event-bg-color: rgba(30, 86, 208, 0.25);
          --fc-event-border-color: #1e56d0;
          --fc-event-text-color: #1e56d0;
          --fc-event-selected-overlay-color: rgba(0, 0, 0, 0);
        }
        .fc-timegrid-event.fc-v-event.fc-select-mirror,
        .fc-select-mirror {
          --fc-event-bg-color: rgba(30, 86, 208, 0.2) !important;
          --fc-event-border-color: #1e56d0 !important;
          --fc-event-text-color: #1e56d0 !important;
          background-color: rgba(30, 86, 208, 0.2) !important;
          border-left: 3px solid #1e56d0 !important;
          border-top: none !important;
          border-right: none !important;
          border-bottom: none !important;
          border-radius: 6px !important;
          box-shadow: none !important;
          opacity: 1 !important;
        }
        .fc-select-mirror .fc-event-main,
        .fc-select-mirror .fc-event-time,
        .fc-select-mirror .fc-event-title {
          color: #1e56d0 !important;
          font-weight: 600 !important;
          font-size: 0.75rem !important;
        }
      `}</style>
  );
}
