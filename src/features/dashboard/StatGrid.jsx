// Four stat cards (FR-DASH-2). Udhaar opens Khata, Low stock opens Stock (FR-DASH-7).
import { Banknote, IndianRupee, NotebookPen, PackageX } from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard.jsx';
import { formatRupees } from '../../lib/format.js';
import {
  selectLowStockItems,
  selectTodayTotals,
  selectTopDebtors,
  selectUdhaarPending,
} from '../../store/selectors.js';
import { useShop, useStrings } from '../../store/ShopContext.jsx';

export function StatGrid({ onNavigate }) {
  const t = useStrings();
  const today = useShop(selectTodayTotals);
  const udhaar = useShop(selectUdhaarPending);
  const debtorCount = useShop((s) => selectTopDebtors(s, Infinity).length);
  const lowStock = useShop(selectLowStockItems).length;

  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      <StatCard
        icon={IndianRupee}
        tone="primary"
        label={t.stats.sales}
        value={today.sales}
        format={formatRupees}
        delta={t.stats.salesDelta(today.salesCount)}
      />
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
        icon={Banknote}
        tone="success"
        label={t.stats.cash}
        value={today.cash}
        format={formatRupees}
        delta={t.stats.cashDelta}
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
