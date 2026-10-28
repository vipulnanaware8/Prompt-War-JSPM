// Confirmation card (FR-CONF, SRS 7.5): nothing is saved until Confirm.
import { useState } from 'react';
import { Check } from 'lucide-react';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Sheet } from '../../components/ui/Sheet.jsx';
import { formatRupees } from '../../lib/format.js';
import {
  balanceAfter,
  computeBalances,
  linesTotal,
  priceLines,
  stockWarnings,
} from '../../lib/ledger.js';
import { useShop, useStrings } from '../../store/ShopContext.jsx';
import { CardSummary } from './CardSummary.jsx';
import { CustomerRow } from './CustomerRow.jsx';
import { IntentSwitch } from './IntentSwitch.jsx';
import { LineItemRow } from './LineItemRow.jsx';
import { PriceCard } from './PriceCard.jsx';
import { VoiceFix } from './VoiceFix.jsx';

export function ConfirmationSheet({ flow }) {
  const t = useStrings();
  const { items, customers, transactions } = useShop();
  const [done, setDone] = useState(false);
  const { draft, setDraft } = flow;
  if (!draft) return <Sheet open={false} onClose={flow.cancel} label={t.card.title} />;

  const { intent, lines } = draft;
  const update = (patch) => setDraft({ ...draft, ...patch });

  if (intent === 'price_update') {
    const item = items.find((i) => i.id === lines[0]?.itemId);
    const valid = item && draft.amount > 0;
    const confirmPrice = () => valid && flow.confirm();
    return (
      <Sheet
        open
        onClose={flow.cancel}
        label={t.price.title}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.target.tagName !== 'BUTTON') {
            e.preventDefault();
            confirmPrice();
          }
        }}
      >
        <div className="flex flex-col gap-4 px-4 pt-2 pb-6 sm:px-6">
          <h2 className="text-small font-medium text-muted">{t.price.title}</h2>
          {item && (
            <PriceCard item={item} price={draft.amount} onPrice={(amount) => update({ amount })} />
          )}
          <VoiceFix flow={flow} example={t.correct.priceExample} />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" size="lg" onClick={flow.cancel}>
              {t.card.cancel}
            </Button>
            <Button
              size="lg"
              className="sm:min-w-56"
              disabled={!valid}
              onClick={confirmPrice}
              data-autofocus
            >
              {t.price.confirm(formatRupees(draft.amount ?? 0))}
            </Button>
          </div>
          {!valid && (
            <p className="text-right text-small font-medium text-danger">{t.card.reasons.amount}</p>
          )}
        </div>
      </Sheet>
    );
  }

  const isPayment = intent === 'payment';
  const needsCustomer = intent === 'credit_sale' || isPayment;
  const amountOnly = isPayment || (intent === 'credit_sale' && lines.length === 0);

  // All money maths comes from src/lib/ledger.js.
  const total = amountOnly ? Math.round(draft.amount ?? 0) : linesTotal(priceLines(lines, items));
  const before = draft.customerId ? computeBalances(customers, transactions)[draft.customerId] : 0;
  const after = balanceAfter(before, { type: intent, amount: total });
  const warnings = stockWarnings(intent, lines, items).map((w) => {
    const name = items.find((i) => i.id === w.itemId).name;
    return t.card.stockWarning(name, `${w.stock} ${w.unit}`);
  });
  if (isPayment && draft.customerId && total > before) {
    warnings.push(t.card.advanceWarning(formatRupees(total - Math.max(before, 0))));
  }

  // Validation (FR-CONF-5): the reason is shown under the disabled button.
  let reason = null;
  if (needsCustomer && !draft.customerId) reason = t.card.reasons.customer;
  else if (amountOnly && !(total > 0)) reason = t.card.reasons.amount;
  else if (!amountOnly && lines.length === 0) reason = t.card.reasons.items;

  function handleConfirm() {
    if (reason || done) return;
    setDone(true); // check mark for 600 ms, then save and close (FR-CONF-9)
    setTimeout(() => {
      setDone(false);
      flow.confirm();
    }, 600);
  }

  // Enter confirms, except while a button or select has focus (they use Enter themselves).
  function handleKeyDown(event) {
    if (event.key === 'Enter' && !['BUTTON', 'SELECT'].includes(event.target.tagName)) {
      event.preventDefault();
      handleConfirm();
    }
  }

  return (
    <Sheet open onClose={flow.cancel} label={t.card.title} onKeyDown={handleKeyDown}>
      <div className="flex flex-col gap-4 px-4 pt-2 pb-6 sm:px-6">
        <div className="flex items-center justify-between gap-2">
          <Badge intent={intent}>{t.intent[intent]}</Badge>
          <h2 className="text-small font-medium text-muted">{t.card.title}</h2>
        </div>
        <IntentSwitch value={intent} onChange={(value) => update({ intent: value })} />

        {needsCustomer && (
          <CustomerRow
            customers={customers}
            customerId={draft.customerId}
            before={before}
            after={after}
            newName={draft.newCustomerName}
            onChange={(customerId) => update({ customerId })}
            onAdd={flow.addCustomer}
          />
        )}

        {amountOnly ? (
          <label className="flex flex-col gap-1 text-small font-medium text-muted">
            {t.card.amountLabel}
            <input
              type="number"
              inputMode="numeric"
              min="1"
              value={draft.amount ?? ''}
              onChange={(e) =>
                update({ amount: e.target.value === '' ? null : Number(e.target.value) })
              }
              className="min-h-11 rounded-md border border-border bg-surface px-3 text-h2 font-semibold text-ink tabular-nums"
            />
          </label>
        ) : (
          <ul className="flex flex-col divide-y divide-border border-y border-border">
            {lines.map((line) => (
              <LineItemRow
                key={line.key}
                line={line}
                item={items.find((i) => i.id === line.itemId)}
                intent={intent}
                onQty={(qty) =>
                  update({ lines: lines.map((l) => (l.key === line.key ? { ...l, qty } : l)) })
                }
                onRemove={() => update({ lines: lines.filter((l) => l.key !== line.key) })}
              />
            ))}
            {lines.length === 0 && <li className="py-3 text-small text-muted">{t.card.noItems}</li>}
          </ul>
        )}

        <VoiceFix flow={flow} example={amountOnly ? null : t.correct.example} />

        <CardSummary warnings={warnings} total={intent === 'stock_in' ? null : total} />

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" size="lg" onClick={flow.cancel}>
            {t.card.cancel}
          </Button>
          <Button
            size="lg"
            className={`sm:min-w-56 ${done ? 'bg-success hover:bg-success' : ''}`}
            disabled={Boolean(reason)}
            onClick={handleConfirm}
            data-autofocus
          >
            {done ? (
              <Check size={28} strokeWidth={3} aria-label={t.toast.done} />
            ) : intent === 'stock_in' ? (
              t.card.confirmPlain
            ) : (
              t.card.confirm(formatRupees(total))
            )}
          </Button>
        </div>
        {reason && <p className="text-right text-small font-medium text-danger">{reason}</p>}
      </div>
    </Sheet>
  );
}
