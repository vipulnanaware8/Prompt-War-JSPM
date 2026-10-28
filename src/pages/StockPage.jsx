// Stock — filter chips + every item with stock level and forecast (SRS 7.5).
import { useState } from 'react';
import { CircleCheck } from 'lucide-react';
import { Chip } from '../components/ui/Chip.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { ItemList } from '../features/stock/ItemList.jsx';
import { selectItemsWithForecast } from '../store/selectors.js';
import { useShop, useStrings } from '../store/ShopContext.jsx';

// Filter rules (FR-STOCK-2, FR-STOCK-4)
const FILTERS = {
  all: () => true,
  low: (item) => item.stock <= item.reorderLevel,
  running: (item) => item.daysLeft !== null && item.daysLeft <= 3,
};

export function StockPage({ params }) {
  const t = useStrings();
  // The filter stays while this screen is open; the dashboard can open it pre-filtered.
  const [filter, setFilter] = useState(params?.filter ?? 'all');
  const items = useShop(selectItemsWithForecast);
  const shown = items.filter(FILTERS[filter]);

  return (
    <div className="flex flex-col gap-4">
      <div className="py-2">
        <h1 className="text-h1 font-bold">{t.stockTitle}</h1>
        <p className="text-body text-muted">{t.stockSub(items.length)}</p>
      </div>

      <div role="group" aria-label={t.stockScreen.filterLabel} className="flex flex-wrap gap-2">
        {Object.keys(FILTERS).map((id) => (
          <Chip key={id} selected={id === filter} onClick={() => setFilter(id)}>
            {t.stockScreen.filters[id]}
            <span className="ml-1.5 tabular-nums opacity-70">
              {items.filter(FILTERS[id]).length}
            </span>
          </Chip>
        ))}
      </div>

      {shown.length > 0 ? (
        <ItemList items={shown} />
      ) : (
        <div className="rounded-lg border border-border bg-surface shadow-card">
          <EmptyState
            icon={CircleCheck}
            title={t.stockScreen.allGood}
            hint={t.stockScreen.allGoodHint}
          />
        </div>
      )}
    </div>
  );
}
