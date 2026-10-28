// Add customer (FR-KHATA-4): name + optional second name. No phone or address fields, ever.
import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { Sheet } from '../../components/ui/Sheet.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { newId } from '../../lib/ids.js';
import { buildCustomer } from '../../lib/ledger.js';
import { useShopDispatch, useStrings } from '../../store/ShopContext.jsx';

const INPUT = 'min-h-12 rounded-md border border-border bg-surface px-3 text-body text-ink';

export function AddCustomerSheet({ open, initialName, onClose, onAdded }) {
  const t = useStrings();
  const dispatch = useShopDispatch();
  const { showToast } = useToast();
  const [name, setName] = useState(initialName);
  const [alias, setAlias] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    const customer = buildCustomer({ name, alias }, { id: newId('c') });
    dispatch({ type: 'ADD_CUSTOMER', payload: customer });
    showToast({ type: 'success', message: t.khata.added(customer.name) });
    onAdded(customer.id);
  }

  return (
    <Sheet open={open} onClose={onClose} label={t.khata.addTitle}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4 pt-2 pb-6 sm:px-6 sm:pt-6">
        <h2 className="text-h2 font-semibold">{t.khata.addTitle}</h2>
        <label className="flex flex-col gap-1 text-small font-medium text-muted">
          {t.khata.nameLabel}
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            className={INPUT}
          />
        </label>
        <label className="flex flex-col gap-1 text-small font-medium text-muted">
          {t.khata.aliasLabel}
          <input
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            maxLength={40}
            className={INPUT}
          />
          <span className="text-caption">{t.khata.aliasHint}</span>
        </label>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" size="lg" onClick={onClose}>
            {t.settingsScreen.cancel}
          </Button>
          <Button type="submit" size="lg" disabled={!name.trim()}>
            <UserPlus size={20} aria-hidden="true" />
            {t.khata.add}
          </Button>
        </div>
      </form>
    </Sheet>
  );
}
