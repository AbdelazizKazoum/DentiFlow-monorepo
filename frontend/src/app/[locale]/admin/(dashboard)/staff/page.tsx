"use client";

import React, { useState, useCallback } from "react";
import {
  UserCog,
  Plus,
  Search,
  Phone,
  Mail,
  MoreVertical,
  Edit2,
  Trash2,
  X,
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

type StaffRole = "doctor" | "secretary" | "assistant" | "admin";
type StaffStatus = "active" | "on-leave" | "inactive";

interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  status: StaffStatus;
  phone: string;
  email: string;
  specialization: string;
  joinDate: string;
  avatar: string;
}

interface FormState {
  id: string;
  name: string;
  role: StaffRole;
  status: StaffStatus;
  phone: string;
  email: string;
  specialization: string;
  joinDate: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const ROLE_CONFIG: Record<
  StaffRole,
  { label: string; color: string; bg: string }
> = {
  doctor: { label: "Doctor", color: "#1e56d0", bg: "#e8f0fe" },
  secretary: { label: "Secretary", color: "#c05621", bg: "#fef3e8" },
  assistant: { label: "Assistant", color: "#6B46C1", bg: "#F3EBFA" },
  admin: { label: "Admin", color: "#279C41", bg: "#E8F8EC" },
};

const STATUS_CONFIG: Record<
  StaffStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  active: { label: "Active", color: "#279C41", bg: "#E8F8EC", dot: "#279C41" },
  "on-leave": {
    label: "On Leave",
    color: "#c05621",
    bg: "#fef3e8",
    dot: "#f6ad55",
  },
  inactive: {
    label: "Inactive",
    color: "#64748b",
    bg: "#f1f5f9",
    dot: "#94a3b8",
  },
};

const INITIAL_STAFF: StaffMember[] = [
  {
    id: "1",
    name: "Dr. Emily Carter",
    role: "doctor",
    status: "active",
    phone: "555-0201",
    email: "emily.carter@dentiflow.com",
    specialization: "Cosmetic & Restorative Dentistry",
    joinDate: "2021-03-15",
    avatar: "https://i.pravatar.cc/150?u=emily",
  },
  {
    id: "2",
    name: "Dr. John Harris",
    role: "doctor",
    status: "active",
    phone: "555-0202",
    email: "john.harris@dentiflow.com",
    specialization: "Orthodontics",
    joinDate: "2019-07-01",
    avatar: "https://i.pravatar.cc/150?u=john",
  },
  {
    id: "3",
    name: "Dr. Sarah Chen",
    role: "admin",
    status: "active",
    phone: "555-0203",
    email: "sarah.chen@dentiflow.com",
    specialization: "Periodontal Care",
    joinDate: "2022-01-10",
    avatar: "https://i.pravatar.cc/150?u=sarah",
  },
  {
    id: "4",
    name: "Mark Thompson",
    role: "secretary",
    status: "on-leave",
    phone: "555-0204",
    email: "mark.t@dentiflow.com",
    specialization: "Patient Coordination",
    joinDate: "2023-05-20",
    avatar: "https://i.pravatar.cc/150?u=mark",
  },
  {
    id: "5",
    name: "Lisa Nguyen",
    role: "assistant",
    status: "active",
    phone: "555-0205",
    email: "lisa.n@dentiflow.com",
    specialization: "Dental Radiology",
    joinDate: "2022-09-01",
    avatar: "https://i.pravatar.cc/150?u=lisa",
  },
  {
    id: "6",
    name: "Carlos Rivera",
    role: "assistant",
    status: "inactive",
    phone: "555-0206",
    email: "carlos.r@dentiflow.com",
    specialization: "Sterilization & Instruments",
    joinDate: "2020-11-15",
    avatar: "https://i.pravatar.cc/150?u=carlos",
  },
];

const EMPTY_FORM: FormState = {
  id: "",
  name: "",
  role: "doctor",
  status: "active",
  phone: "",
  email: "",
  specialization: "",
  joinDate: new Date().toISOString().split("T")[0],
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<StaffRole | "all">("all");
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

  const openEdit = useCallback((member: StaffMember) => {
    setForm({
      id: member.id,
      name: member.name,
      role: member.role,
      status: member.status,
      phone: member.phone,
      email: member.email,
      specialization: member.specialization,
      joinDate: member.joinDate,
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
      setStaff((prev) => prev.filter((s) => s.id !== deleteTargetId));
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
    const emailExists = staff.some(
      (s) => s.email === form.email && s.id !== form.id,
    );
    if (emailExists) {
      setError("A staff member with this email already exists.");
      return;
    }

    const updated: StaffMember = {
      id: form.id || String(Date.now()),
      name: form.name,
      role: form.role,
      status: form.status,
      phone: form.phone,
      email: form.email,
      specialization: form.specialization,
      joinDate: form.joinDate,
      avatar: `https://i.pravatar.cc/150?u=${form.email}`,
    };

    setStaff((prev) =>
      form.id
        ? prev.map((s) => (s.id === form.id ? updated : s))
        : [...prev, updated],
    );
    setModalOpen(false);
  };

  const filtered = staff.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.specialization.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || s.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Summary counts
  const counts = {
    total: staff.length,
    active: staff.filter((s) => s.status === "active").length,
    onLeave: staff.filter((s) => s.status === "on-leave").length,
    inactive: staff.filter((s) => s.status === "inactive").length,
  };

  return (
    <>
      <div className="p-6 lg:p-8 space-y-6">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Staff Management
            </h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Manage your clinic's team members
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
            Add Staff Member
          </button>
        </div>

        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Staff", value: counts.total, dot: "#1e56d0" },
            { label: "Active", value: counts.active, dot: "#279C41" },
            { label: "On Leave", value: counts.onLeave, dot: "#f6ad55" },
            { label: "Inactive", value: counts.inactive, dot: "#94a3b8" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-card border rounded-xl p-4 flex flex-col gap-1"
              style={{ borderColor: "var(--border-ui)" }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: stat.dot }}
                />
                <span
                  className="text-xs font-medium"
                  style={{ color: "var(--text-muted)" }}
                >
                  {stat.label}
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* ── Filters ── */}
        <div
          className="bg-card border rounded-xl p-4 flex flex-col sm:flex-row gap-3"
          style={{ borderColor: "var(--border-ui)" }}
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              type="text"
              placeholder="Search by name, email or specialization…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 h-9 text-sm rounded-lg border bg-transparent outline-none
                focus:ring-2 focus:ring-blue-500/30"
              style={{
                borderColor: "var(--border-ui)",
                color: "var(--foreground)",
              }}
            />
          </div>

          {/* Role filter pills */}
          <div className="flex flex-wrap gap-2">
            {(
              ["all", "doctor", "secretary", "assistant", "admin"] as const
            ).map((r) => {
              const isActive = roleFilter === r;
              const cfg = r !== "all" ? ROLE_CONFIG[r] : null;
              return (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className="px-3 h-9 rounded-lg text-xs font-semibold border transition-all duration-150"
                  style={
                    isActive && cfg
                      ? {
                          backgroundColor: cfg.bg,
                          color: cfg.color,
                          borderColor: cfg.color,
                        }
                      : isActive
                        ? {
                            backgroundColor: "#1e56d0",
                            color: "#fff",
                            borderColor: "#1e56d0",
                          }
                        : {
                            backgroundColor: "transparent",
                            color: "var(--text-muted)",
                            borderColor: "var(--border-ui)",
                          }
                  }
                >
                  {r === "all" ? "All Roles" : ROLE_CONFIG[r]?.label || r}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Staff Grid ── */}
        {filtered.length === 0 ? (
          <div
            className="bg-card border rounded-xl p-12 flex flex-col items-center gap-3"
            style={{ borderColor: "var(--border-ui)" }}
          >
            <UserCog size={40} style={{ color: "var(--text-muted)" }} />
            <p
              className="text-sm font-medium"
              style={{ color: "var(--text-muted)" }}
            >
              No staff members found
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((member) => {
              const roleCfg = ROLE_CONFIG[member.role] || ROLE_CONFIG.doctor;
              const statusCfg =
                STATUS_CONFIG[member.status] || STATUS_CONFIG.active;
              return (
                <div
                  key={member.id}
                  className="bg-card border rounded-xl p-5 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200"
                  style={{ borderColor: "var(--border-ui)" }}
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-11 h-11 rounded-full object-cover ring-2 ring-white/20 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate leading-tight">
                          {member.name}
                        </p>
                        <p
                          className="text-xs mt-0.5 truncate"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {member.specialization}
                        </p>
                      </div>
                    </div>
                    <IconButton
                      size="small"
                      onClick={(e) => openMenu(e, member.id)}
                      sx={{ color: "var(--text-muted)", flexShrink: 0 }}
                    >
                      <MoreVertical size={16} />
                    </IconButton>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: roleCfg.bg,
                        color: roleCfg.color,
                      }}
                    >
                      {roleCfg.label}
                    </span>
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
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
                  </div>

                  {/* Contact */}
                  <div
                    className="space-y-1.5 border-t pt-3"
                    style={{ borderColor: "var(--border-ui)" }}
                  >
                    <div
                      className="flex items-center gap-2 text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <Mail size={13} />
                      <span className="truncate">{member.email}</span>
                    </div>
                    {member.phone && (
                      <div
                        className="flex items-center gap-2 text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <Phone size={13} />
                        <span>{member.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Join date */}
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Joined{" "}
                    {new Date(member.joinDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              );
            })}
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
            const member = staff.find((s) => s.id === menuTarget);
            if (member) openEdit(member);
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
        maxWidth="sm"
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
            {form.id ? "Edit Staff Member" : "Add Staff Member"}
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
            {/* Name */}
            <TextField
              label="Full Name"
              fullWidth
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Dr. Jane Doe"
              required
            />

            {/* Role & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  label="Role"
                  value={form.role}
                  onChange={(e) =>
                    setForm({ ...form, role: e.target.value as StaffRole })
                  }
                >
                  <MenuItem value="doctor">Doctor</MenuItem>
                  <MenuItem value="secretary">Secretary</MenuItem>
                  <MenuItem value="assistant">Assistant</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value as StaffStatus })
                  }
                >
                  <MenuItem value="active">✅ Active</MenuItem>
                  <MenuItem value="on-leave">🟡 On Leave</MenuItem>
                  <MenuItem value="inactive">⚫ Inactive</MenuItem>
                </Select>
              </FormControl>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="e.g. jane@dentiflow.com"
                required
              />
              <TextField
                label="Phone"
                fullWidth
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="e.g. 555-0201"
              />
            </div>

            {/* Specialization & Join Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
              <TextField
                label="Specialization"
                fullWidth
                value={form.specialization}
                onChange={(e) =>
                  setForm({ ...form, specialization: e.target.value })
                }
                placeholder="e.g. Orthodontics"
              />
              <TextField
                label="Join Date"
                type="date"
                fullWidth
                value={form.joinDate}
                onChange={(e) => setForm({ ...form, joinDate: e.target.value })}
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
              {form.id ? "Save Changes" : "Add Member"}
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
            Delete Staff Member
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
              {staff.find((s) => s.id === deleteTargetId)?.name}
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
