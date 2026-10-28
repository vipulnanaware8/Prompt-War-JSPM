// Stock bar: width = stock ÷ (2 × reorder level), capped at 100%, colour + text label (FR-STOCK-1).
import { useStrings } from '../../store/ShopContext.jsx';

const LEVELS = {
  out: { bar: 'bg-danger', text: 'text-danger' },
  low: { bar: 'bg-warning', text: 'text-warning' },
  ok: { bar: 'bg-success', text: 'text-success' },
};

export function StockBar({ stock, reorderLevel }) {
  const t = useStrings();
  let level = 'ok';
  if (stock <= 0) level = 'out';
  else if (stock <= reorderLevel) level = 'low';
  const width = Math.min(100, (stock / (2 * reorderLevel)) * 100);

  return (
    <div className="flex items-center gap-3">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-bg">
        <div
          className={`h-full rounded-full ${LEVELS[level].bar}`}
          style={{ width: `${width}%` }}
        />
      </div>
      <span className={`w-20 shrink-0 text-right text-caption font-semibold ${LEVELS[level].text}`}>
        {t.stockLevel[level]}
      </span>
    </div>
  );
}
