"use client";

import React from "react";
import { Users } from "lucide-react";
import { usePatientPage } from "./hooks/usePatientPage";
import { PatientSummaryCards } from "./components/PatientSummaryCards";
import { PatientToolbar } from "./components/PatientToolbar";
import { PatientTable } from "./components/PatientTable";
import { PatientGrid } from "./components/PatientGrid";
import { PatientActionMenu } from "./components/PatientActionMenu";
import { PatientFormDrawer } from "./components/PatientFormDrawer";
import { DeleteConfirmModal } from "./components/DeleteConfirmModal";
import { DateRangeModal } from "./components/DateRangeModal";
import { FilterDrawer } from "./components/FilterDrawer";
import type { SortOption } from "./types";

export default function PatientPage() {
  const hook = usePatientPage();

  return (
    <>
      <div className="p-6 lg:p-8 space-y-5">
        {/* Stats */}
        <PatientSummaryCards patients={hook.patients} />

        {/* Toolbar */}
        <PatientToolbar
          viewMode={hook.viewMode}
          setViewMode={hook.setViewMode}
          search={hook.search}
          setSearch={hook.setSearch}
          dateRange={hook.dateRange}
          dateLabel={hook.dateLabel}
          sortLabel={hook.sortLabel}
          activeFilterCount={hook.activeFilterCount}
          filters={hook.filters}
          datePreset={hook.datePreset}
          someSelected={hook.someSelected}
          selectedCount={hook.selectedIds.size}
          filteredCount={hook.filtered.length}
          onDateOpen={() => hook.setDateModalOpen(true)}
          onSortOpen={(e) => hook.setSortMenuAnchor(e.currentTarget)}
          onFilterOpen={() => hook.setFilterDrawerOpen(true)}
          onExport={hook.handleExport}
          onAddNew={hook.openNew}
          onBulkDelete={hook.bulkDelete}
          onRemoveDateFilter={hook.removeDateFilter}
          onRemoveStatusFilter={hook.removeStatusFilter}
          onRemoveGenderFilter={hook.removeGenderFilter}
          onResetAll={hook.resetAllFilters}
        />

        {/* Content */}
        {hook.isLoading ? (
          // ── Loading skeleton ──
          <div
            style={{
              background: "var(--surface-card)",
              borderRadius: 12,
              border: "1px solid var(--border-ui)",
              overflow: "hidden",
              boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
            }}
          >
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 20px",
                  borderBottom: i < 7 ? "1px solid var(--border-ui)" : "none",
                  animation: "pulse 1.5s ease-in-out infinite",
                  animationDelay: `${i * 0.07}s`,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "var(--border-ui)",
                    flexShrink: 0,
                  }}
                />
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  <div
                    style={{
                      height: 13,
                      width: `${140 + (i % 3) * 30}px`,
                      borderRadius: 6,
                      background: "var(--border-ui)",
                    }}
                  />
                  <div
                    style={{
                      height: 11,
                      width: `${90 + (i % 4) * 20}px`,
                      borderRadius: 6,
                      background: "var(--border-ui)",
                      opacity: 0.6,
                    }}
                  />
                </div>
                <div
                  style={{
                    height: 13,
                    width: 80,
                    borderRadius: 6,
                    background: "var(--border-ui)",
                    opacity: 0.5,
                  }}
                />
                <div
                  style={{
                    height: 24,
                    width: 64,
                    borderRadius: 20,
                    background: "var(--border-ui)",
                    opacity: 0.5,
                  }}
                />
              </div>
            ))}
            <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.45} }`}</style>
          </div>
        ) : hook.filtered.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
              padding: "72px 0",
              background: "var(--surface-card)",
              borderRadius: 12,
              border: "1px solid var(--border-ui)",
              boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "#eff6ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Users size={32} color="var(--brand-primary)" />
            </div>
            <div style={{ textAlign: "center" }}>
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "var(--foreground)",
                  margin: "0 0 4px",
                }}
              >
                No patients found
              </p>
              <p
                style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}
              >
                Try adjusting your search or filter criteria
              </p>
            </div>
            <button
              onClick={hook.resetAllFilters}
              style={{
                padding: "8px 22px",
                borderRadius: 8,
                border: "1px solid var(--border-ui)",
                background: "var(--surface-card)",
                cursor: "pointer",
                fontSize: 13,
                color: "var(--foreground)",
                fontWeight: 600,
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : hook.viewMode === "list" ? (
          <PatientTable
            patients={hook.paginated}
            selectedIds={hook.selectedIds}
            allSelected={hook.allSelected}
            someSelected={hook.someSelected}
            currentPage={hook.currentPage}
            totalPages={hook.totalPages}
            onToggleAll={hook.toggleAll}
            onToggleOne={hook.toggleOne}
            onOpenMenu={hook.openMenu}
            onSetPage={hook.setCurrentPage}
          />
        ) : (
          <PatientGrid
            patients={hook.paginated}
            currentPage={hook.currentPage}
            totalPages={hook.totalPages}
            onOpenMenu={hook.openMenu}
            onEdit={hook.openEdit}
            onSetPage={hook.setCurrentPage}
          />
        )}
      </div>

      {/* Menus */}
      <PatientActionMenu
        sortMenuAnchor={hook.sortMenuAnchor}
        sort={hook.sort}
        onSortChange={(v: SortOption) => hook.setSort(v)}
        onSortClose={() => hook.setSortMenuAnchor(null)}
        menuAnchor={hook.menuAnchor}
        menuTarget={hook.menuTarget}
        patients={hook.patients}
        onEdit={hook.openEdit}
        onDelete={hook.handleDelete}
        onMenuClose={hook.closeMenu}
      />

      {/* Date Range Modal */}
      <DateRangeModal
        open={hook.dateModalOpen}
        dateRange={hook.dateRange}
        onApply={(r, preset) => {
          hook.setDateRange(r);
          hook.setDatePreset(preset || null);
        }}
        onClose={() => hook.setDateModalOpen(false)}
      />

      {/* Filter Drawer */}
      <FilterDrawer
        open={hook.filterDrawerOpen}
        filters={hook.filters}
        onApply={hook.setFilters}
        onClose={() => hook.setFilterDrawerOpen(false)}
      />

      {/* Patient Form Drawer */}
      <PatientFormDrawer
        open={hook.formDrawerOpen}
        form={hook.form}
        formError={hook.formError}
        isEdit={!!hook.form.id}
        insuranceProviders={hook.insuranceProviders}
        insuranceTemplates={hook.insuranceTemplates}
        onClose={() => hook.setFormDrawerOpen(false)}
        onSave={hook.handleSave}
        onDelete={() => hook.form.id && hook.handleDelete(hook.form.id)}
        onChange={hook.setForm}
      />

      {/* Delete Confirm */}
      <DeleteConfirmModal
        open={hook.deleteConfirmOpen}
        deleteTargetId={hook.deleteTargetId}
        patients={hook.patients}
        onClose={() => hook.setDeleteConfirmOpen(false)}
        onConfirm={hook.confirmDelete}
      />
    </>
  );
}
