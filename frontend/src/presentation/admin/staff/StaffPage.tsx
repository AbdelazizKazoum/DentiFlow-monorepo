"use client";

import { useStaffPage } from "./hooks/useStaffPage";
import { StaffHeader } from "./components/StaffHeader";
import { StaffSummaryCards } from "./components/StaffSummaryCards";
import { StaffFilters } from "./components/StaffFilters";
import { StaffGrid } from "./components/StaffGrid";
import { StaffActionMenu } from "./components/StaffActionMenu";
import { StaffFormModal } from "./components/StaffFormModal";
import { DeleteConfirmModal } from "./components/DeleteConfirmModal";
import { StaffGridSkeleton } from "./components/StaffGridSkeleton";

export default function StaffPage() {
  const {
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
  } = useStaffPage();

  return (
    <>
      <div className="p-6 lg:p-8 space-y-6">
        <StaffHeader onAddNew={openNew} />

        <StaffSummaryCards
          total={counts.total}
          active={counts.active}
          onLeave={counts.onLeave}
          inactive={counts.inactive}
        />

        <StaffFilters
          search={search}
          onSearchChange={setSearch}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
        />

        {isLoading ? (
          <StaffGridSkeleton />
        ) : (
          <StaffGrid members={filtered} onOpenMenu={openMenu} />
        )}
      </div>

      <StaffActionMenu
        anchor={menuAnchor}
        onClose={closeMenu}
        onEdit={() => {
          const member = staff.find((s) => s.id === menuTarget);
          if (member) openEdit(member);
        }}
        onDelete={() => menuTarget && handleDelete(menuTarget)}
      />

      <StaffFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        form={form}
        onFormChange={setForm}
        onSave={handleSave}
        onDelete={handleDelete}
        error={formError}
        isAdding={isAdding}
        isUpdating={isUpdating}
      />

      <DeleteConfirmModal
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        staffName={
          staff.find((s) => s.id === deleteTargetId)?.fullName ?? "this member"
        }
      />
    </>
  );
}
