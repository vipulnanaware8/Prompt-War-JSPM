// Customer on the card: avatar, name, change (select), balance preview "₹240 → ₹340".
import { ArrowRight, UserPlus } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar.jsx';
import { formatRupees } from '../../lib/format.js';
import { useStrings } from '../../store/ShopContext.jsx';

export function CustomerRow({ customers, customerId, before, after, newName, onChange, onAdd }) {
  const t = useStrings();
  const customer = customers.find((c) => c.id === customerId);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        {customer && <Avatar name={customer.name} />}
        <label className="flex min-w-0 flex-1 flex-col text-caption font-medium text-muted">
          {t.card.customer}
          <select
            value={customerId ?? ''}
            onChange={(e) => onChange(e.target.value || null)}
            className="min-h-11 w-full cursor-pointer rounded-md border border-border bg-surface px-2 text-body font-semibold text-ink"
          >
            <option value="">{t.card.chooseCustomer}</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        {customer && (
          <p className="flex shrink-0 items-center gap-1 text-small font-semibold tabular-nums">
            <span className="text-muted">{formatRupees(before)}</span>
            <ArrowRight size={16} className="text-muted" aria-hidden="true" />
            <span className={after > before ? 'text-danger' : 'text-success'}>
              {formatRupees(after)}
            </span>
          </p>
        )}
      </div>
      {!customer && newName && (
        <button
          type="button"
          onClick={() => onAdd(newName)}
          className="inline-flex min-h-11 items-center gap-2 self-start rounded-md bg-primary-soft px-3 text-small font-semibold text-primary-strong hover:opacity-90"
        >
          <UserPlus size={20} aria-hidden="true" />
          {t.card.addCustomer(newName)}
        </button>
      )}
    </div>
  );
}
