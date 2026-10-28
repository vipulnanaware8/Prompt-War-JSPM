// What the Telegram alert server needs to know about the shop (see functions/). Only this
// summary leaves the phone, and only after the owner turns alerts on — never the full ledger.

import { computeBalances, todayTotals } from './ledger.js';
import { dayKey } from './format.js';
import { openPromises } from './promises.js';

export const DEFAULT_ALERTS = {
  enabled: false,
  dailySummary: true,
  lowStock: true,
  promises: true,
  customerReminders: false,
  reminderEveryDays: 7,
};

/** Alert settings with defaults filled in. */
export function alertSettings(settings) {
  return { ...DEFAULT_ALERTS, ...settings.alerts };
}

/**
 * @param {import('../data/seed.js').ShopState} state
 * @param {Date} [now]
 */
export function buildAlertSnapshot(state, now = new Date()) {
  const balances = computeBalances(state.customers, state.transactions);
  const nameOf = (id) => state.customers.find((c) => c.id === id)?.name ?? '';
  const { sales, salesCount, cash, credit, collected } = todayTotals(state.transactions, now);

  return {
    shopName: state.settings.shopName,
    language: state.settings.language,
    upiId: state.settings.upiId ?? '',
    alerts: alertSettings(state.settings),
    day: dayKey(now),
    today: { sales, salesCount, cash, credit, collected },
    lowStock: state.items
      .filter((item) => item.stock <= item.reorderLevel)
      .map(({ id, name, stock, unit }) => ({ id, name, stock, unit })),
    promises: openPromises(state, balances).map((p) => ({
      customerId: p.customerId,
      name: nameOf(p.customerId),
      due: p.due,
      balance: balances[p.customerId],
    })),
    // Only customers who were sent a Telegram invite and owe something. The server reminds
    // only those who actually tapped Start on it.
    customers: state.customers
      .filter((c) => c.telegramInvited && balances[c.id] > 0)
      .map((c) => ({ id: c.id, name: c.name, balance: balances[c.id] })),
    updatedAt: now.toISOString(),
  };
}
