// "What to do now": items running out and udhaar to collect, each with one action.
// Restock opens Stock pre-filtered; collect opens the customer's khata, which has the reminder.
import { CalendarClock, CircleCheck, HandCoins, PackageX } from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { displayName, formatQty, formatRupees, nativeAlias } from '../../lib/format.js';
import { selectTodos } from '../../store/selectors.js';
import { useShop, useStrings } from '../../store/ShopContext.jsx';

function Row({ icon: Icon, tone, title, hint, action, onAction }) {
  return (
    <li className="flex items-center gap-3 py-3">
      <span className={`flex size-10 shrink-0 items-center justify-center rounded-md ${tone}`}>
        <Icon size={20} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-body font-semibold">{title}</p>
        <p className="text-small text-muted tabular-nums">{hint}</p>
      </div>
      <Button variant="secondary" onClick={onAction} className="shrink-0">
        {action}
      </Button>
    </li>
  );
}

export function TodoList({ onNavigate, onOpenCustomer }) {
  const t = useStrings();
  const todos = useShop(selectTodos);
  const language = useShop((s) => s.settings.language);

  if (todos.length === 0) {
    return (
      <Card className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-success-soft text-success">
          <CircleCheck size={20} aria-hidden="true" />
        </span>
        <div>
          <p className="text-body font-semibold">{t.todos.allDone}</p>
          <p className="text-small text-muted">{t.todos.allDoneHint}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title={t.todos.title}>
      <ul className="-my-3 flex flex-col divide-y divide-border">
        {todos.map((todo) => {
          if (todo.kind === 'restock') {
            const { item, days } = todo;
            const name = (language !== 'hinglish' && nativeAlias(item)) || item.name;
            return (
              <Row
                key={`restock_${item.id}`}
                icon={PackageX}
                tone="bg-warning-soft text-warning"
                title={t.todos.restock(name, days)}
                hint={t.todos.restockHint(formatQty(item.stock, item.unit))}
                action={t.todos.restockAction}
                onAction={() => onNavigate('stock', { filter: 'running' })}
              />
            );
          }
          if (todo.kind === 'promise') {
            const { customer, days, balance } = todo;
            return (
              <Row
                key={`promise_${customer.id}`}
                icon={CalendarClock}
                tone="bg-primary-soft text-primary-strong"
                title={t.promise.todo(displayName(customer, language), days)}
                hint={t.promise.hint(formatRupees(balance))}
                action={t.todos.collectAction}
                onAction={() => onOpenCustomer(customer.id)}
              />
            );
          }
          const { customer, days } = todo;
          return (
            <Row
              key={`collect_${customer.id}`}
              icon={HandCoins}
              tone="bg-danger-soft text-danger"
              title={t.todos.collect(displayName(customer, language))}
              hint={t.todos.collectHint(formatRupees(customer.balance), days)}
              action={t.todos.collectAction}
              onAction={() => onOpenCustomer(customer.id)}
            />
          );
        })}
      </ul>
    </Card>
  );
}
