// Sales hero + Udhaar and Low stock cards (FR-DASH-2). Udhaar opens Khata, Low stock
// opens Stock (FR-DASH-7). Today's cash lives inside the hero.
import { NotebookPen, PackageX } from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard.jsx';
import { formatRupees } from '../../lib/format.js';
import {
  selectLowStockItems,
  selectTopDebtors,
  selectUdhaarPending,
} from '../../store/selectors.js';
import { useShop, useStrings } from '../../store/ShopContext.jsx';
import { SalesHero } from './SalesHero.jsx';

export function StatGrid({ onNavigate }) {
  const t = useStrings();
  const udhaar = useShop(selectUdhaarPending);
  const debtorCount = useShop((s) => selectTopDebtors(s, Infinity).length);
  const lowStock = useShop(selectLowStockItems).length;

  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
      <div className="col-span-2 xl:col-span-1">
        <SalesHero />
      </div>
      <StatCard
        icon={NotebookPen}
        tone="danger"
        label={t.stats.udhaar}
        value={udhaar}
        format={formatRupees}
        delta={t.stats.udhaarDelta(debtorCount)}
        onClick={() => onNavigate('khata')}
      />
      <StatCard
        icon={PackageX}
        tone="warning"
        label={t.stats.lowStock}
        value={lowStock}
        delta={t.stats.lowStockDelta(lowStock)}
        onClick={() => onNavigate('stock', { filter: 'low' })}
      />
    </div>
  );
}
