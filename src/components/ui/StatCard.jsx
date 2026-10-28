// StatCard — icon, label, count-up value, delta text (SRS 7.4).
import { Card } from './Card.jsx';
import { useCountUp } from './useCountUp.js';

// Icon tint by meaning: soft background + strong colour.
const TONES = {
  primary: 'bg-primary-soft text-primary-strong',
  danger: 'bg-danger-soft text-danger',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
};

export function StatCard({
  icon: Icon,
  label,
  value,
  format = String,
  delta,
  tone = 'primary',
  onClick,
}) {
  const shown = useCountUp(value);
  return (
    <Card onClick={onClick} className="@container flex flex-col gap-3">
      <span className={`flex size-10 items-center justify-center rounded-md ${TONES[tone]}`}>
        <Icon size={20} strokeWidth={2} aria-hidden="true" />
      </span>
      <span className="text-small font-medium text-muted">{label}</span>
      {/* Screen readers get the exact value; the animated one is visual only. */}
      {/* Never truncate money: narrow cards (4 in a row on small desktops) use the H2 size */}
      <span
        className="font-ledger text-h2 font-bold whitespace-nowrap tabular-nums @[7rem]:text-h1"
        aria-hidden="true"
      >
        {format(shown)}
      </span>
      <span className="sr-only">{format(value)}</span>
      {delta && <span className="text-caption font-medium text-muted">{delta}</span>}
    </Card>
  );
}
