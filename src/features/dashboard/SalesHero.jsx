// Today's sales as the hero number, compared with yesterday up to the same time,
// plus today's cash (FR-DASH-2).
import { IndianRupee, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { Card } from '../../components/ui/Card.jsx';
import { useCountUp } from '../../components/ui/useCountUp.js';
import { formatRupees } from '../../lib/format.js';
import { selectTodayTotals, selectYesterdaySalesSoFar } from '../../store/selectors.js';
import { useShop, useStrings } from '../../store/ShopContext.jsx';

// Trend pill: always has words, not only colour (NFR-9).
const TRENDS = {
  up: { icon: TrendingUp, tone: 'bg-success-soft text-success' },
  down: { icon: TrendingDown, tone: 'bg-danger-soft text-danger' },
  same: { icon: Minus, tone: 'bg-bg text-muted' },
};

function Trend({ today, yesterday }) {
  const t = useStrings();
  if (yesterday <= 0) return null;
  const pct = Math.round(((today - yesterday) / yesterday) * 100);
  let dir = 'same';
  if (pct > 0) dir = 'up';
  if (pct < 0) dir = 'down';
  const { icon: Icon, tone } = TRENDS[dir];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-small font-semibold tabular-nums ${tone}`}
    >
      <Icon size={16} aria-hidden="true" />
      {dir === 'same' ? t.stats.trend.same : t.stats.trend[dir](Math.abs(pct))}
    </span>
  );
}

export function SalesHero() {
  const t = useStrings();
  const today = useShop(selectTodayTotals);
  const yesterday = useShop(selectYesterdaySalesSoFar);
  const shown = useCountUp(today.sales);

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-md bg-primary-soft text-primary-strong">
          <IndianRupee size={20} aria-hidden="true" />
        </span>
        <span className="text-small font-medium text-muted">{t.stats.sales}</span>
      </div>

      <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
        {/* Screen readers get the exact value; the animated one is visual only. */}
        <span className="text-display font-bold tabular-nums" aria-hidden="true">
          {formatRupees(shown)}
        </span>
        <span className="sr-only">{formatRupees(today.sales)}</span>
        <span className="pb-2">
          <Trend today={today.sales} yesterday={yesterday} />
        </span>
      </div>

      <p className="text-small text-muted">
        {t.stats.salesDelta(today.salesCount)}
        {yesterday > 0 && ` · ${t.stats.yesterdaySoFar(formatRupees(yesterday))}`}
      </p>

      <div className="flex items-center justify-between border-t border-border pt-3">
        <span className="text-small font-medium text-muted">
          {t.stats.cash} <span className="font-normal">({t.stats.cashDelta})</span>
        </span>
        <span className="text-body font-bold text-success tabular-nums">
          {formatRupees(today.cash)}
        </span>
      </div>
    </Card>
  );
}
