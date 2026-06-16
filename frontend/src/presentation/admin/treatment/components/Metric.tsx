export function Metric({label, value}: {label: string; value: string}) {
  return (
    <div className="min-w-28 rounded-xl border border-ui-border bg-page px-3.5 py-2.5">
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-text-muted">
        {label}
      </p>
      <p className="mt-1 text-base font-semibold text-foreground">{value}</p>
    </div>
  );
}
