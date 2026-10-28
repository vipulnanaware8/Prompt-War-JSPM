// Change the entry type on the card (FR-CONF-3): Udhaar · Nakad · Jama · Stock.
import { INTENT_STYLE } from '../../components/ui/Badge.jsx';
import { useStrings } from '../../store/ShopContext.jsx';

const INTENTS = ['credit_sale', 'cash_sale', 'payment', 'stock_in'];

export function IntentSwitch({ value, onChange }) {
  const t = useStrings();
  return (
    <div role="radiogroup" aria-label={t.card.intentLabel} className="flex flex-wrap gap-2">
      {INTENTS.map((intent) => {
        const { icon: Icon, tone } = INTENT_STYLE[intent];
        const selected = intent === value;
        return (
          <button
            key={intent}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(intent)}
            className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3 text-small font-semibold transition duration-150 ease-out active:scale-[.98] ${
              selected ? `border-transparent ${tone}` : 'border-border text-muted hover:bg-bg'
            }`}
          >
            <Icon size={16} aria-hidden="true" />
            {t.intent[intent]}
          </button>
        );
      })}
    </div>
  );
}
