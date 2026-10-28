// Item rows: name, price/unit, stock + unit, stock bar (FR-STOCK-1, FR-STOCK-2).
import { formatQty, formatRupees } from '../../lib/format.js';
import { useStrings } from '../../store/ShopContext.jsx';
import { StockBar } from './StockBar.jsx';

export function ItemList({ items }) {
  const t = useStrings();
  return (
    <ul className="flex flex-col divide-y divide-border rounded-lg border border-border bg-surface shadow-card">
      {items.map((item) => (
        <li key={item.id} className="flex flex-col gap-2 px-4 py-3 sm:px-6">
          <div className="flex items-baseline justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-body font-semibold">{item.name}</p>
              <p className="text-small text-muted tabular-nums">
                {t.perUnit(formatRupees(item.price), item.unit)}
              </p>
            </div>
            <p className="shrink-0 text-h2 font-semibold tabular-nums">
              {formatQty(item.stock, item.unit)}
            </p>
          </div>
          <StockBar stock={item.stock} reorderLevel={item.reorderLevel} />
        </li>
      ))}
    </ul>
  );
}
