// Telegram alerts (free): link the owner's Telegram, then choose which alerts arrive
// automatically. Linking works by the owner tapping Start on a one-time bot link in their own
// Telegram (functions/index.js matches the code).
import { useEffect, useId, useState } from 'react';
import { CheckCircle2, Send } from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { alertSettings } from '../../lib/alertSnapshot.js';
import {
  botLink,
  cloudConfigured,
  disconnectAlerts,
  newConnectCode,
  registerConnectCode,
  watchConnection,
} from '../../lib/cloud.js';
import { useShop, useShopDispatch, useStrings } from '../../store/ShopContext.jsx';

const EVERY_DAYS = [3, 7, 15];

// Each switch's strings live at t.alerts[key] and t.alerts[`${key}Help`].
const ALERT_TOGGLES = ['dailySummary', 'lowStock', 'promises', 'customerReminders'];

function Toggle({ label, help, checked, onChange }) {
  const helpId = useId();
  return (
    <label className="flex min-h-11 cursor-pointer items-center justify-between gap-4">
      <span>
        <span className="block text-body font-semibold">{label}</span>
        <span id={helpId} className="block text-small text-muted">
          {help}
        </span>
      </span>
      <input
        type="checkbox"
        role="switch"
        aria-label={label}
        aria-describedby={helpId}
        checked={checked}
        onChange={onChange}
        className="size-6 shrink-0 cursor-pointer accent-primary"
      />
    </label>
  );
}

export function AlertsCard() {
  const t = useStrings();
  const alerts = useShop((s) => alertSettings(s.settings));
  const dispatch = useShopDispatch();
  const { showToast } = useToast();
  const [connection, setConnection] = useState(null);
  const [waiting, setWaiting] = useState(false);

  // Follow the link status while alerts are on; the webhook writes it when the code arrives.
  useEffect(() => {
    if (!cloudConfigured || !alerts.enabled) return undefined;
    let unsubscribe = () => {};
    let active = true;
    watchConnection((data) => {
      setConnection(data);
      if (data) setWaiting(false);
    })
      .then((stop) => (active ? (unsubscribe = stop) : stop()))
      .catch((error) => console.error('Alerts status failed', error));
    return () => {
      active = false;
      unsubscribe();
    };
  }, [alerts.enabled]);

  function update(changes) {
    dispatch({ type: 'UPDATE_SETTINGS', payload: { alerts: { ...alerts, ...changes } } });
  }

  function connect() {
    // Open Telegram first, inside the tap, so the browser does not block the new tab.
    const code = newConnectCode();
    window.open(botLink(code), '_blank', 'noopener');
    setWaiting(true);
    update({ enabled: true });
    registerConnectCode(code).catch(() => {
      setWaiting(false);
      showToast({ type: 'error', message: t.alerts.failed });
    });
  }

  async function disconnect() {
    update({ enabled: false }); // stops uploads before the data is deleted
    try {
      await disconnectAlerts();
      setConnection(null);
      showToast({ type: 'success', message: t.alerts.disconnected });
    } catch {
      showToast({ type: 'error', message: t.alerts.failed });
    }
  }

  if (!cloudConfigured) {
    return (
      <Card title={t.alerts.title}>
        <p className="text-small text-muted">{t.alerts.notConfigured}</p>
      </Card>
    );
  }

  const connected = alerts.enabled && connection;

  return (
    <Card title={t.alerts.title}>
      {!connected ? (
        <div className="flex flex-col gap-4">
          <p className="text-body">{t.alerts.intro}</p>
          {waiting && (
            <p
              className="rounded-lg bg-info-soft p-3 text-small font-medium text-info"
              role="status"
            >
              {t.alerts.waiting}
            </p>
          )}
          <Button onClick={connect} className="self-start">
            <Send size={20} aria-hidden="true" />
            {t.alerts.connect}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <p className="flex items-center gap-2 rounded-lg bg-success-soft p-3 text-small font-medium text-success">
            <CheckCircle2 size={20} aria-hidden="true" />
            {t.alerts.connected(connection.name)}
          </p>
          {ALERT_TOGGLES.map((key) => (
            <Toggle
              key={key}
              label={t.alerts[key]}
              help={t.alerts[`${key}Help`]}
              checked={alerts[key]}
              onChange={() => update({ [key]: !alerts[key] })}
            />
          ))}
          {alerts.customerReminders && (
            <label className="flex flex-col gap-1 text-small font-medium text-muted">
              {t.alerts.everyDays}
              <select
                value={alerts.reminderEveryDays}
                onChange={(e) => update({ reminderEveryDays: Number(e.target.value) })}
                className="min-h-11 rounded-md border border-border bg-surface px-3 text-body text-ink"
              >
                {EVERY_DAYS.map((n) => (
                  <option key={n} value={n}>
                    {t.alerts.everyDaysOption(n)}
                  </option>
                ))}
              </select>
            </label>
          )}
          <Button variant="secondary" onClick={disconnect} className="self-start">
            {t.alerts.disconnect}
          </Button>
        </div>
      )}
    </Card>
  );
}
