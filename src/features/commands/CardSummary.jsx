// Bottom of the confirmation card: warnings (amber box) and the big TOTAL (FR-CONF-2/6/7).
import { AlertTriangle } from 'lucide-react';
import { formatRupees } from '../../lib/format.js';
import { useStrings } from '../../store/ShopContext.jsx';

export function CardSummary({ warnings, total }) {
  const t = useStrings();
  return (
    <>
      {warnings.length > 0 && (
        <ul className="flex flex-col gap-1 rounded-md bg-warning-soft p-3 text-small font-medium text-warning">
          {warnings.map((w) => (
            <li key={w} className="flex items-start gap-2">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              {w}
            </li>
          ))}
        </ul>
      )}
      {total !== null && (
        <div className="flex items-baseline justify-between border-t border-border pt-3">
          <span className="text-h2 font-semibold">{t.card.total}</span>
          <span className="text-display font-bold tabular-nums">{formatRupees(total)}</span>
        </div>
      )}
    </>
  );
}
