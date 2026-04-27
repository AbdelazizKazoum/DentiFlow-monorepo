"use client";

import React, {useState} from "react";
import {AppointmentCalendar} from "./AppointmentCalendar";
import {AppointmentModal} from "./AppointmentModal";
import {Appointment} from "./types";
import {mockAppointments} from "./mockAppointments";
import {Button} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

export const AppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] =
    useState<Appointment[]>(mockAppointments);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedAppointment, setSelectedAppointment] = useState<
    Partial<Appointment>
  >({});

  const handleSelectSlot = (start: Date, end: Date) => {
    setSelectedAppointment({
      start: start.toISOString(),
      end: end.toISOString(),
      status: "confirmed",
      service: "Consultation",
    });
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleSelectAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleUpdateAppointment = (updated: Appointment) => {
    // Basic overlap validation for drag/drop
    const hasOverlap = Object.values(appointments).some((apt) => {
      if (apt.id === updated.id) return false;
      const s1 = new Date(updated.start).getTime();
      const e1 = new Date(updated.end).getTime();
      const s2 = new Date(apt.start).getTime();
      const e2 = new Date(apt.end).getTime();
      return s1 < e2 && e1 > s2;
    });

    if (hasOverlap) {
      alert("Cannot move: Timeslot overlaps with an existing appointment.");
      return;
    }

    setAppointments((prev) =>
      prev.map((apt) => (apt.id === updated.id ? updated : apt)),
    );
  };

  const handleSaveModal = (appointment: Appointment) => {
    if (modalMode === "create") {
      setAppointments((prev) => [...prev, appointment]);
    } else {
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === appointment.id ? appointment : apt)),
      );
    }
    setIsModalOpen(false);
  };

  const handleDeleteModal = (id: string) => {
    if (window.confirm("Are you sure you want to delete this appointment?")) {
      setAppointments((prev) => prev.filter((apt) => apt.id !== id));
      setIsModalOpen(false);
    }
  };

  const handleOpenNew = () => {
    const now = new Date();
    // Round to next 30 min
    const start = new Date(
      Math.ceil(now.getTime() / (30 * 60000)) * (30 * 60000),
    );
    const end = new Date(start.getTime() + 30 * 60000);

    setSelectedAppointment({
      start: start.toISOString(),
      end: end.toISOString(),
      status: "confirmed",
      service: "Consultation",
    });
    setModalMode("create");
    setIsModalOpen(true);
  };

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Appointment Schedule
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your weekly patient appointments and clinical schedule.
          </p>
        </div>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenNew}
          className="shadow-sm"
          disableElevation
        >
          New Appointment
        </Button>
      </div>

      {/* Calendar Area */}
      <div className="flex-1 min-h-125 flex flex-col relative w-full">
        <AppointmentCalendar
          appointments={appointments}
          onSelectSlot={handleSelectSlot}
          onSelectAppointment={handleSelectAppointment}
          onUpdateAppointment={handleUpdateAppointment}
        />
      </div>

      {/* Modal */}
      <AppointmentModal
        open={isModalOpen}
        mode={modalMode}
        initialData={selectedAppointment}
        existingAppointments={appointments}
        onSave={handleSaveModal}
        onDelete={handleDeleteModal}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
