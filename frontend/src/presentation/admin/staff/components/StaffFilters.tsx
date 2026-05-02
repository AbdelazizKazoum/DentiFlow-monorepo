import {Search} from "lucide-react";
import {StaffRole} from "@/domain/staff/entities/staff";
import {ROLE_CONFIG} from "../staffConfig";

interface StaffFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  roleFilter: StaffRole | "all";
  onRoleFilterChange: (role: StaffRole | "all") => void;
}

export function StaffFilters({
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
}: StaffFiltersProps) {
  return (
    <div
      className="bg-card border rounded-xl p-4 flex flex-col sm:flex-row gap-3"
      style={{borderColor: "var(--border-ui)"}}
    >
      {/* Search */}
      <div className="relative flex-1">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{color: "var(--text-muted)"}}
        />
        <input
          type="text"
          placeholder="Search by name, email or specialization…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
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
        {(["all", ...Object.values(StaffRole)] as const).map((r) => {
          const isActive = roleFilter === r;
          const cfg = r !== "all" ? ROLE_CONFIG[r as StaffRole] : null;
          return (
            <button
              key={r}
              onClick={() => onRoleFilterChange(r as StaffRole | "all")}
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
              {r === "all" ? "All Roles" : ROLE_CONFIG[r as StaffRole]?.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
