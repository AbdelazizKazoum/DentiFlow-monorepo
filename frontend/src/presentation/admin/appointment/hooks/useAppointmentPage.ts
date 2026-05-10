import {useCallback, useEffect, useMemo, useState} from "react";
import type {Appointment} from "@/domain/appointment/entities/appointment";
import {useAppointmentStore} from "@/presentation/stores/appointmentStore";
import {
  APPOINTMENT_CLINIC_ID,
  APPOINTMENT_PROVIDERS,
} from "../appointmentConfig";
import type {AppointmentFormState} from "../types";
import {
  appointmentToForm,
  makeEmptyAppointmentForm,
  toDatetimeLocal,
} from "../utils";
import {AppError} from "@/infrastructure/http/httpErrorHandler";

const firstProvider = APPOINTMENT_PROVIDERS[0];

export function useAppointmentPage() {
  const {
    appointments,
    isLoading,
    isSaving,
    loadCalendar,
    addAppointment,
    editAppointment,
    removeAppointment,
    moveAppointment,
  } = useAppointmentStore();

  const [activeProviderIds, setActiveProviderIds] = useState<Set<string>>(
    () => new Set(APPOINTMENT_PROVIDERS.map((provider) => provider.id)),
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState<AppointmentFormState>(() =>
    makeEmptyAppointmentForm(firstProvider.id, firstProvider.name),
  );

  useEffect(() => {
    const start = new Date();
    start.setDate(start.getDate() - 14);
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setDate(end.getDate() + 45);
    end.setHours(23, 59, 59, 999);

    loadCalendar(APPOINTMENT_CLINIC_ID, start, end);
  }, [loadCalendar]);

  const visibleAppointments = useMemo(
    () =>
      appointments.filter((appointment) =>
        activeProviderIds.has(appointment.doctorId),
      ),
    [appointments, activeProviderIds],
  );

  const toggleProvider = useCallback((id: string) => {
    setActiveProviderIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) {
        if (next.size === 1) return previous;
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const openNew = useCallback((start?: Date, end?: Date, doctorId?: string) => {
    const provider =
      APPOINTMENT_PROVIDERS.find((item) => item.id === doctorId) ??
      APPOINTMENT_PROVIDERS.find((item) => activeProviderIds.has(item.id)) ??
      firstProvider;
    const empty = makeEmptyAppointmentForm(provider.id, provider.name);

    setForm({
      ...empty,
      startAt: start ? toDatetimeLocal(start) : empty.startAt,
      endAt: end ? toDatetimeLocal(end) : empty.endAt,
    });
    setFormError("");
    setModalOpen(true);
  }, [activeProviderIds]);

  const openEdit = useCallback((appointment: Appointment) => {
    setForm(appointmentToForm(appointment));
    setFormError("");
    setModalOpen(true);
  }, []);

  const saveForm = useCallback(async () => {
    if (!form.patientName.trim() || !form.type.trim()) {
      setFormError("Patient name and appointment type are required.");
      return;
    }

    const startAt = new Date(form.startAt);
    const endAt = new Date(form.endAt);
    if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
      setFormError("Start and end time must be valid.");
      return;
    }

    if (endAt <= startAt) {
      setFormError("End time must be after start time.");
      return;
    }

    const payload = {
      id: form.id,
      clinicId: APPOINTMENT_CLINIC_ID,
      patientId: form.patientId || `patient-${Date.now()}`,
      patientName: form.patientName,
      patientPhone: form.patientPhone || undefined,
      doctorId: form.doctorId,
      doctorName: form.doctorName,
      startAt,
      endAt,
      isEmergency: form.isEmergency,
      type: form.type,
      channel: form.channel,
      status: form.status,
      notes: form.notes || undefined,
    };

    try {
      await (form.id ? editAppointment(payload) : addAppointment(payload));
      setModalOpen(false);
    } catch (error) {
      const message =
        error instanceof AppError || error instanceof Error
          ? error.message
          : "Failed to save appointment.";
      setFormError(message);
    }
  }, [addAppointment, editAppointment, form]);

  const deleteForm = useCallback(async () => {
    if (!form.id) return;
    await removeAppointment(form.id);
    setModalOpen(false);
  }, [form.id, removeAppointment]);

  const move = useCallback(
    async (
      appointmentId: string,
      doctorId: string,
      doctorName: string | undefined,
      start: Date,
      end: Date,
    ) =>
      moveAppointment({
        appointmentId,
        doctorId,
        doctorName,
        newStartAt: start,
        newEndAt: end,
      }),
    [moveAppointment],
  );

  return {
    appointments,
    visibleAppointments,
    isLoading,
    isSaving,
    providers: APPOINTMENT_PROVIDERS,
    activeProviderIds,
    toggleProvider,
    modalOpen,
    setModalOpen,
    form,
    setForm,
    formError,
    openNew,
    openEdit,
    saveForm,
    deleteForm,
    move,
  };
}
