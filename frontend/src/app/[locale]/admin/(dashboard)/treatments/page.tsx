"use client";

import React, { useState, useCallback } from "react";
import {
  Stethoscope,
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  X,
  Star,
  Clock,
  DollarSign,
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

type TreatmentStatus = "active" | "inactive";
type VisitType = "single" | "multiple";

interface Treatment {
  id: string;
  name: string;
  price: number;
  duration: string;
  visitType: VisitType;
  rating: number;
  reviewCount: number;
  status: TreatmentStatus;
  category: string;
  description: string;
}

interface FormState {
  id: string;
  name: string;
  price: string;
  duration: string;
  visitType: VisitType;
  status: TreatmentStatus;
  category: string;
  description: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  TreatmentStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  active: {
    label: "Active",
    color: "#10b981",
    bg: "#d1fae5",
    dot: "#10b981",
  },
  inactive: {
    label: "Inactive",
    color: "#64748b",
    bg: "#f1f5f9",
    dot: "#94a3b8",
  },
};

const VISIT_TYPE_CONFIG: Record<
  VisitType,
  { label: string; color: string; bg: string }
> = {
  single: {
    label: "Single Visit",
    color: "#3b82f6",
    bg: "#dbeafe",
  },
  multiple: {
    label: "Multiple Visits",
    color: "#8b5cf6",
    bg: "#ede9fe",
  },
};

const INITIAL_TREATMENTS: Treatment[] = [
  {
    id: "1",
    name: "General Checkup",
    price: 60,
    duration: "1 hour",
    visitType: "single",
    rating: 5.0,
    reviewCount: 48,
    status: "active",
    category: "Preventive",
    description: "Routine dental examination and cleaning",
  },
  {
    id: "2",
    name: "Teeth Whitening",
    price: 300,
    duration: "1 hour",
    visitType: "single",
    rating: 4.5,
    reviewCount: 76,
    status: "active",
    category: "Cosmetic",
    description: "Professional teeth whitening treatment",
  },
  {
    id: "3",
    name: "Teeth Cleaning",
    price: 75,
    duration: "1.5 hours",
    visitType: "single",
    rating: 4.8,
    reviewCount: 186,
    status: "active",
    category: "Preventive",
    description: "Deep cleaning and plaque removal",
  },
  {
    id: "4",
    name: "Tooth Extraction",
    price: 200,
    duration: "2 hours",
    visitType: "single",
    rating: 4.2,
    reviewCount: 100,
    status: "active",
    category: "Surgery",
    description: "Safe tooth removal procedure",
  },
  {
    id: "5",
    name: "Tooth Fillings",
    price: 210,
    duration: "1.5 hours",
    visitType: "single",
    rating: 4.6,
    reviewCount: 76,
    status: "active",
    category: "Restorative",
    description: "Composite or amalgam fillings",
  },
  {
    id: "6",
    name: "Tooth Scaling",
    price: 140,
    duration: "1.5 hours",
    visitType: "single",
    rating: 4.7,
    reviewCount: 186,
    status: "active",
    category: "Preventive",
    description: "Remove tartar and calculus buildup",
  },
  {
    id: "7",
    name: "Tooth Braces (Metal)",
    price: 3000,
    duration: "1.5 hours",
    visitType: "multiple",
    rating: 4.9,
    reviewCount: 220,
    status: "active",
    category: "Orthodontics",
    description: "Traditional metal braces treatment",
  },
  {
    id: "8",
    name: "Veneers",
    price: 925,
    duration: "1.5 hours",
    visitType: "multiple",
    rating: 4.8,
    reviewCount: 32,
    status: "active",
    category: "Cosmetic",
    description: "Porcelain veneers for smile enhancement",
  },
  {
    id: "9",
    name: "Bonding",
    price: 190,
    duration: "1.5 hours",
    visitType: "multiple",
    rating: 4.5,
    reviewCount: 4,
    status: "active",
    category: "Cosmetic",
    description: "Tooth-colored resin bonding",
  },
  {
    id: "10",
    name: "Root Canal",
    price: 400,
    duration: "2 hours",
    visitType: "multiple",
    rating: 4.3,
    reviewCount: 58,
    status: "inactive",
    category: "Endodontics",
    description: "Root canal therapy",
  },
];

const EMPTY_FORM: FormState = {
  id: "",
  name: "",
  price: "",
  duration: "",
  visitType: "single",
  status: "active",
  category: "",
  description: "",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function TreatmentsPage() {
  const [treatments, setTreatments] = useState<Treatment[]>(INITIAL_TREATMENTS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TreatmentStatus | "all">(
    "all",
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState("");

  // Delete confirmation modal state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Per-row action menu state
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

  const openEdit = useCallback((treatment: Treatment) => {
    setForm({
      id: treatment.id,
      name: treatment.name,
      price: treatment.price.toString(),
      duration: treatment.duration,
      visitType: treatment.visitType,
      status: treatment.status,
      category: treatment.category,
      description: treatment.description,
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
      setTreatments((prev) => prev.filter((t) => t.id !== deleteTargetId));
      setDeleteConfirmOpen(false);
      setDeleteTargetId(null);
      setModalOpen(false);
    }
  }, [deleteTargetId]);

  const handleSave = () => {
    if (!form.name.trim() || !form.price.trim()) {
      setError("Name and price are required.");
      return;
    }

    const price = parseFloat(form.price);
    if (isNaN(price) || price <= 0) {
      setError("Please enter a valid price.");
      return;
    }

    const updated: Treatment = {
      id: form.id || String(Date.now()),
      name: form.name,
      price,
      duration: form.duration,
      visitType: form.visitType,
      status: form.status,
      category: form.category,
      description: form.description,
      rating: treatments.find((t) => t.id === form.id)?.rating || 0,
      reviewCount: treatments.find((t) => t.id === form.id)?.reviewCount || 0,
    };

    setTreatments((prev) =>
      form.id
        ? prev.map((t) => (t.id === form.id ? updated : t))
        : [...prev, updated],
    );
    setModalOpen(false);
  };

  const filtered = treatments.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = treatments.filter((t) => t.status === "active").length;
  const inactiveCount = treatments.filter(
    (t) => t.status === "inactive",
  ).length;

  return (
    <>
      <div className="p-6 lg:p-8 space-y-6">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Treatments</h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Manage your dental treatment services
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
            Add Treatment
          </button>
        </div>

        {/* ── Status Tabs & Count ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {(["all", "active", "inactive"] as const).map((s) => {
              const isActive = statusFilter === s;
              const count =
                s === "all"
                  ? treatments.length
                  : s === "active"
                    ? activeCount
                    : inactiveCount;
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
                    ? "All Treatments"
                    : s === "active"
                      ? "Active Treatment"
                      : "Inactive Treatment"}
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
            <Stethoscope size={16} style={{ color: "var(--text-muted)" }} />
            <span
              className="text-sm font-semibold"
              style={{ color: "var(--text-muted)" }}
            >
              {filtered.length}
            </span>
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>
              treatment{filtered.length !== 1 ? "s" : ""}
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
            Add Treatment
          </button>
        </div>

        {/* ── Treatments Table ── */}
        {filtered.length === 0 ? (
          <div
            className="bg-card border rounded-xl p-12 flex flex-col items-center gap-3"
            style={{ borderColor: "var(--border-ui)" }}
          >
            <Stethoscope size={40} style={{ color: "var(--text-muted)" }} />
            <p
              className="text-sm font-medium"
              style={{ color: "var(--text-muted)" }}
            >
              No treatments found
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
                      Treatment Name
                    </th>
                    <th
                      className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Price
                    </th>
                    <th
                      className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Estimate Duration
                    </th>
                    <th
                      className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Type of Visit
                    </th>
                    <th
                      className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Rating
                    </th>
                    <th
                      className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Review
                    </th>
                    <th
                      className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--text-muted)" }}
                    ></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((treatment) => {
                    const visitCfg = VISIT_TYPE_CONFIG[treatment.visitType];
                    return (
                      <tr
                        key={treatment.id}
                        className="border-b transition-colors hover:bg-gray-50/50"
                        style={{ borderColor: "var(--border-ui)" }}
                      >
                        {/* Treatment Name */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                              style={{
                                backgroundColor: "var(--brand-primary)",
                                opacity: 0.1,
                              }}
                            >
                              <Stethoscope
                                size={18}
                                style={{ color: "var(--brand-primary)" }}
                              />
                            </div>
                            <div>
                              <p className="font-medium text-sm text-foreground">
                                {treatment.name}
                              </p>
                              <p
                                className="text-xs mt-0.5"
                                style={{ color: "var(--text-muted)" }}
                              >
                                {treatment.category}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <span
                              className="text-sm font-semibold"
                              style={{ color: "var(--brand-primary)" }}
                            >
                              ${treatment.price}
                            </span>
                          </div>
                        </td>

                        {/* Duration */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-foreground">
                            <Clock
                              size={14}
                              style={{ color: "var(--text-muted)" }}
                            />
                            <span>{treatment.duration}</span>
                          </div>
                        </td>

                        {/* Visit Type */}
                        <td className="px-6 py-4">
                          <span
                            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                            style={{
                              backgroundColor: visitCfg.bg,
                              color: visitCfg.color,
                            }}
                          >
                            {visitCfg.label}
                          </span>
                        </td>

                        {/* Rating */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <Star
                              size={14}
                              fill="#fbbf24"
                              style={{ color: "#fbbf24" }}
                            />
                            <span className="text-sm font-semibold text-foreground">
                              {treatment.rating.toFixed(1)}
                            </span>
                          </div>
                        </td>

                        {/* Review Count */}
                        <td className="px-6 py-4">
                          <span
                            className="text-sm"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {treatment.reviewCount} Review
                            {treatment.reviewCount !== 1 ? "s" : ""}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <IconButton
                            size="small"
                            onClick={(e) => openMenu(e, treatment.id)}
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
            const treatment = treatments.find((t) => t.id === menuTarget);
            if (treatment) openEdit(treatment);
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
            {form.id ? "Edit Treatment" : "Add New Treatment"}
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
              Treatment Details
            </Typography>

            {/* Name & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
              <TextField
                label="Treatment Name"
                fullWidth
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Teeth Whitening"
                required
              />
              <TextField
                label="Category"
                fullWidth
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="e.g. Cosmetic, Preventive"
              />
            </div>

            {/* Price & Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
              <TextField
                label="Price (USD)"
                type="number"
                fullWidth
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="e.g. 300"
                required
                slotProps={{
                  input: {
                    startAdornment: (
                      <DollarSign
                        size={16}
                        style={{
                          color: "var(--text-muted)",
                          marginRight: "4px",
                        }}
                      />
                    ),
                  },
                }}
              />
              <TextField
                label="Duration"
                fullWidth
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                placeholder="e.g. 1 hour, 1.5 hours"
              />
            </div>

            {/* Visit Type & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <FormControl fullWidth>
                <InputLabel>Visit Type</InputLabel>
                <Select
                  label="Visit Type"
                  value={form.visitType}
                  onChange={(e) =>
                    setForm({ ...form, visitType: e.target.value as VisitType })
                  }
                >
                  <MenuItem value="single">Single Visit</MenuItem>
                  <MenuItem value="multiple">Multiple Visits</MenuItem>
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
                      status: e.target.value as TreatmentStatus,
                    })
                  }
                >
                  <MenuItem value="active">✅ Active</MenuItem>
                  <MenuItem value="inactive">⚫ Inactive</MenuItem>
                </Select>
              </FormControl>
            </div>

            {/* Description */}
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Brief description of the treatment..."
            />
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
              {form.id ? "Save Changes" : "Add Treatment"}
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
            Delete Treatment
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
              {treatments.find((t) => t.id === deleteTargetId)?.name}
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
