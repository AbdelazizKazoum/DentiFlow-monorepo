import React, { useState, useCallback, useEffect } from "react";
import { Staff, StaffRole, StaffStatus } from "@/domain/staff/entities/staff";
import { useStaffStore } from "@/presentation/stores/staffStore";

export interface StaffFormState {
  id: string;
  firstName: string;
  lastName: string;
  role: StaffRole;
  status: StaffStatus;
  phone: string;
  email: string;
  specialization: string;
  createdAt: string;
  password: string;
  confirmPassword: string;
}

const EMPTY_FORM: StaffFormState = {
  id: "",
  firstName: "",
  lastName: "",
  role: StaffRole.DOCTOR,
  status: StaffStatus.ACTIVE,
  phone: "",
  email: "",
  specialization: "",
  createdAt: new Date().toISOString().split("T")[0],
  password: "",
  confirmPassword: "",
};

export function useStaffPage() {
  const {
    staff,
    isLoading,
    isAdding,
    isUpdating,
    loadStaff,
    addStaff,
    editStaff,
    removeStaff,
  } = useStaffStore();

  // ── UI state ──────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<StaffRole | "all">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<StaffFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuTarget, setMenuTarget] = useState<string | null>(null);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

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

  // ── Modal ─────────────────────────────────────────────────────────────────
  const openNew = useCallback(() => {
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((member: Staff) => {
    setForm({
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      role: member.role,
      status: member.status,
      phone: member.phone ?? "",
      email: member.email ?? "",
      specialization: member.specialization ?? "",
      createdAt: member.createdAt.toISOString().split("T")[0],
      password: "",
      confirmPassword: "",
    });
    setFormError("");
    setModalOpen(true);
    closeMenu();
  }, []);

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = useCallback((id: string) => {
    setDeleteTargetId(id);
    setDeleteConfirmOpen(true);
    closeMenu();
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteTargetId) {
      await removeStaff(deleteTargetId);
      setDeleteConfirmOpen(false);
      setDeleteTargetId(null);
      setModalOpen(false);
    }
  }, [deleteTargetId, removeStaff]);

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      setFormError("First name, last name and email are required.");
      return;
    }
    const emailExists = staff.some(
      (s) => s.email === form.email && s.id !== form.id,
    );
    if (emailExists) {
      setFormError("A staff member with this email already exists.");
      return;
    }

    // Password validation — required on create, optional on edit
    const isCreate = !form.id;
    if (isCreate && !form.password.trim()) {
      setFormError("Password is required.");
      return;
    }
    if (form.password && form.password.length < 8) {
      setFormError("Password must be at least 8 characters.");
      return;
    }
    if (form.password && form.password !== form.confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    if (form.id) {
      await editStaff(form.id, {
        firstName: form.firstName,
        lastName: form.lastName,
        role: form.role,
        status: form.status,
        phone: form.phone || undefined,
        email: form.email || undefined,
        specialization: form.specialization || undefined,
        avatar: `https://i.pravatar.cc/150?u=${form.email}`,
        password: form.password || undefined,
      });
    } else {
      await addStaff({
        clinicId:
          process.env.NEXT_PUBLIC_DEFAULT_CLINIC_ID ??
          "00000000-0000-4000-8000-000000000001",
        userId: "",
        firstName: form.firstName,
        lastName: form.lastName,
        role: form.role,
        status: form.status,
        password: form.password,
        phone: form.phone || undefined,
        email: form.email || undefined,
        specialization: form.specialization || undefined,
        avatar: `https://i.pravatar.cc/150?u=${form.email}`,
      });
    }

    setModalOpen(false);
  };

  // ── Derived state ─────────────────────────────────────────────────────────
  const filtered = staff.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      (s.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (s.specialization ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || s.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const counts = {
    total: staff.length,
    active: staff.filter((s) => s.isActiveStaff()).length,
    onLeave: staff.filter((s) => s.status === StaffStatus.ON_LEAVE).length,
    inactive: staff.filter((s) => s.status === StaffStatus.INACTIVE).length,
  };

  return {
    staff,
    filtered,
    counts,
    isLoading,
    isAdding,
    isUpdating,
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    modalOpen,
    setModalOpen,
    form,
    setForm,
    formError,
    handleSave,
    openNew,
    openEdit,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    deleteTargetId,
    handleDelete,
    confirmDelete,
    menuAnchor,
    menuTarget,
    openMenu,
    closeMenu,
  };
}
