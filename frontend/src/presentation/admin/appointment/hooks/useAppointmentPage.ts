import {useCallback, useEffect, useMemo, useState} from "react";
import {useSession} from "next-auth/react";
import type {Appointment} from "@/domain/appointment/entities/appointment";
import {useAppointmentStore} from "@/presentation/stores/appointmentStore";
import {useQueueStore} from "@/presentation/stores/queueStore";
import {
  APPOINTMENT_CLINIC_ID,
  staffToAppointmentProviders,
} from "../appointmentConfig";
import type {AppointmentFormState} from "../types";
import type {CheckInFormState} from "../components/CheckInDialog";
import {
  appointmentToForm,
  makeEmptyAppointmentForm,
  toDatetimeLocal,
} from "../utils";
import {AppError} from "@/infrastructure/http/httpErrorHandler";

export function useAppointmentPage() {
  const {data: session, status: sessionStatus} = useSession();
  const clinicId = session?.user?.clinic_id || APPOINTMENT_CLINIC_ID;
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

  const providers = useMemo(
    () => staffToAppointmentProviders(doctors),
    [doctors],
  );

  const allProviderIds = useMemo(
    () => new Set(providers.map((provider) => provider.id)),
    [providers],
  );

  const [disabledProviderIds, setDisabledProviderIds] = useState<Set<string>>(
    new Set(),
  );

  const activeProviderIds = useMemo(() => {
    const active = new Set(allProviderIds);
    for (const id of disabledProviderIds) {
      active.delete(id);
    }
    return active;
  }, [allProviderIds, disabledProviderIds]);

  const [modalOpen, setModalOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState<AppointmentFormState>(() =>
    makeEmptyAppointmentForm("", ""),
  );

  // Check-in state
  const {checkInPatient, isUpdating: isChecking} = useQueueStore();
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkInAppointment, setCheckInAppointment] =
    useState<Appointment | null>(null);
  const [checkInForm, setCheckInForm] = useState<CheckInFormState>({
    priority: "NORMAL",
    notes: "",
  });
  const [checkInError, setCheckInError] = useState("");

  const visibleAppointments = useMemo(
    () =>
      appointments.filter((appointment) =>
        activeProviderIds.has(appointment.doctorId),
      ),
    [appointments, activeProviderIds],
  );

  const toggleProvider = useCallback(
    (id: string) => {
      setDisabledProviderIds((previous) => {
        const next = new Set(previous);
        if (next.has(id)) {
          next.delete(id);
        } else {
          // Prevent disabling the last provider
          if (allProviderIds.size - next.size > 1) {
            next.add(id);
          }
        }
        return next;
      });
    },
    [allProviderIds.size],
  );

  const openNew = useCallback(
    (start?: Date, end?: Date, doctorId?: string) => {
      const provider =
        providers.find((item) => item.id === doctorId) ??
        providers.find((item) => activeProviderIds.has(item.id)) ??
        providers[0];
      const empty = makeEmptyAppointmentForm(
        provider?.id || "",
        provider?.name || "",
      );

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
    if (!form.id && !form.patientId) {
      setFormError("Please select a patient from the search results.");
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
      clinicId,
      patientId: form.patientId,
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
  }, [addAppointment, clinicId, editAppointment, form]);

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
    setCheckInForm({priority: "NORMAL", notes: ""});
    setCheckInError("");
    setCheckInOpen(true);
  }, []);

  const submitCheckIn = useCallback(async () => {
    if (!checkInAppointment) return;
    setCheckInError("");
    try {
      await checkInPatient({
        clinicId,
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
  }, [checkInAppointment, checkInForm, checkInPatient, clinicId]);

  const navigateCalendar = useCallback(
    (start: Date, end: Date) => {
      loadCalendar(clinicId, start, end);
    },
    [clinicId, loadCalendar],
  );

  const canCheckInForm = useMemo(() => {
    if (!form.id || !form.patientId) return false;
    return ["PENDING", "CONFIRMED"].includes(form.status);
  }, [form.id, form.patientId, form.status]);

  const openCheckInFromForm = useCallback(() => {
    if (!canCheckInForm) return;
    openCheckIn({
      id: form.id,
      clinicId,
      patientId: form.patientId,
      patientName: form.patientName,
      patientPhone: form.patientPhone || undefined,
      doctorId: form.doctorId,
      doctorName: form.doctorName,
      startAt: new Date(form.startAt),
      endAt: new Date(form.endAt),
      isEmergency: form.isEmergency,
      type: form.type || undefined,
      channel: form.channel,
      status: form.status,
      notes: form.notes || undefined,
    });
    setModalOpen(false);
  }, [canCheckInForm, clinicId, form, openCheckIn]);

  // Load doctors and initial week on mount
  useEffect(() => {
    if (sessionStatus === "loading") return;
    loadDoctors(clinicId);
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    loadCalendar(clinicId, start, end);
  }, [clinicId, loadDoctors, loadCalendar, sessionStatus]);

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
    navigateCalendar,
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
    canCheckInForm,
    openCheckInFromForm,
  };
}
