// Shop's UPI ID, added to payment reminders as a pay link. Empty = no UPI line.
import { useState } from 'react';
import { Button } from '../../components/ui/Button.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { isValidUpiId } from '../../lib/reminders.js';
import { useShopDispatch, useStrings } from '../../store/ShopContext.jsx';

export function UpiForm({ upiId }) {
  const t = useStrings();
  const dispatch = useShopDispatch();
  const { showToast } = useToast();
  const [value, setValue] = useState(upiId);
  const trimmed = value.trim();
  const invalid = trimmed !== '' && !isValidUpiId(trimmed);

  function saveUpi(event) {
    event.preventDefault();
    dispatch({ type: 'UPDATE_SETTINGS', payload: { upiId: trimmed } });
    showToast({ type: 'success', message: t.saved });
  }

  return (
    <form onSubmit={saveUpi} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <label className="flex flex-1 flex-col gap-1 text-small font-medium text-muted">
        {t.upiLabel}
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={60}
          placeholder="sharma@upi"
          inputMode="email"
          autoCapitalize="none"
          aria-invalid={invalid}
          className="min-h-11 rounded-md border border-border bg-surface px-3 text-body text-ink"
        />
        {invalid && <span className="text-small text-danger">{t.upiInvalid}</span>}
      </label>
      <Button type="submit" disabled={invalid || trimmed === upiId}>
        {t.save}
      </Button>
    </form>
  );
}
