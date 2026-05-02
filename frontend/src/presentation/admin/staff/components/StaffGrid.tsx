import React from "react";
import {UserCog} from "lucide-react";
import {Staff} from "@/domain/staff/entities/staff";
import {StaffCard} from "./StaffCard";

interface StaffGridProps {
  members: Staff[];
  onOpenMenu: (e: React.MouseEvent<HTMLButtonElement>, id: string) => void;
}

export function StaffGrid({members, onOpenMenu}: StaffGridProps) {
  if (members.length === 0) {
    return (
      <div
        className="bg-card border rounded-xl p-12 flex flex-col items-center gap-3"
        style={{borderColor: "var(--border-ui)"}}
      >
        <UserCog size={40} style={{color: "var(--text-muted)"}} />
        <p className="text-sm font-medium" style={{color: "var(--text-muted)"}}>
          No staff members found
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {members.map((member) => (
        <StaffCard key={member.id} member={member} onOpenMenu={onOpenMenu} />
      ))}
    </div>
  );
}
