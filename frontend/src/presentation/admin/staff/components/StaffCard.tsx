import React from "react";
import {Mail, Phone, MoreVertical} from "lucide-react";
import {IconButton} from "@mui/material";
import {Staff} from "@/domain/staff/entities/staff";
import {ROLE_CONFIG, STATUS_CONFIG} from "../staffConfig";

interface StaffCardProps {
  member: Staff;
  onOpenMenu: (e: React.MouseEvent<HTMLButtonElement>, id: string) => void;
}

export function StaffCard({member, onOpenMenu}: StaffCardProps) {
  const roleCfg = ROLE_CONFIG[member.role];
  const statusCfg = STATUS_CONFIG[member.status];

  return (
    <div
      className="bg-card border rounded-xl p-5 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200"
      style={{borderColor: "var(--border-ui)"}}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={member.avatar}
            alt={member.fullName}
            className="w-11 h-11 rounded-full object-cover ring-2 ring-white/20 shrink-0"
          />
          <div className="min-w-0">
            <p className="font-semibold text-sm text-foreground truncate leading-tight">
              {member.fullName}
            </p>
            <p
              className="text-xs mt-0.5 truncate"
              style={{color: "var(--text-muted)"}}
            >
              {member.specialization}
            </p>
          </div>
        </div>
        <IconButton
          size="small"
          onClick={(e) => onOpenMenu(e, member.id)}
          sx={{color: "var(--text-muted)", flexShrink: 0}}
        >
          <MoreVertical size={16} />
        </IconButton>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
          style={{backgroundColor: roleCfg.bg, color: roleCfg.color}}
        >
          {roleCfg.label}
        </span>
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
          style={{backgroundColor: statusCfg.bg, color: statusCfg.color}}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{backgroundColor: statusCfg.dot}}
          />
          {statusCfg.label}
        </span>
      </div>

      {/* Contact */}
      <div
        className="space-y-1.5 border-t pt-3"
        style={{borderColor: "var(--border-ui)"}}
      >
        {member.email && (
          <div
            className="flex items-center gap-2 text-xs"
            style={{color: "var(--text-muted)"}}
          >
            <Mail size={13} />
            <span className="truncate">{member.email}</span>
          </div>
        )}
        {member.phone && (
          <div
            className="flex items-center gap-2 text-xs"
            style={{color: "var(--text-muted)"}}
          >
            <Phone size={13} />
            <span>{member.phone}</span>
          </div>
        )}
      </div>

      {/* Join date */}
      <p className="text-xs" style={{color: "var(--text-muted)"}}>
        Joined{" "}
        {member.createdAt.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </p>
    </div>
  );
}
