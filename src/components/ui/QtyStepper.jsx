// QtyStepper — − / value / +. Step and minimum 0.5 for kg/litre, else 1 (SRS 7.4).
import { Minus, Plus } from 'lucide-react';

const HALF_UNITS = ['kg', 'litre'];

export function QtyStepper({ value, unit, onChange, lessLabel, moreLabel }) {
  const step = HALF_UNITS.includes(unit) ? 0.5 : 1;
  const round = (n) => Math.round(n * 100) / 100;
  const button =
    'flex size-11 items-center justify-center rounded-full border border-border text-ink transition-[transform,opacity] duration-150 ease-out hover:bg-primary-soft active:scale-[.98] disabled:opacity-40';

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label={lessLabel}
        className={button}
        disabled={round(value - step) < step}
        onClick={() => onChange(round(value - step))}
      >
        <Minus size={20} aria-hidden="true" />
      </button>
      <span
        className="min-w-12 text-center text-body font-semibold tabular-nums"
        aria-live="polite"
      >
        {value} <span className="text-caption font-medium text-muted">{unit}</span>
      </span>
      <button
        type="button"
        aria-label={moreLabel}
        className={button}
        onClick={() => onChange(round(value + step))}
      >
        <Plus size={20} aria-hidden="true" />
      </button>
    </div>
  );
}
