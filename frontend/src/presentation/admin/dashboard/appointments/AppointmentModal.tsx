"use client";

import React, {useEffect} from "react";
import {useForm, Controller} from "react-hook-form";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormHelperText,
  Alert,
} from "@mui/material";
import {Appointment, AppointmentStatus} from "./types";

interface AppointmentModalProps {
  open: boolean;
  mode: "create" | "edit";
  initialData: Partial<Appointment>;
  existingAppointments: Appointment[];
  onSave: (appointment: Appointment) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

type FormValues = {
  patientName: string;
  service: string;
  start: string;
  end: string;
  status: AppointmentStatus;
  notes: string;
};

// Services available to mock
const SERVICES = [
  "Consultation",
  "Teeth Cleaning",
  "Root Canal",
  "Filling",
  "Orthodontic Check",
  "Extraction",
  "Crown Fitting",
];

// Helper to format date for datetime-local input
const toLocalDateTimeStr = (isoStr: string) => {
  if (!isoStr) return "";
  const d = new Date(isoStr);
  const offset = d.getTimezoneOffset() * 60000;
  const localISOTime = new Date(d.getTime() - offset)
    .toISOString()
    .slice(0, 16);
  return localISOTime;
};

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  open,
  mode,
  initialData,
  existingAppointments,
  onSave,
  onDelete,
  onClose,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: {errors},
  } = useForm<FormValues>({
    defaultValues: {
      patientName: "",
      service: "Consultation",
      start: "",
      end: "",
      status: "confirmed",
      notes: "",
    },
  });

  const watchStart = watch("start");

  useEffect(() => {
    if (open && initialData) {
      reset({
        patientName: initialData.patientName || "",
        service: initialData.service || "Consultation",
        start: initialData.start ? toLocalDateTimeStr(initialData.start) : "",
        end: initialData.end ? toLocalDateTimeStr(initialData.end) : "",
        status: initialData.status || "confirmed",
        notes: initialData.notes || "",
      });
    }
  }, [open, initialData, reset]);

  // Auto-set end time when start time changes and end time is empty or we want to default roughly 30 minutes
  useEffect(() => {
    if (watchStart && mode === "create") {
      const startDate = new Date(watchStart);
      const endDate = new Date(startDate.getTime() + 30 * 60000); // +30 minutes
      // prevent infinite loops logic here:
      const endStr = toLocalDateTimeStr(endDate.toISOString());
      setValue("end", endStr);
    }
  }, [watchStart, mode, setValue]);

  const hasOverlap = (startStr: string, endStr: string, excludeId?: string) => {
    const s = new Date(startStr).getTime();
    const e = new Date(endStr).getTime();
    return existingAppointments.some((apt) => {
      if (apt.id === excludeId) return false;
      const aptS = new Date(apt.start).getTime();
      const aptE = new Date(apt.end).getTime();
      return s < aptE && e > aptS;
    });
  };

  const isBusinessHours = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = d.getDay();
    const hours = d.getHours();

    if (day === 0 || day === 6) return false; // Weekend
    if (hours < 9 || hours >= 18) return false; // outside 09:00-18:00

    // Specifically block dates exactly on 18:00 if they extend past 18:00
    // But allow an appointment ending precisely at 18:00
    const m = d.getMinutes();
    if (hours === 18 && m > 0) return false;

    return true;
  };

  const onSubmit = (data: FormValues) => {
    // Re-validate dates
    const s = new Date(data.start);
    const e = new Date(data.end);

    if (s >= e) {
      setError("end", {message: "End time must be after start time"});
      return;
    }

    if (!isBusinessHours(data.start) || !isBusinessHours(data.end)) {
      setError("start", {message: "Must be Mon-Fri, 09:00-18:00"});
      return;
    }

    if (hasOverlap(data.start, data.end, initialData.id)) {
      setError("start", {
        message: "Timeslot overlaps with existing appointment",
      });
      return;
    }

    const appointment: Appointment = {
      id: initialData.id || Math.random().toString(36).substr(2, 9),
      title: data.patientName,
      start: s.toISOString(),
      end: e.toISOString(),
      status: data.status,
      patientName: data.patientName,
      service: data.service,
      notes: data.notes,
    };

    onSave(appointment);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>
          {mode === "create" ? "Create Appointment" : "Edit Appointment"}
        </DialogTitle>
        <DialogContent className="flex flex-col gap-4 pt-2 mt-2">
          {errors.start?.message && (
            <Alert severity="error">{errors.start.message}</Alert>
          )}

          <Controller
            name="patientName"
            control={control}
            rules={{
              required: "Patient name is required",
              minLength: {value: 2, message: "Minimum 2 characters"},
            }}
            render={({field}) => (
              <TextField
                {...field}
                label="Patient Name"
                variant="outlined"
                fullWidth
                error={!!errors.patientName}
                helperText={errors.patientName?.message}
                margin="dense"
              />
            )}
          />

          <FormControl fullWidth variant="outlined" margin="dense">
            <InputLabel>Service</InputLabel>
            <Controller
              name="service"
              control={control}
              render={({field}) => (
                <Select {...field} label="Service">
                  {SERVICES.map((srv) => (
                    <MenuItem key={srv} value={srv}>
                      {srv}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </FormControl>

          <div className="flex gap-4">
            <Controller
              name="start"
              control={control}
              rules={{required: "Start time is required"}}
              render={({field}) => (
                <TextField
                  {...field}
                  label="Start Time"
                  type="datetime-local"
                  fullWidth
                  InputLabelProps={{shrink: true}}
                  error={
                    !!errors.start &&
                    errors.start.message !==
                      "Timeslot overlaps with existing appointment" &&
                    errors.start.message !== "Must be Mon-Fri, 09:00-18:00"
                  }
                  margin="dense"
                />
              )}
            />
            <Controller
              name="end"
              control={control}
              rules={{required: "End time is required"}}
              render={({field}) => (
                <TextField
                  {...field}
                  label="End Time"
                  type="datetime-local"
                  fullWidth
                  InputLabelProps={{shrink: true}}
                  error={!!errors.end}
                  helperText={errors.end?.message}
                  margin="dense"
                />
              )}
            />
          </div>

          <FormControl fullWidth variant="outlined" margin="dense">
            <InputLabel>Status</InputLabel>
            <Controller
              name="status"
              control={control}
              render={({field}) => (
                <Select {...field} label="Status">
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              )}
            />
          </FormControl>

          <Controller
            name="notes"
            control={control}
            render={({field}) => (
              <TextField
                {...field}
                label="Notes"
                multiline
                rows={3}
                variant="outlined"
                fullWidth
                margin="dense"
              />
            )}
          />
        </DialogContent>
        <DialogActions className="px-6 pb-6">
          {mode === "edit" && (
            <Button
              onClick={() => onDelete(initialData.id!)}
              color="error"
              variant="outlined"
              className="mr-auto"
            >
              Delete
            </Button>
          )}
          <Button onClick={onClose} variant="text">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
