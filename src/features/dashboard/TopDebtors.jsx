// Top 3 udhaar customers, highest balance first (FR-DASH-5).
import { Avatar } from '../../components/ui/Avatar.jsx';
import { BalanceChip } from '../../components/ui/BalanceChip.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { TimeAgo } from '../../components/ui/TimeAgo.jsx';
import { selectTopDebtors } from '../../store/selectors.js';
import { useShop, useStrings } from '../../store/ShopContext.jsx';

export function TopDebtors({ onOpen }) {
  const t = useStrings();
  const debtors = useShop(selectTopDebtors);

  return (
    <Card title={t.topDebtorsTitle}>
      {debtors.length === 0 ? (
        <p className="text-body text-muted">{t.noDebtors}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border">
          {debtors.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onOpen(c.id)}
                aria-label={t.khata.openCustomer(c.name)}
                className="-mx-2 flex w-[calc(100%+16px)] items-center gap-3 rounded-md px-2 py-3 text-left transition-[transform,opacity] duration-150 ease-out hover:bg-bg"
              >
                <Avatar name={c.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body font-semibold">{c.name}</p>
                  <TimeAgo ts={c.lastActivity} className="text-small text-muted" />
                </div>
                <BalanceChip balance={c.balance} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
