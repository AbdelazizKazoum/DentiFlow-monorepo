import {Plus} from "lucide-react";

interface StaffHeaderProps {
  onAddNew: () => void;
}

export function StaffHeader({onAddNew}: StaffHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Staff Management</h1>
        <p className="text-sm" style={{color: "var(--text-muted)"}}>
          Manage your clinic&apos;s team members
        </p>
      </div>
      <button
        onClick={onAddNew}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white
          shadow-sm transition-all duration-150"
        style={{backgroundColor: "var(--brand-primary)"}}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "var(--brand-primary-dark)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "var(--brand-primary)")
        }
      >
        <Plus size={16} />
        Add Staff Member
      </button>
    </div>
  );
}
