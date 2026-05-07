"use client";

import React from "react";
import {
  Search,
  CalendarDays,
  RefreshCw,
  SlidersHorizontal,
  Download,
  Plus,
  LayoutList,
  LayoutGrid,
  X,
  ChevronDown,
} from "lucide-react";
import { STATUS_CONFIG } from "../patientConfig";
import type { FilterState, DateRange } from "../types";
import { PatientStatus } from "@/domain/patient/entities/patient";

interface PatientToolbarProps {
  viewMode: "list" | "grid";
  setViewMode: (v: "list" | "grid") => void;
  search: string;
  setSearch: (s: string) => void;
  dateRange: DateRange;
  dateLabel: string;
  sortLabel: string;
  activeFilterCount: number;
  filters: FilterState;
  datePreset: string | null;
  someSelected: boolean;
  selectedCount: number;
  filteredCount: number;
  onDateOpen: () => void;
  onSortOpen: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onFilterOpen: () => void;
  onExport: () => void;
  onAddNew: () => void;
  onBulkDelete: () => void;
  onRemoveDateFilter: () => void;
  onRemoveStatusFilter: () => void;
  onRemoveGenderFilter: () => void;
  onResetAll: () => void;
}

export function PatientToolbar({
  viewMode,
  setViewMode,
  search,
  setSearch,
  dateRange,
  dateLabel,
  sortLabel,
  activeFilterCount,
  filters,
  datePreset,
  someSelected,
  selectedCount,
  filteredCount,
  onDateOpen,
  onSortOpen,
  onFilterOpen,
  onExport,
  onAddNew,
  onBulkDelete,
  onRemoveDateFilter,
  onRemoveStatusFilter,
  onRemoveGenderFilter,
  onResetAll,
}: PatientToolbarProps) {
  const hasAnyFilter =
    search ||
    filters.status !== "all" ||
    filters.gender !== "all" ||
    dateRange.from ||
    dateRange.to;

  return (
    <div
      style={{
        background: "var(--surface-card)",
        borderRadius: 12,
        border: "1px solid var(--border-ui)",
        boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
        padding: "10px 14px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Main Row */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* View Toggle */}
        <div
          style={{
            display: "flex",
            borderRadius: 7,
            border: "1px solid var(--border-ui)",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => setViewMode("list")}
            style={{
              padding: "6px 9px",
              border: "none",
              cursor: "pointer",
              background:
                viewMode === "list" ? "var(--brand-primary)" : "transparent",
              color: viewMode === "list" ? "#fff" : "var(--text-placeholder)",
            }}
          >
            <LayoutList size={15} />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            style={{
              padding: "6px 9px",
              border: "none",
              cursor: "pointer",
              background:
                viewMode === "grid" ? "var(--brand-primary)" : "transparent",
              color: viewMode === "grid" ? "#fff" : "var(--text-placeholder)",
            }}
          >
            <LayoutGrid size={15} />
          </button>
        </div>
        {/* Search */}
        <div
          style={{
            position: "relative",
            width: 260,
            minWidth: 160,
            flexShrink: 1,
            flexGrow: 0,
          }}
        >
          <Search
            size={14}
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-placeholder)",
              pointerEvents: "none",
            }}
          />
          <input
            type="text"
            placeholder="Search by name, email, phone, CNIE..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "7px 10px 7px 32px",
              borderRadius: 7,
              border: "1px solid var(--border-ui)",
              fontSize: 13,
              color: "var(--foreground)",
              background: "var(--surface-page)",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
        <div style={{ flex: 1 }} />
        {/* Date */}
        <button
          onClick={onDateOpen}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "7px 12px",
            borderRadius: 7,
            border:
              dateRange.from || dateRange.to
                ? "1px solid var(--brand-primary)"
                : "1px solid var(--border-ui)",
            background:
              dateRange.from || dateRange.to
                ? "#eff6ff"
                : "var(--surface-card)",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            color:
              dateRange.from || dateRange.to
                ? "var(--brand-primary)"
                : "var(--foreground)",
            flexShrink: 0,
          }}
        >
          <CalendarDays size={14} /> {dateLabel} <ChevronDown size={12} />
        </button>
        {/* Sort */}
        <button
          onClick={onSortOpen}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "7px 12px",
            borderRadius: 7,
            border: "1px solid var(--border-ui)",
            background: "var(--surface-card)",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            color: "var(--foreground)",
            flexShrink: 0,
          }}
        >
          <RefreshCw size={14} /> {sortLabel} <ChevronDown size={12} />
        </button>
        <div
          style={{
            width: 1,
            height: 22,
            background: "var(--border-ui)",
            flexShrink: 0,
          }}
        />
        {/* Filter */}
        <button
          onClick={onFilterOpen}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "7px 12px",
            borderRadius: 7,
            border: "1px solid var(--border-ui)",
            background: "var(--surface-card)",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            color: "var(--foreground)",
            flexShrink: 0,
            whiteSpace: "nowrap",
          }}
        >
          <SlidersHorizontal size={14} /> Filter
          {activeFilterCount > 0 && (
            <span
              style={{
                minWidth: 17,
                height: 17,
                borderRadius: 9,
                background: "var(--brand-primary)",
                color: "#fff",
                fontSize: 10,
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 3px",
              }}
            >
              {activeFilterCount}
            </span>
          )}
        </button>
        <div
          style={{
            width: 1,
            height: 22,
            background: "var(--border-ui)",
            flexShrink: 0,
          }}
        />
        {/* Export */}
        <button
          onClick={onExport}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "7px 12px",
            borderRadius: 7,
            border: "1px solid var(--border-ui)",
            background: "var(--surface-card)",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            color: "var(--foreground)",
            flexShrink: 0,
          }}
        >
          <Download size={14} /> Export
        </button>
        {/* Add Patient */}
        <button
          onClick={onAddNew}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            borderRadius: 8,
            border: "none",
            background: "var(--brand-primary)",
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            flexShrink: 0,
            whiteSpace: "nowrap",
            boxShadow: "0 2px 6px rgba(30,86,208,0.25)",
            transition: "background 0.15s,box-shadow 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--brand-primary-dark)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(30,86,208,0.35)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--brand-primary)";
            e.currentTarget.style.boxShadow = "0 2px 6px rgba(30,86,208,0.25)";
          }}
        >
          <Plus size={14} /> Add Patient
        </button>
      </div>
      {/* Info Row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          flexWrap: "wrap",
          marginTop: 10,
          paddingTop: 8,
          borderTop: "1px solid var(--border-ui)",
        }}
      >
        <span className="text-text-placeholder" style={{ fontSize: 12 }}>
          {someSelected
            ? `${selectedCount} selected`
            : `${filteredCount} patient${filteredCount !== 1 ? "s" : ""}`}
        </span>
        {someSelected && (
          <button
            onClick={onBulkDelete}
            style={{
              padding: "3px 10px",
              borderRadius: 6,
              border: "1px solid #fca5a5",
              background: "#fef2f2",
              color: "#dc2626",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Delete Selected
          </button>
        )}
        {filters.status !== "all" && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "3px 9px",
              borderRadius: 20,
              background: "#eff6ff",
              color: "var(--brand-primary)",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {STATUS_CONFIG[filters.status as PatientStatus].label}
            <button
              onClick={onRemoveStatusFilter}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                lineHeight: 1,
                color: "var(--brand-primary)",
                display: "flex",
              }}
            >
              <X size={10} />
            </button>
          </span>
        )}
        {filters.gender !== "all" && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "3px 9px",
              borderRadius: 20,
              background: "#eff6ff",
              color: "var(--brand-primary)",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {filters.gender}
            <button
              onClick={onRemoveGenderFilter}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                lineHeight: 1,
                color: "var(--brand-primary)",
                display: "flex",
              }}
            >
              <X size={10} />
            </button>
          </span>
        )}
        {(dateRange.from || dateRange.to) && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "3px 9px",
              borderRadius: 20,
              background: "#eff6ff",
              color: "var(--brand-primary)",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {datePreset || "Custom range"}
            <button
              onClick={onRemoveDateFilter}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                lineHeight: 1,
                color: "var(--brand-primary)",
                display: "flex",
              }}
            >
              <X size={10} />
            </button>
          </span>
        )}
        <div style={{ flex: 1 }} />
        {hasAnyFilter && (
          <button
            onClick={onResetAll}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "3px 9px",
              borderRadius: 6,
              border: "1px solid var(--border-ui)",
              background: "var(--surface-card)",
              cursor: "pointer",
              fontSize: 12,
              color: "var(--text-muted)",
            }}
          >
            <RefreshCw size={12} /> Reset
          </button>
        )}
      </div>
    </div>
  );
}
