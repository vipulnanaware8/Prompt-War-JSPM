// Customers sorted by balance, highest first (FR-KHATA-1, FR-KHATA-5).
import { Avatar } from '../../components/ui/Avatar.jsx';
import { BalanceChip } from '../../components/ui/BalanceChip.jsx';
import { TimeAgo } from '../../components/ui/TimeAgo.jsx';

const DEVANAGARI = /[ऀ-ॿ]/;

export function CustomerList({ customers }) {
  return (
    <ul className="flex flex-col divide-y divide-border rounded-lg border border-border bg-surface shadow-card">
      {customers.map((c) => (
        <li key={c.id} className="flex items-center gap-3 px-4 py-3 sm:px-6">
          <Avatar name={c.name} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-body font-semibold">
              {c.name}{' '}
              <span className="text-small font-normal text-muted">
                {c.aliases.find((a) => DEVANAGARI.test(a))}
              </span>
            </p>
            <TimeAgo ts={c.lastActivity} className="text-small text-muted" />
          </div>
          <BalanceChip balance={c.balance} />
        </li>
      ))}
    </ul>
  );
}
