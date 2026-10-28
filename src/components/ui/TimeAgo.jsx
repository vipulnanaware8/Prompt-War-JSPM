// Relative time in the selected language ("5 min pehle", "Kal").
import { relativeTime } from '../../lib/format.js';
import { useStrings } from '../../store/ShopContext.jsx';

export function TimeAgo({ ts, className = '' }) {
  const t = useStrings();
  const { key, n } = relativeTime(ts);
  return (
    <time dateTime={ts} className={className}>
      {t.time[key](n)}
    </time>
  );
}
