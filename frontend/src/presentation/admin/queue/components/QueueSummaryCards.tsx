import {CheckCircle2, Clock, ClipboardList, UserCheck} from "lucide-react";

interface QueueSummaryCardsProps {
  active: number;
  waiting: number;
  inChair: number;
  completed: number;
}

export function QueueSummaryCards({
  active,
  waiting,
  inChair,
  completed,
}: QueueSummaryCardsProps) {
  const cards = [
    {
      label: "Active Queue",
      value: active,
      icon: <ClipboardList size={18} />,
      color: "#1e56d0",
    },
    {
      label: "Waiting",
      value: waiting,
      icon: <Clock size={18} />,
      color: "#f59e0b",
    },
    {
      label: "In Chair",
      value: inChair,
      icon: <UserCheck size={18} />,
      color: "#7c3aed",
    },
    {
      label: "Completed",
      value: completed,
      icon: <CheckCircle2 size={18} />,
      color: "#279C41",
    },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-lg border px-4 py-3 shadow-sm"
          style={{
            borderColor: "var(--border-ui)",
            backgroundColor: "var(--surface-card)",
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-wide"
                style={{color: "var(--text-muted)"}}
              >
                {card.label}
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {card.value}
              </p>
            </div>
            <div
              className="h-10 w-10 rounded-lg flex items-center justify-center"
              style={{
                color: card.color,
                backgroundColor: `${card.color}18`,
              }}
            >
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
