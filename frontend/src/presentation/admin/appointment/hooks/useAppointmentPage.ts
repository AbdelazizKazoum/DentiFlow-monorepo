import { useCallback, useEffect, useMemo, useState } from "react";
import type { Appointment } from "@/domain/appointment/entities/appointment";
import { useAppointmentStore } from "@/presentation/stores/appointmentStore";
import { useQueueStore } from "@/presentation/stores/queueStore";
import {
  APPOINTMENT_CLINIC_ID,
  staffToAppointmentProviders,
} from "../appointmentConfig";
import type { AppointmentFormState } from "../types";
import type { CheckInFormState } from "../components/CheckInDialog";
import {
  appointmentToForm,
  makeEmptyAppointmentForm,
  toDatetimeLocal,
} from "../utils";
import { AppError } from "@/infrastructure/http/httpErrorHandler";

export function useAppointmentPage() {
  const {
    appointments,
    doctors,
    isLoading,
    isSaving,
    loadCalendar,
    loadDoctors,
    addAppointment,
    editAppointment,
    removeAppointment,
    moveAppointment,
  } = useAppointmentStore();

  const providers = useMemo(() => staffToAppointmentProviders(doctors), [doctors]);

  const [activeProviderIds, setActiveProviderIds] = useState<Set<string>>(
    new Set(),
  );

  // Update activeProviderIds when providers change
  useEffect(() => {
    if (providers.length > 0) {
      setActiveProviderIds(new Set(providers.map((provider) => provider.id)));
    }
  }, [providers]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState<AppointmentFormState>(() =>
    makeEmptyAppointmentForm("", ""),
  );

  // Check-in state
  const { checkInPatient, isUpdating: isChecking } = useQueueStore();
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkInAppointment, setCheckInAppointment] =
    useState<Appointment | null>(null);
  const [checkInForm, setCheckInForm] = useState<CheckInFormState>({
    priority: "NORMAL",
    notes: "",
  });
  const [checkInError, setCheckInError] = useState("");

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

  const openNew = useCallback(
    (start?: Date, end?: Date, doctorId?: string) => {
      const provider =
        providers.find((item) => item.id === doctorId) ??
        providers.find((item) => activeProviderIds.has(item.id)) ??
        providers[0];
      const empty = makeEmptyAppointmentForm(provider?.id || "", provider?.name || "");

      setForm({
        ...empty,
        startAt: start ? toDatetimeLocal(start) : empty.startAt,
        endAt: end ? toDatetimeLocal(end) : empty.endAt,
      });
      setFormError("");
      setModalOpen(true);
    },
    [activeProviderIds, providers],
  );

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

  const openCheckIn = useCallback((appointment: Appointment) => {
    setCheckInAppointment(appointment);
    setCheckInForm({ priority: "NORMAL", notes: "" });
    setCheckInError("");
    setCheckInOpen(true);
  }, []);

  const submitCheckIn = useCallback(async () => {
    if (!checkInAppointment) return;
    setCheckInError("");
    try {
      await checkInPatient({
        clinicId: APPOINTMENT_CLINIC_ID,
        appointmentId: checkInAppointment.id,
        patientId: checkInAppointment.patientId,
        patientName: checkInAppointment.patientName,
        patientPhone: checkInAppointment.patientPhone,
        doctorId: checkInAppointment.doctorId,
        doctorName: checkInAppointment.doctorName,
        appointmentType: checkInAppointment.type,
        priority: checkInForm.priority,
        notes: checkInForm.notes || undefined,
        arrivedAt: new Date(),
      });
      setCheckInOpen(false);
      setCheckInAppointment(null);
    } catch (error) {
      const message =
        error instanceof AppError || error instanceof Error
          ? error.message
          : "Failed to check in patient.";
      setCheckInError(message);
    }
  }, [checkInAppointment, checkInForm, checkInPatient]);

  // Load doctors and calendar on mount
  useEffect(() => {
    loadDoctors();
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(start);
    end.setDate(end.getDate() + 7); // Load one week of appointments
    loadCalendar(APPOINTMENT_CLINIC_ID, start, end);
  }, [loadDoctors, loadCalendar]);

  return {
    appointments,
    visibleAppointments,
    isLoading,
    isSaving,
    providers,
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
    // Check-in
    checkInOpen,
    checkInAppointment,
    checkInForm,
    checkInError,
    isChecking,
    openCheckIn,
    submitCheckIn,
    setCheckInOpen,
    setCheckInForm,
  };
}
