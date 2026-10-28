// Home / Dashboard (SRS 7.5).
import { useShop, useStrings } from '../store/ShopContext.jsx';
import { StatGrid } from '../features/dashboard/StatGrid.jsx';
import { SalesChart } from '../features/dashboard/SalesChart.jsx';
import { TopDebtors } from '../features/dashboard/TopDebtors.jsx';
import { RecentActivity } from '../features/dashboard/RecentActivity.jsx';

function timeOfDay(hour) {
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

export function HomePage({ onNavigate, onOpenCustomer }) {
  const t = useStrings();
  const shopName = useShop((s) => s.settings.shopName);

  return (
    <div className="flex flex-col gap-4">
      <div className="py-2">
        <h1 className="text-h1 font-bold">{t.greeting(shopName)}</h1>
        <p className="text-body text-muted">
          {t.timeOfDay[timeOfDay(new Date().getHours())]} · {t.greetingSub}
        </p>
      </div>
      <StatGrid onNavigate={onNavigate} />
      <SalesChart />
      <TopDebtors onOpen={onOpenCustomer} />
      <RecentActivity />
    </div>
  );
}
