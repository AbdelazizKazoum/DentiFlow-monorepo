import {Avatar, Chip} from "@mui/material";
import type {AppointmentProvider} from "../appointmentConfig";
import {
  APPOINTMENT_LEGEND_STATUSES,
  APPOINTMENT_STATUS_CONFIG,
} from "../appointmentConfig";

interface ProviderFilterBarProps {
  providers: AppointmentProvider[];
  activeProviderIds: Set<string>;
  onToggleProvider: (id: string) => void;
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("");
}

export function ProviderFilterBar({
  providers,
  activeProviderIds,
  onToggleProvider,
}: ProviderFilterBarProps) {
  return (
    <div
      className="px-6 py-3.5 border-b flex flex-wrap items-center gap-3"
      style={{borderColor: "var(--border-ui)"}}
    >
      <span
        className="text-xs font-semibold uppercase tracking-wide mr-1"
        style={{color: "var(--text-muted)"}}
      >
        Providers
      </span>
      {providers.map((provider) => {
        const active = activeProviderIds.has(provider.id);
        return (
          <Chip
            key={provider.id}
            onClick={() => onToggleProvider(provider.id)}
            avatar={
              <Avatar
                src={provider.avatar}
                alt={provider.name}
                sx={{width: 22, height: 22, fontSize: "0.6rem"}}
              >
                {initials(provider.name)}
              </Avatar>
            }
            label={provider.name}
            size="small"
            sx={{
              fontWeight: 600,
              fontSize: "0.75rem",
              height: 30,
              border: `1.5px solid ${
                active ? provider.color : "#e2e8f0"
              }`,
              backgroundColor: active ? `${provider.color}18` : "transparent",
              color: active ? provider.color : "var(--text-muted)",
              cursor: "pointer",
              "& .MuiChip-avatar": {width: 22, height: 22},
              "&:hover": {
                backgroundColor: `${provider.color}25`,
                borderColor: provider.color,
              },
            }}
          />
        );
      })}

      <div className="ml-auto flex flex-wrap items-center gap-4">
        {APPOINTMENT_LEGEND_STATUSES.map((status) => {
          const cfg = APPOINTMENT_STATUS_CONFIG[status];
          return (
            <div key={status} className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{backgroundColor: cfg.border}}
              />
              <span
                className="text-xs font-medium hidden sm:inline"
                style={{color: "var(--text-muted)"}}
              >
                {cfg.label}
              </span>
            </div>
          );
        })}
        <span
          className="text-xs hidden lg:inline"
          style={{color: "var(--text-muted)"}}
        >
          Click to book · Drag to reschedule
        </span>
      </div>
    </div>
  );
}
