// Card body for "Maggi ka rate 15 kar do": old price → new price, editable before Confirm.
import { ArrowRight } from 'lucide-react';
import { formatRupees } from '../../lib/format.js';
import { useStrings } from '../../store/ShopContext.jsx';

export function PriceCard({ item, price, onPrice }) {
  const t = useStrings();
  return (
    <div className="flex flex-col gap-3">
      <p className="text-h2 font-semibold">{item.name}</p>
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-small font-medium text-muted">{t.price.current}</span>
          <span className="min-h-11 py-2 text-h2 font-semibold text-muted tabular-nums line-through">
            {formatRupees(item.price)}
          </span>
        </div>
        <ArrowRight size={24} className="mb-3 shrink-0 text-muted" aria-hidden="true" />
        <label className="flex min-w-0 flex-1 flex-col gap-1 text-small font-medium text-muted">
          {t.price.newPrice(item.unit)}
          <input
            type="number"
            inputMode="decimal"
            min="0.01"
            step="0.01"
            value={price ?? ''}
            onChange={(e) => onPrice(e.target.value === '' ? null : Number(e.target.value))}
            className="min-h-11 w-full rounded-md border border-border bg-surface px-3 text-h2 font-semibold text-ink tabular-nums"
          />
        </label>
      </div>
    </div>
  );
}
