// Edit shop name (FR-SET-1); updates header and greeting.
import { useState } from 'react';
import { Button } from '../../components/ui/Button.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { useShopDispatch, useStrings } from '../../store/ShopContext.jsx';

export function ShopNameForm({ shopName }) {
  const t = useStrings();
  const dispatch = useShopDispatch();
  const { showToast } = useToast();
  const [name, setName] = useState(shopName);
  const trimmed = name.trim();

  function saveName(event) {
    event.preventDefault();
    dispatch({ type: 'UPDATE_SETTINGS', payload: { shopName: trimmed } });
    showToast({ type: 'success', message: t.saved });
  }

  return (
    <form onSubmit={saveName} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <label className="flex flex-1 flex-col gap-1 text-small font-medium text-muted">
        {t.shopNameLabel}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
          className="min-h-11 rounded-md border border-border bg-surface px-3 text-body text-ink"
        />
      </label>
      <Button type="submit" disabled={!trimmed || trimmed === shopName}>
        {t.save}
      </Button>
    </form>
  );
}
