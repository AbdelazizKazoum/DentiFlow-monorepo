import {motion} from "framer-motion";
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
      Icon: ClipboardList,
      color: "#1e56d0",
      bg: "#eff6ff",
    },
    {
      label: "Waiting",
      value: waiting,
      Icon: Clock,
      color: "#f59e0b",
      bg: "#fef3c7",
    },
    {
      label: "In Chair",
      value: inChair,
      Icon: UserCheck,
      color: "#7c3aed",
      bg: "#f5f3ff",
    },
    {
      label: "Completed",
      value: completed,
      Icon: CheckCircle2,
      color: "#279C41",
      bg: "#E8F8EC",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
      {cards.map(({label, value, Icon, color, bg}) => (
        <div
          key={label}
          style={{
            background: "var(--surface-card)",
            border: "1px solid var(--border-ui)",
            borderRadius: 14,
            padding: "18px 20px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            cursor: "default",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon size={22} color={color} />
          </div>
          <div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: "var(--foreground)",
                lineHeight: 1,
                letterSpacing: 0,
              }}
            >
              <motion.span
                key={value}
                initial={{opacity: 0, scale: 0.7}}
                animate={{opacity: 1, scale: 1}}
                transition={{type: "spring", stiffness: 400, damping: 20}}
              >
                {value}
              </motion.span>
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                marginTop: 3,
                fontWeight: 500,
              }}
            >
              {label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
