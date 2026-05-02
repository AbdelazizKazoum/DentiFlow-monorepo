interface StaffSummaryCardsProps {
  total: number;
  active: number;
  onLeave: number;
  inactive: number;
}

export function StaffSummaryCards({
  total,
  active,
  onLeave,
  inactive,
}: StaffSummaryCardsProps) {
  const stats = [
    {label: "Total Staff", value: total, dot: "#1e56d0"},
    {label: "Active", value: active, dot: "#279C41"},
    {label: "On Leave", value: onLeave, dot: "#f6ad55"},
    {label: "Inactive", value: inactive, dot: "#94a3b8"},
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-card border rounded-xl p-4 flex flex-col gap-1"
          style={{borderColor: "var(--border-ui)"}}
        >
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{backgroundColor: stat.dot}}
            />
            <span
              className="text-xs font-medium"
              style={{color: "var(--text-muted)"}}
            >
              {stat.label}
            </span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
