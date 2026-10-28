// Last 5 transactions, newest first (FR-DASH-6).
import { Inbox } from 'lucide-react';
import { INTENT_STYLE } from '../../components/ui/Badge.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { TimeAgo } from '../../components/ui/TimeAgo.jsx';
import { formatQty, formatRupees } from '../../lib/format.js';
import { selectRecentTransactions } from '../../store/selectors.js';
import { useShop, useStrings } from '../../store/ShopContext.jsx';

export function RecentActivity() {
  const t = useStrings();
  const recent = useShop(selectRecentTransactions);
  const items = useShop((s) => s.items);
  const customers = useShop((s) => s.customers);

  // One readable sentence per transaction, e.g. "Ramesh — udhaar ₹100".
  function describe(tx) {
    const amount = formatRupees(tx.amount);
    const firstName = customers.find((c) => c.id === tx.customerId)?.name.split(' ')[0] ?? '';
    if (tx.type === 'stock_in') {
      const line = tx.lines[0];
      const item = items.find((i) => i.id === line.itemId);
      return t.activity.stock_in(item?.name ?? line.itemId, formatQty(line.qty, line.unit));
    }
    if (tx.type === 'cash_sale') return t.activity.cash_sale(amount);
    return t.activity[tx.type](firstName, amount);
  }

  return (
    <Card title={t.recentTitle}>
      {recent.length === 0 ? (
        <EmptyState icon={Inbox} title={t.emptyToday} hint={t.emptyTodayHint} />
      ) : (
        <ul className="flex flex-col divide-y divide-border">
          {recent.map((tx) => {
            const { icon: Icon, tone } = INTENT_STYLE[tx.type];
            return (
              <li key={tx.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span
                  className={`flex size-10 shrink-0 items-center justify-center rounded-full ${tone}`}
                >
                  <Icon size={20} aria-hidden="true" />
                </span>
                <p className="min-w-0 flex-1 truncate text-body font-medium tabular-nums">
                  {describe(tx)}
                </p>
                <TimeAgo ts={tx.ts} className="shrink-0 text-small text-muted" />
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
