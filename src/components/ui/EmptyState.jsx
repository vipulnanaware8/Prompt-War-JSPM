// EmptyState — 48 px icon, title, one-line hint (SRS 7.4).

export function EmptyState({ icon: Icon, title, hint }) {
  return (
    <div className="flex flex-col items-center gap-2 py-8 text-center">
      <Icon size={48} strokeWidth={1.5} className="text-muted" aria-hidden="true" />
      <p className="text-body font-semibold">{title}</p>
      {hint && <p className="text-small text-muted">{hint}</p>}
    </div>
  );
}
