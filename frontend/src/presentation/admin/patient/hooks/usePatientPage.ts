"use client";

import React, {useState, useCallback, useEffect, useMemo} from "react";
import {Patient, PatientGender} from "@/domain/patient/entities/patient";
import {usePatientStore} from "@/presentation/stores/patientStore";
import type {GetPatientsQuery} from "@/domain/patient/commands/GetPatientsQuery";
import {SORT_OPTIONS, PAGE_SIZE} from "../patientConfig";
import type {
  PatientFormState,
  FilterState,
  DateRange,
  SortOption,
} from "../types";
import {EMPTY_FORM} from "../types";
import {
  getFullName,
  getActiveFilterCount,
  formatDateDisplay,
} from "../utils/patientHelpers";

const CLINIC_ID = process.env.NEXT_PUBLIC_DEFAULT_CLINIC_ID ?? "clinic-1";

export function usePatientPage() {
  const {
    patients,
    patientsMeta,
    isLoading,
    isAdding,
    isUpdating,
    loadPatients,
    addPatient,
    editPatient,
    removePatient,
    insuranceProviders,
    loadInsuranceProviders,
    insuranceTemplates,
    loadInsuranceTemplates,
  } = usePatientStore();

  // ── Filter / sort / search state ──────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    status: "all",
    gender: "all",
  });
  const [dateRange, setDateRange] = useState<DateRange>({
    from: null,
    to: null,
  });
  const [datePreset, setDatePreset] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>("lastAdded");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  // ── Modal / drawer state ──────────────────────────────────────────────────
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [sortMenuAnchor, setSortMenuAnchor] = useState<null | HTMLElement>(
    null,
  );
  const [formDrawerOpen, setFormDrawerOpen] = useState(false);
  const [form, setForm] = useState<PatientFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuTarget, setMenuTarget] = useState<string | null>(null);

  useEffect(() => {
    loadInsuranceProviders(CLINIC_ID);
  }, [loadInsuranceProviders]);

  // Load insurance templates whenever providers list changes
  useEffect(() => {
    if (insuranceProviders.length > 0) {
      loadInsuranceTemplates(insuranceProviders.map((p) => p.id));
    }
  }, [insuranceProviders, loadInsuranceTemplates]);

  // ── Wrappers that reset pagination on filter/search/sort change ────────────
  const handleSetSearch = (v: string) => {
    setSearch(v);
    setCurrentPage(1);
  };
  const handleSetFilters = (
    v: FilterState | ((prev: FilterState) => FilterState),
  ) => {
    setFilters(v);
    setCurrentPage(1);
  };
  const handleSetDateRange = (v: DateRange) => {
    setDateRange(v);
    setCurrentPage(1);
  };
  const handleSetSort = (v: SortOption) => {
    setSort(v);
    setCurrentPage(1);
  };

  // ── Derived: server query + current page selection ───────────────────────
  const serverQuery = useMemo<GetPatientsQuery>(() => {
    const sortMap: Partial<
      Record<
        SortOption,
        {
          sortBy: "firstName" | "lastName" | "createdAt" | "updatedAt";
          sortOrder: "asc" | "desc";
        }
      >
    > = {
      lastAdded: {sortBy: "createdAt", sortOrder: "desc"},
      name: {sortBy: "firstName", sortOrder: "asc"},
    };

    const mappedSort = sortMap[sort];

    return {
      clinicId: CLINIC_ID,
      page: currentPage,
      limit: PAGE_SIZE,
      ...(filters.status !== "all" ? {status: filters.status} : {}),
      ...(filters.gender !== "all" ? {gender: filters.gender} : {}),
      ...(search.trim() ? {search: search.trim()} : {}),
      ...(dateRange.from ? {createdFrom: dateRange.from} : {}),
      ...(dateRange.to ? {createdTo: dateRange.to} : {}),
      ...(mappedSort ?? {}),
    };
  }, [
    currentPage,
    filters.status,
    filters.gender,
    search,
    dateRange.from,
    dateRange.to,
    sort,
  ]);

  useEffect(() => {
    loadPatients(serverQuery);
  }, [loadPatients, serverQuery]);

  const handleSetCurrentPage = (page: number) => {
    setCurrentPage(page);
    setSelectedIds(new Set());
  };

  const filtered = patients;
  const paginated = patients;
  const totalPages = Math.max(1, patientsMeta.totalPages || 1);

  const allSelected =
    patients.length > 0 && patients.every((p) => selectedIds.has(p.id));
  const someSelected = patients.some((p) => selectedIds.has(p.id));

  const activeFilterCount = getActiveFilterCount(filters, dateRange);

  // ── Selection ─────────────────────────────────────────────────────────────
  const toggleAll = () => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(patients.map((p) => p.id)));
  };

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return s;
    });
  };

  // ── Menu ──────────────────────────────────────────────────────────────────
  const openMenu = (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
    setMenuTarget(id);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuTarget(null);
  };

  // ── Form ──────────────────────────────────────────────────────────────────
  const openNew = useCallback(() => {
    setForm(EMPTY_FORM);
    setFormError("");
    setFormDrawerOpen(true);
  }, []);

  const openEdit = useCallback((p: Patient) => {
    setForm({
      id: p.id,
      firstName: p.firstName,
      lastName: p.lastName,
      email: p.email || "",
      phone: p.phone || "",
      dateOfBirth: p.dateOfBirth
        ? new Date(p.dateOfBirth).toISOString().split("T")[0]
        : "",
      gender: p.gender || "",
      address: p.address || "",
      status: p.status,
      notes: p.notes || "",
      allergies: p.allergies || "",
      chronicConditions: p.chronicConditions || "",
      currentMedications: p.currentMedications || "",
      medicalNotes: p.medicalNotes || "",
      cnie: p.cnie || "",
    });
    setFormError("");
    setFormDrawerOpen(true);
    closeMenu();
  }, []);

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setFormError("First name and last name are required.");
      return;
    }
    if (!form.email.trim()) {
      setFormError("Email address is required.");
      return;
    }
    if (
      patients.some((p) => p.email === form.email.trim() && p.id !== form.id)
    ) {
      setFormError("A patient with this email already exists.");
      return;
    }

    setFormError("");

    const input = {
      clinicId: CLINIC_ID,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      dateOfBirth: form.dateOfBirth ? new Date(form.dateOfBirth) : undefined,
      gender: (form.gender as PatientGender) || undefined,
      address: form.address.trim() || undefined,
      notes: form.notes.trim() || undefined,
      allergies: form.allergies.trim() || undefined,
      chronicConditions: form.chronicConditions.trim() || undefined,
      currentMedications: form.currentMedications.trim() || undefined,
      medicalNotes: form.medicalNotes.trim() || undefined,
      cnie: form.cnie.trim() || undefined,
      status: form.status,
    };

    try {
      if (form.id) {
        await editPatient(form.id, input);
      } else {
        await addPatient(input);
      }
      await loadPatients(serverQuery);
      setFormDrawerOpen(false);
    } catch {
      // Errors handled in store
    }
  }, [form, patients, editPatient, addPatient, loadPatients, serverQuery]);

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = useCallback((id: string) => {
    setDeleteTargetId(id);
    setDeleteConfirmOpen(true);
    closeMenu();
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteTargetId) return;
    try {
      await removePatient(deleteTargetId);
      setSelectedIds((prev) => {
        const s = new Set(prev);
        s.delete(deleteTargetId);
        return s;
      });
      setDeleteConfirmOpen(false);
      setDeleteTargetId(null);
      setFormDrawerOpen(false);
      await loadPatients(serverQuery);
    } catch {
      // Errors handled in store
    }
  }, [deleteTargetId, removePatient, loadPatients, serverQuery]);

  const bulkDelete = async () => {
    const ids = [...selectedIds];
    for (const id of ids) {
      await removePatient(id).catch(() => null);
    }
    setSelectedIds(new Set());
    await loadPatients(serverQuery);
  };

  // ── Filters ───────────────────────────────────────────────────────────────
  const removeDateFilter = () => {
    setDateRange({from: null, to: null});
    setDatePreset(null);
  };
  const removeStatusFilter = () => setFilters((f) => ({...f, status: "all"}));
  const removeGenderFilter = () => setFilters((f) => ({...f, gender: "all"}));
  const resetAllFilters = () => {
    setSearch("");
    setFilters({status: "all", gender: "all"});
    setDateRange({from: null, to: null});
    setDatePreset(null);
  };

  // ── Export ────────────────────────────────────────────────────────────────
  const handleExport = () => {
    const rows = patients.map((p) =>
      [
        getFullName(p.firstName, p.lastName),
        p.email || "",
        p.phone || "",
        p.status,
        p.gender || "",
        p.dateOfBirth
          ? new Date(p.dateOfBirth).toISOString().split("T")[0]
          : "",
        new Date(p.createdAt).toISOString().split("T")[0],
      ].join(","),
    );
    const csv = [
      "Full Name,Email,Phone,Status,Gender,Date of Birth,Registered",
      ...rows,
    ].join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = "patients.csv";
    a.click();
  };

  // ── Labels ────────────────────────────────────────────────────────────────
  const dateLabel =
    datePreset ||
    (dateRange.from
      ? `${formatDateDisplay(dateRange.from)} - ${formatDateDisplay(dateRange.to)}`
      : "Date");
  const sortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Sort";

  return {
    // Data
    patients,
    filtered,
    paginated,
    insuranceProviders,
    insuranceTemplates,
    // Loading states
    isLoading,
    isAdding,
    isUpdating,
    // Pagination
    currentPage,
    setCurrentPage: handleSetCurrentPage,
    totalPages,
    totalCount: patientsMeta.total,
    // Search & filters
    search,
    setSearch: handleSetSearch,
    filters,
    setFilters: handleSetFilters,
    dateRange,
    setDateRange: handleSetDateRange,
    datePreset,
    setDatePreset,
    sort,
    setSort: handleSetSort,
    activeFilterCount,
    dateLabel,
    sortLabel,
    removeDateFilter,
    removeStatusFilter,
    removeGenderFilter,
    resetAllFilters,
    // View mode
    viewMode,
    setViewMode,
    // Selection
    selectedIds,
    allSelected,
    someSelected,
    toggleAll,
    toggleOne,
    // Menu
    menuAnchor,
    menuTarget,
    openMenu,
    closeMenu,
    // Sort menu
    sortMenuAnchor,
    setSortMenuAnchor,
    // Form drawer
    formDrawerOpen,
    setFormDrawerOpen,
    form,
    setForm,
    formError,
    openNew,
    openEdit,
    handleSave,
    // Delete
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    deleteTargetId,
    handleDelete,
    confirmDelete,
    bulkDelete,
    // Drawers/modals
    filterDrawerOpen,
    setFilterDrawerOpen,
    dateModalOpen,
    setDateModalOpen,
    // Export
    handleExport,
  };
}
