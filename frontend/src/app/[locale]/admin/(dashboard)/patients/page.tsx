"use client";

import React, { useState, useCallback } from "react";
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  MoreVertical,
  Edit2,
  Trash2,
  X,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  IconButton,
  Typography,
  Menu,
} from "@mui/material";

// ─── Types ────────────────────────────────────────────────────────────────────

type PatientStatus = "active" | "inactive" | "new";
type BloodType = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  bloodType: BloodType;
  allergies: string;
  medicalConditions: string;
  emergencyContact: string;
  emergencyPhone: string;
  lastVisit: string;
  nextAppointment: string;
  status: PatientStatus;
  avatar: string;
  registrationDate: string;
}

interface FormState {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  bloodType: BloodType;
  allergies: string;
  medicalConditions: string;
  emergencyContact: string;
  emergencyPhone: string;
  lastVisit: string;
  nextAppointment: string;
  status: PatientStatus;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  PatientStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  active: { label: "Active", color: "#279C41", bg: "#E8F8EC", dot: "#279C41" },
  new: {
    label: "New Patient",
    color: "#1e56d0",
    bg: "#e8f0fe",
    dot: "#1e56d0",
  },
  inactive: {
    label: "Inactive",
    color: "#64748b",
    bg: "#f1f5f9",
    dot: "#94a3b8",
  },
};

const INITIAL_PATIENTS: Patient[] = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice.j@example.com",
    phone: "555-0101",
    dateOfBirth: "1985-06-15",
    bloodType: "O+",
    allergies: "Penicillin",
    medicalConditions: "Hypertension",
    emergencyContact: "Bob Johnson",
    emergencyPhone: "555-0102",
    lastVisit: "2026-04-15",
    nextAppointment: "2026-05-10",
    status: "active",
    avatar: "https://i.pravatar.cc/150?u=alice",
    registrationDate: "2020-03-10",
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "m.chen@example.com",
    phone: "555-0203",
    dateOfBirth: "1992-11-22",
    bloodType: "A+",
    allergies: "None",
    medicalConditions: "None",
    emergencyContact: "Lisa Chen",
    emergencyPhone: "555-0204",
    lastVisit: "2026-04-25",
    nextAppointment: "",
    status: "active",
    avatar: "https://i.pravatar.cc/150?u=michael",
    registrationDate: "2021-07-18",
  },
  {
    id: "3",
    name: "Sarah Williams",
    email: "sarah.w@example.com",
    phone: "555-0305",
    dateOfBirth: "1978-03-08",
    bloodType: "B-",
    allergies: "Latex",
    medicalConditions: "Diabetes Type 2",
    emergencyContact: "John Williams",
    emergencyPhone: "555-0306",
    lastVisit: "2025-12-20",
    nextAppointment: "",
    status: "inactive",
    avatar: "https://i.pravatar.cc/150?u=sarah",
    registrationDate: "2019-01-15",
  },
  {
    id: "4",
    name: "David Martinez",
    email: "d.martinez@example.com",
    phone: "555-0407",
    dateOfBirth: "2000-09-30",
    bloodType: "AB+",
    allergies: "None",
    medicalConditions: "None",
    emergencyContact: "Maria Martinez",
    emergencyPhone: "555-0408",
    lastVisit: "",
    nextAppointment: "2026-05-05",
    status: "new",
    avatar: "https://i.pravatar.cc/150?u=david",
    registrationDate: "2026-04-28",
  },
  {
    id: "5",
    name: "Emma Thompson",
    email: "emma.t@example.com",
    phone: "555-0509",
    dateOfBirth: "1995-12-12",
    bloodType: "O-",
    allergies: "Aspirin",
    medicalConditions: "Asthma",
    emergencyContact: "James Thompson",
    emergencyPhone: "555-0510",
    lastVisit: "2026-04-20",
    nextAppointment: "2026-06-01",
    status: "active",
    avatar: "https://i.pravatar.cc/150?u=emma",
    registrationDate: "2022-05-22",
  },
];

const EMPTY_FORM: FormState = {
  id: "",
  name: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  bloodType: "O+",
  allergies: "",
  medicalConditions: "",
  emergencyContact: "",
  emergencyPhone: "",
  lastVisit: "",
  nextAppointment: "",
  status: "new",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PatientStatus | "all">(
    "all",
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState("");

  // Delete confirmation modal state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Per-card action menu state
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuTarget, setMenuTarget] = useState<string | null>(null);

  const openMenu = (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
    setMenuTarget(id);
  };
  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuTarget(null);
  };

  const openNew = useCallback(() => {
    setForm(EMPTY_FORM);
    setError("");
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((patient: Patient) => {
    setForm({
      id: patient.id,
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      dateOfBirth: patient.dateOfBirth,
      bloodType: patient.bloodType,
      allergies: patient.allergies,
      medicalConditions: patient.medicalConditions,
      emergencyContact: patient.emergencyContact,
      emergencyPhone: patient.emergencyPhone,
      lastVisit: patient.lastVisit,
      nextAppointment: patient.nextAppointment,
      status: patient.status,
    });
    setError("");
    setModalOpen(true);
    closeMenu();
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteTargetId(id);
    setDeleteConfirmOpen(true);
    closeMenu();
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteTargetId) {
      setPatients((prev) => prev.filter((p) => p.id !== deleteTargetId));
      setDeleteConfirmOpen(false);
      setDeleteTargetId(null);
      setModalOpen(false);
    }
  }, [deleteTargetId]);

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) {
      setError("Name and email are required.");
      return;
    }
    const emailExists = patients.some(
      (p) => p.email === form.email && p.id !== form.id,
    );
    if (emailExists) {
      setError("A patient with this email already exists.");
      return;
    }

    const updated: Patient = {
      id: form.id || String(Date.now()),
      name: form.name,
      email: form.email,
      phone: form.phone,
      dateOfBirth: form.dateOfBirth,
      bloodType: form.bloodType,
      allergies: form.allergies,
      medicalConditions: form.medicalConditions,
      emergencyContact: form.emergencyContact,
      emergencyPhone: form.emergencyPhone,
      lastVisit: form.lastVisit,
      nextAppointment: form.nextAppointment,
      status: form.status,
      avatar: `https://i.pravatar.cc/150?u=${form.email}`,
      registrationDate:
        patients.find((p) => p.id === form.id)?.registrationDate ||
        new Date().toISOString().split("T")[0],
    };

    setPatients((prev) =>
      form.id
        ? prev.map((p) => (p.id === form.id ? updated : p))
        : [...prev, updated],
    );
    setModalOpen(false);
  };

  const filtered = patients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate age
  const calculateAge = (dob: string) => {
    if (!dob) return "—";
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <>
      <div className="p-6 lg:p-8 space-y-6">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Patients</h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Manage your patient records and appointments
            </p>
          </div>
          <button
            onClick={openNew}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white
              shadow-sm transition-all duration-150"
            style={{
              backgroundColor: "var(--brand-primary)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                "var(--brand-primary-dark)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--brand-primary)")
            }
          >
            <Plus size={16} />
            Add Patient
          </button>
        </div>

        {/* ── Status Tabs & Count ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {(["all", "active", "new", "inactive"] as const).map((s) => {
              const isActive = statusFilter === s;
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className="relative pb-3 text-sm font-semibold transition-colors"
                  style={{
                    color: isActive
                      ? "var(--brand-primary)"
                      : "var(--text-muted)",
                  }}
                >
                  {s === "all"
                    ? "All Patients"
                    : s === "new"
                      ? "New Patients"
                      : s.charAt(0).toUpperCase() + s.slice(1)}
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-0 right-0 h-0.5"
                      style={{ backgroundColor: "var(--brand-primary)" }}
                    />
                  )}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            <Users size={16} style={{ color: "var(--text-muted)" }} />
            <span
              className="text-sm font-semibold"
              style={{ color: "var(--text-muted)" }}
            >
              {filtered.length}
            </span>
            <span
              className="text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              patient{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* ── Search Bar ── */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              type="text"
              placeholder="Search for anything here..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 h-10 text-sm rounded-lg border bg-transparent outline-none
                focus:ring-2 focus:ring-blue-500/20 transition-all"
              style={{
                borderColor: "var(--border-ui)",
                color: "var(--foreground)",
              }}
            />
          </div>
          <button
            onClick={openNew}
            className="inline-flex items-center gap-2 px-4 h-10 rounded-lg text-sm font-semibold text-white
              shadow-sm transition-all duration-150 shrink-0"
            style={{
              backgroundColor: "var(--brand-primary)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                "var(--brand-primary-dark)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--brand-primary)")
            }
          >
            <Plus size={16} />
            Add Patient
          </button>
        </div>

        {/* ── Patients Table ── */}
        {filtered.length === 0 ? (
          <div
            className="bg-card border rounded-xl p-12 flex flex-col items-center gap-3"
            style={{ borderColor: "var(--border-ui)" }}
          >
            <Users size={40} style={{ color: "var(--text-muted)" }} />
            <p
              className="text-sm font-medium"
              style={{ color: "var(--text-muted)" }}
            >
              No patients found
            </p>
          </div>
        ) : (
          <div
            className="bg-card border rounded-xl overflow-hidden"
            style={{ borderColor: "var(--border-ui)" }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr
                    className="border-b"
                    style={{ borderColor: "var(--border-ui)" }}
                  >
                    <th
                      className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Patient Name
                    </th>
                    <th
                      className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Contact
                    </th>
                    <th
                      className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Age / Blood Type
                    </th>
                    <th
                      className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Medical Info
                    </th>
                    <th
                      className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Last Visit
                    </th>
                    <th
                      className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Status
                    </th>
                    <th
                      className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--text-muted)" }}
                    >
                      
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((patient) => {
                    const statusCfg =
                      STATUS_CONFIG[patient.status] || STATUS_CONFIG.active;
                    const hasAllergies =
                      patient.allergies && patient.allergies !== "None";
                    return (
                      <tr
                        key={patient.id}
                        className="border-b transition-colors hover:bg-gray-50/50"
                        style={{ borderColor: "var(--border-ui)" }}
                      >
                        {/* Patient Name */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={patient.avatar}
                              alt={patient.name}
                              className="w-9 h-9 rounded-full object-cover ring-2 ring-white/20 shrink-0"
                            />
                            <div>
                              <p className="font-medium text-sm text-foreground">
                                {patient.name}
                              </p>
                              <p
                                className="text-xs mt-0.5"
                                style={{ color: "var(--text-muted)" }}
                              >
                                Reg:{" "}
                                {new Date(
                                  patient.registrationDate,
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div
                              className="flex items-center gap-1.5 text-xs"
                              style={{ color: "var(--text-muted)" }}
                            >
                              <Mail size={12} />
                              <span className="truncate" style={{ maxWidth: "180px" }}>
                                {patient.email}
                              </span>
                            </div>
                            {patient.phone && (
                              <div
                                className="flex items-center gap-1.5 text-xs"
                                style={{ color: "var(--text-muted)" }}
                              >
                                <Phone size={12} />
                                <span>{patient.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Age / Blood Type */}
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <p className="text-sm text-foreground font-medium">
                              {calculateAge(patient.dateOfBirth)} years
                            </p>
                            <p
                              className="text-xs"
                              style={{ color: "var(--text-muted)" }}
                            >
                              Blood: {patient.bloodType}
                            </p>
                          </div>
                        </td>

                        {/* Medical Info */}
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {hasAllergies ? (
                              <div className="flex items-center gap-1.5">
                                <span
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium"
                                  style={{
                                    backgroundColor: "#fff7ed",
                                    color: "#c2410c",
                                  }}
                                >
                                  <AlertCircle size={11} />
                                  Allergies
                                </span>
                              </div>
                            ) : (
                              <span
                                className="text-xs"
                                style={{ color: "var(--text-muted)" }}
                              >
                                No allergies
                              </span>
                            )}
                            {patient.medicalConditions &&
                              patient.medicalConditions !== "None" && (
                                <p
                                  className="text-xs truncate"
                                  style={{ color: "var(--text-muted)", maxWidth: "150px" }}
                                  title={patient.medicalConditions}
                                >
                                  {patient.medicalConditions}
                                </p>
                              )}
                          </div>
                        </td>

                        {/* Last Visit */}
                        <td className="px-6 py-4">
                          {patient.lastVisit ? (
                            <div>
                              <p className="text-sm text-foreground">
                                {new Date(patient.lastVisit).toLocaleDateString(
                                  "en-US",
                                  { month: "short", day: "numeric" },
                                )}
                              </p>
                              <p
                                className="text-xs mt-0.5"
                                style={{ color: "var(--text-muted)" }}
                              >
                                {new Date(
                                  patient.lastVisit,
                                ).toLocaleDateString("en-US", {
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                          ) : (
                            <span
                              className="text-xs"
                              style={{ color: "var(--text-muted)" }}
                            >
                              No visits
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                            style={{
                              backgroundColor: statusCfg.bg,
                              color: statusCfg.color,
                            }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: statusCfg.dot }}
                            />
                            {statusCfg.label}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <IconButton
                            size="small"
                            onClick={(e) => openMenu(e, patient.id)}
                            sx={{ color: "var(--text-muted)" }}
                          >
                            <MoreVertical size={16} />
                          </IconButton>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Action Menu ── */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
        slotProps={{
          paper: {
            sx: {
              borderRadius: "10px",
              border: "1px solid var(--border-ui)",
              backgroundColor: "var(--surface-card)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              minWidth: 140,
            },
          },
        }}
      >
        <MenuItem
          onClick={() => {
            const patient = patients.find((p) => p.id === menuTarget);
            if (patient) openEdit(patient);
          }}
          sx={{ fontSize: "0.875rem", gap: 1, color: "var(--foreground)" }}
        >
          <Edit2 size={15} /> Edit
        </MenuItem>
        <MenuItem
          onClick={() => menuTarget && handleDelete(menuTarget)}
          sx={{ fontSize: "0.875rem", gap: 1, color: "#e53e3e" }}
        >
          <Trash2 size={15} /> Delete
        </MenuItem>
      </Menu>

      {/* ── Add / Edit Modal ── */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: "16px",
              boxShadow:
                "0 20px 40px -10px rgba(0,0,0,0.15), 0 10px 20px -15px rgba(0,0,0,0.1)",
              border: "1px solid var(--border-ui)",
              backgroundColor: "var(--surface-card)",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: "20px 24px",
            borderBottom: "1px solid var(--border-ui)",
          }}
        >
          <Typography
            variant="h6"
            component="div"
            sx={{ fontWeight: 700, color: "var(--foreground)" }}
          >
            {form.id ? "Edit Patient" : "Add New Patient"}
          </Typography>
          <IconButton
            size="small"
            onClick={() => setModalOpen(false)}
            sx={{ color: "var(--text-muted)" }}
          >
            <X size={20} />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            p: "24px",
            "& .MuiTextField-root": { mb: "16px" },
            "& .MuiInputLabel-root": { fontSize: "0.875rem" },
            "& .MuiInputBase-input": { fontSize: "0.875rem" },
          }}
        >
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1 pt-2">
            {/* Basic Info Section */}
            <Typography
              sx={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                mb: 1,
              }}
            >
              Basic Information
            </Typography>

            {/* Name & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
              <TextField
                label="Full Name"
                fullWidth
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. John Doe"
                required
              />
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="e.g. john@example.com"
                required
              />
            </div>

            {/* Phone & Date of Birth */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
              <TextField
                label="Phone"
                fullWidth
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="e.g. 555-0101"
              />
              <TextField
                label="Date of Birth"
                type="date"
                fullWidth
                value={form.dateOfBirth}
                onChange={(e) =>
                  setForm({ ...form, dateOfBirth: e.target.value })
                }
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </div>

            {/* Blood Type & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <FormControl fullWidth>
                <InputLabel>Blood Type</InputLabel>
                <Select
                  label="Blood Type"
                  value={form.bloodType}
                  onChange={(e) =>
                    setForm({ ...form, bloodType: e.target.value as BloodType })
                  }
                >
                  <MenuItem value="A+">A+</MenuItem>
                  <MenuItem value="A-">A-</MenuItem>
                  <MenuItem value="B+">B+</MenuItem>
                  <MenuItem value="B-">B-</MenuItem>
                  <MenuItem value="AB+">AB+</MenuItem>
                  <MenuItem value="AB-">AB-</MenuItem>
                  <MenuItem value="O+">O+</MenuItem>
                  <MenuItem value="O-">O-</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value as PatientStatus,
                    })
                  }
                >
                  <MenuItem value="new">🆕 New Patient</MenuItem>
                  <MenuItem value="active">✅ Active</MenuItem>
                  <MenuItem value="inactive">⚫ Inactive</MenuItem>
                </Select>
              </FormControl>
            </div>

            {/* Medical Info Section */}
            <Typography
              sx={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                mb: 1,
                mt: 1,
              }}
            >
              Medical Information
            </Typography>

            {/* Allergies & Medical Conditions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <TextField
                label="Allergies"
                fullWidth
                value={form.allergies}
                onChange={(e) =>
                  setForm({ ...form, allergies: e.target.value })
                }
                placeholder="e.g. Penicillin, Latex"
              />
              <TextField
                label="Medical Conditions"
                fullWidth
                value={form.medicalConditions}
                onChange={(e) =>
                  setForm({ ...form, medicalConditions: e.target.value })
                }
                placeholder="e.g. Diabetes, Hypertension"
              />
            </div>

            {/* Emergency Contact Section */}
            <Typography
              sx={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                mb: 1,
                mt: 1,
              }}
            >
              Emergency Contact
            </Typography>

            {/* Emergency Contact & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <TextField
                label="Emergency Contact Name"
                fullWidth
                value={form.emergencyContact}
                onChange={(e) =>
                  setForm({ ...form, emergencyContact: e.target.value })
                }
                placeholder="e.g. Jane Doe"
              />
              <TextField
                label="Emergency Phone"
                fullWidth
                value={form.emergencyPhone}
                onChange={(e) =>
                  setForm({ ...form, emergencyPhone: e.target.value })
                }
                placeholder="e.g. 555-0102"
              />
            </div>

            {/* Appointment Section */}
            <Typography
              sx={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                mb: 1,
                mt: 1,
              }}
            >
              Appointments
            </Typography>

            {/* Last Visit & Next Appointment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
              <TextField
                label="Last Visit"
                type="date"
                fullWidth
                value={form.lastVisit}
                onChange={(e) =>
                  setForm({ ...form, lastVisit: e.target.value })
                }
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                label="Next Appointment"
                type="date"
                fullWidth
                value={form.nextAppointment}
                onChange={(e) =>
                  setForm({ ...form, nextAppointment: e.target.value })
                }
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </div>
          </div>
        </DialogContent>

        <DialogActions
          sx={{
            p: "16px 24px",
            borderTop: "1px solid var(--border-ui)",
            justifyContent: "space-between",
          }}
        >
          <div>
            {form.id && (
              <Button
                color="error"
                variant="text"
                onClick={() => handleDelete(form.id)}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: "8px",
                }}
              >
                Delete
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outlined"
              onClick={() => setModalOpen(false)}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "8px",
                padding: "8px 16px",
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "8px",
                padding: "8px 16px",
                boxShadow: "0 1px 3px rgba(30,86,208,0.3)",
                backgroundColor: "var(--brand-primary)",
                "&:hover": {
                  backgroundColor: "var(--brand-primary-dark)",
                  boxShadow: "0 2px 6px rgba(30,86,208,0.4)",
                },
              }}
            >
              {form.id ? "Save Changes" : "Add Patient"}
            </Button>
          </div>
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirmation Modal ── */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: "16px",
              boxShadow:
                "0 20px 40px -10px rgba(0,0,0,0.15), 0 10px 20px -15px rgba(0,0,0,0.1)",
              border: "1px solid var(--border-ui)",
              backgroundColor: "var(--surface-card)",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: "20px 24px",
            borderBottom: "1px solid var(--border-ui)",
          }}
        >
          <Typography
            variant="h6"
            component="div"
            sx={{ fontWeight: 700, color: "var(--foreground)" }}
          >
            Delete Patient
          </Typography>
          <IconButton
            size="small"
            onClick={() => setDeleteConfirmOpen(false)}
            sx={{ color: "var(--text-muted)" }}
          >
            <X size={20} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: "24px" }}>
          <Typography
            sx={{
              color: "var(--foreground)",
              fontSize: "0.9375rem",
              lineHeight: 1.6,
            }}
          >
            Are you sure you want to delete{" "}
            <strong style={{ color: "var(--brand-primary)" }}>
              {patients.find((p) => p.id === deleteTargetId)?.name}
            </strong>
            ? This action cannot be undone.
          </Typography>
        </DialogContent>

        <DialogActions
          sx={{
            p: "16px 24px",
            borderTop: "1px solid var(--border-ui)",
            gap: 2,
          }}
        >
          <Button
            variant="outlined"
            onClick={() => setDeleteConfirmOpen(false)}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "8px",
              padding: "8px 16px",
              flex: 1,
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmDelete}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "8px",
              padding: "8px 16px",
              flex: 1,
              backgroundColor: "#e53e3e",
              "&:hover": {
                backgroundColor: "#c53030",
              },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
