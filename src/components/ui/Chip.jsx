// Chip — selectable pill (language, filter). Selected = primary-soft + primary-strong text.
// `dark` styles it for the dark voice panel.

export function Chip({ selected = false, dark = false, className = '', ...props }) {
  let tone = 'border-border bg-surface text-ink hover:bg-primary-soft';
  if (dark) tone = 'border-panel-muted/40 text-panel-text hover:bg-white/10';
  if (selected) tone = 'border-primary-soft bg-primary-soft text-primary-strong';
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={`inline-flex min-h-11 items-center rounded-full border px-4 text-small font-semibold transition-[transform,opacity] duration-150 ease-out active:scale-[.98] ${tone} ${className}`}
      {...props}
    />
  );
}
