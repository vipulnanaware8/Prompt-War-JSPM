// 7-day sales bar chart (FR-DASH-4). Today's bar is full primary; other days at 85%.
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { Card } from '../../components/ui/Card.jsx';
import { formatRupees } from '../../lib/format.js';
import { selectDailySales } from '../../store/selectors.js';
import { useShop, useStrings } from '../../store/ShopContext.jsx';

export function SalesChart() {
  const t = useStrings();
  const days = useShop(selectDailySales).map((day) => ({
    ...day,
    label: day.isToday ? t.chartToday : day.date.toLocaleDateString(t.locale, { weekday: 'short' }),
  }));
  const summary = days.map((d) => `${d.label} ${formatRupees(d.total)}`).join(', ');

  return (
    <Card title={t.chartTitle}>
      {/* Screen readers get the numbers as text; the chart itself is visual. */}
      <p className="sr-only">{t.chartSummary(summary)}</p>
      <div className="h-[200px]" aria-hidden="true">
        <ResponsiveContainer
          width="100%"
          height={200}
          initialDimension={{ width: 320, height: 200 }}
        >
          <BarChart
            data={days}
            margin={{ top: 8, right: 0, bottom: 0, left: 0 }}
            accessibilityLayer={false}
          >
            <XAxis
              dataKey="label"
              axisLine={{ stroke: 'var(--border)' }}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'var(--muted)' }}
              interval={0}
            />
            <Tooltip
              cursor={{ fill: 'var(--primary-soft)', opacity: 0.6 }}
              formatter={(value) => [formatRupees(value), t.chartTitle]}
              labelStyle={{ color: 'var(--ink)', fontWeight: 600 }}
              contentStyle={{
                borderRadius: 12,
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-raised)',
                fontSize: 14,
              }}
            />
            <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={48} isAnimationActive={false}>
              {days.map((day) => (
                <Cell key={day.key} fill="var(--primary)" fillOpacity={day.isToday ? 1 : 0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
