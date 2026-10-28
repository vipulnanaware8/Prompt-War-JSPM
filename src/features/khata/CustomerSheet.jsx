// Customer sheet (FR-KHATA-2): big balance, copy reminder, last 10 transactions.
// Opens from the Khata list, the dashboard and spoken-question answers.
import { Inbox } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar.jsx';
import { BalanceChip } from '../../components/ui/BalanceChip.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { INTENT_STYLE } from '../../components/ui/Badge.jsx';
import { Sheet } from '../../components/ui/Sheet.jsx';
import { TimeAgo } from '../../components/ui/TimeAgo.jsx';
import { formatQty, formatRupees, nativeAlias } from '../../lib/format.js';
import { selectCustomersByBalance, selectCustomerTransactions } from '../../store/selectors.js';
import { useShop, useStrings } from '../../store/ShopContext.jsx';
import { ReminderButton } from './ReminderButton.jsx';

export function CustomerSheet({ customerId, open, onClose }) {
  const t = useStrings();
  const customer = useShop((s) => selectCustomersByBalance(s).find((c) => c.id === customerId));
  const history = useShop((s) => selectCustomerTransactions(s, customerId));
  const items = useShop((s) => s.items);
  const itemName = (id) => items.find((i) => i.id === id)?.name ?? id;

  return (
    <Sheet
      open={open && Boolean(customer)}
      onClose={onClose}
      label={customer?.name ?? t.khata.open}
    >
      {customer && (
        <div className="flex flex-col gap-5 px-4 pt-2 pb-6 sm:px-6 sm:pt-6">
          <div className="flex items-center gap-3">
            <Avatar name={customer.name} />
            <div className="min-w-0">
              <h2 className="truncate text-h2 font-semibold">{customer.name}</h2>
              <p className="text-small text-muted">{nativeAlias(customer)}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-small font-medium text-muted">{t.khata.balanceLabel}</p>
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-ledger text-display font-bold tabular-nums">
                {formatRupees(Math.abs(customer.balance))}
              </span>
              <BalanceChip balance={customer.balance} />
            </div>
            <p className="text-caption font-medium text-muted">
              {t.khata.opening(formatRupees(customer.openingBalance))}
            </p>
          </div>

          {customer.balance > 0 ? (
            <ReminderButton customer={customer} />
          ) : (
            <p className="rounded-lg bg-success-soft p-3 text-small font-medium text-success">
              {t.khata.noReminder}
            </p>
          )}

          <section className="flex flex-col gap-2">
            <h3 className="text-body font-semibold">{t.khata.historyTitle}</h3>
            {history.length === 0 ? (
              <EmptyState icon={Inbox} title={t.khata.noHistory} />
            ) : (
              <ul className="flex flex-col divide-y divide-border">
                {history.map((tx) => {
                  const { icon: Icon, tone } = INTENT_STYLE[tx.type];
                  const lines = (tx.lines ?? [])
                    .map((l) => `${itemName(l.itemId)} ${formatQty(l.qty, l.unit)}`)
                    .join(', ');
                  return (
                    <li key={tx.id} className="flex items-center gap-3 py-3">
                      <span
                        className={`flex size-10 shrink-0 items-center justify-center rounded-full ${tone}`}
                      >
                        <Icon size={20} aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-body font-medium">{t.intent[tx.type]}</p>
                        <p className="truncate text-small text-muted">
                          {lines || <TimeAgo ts={tx.ts} />}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p
                          className={`text-body font-semibold tabular-nums ${tx.type === 'payment' ? 'text-success' : 'text-danger'}`}
                        >
                          {tx.type === 'payment' ? '−' : '+'}
                          {formatRupees(tx.amount)}
                        </p>
                        {lines && <TimeAgo ts={tx.ts} className="text-caption text-muted" />}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      )}
    </Sheet>
  );
}
