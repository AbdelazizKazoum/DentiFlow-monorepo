"use client";

import {AppointmentCalendar} from "./components/AppointmentCalendar";
import {AppointmentCalendarStyles} from "./components/AppointmentCalendarStyles";
import {AppointmentFormModal} from "./components/AppointmentFormModal";
import {ProviderFilterBar} from "./components/ProviderFilterBar";
import {useAppointmentPage} from "./hooks/useAppointmentPage";

export default function AppointmentPage() {
  const hook = useAppointmentPage();

  return (
    <>
      <AppointmentCalendarStyles />

      <div className="p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Appointments</h1>
          <p className="text-sm" style={{color: "var(--text-muted)"}}>
            Manage your patient schedule
          </p>
        </div>

        <div
          className="bg-card border rounded-lg overflow-hidden"
          style={{
            borderColor: "var(--border-ui)",
            opacity: hook.isLoading ? 0.72 : 1,
          }}
        >
          <ProviderFilterBar
            providers={hook.providers}
            activeProviderIds={hook.activeProviderIds}
            onToggleProvider={hook.toggleProvider}
          />

          <AppointmentCalendar
            appointments={hook.appointments}
            providers={hook.providers}
            activeProviderIds={hook.activeProviderIds}
            onAddRequested={hook.openNew}
            onEditRequested={hook.openEdit}
            onMoveRequested={hook.move}
          />
        </div>
      </div>

      <AppointmentFormModal
        open={hook.modalOpen}
        form={hook.form}
        providers={hook.providers}
        error={hook.formError}
        isSaving={hook.isSaving}
        onClose={() => hook.setModalOpen(false)}
        onChange={hook.setForm}
        onSave={hook.saveForm}
        onDelete={hook.deleteForm}
      />
    </>
  );
}
