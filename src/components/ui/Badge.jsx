// Badge — intent icon + text on a soft background (SRS 7.4). Icons from SRS 7.2.
import { Banknote, HandCoins, NotebookPen, PackagePlus } from 'lucide-react';

export const INTENT_STYLE = {
  credit_sale: { icon: NotebookPen, tone: 'bg-primary-soft text-primary-strong' },
  cash_sale: { icon: Banknote, tone: 'bg-success-soft text-success' },
  payment: { icon: HandCoins, tone: 'bg-success-soft text-success' },
  stock_in: { icon: PackagePlus, tone: 'bg-info-soft text-info' },
};

export function Badge({ intent, children }) {
  const { icon: Icon, tone } = INTENT_STYLE[intent];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-small font-semibold ${tone}`}
    >
      <Icon size={16} aria-hidden="true" />
      {children}
    </span>
  );
}
