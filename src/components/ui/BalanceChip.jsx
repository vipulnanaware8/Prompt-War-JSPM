// BalanceChip — status always has text, not only colour (FR-KHATA-5, NFR-9).
import { formatRupees } from '../../lib/format.js';
import { useStrings } from '../../store/ShopContext.jsx';

export function BalanceChip({ balance }) {
  const t = useStrings();
  let tone = 'bg-success-soft text-success';
  let text = t.balance.clear;
  if (balance > 0) {
    tone = 'bg-danger-soft text-danger';
    text = t.balance.due(formatRupees(balance));
  } else if (balance < 0) {
    tone = 'bg-info-soft text-info';
    text = t.balance.advance(formatRupees(-balance));
  }
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-small font-semibold tabular-nums ${tone}`}
    >
      {text}
    </span>
  );
}
