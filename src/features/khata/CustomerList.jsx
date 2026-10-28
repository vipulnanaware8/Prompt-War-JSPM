// Customers sorted by balance, highest first (FR-KHATA-1, FR-KHATA-5). Tap opens the sheet.
import { ChevronRight } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar.jsx';
import { BalanceChip } from '../../components/ui/BalanceChip.jsx';
import { TimeAgo } from '../../components/ui/TimeAgo.jsx';
import { useStrings } from '../../store/ShopContext.jsx';
import { nativeAlias } from '../../lib/format.js';

export function CustomerList({ customers, onOpen }) {
  const t = useStrings();
  return (
    <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface shadow-card">
      {customers.map((c) => (
        <li key={c.id}>
          <button
            type="button"
            onClick={() => onOpen(c.id)}
            aria-label={t.khata.openCustomer(c.name)}
            className="flex w-full items-center gap-3 px-4 py-3 text-left transition-[transform,opacity] duration-150 ease-out hover:bg-bg sm:px-6"
          >
            <Avatar name={c.name} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-body font-semibold">
                {c.name} <span className="text-small font-normal text-muted">{nativeAlias(c)}</span>
              </p>
              <TimeAgo ts={c.lastActivity} className="text-small text-muted" />
            </div>
            <BalanceChip balance={c.balance} />
            <ChevronRight size={20} className="shrink-0 text-muted" aria-hidden="true" />
          </button>
        </li>
      ))}
    </ul>
  );
}
