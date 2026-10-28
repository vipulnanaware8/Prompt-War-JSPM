// Home / Dashboard (SRS 7.5).
import { useStrings } from '../store/ShopContext.jsx';
import { StatGrid } from '../features/dashboard/StatGrid.jsx';
import { TodoList } from '../features/dashboard/TodoList.jsx';
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

  return (
    <div className="flex flex-col gap-4">
      <div className="py-2">
        {/* The header already shows the shop name, so the greeting does not repeat it. */}
        <h1 className="text-h1 font-bold">{t.timeOfDay[timeOfDay(new Date().getHours())]}</h1>
        <p className="text-body text-muted">{t.greetingSub}</p>
      </div>
      <StatGrid onNavigate={onNavigate} />
      <TodoList onNavigate={onNavigate} onOpenCustomer={onOpenCustomer} />
      <SalesChart />
      <TopDebtors onOpen={onOpenCustomer} />
      <RecentActivity />
    </div>
  );
}
