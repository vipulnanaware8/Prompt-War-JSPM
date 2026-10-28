// One line on the card: name + Devanagari alias, "heard:" chip, stepper, × price = subtotal.
// For stock-in it shows the stock change instead ("6 → 16 packet").
import { ArrowRight, X } from 'lucide-react';
import { IconButton } from '../../components/ui/IconButton.jsx';
import { QtyStepper } from '../../components/ui/QtyStepper.jsx';
import { formatQty, formatRupees } from '../../lib/format.js';
import { lineSubtotal } from '../../lib/ledger.js';
import { useStrings } from '../../store/ShopContext.jsx';

const DEVANAGARI = /[ऀ-ॿ]/;

export function LineItemRow({ line, item, intent, onQty, onRemove }) {
  const t = useStrings();
  const alias = item.aliases.find((a) => DEVANAGARI.test(a));
  const isStock = intent === 'stock_in';

  return (
    <li className="flex flex-col gap-2 py-3">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-body font-semibold">
            {item.name}{' '}
            {alias && <span className="text-caption font-medium text-muted">{alias}</span>}
          </p>
          <div className="mt-1 flex flex-wrap gap-1">
            <span className="rounded-full bg-bg px-2 py-0.5 text-caption font-medium text-muted">
              {t.card.heard(line.matchedText)}
            </span>
            {line.confidence < 0.7 && (
              <span className="rounded-full bg-warning-soft px-2 py-0.5 text-caption font-semibold text-warning">
                {t.card.checkThis}
              </span>
            )}
          </div>
        </div>
        <IconButton label={t.card.remove(item.name)} onClick={onRemove}>
          <X size={20} aria-hidden="true" />
        </IconButton>
      </div>
      <div className="flex items-center justify-between gap-2">
        <QtyStepper
          value={line.qty}
          unit={item.unit}
          onChange={onQty}
          lessLabel={t.card.less(item.name)}
          moreLabel={t.card.more(item.name)}
        />
        {isStock ? (
          <p className="flex items-center gap-1 text-small font-semibold tabular-nums">
            <span className="text-muted">{item.stock}</span>
            <ArrowRight size={16} className="text-muted" aria-hidden="true" />
            <span className="text-info">{formatQty(item.stock + line.qty, item.unit)}</span>
          </p>
        ) : (
          <p className="text-right tabular-nums">
            <span className="text-small text-muted">× {formatRupees(item.price)} = </span>
            <span className="text-body font-semibold">
              {formatRupees(lineSubtotal(line.qty, item.price))}
            </span>
          </p>
        )}
      </div>
    </li>
  );
}
