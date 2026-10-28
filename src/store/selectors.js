// Derived values (SRS 8.1). Balances are always computed from transactions, never stored.

import { dayKey, startOfDay } from '../lib/format.js';
import { computeBalances, todayTotals } from '../lib/ledger.js';
import { daysUntilEmpty } from '../lib/forecast.js';
import { normalize } from '../lib/parser/normalize.js';

const SALE_TYPES = ['credit_sale', 'cash_sale'];

/**
 * Balance of every customer: openingBalance + credit sales − payments.
 * @returns {Record<string, number>}
 */
export function selectBalances(state) {
  return computeBalances(state.customers, state.transactions);
}

/** Customers with balance and last activity, highest balance first. */
export function selectCustomersByBalance(state) {
  const balances = selectBalances(state);
  const lastActivity = {};
  for (const tx of state.transactions) {
    if (tx.customerId && (!lastActivity[tx.customerId] || tx.ts > lastActivity[tx.customerId])) {
      lastActivity[tx.customerId] = tx.ts;
    }
  }
  return state.customers
    .map((c) => ({
      ...c,
      balance: balances[c.id],
      lastActivity: lastActivity[c.id] || c.createdAt,
    }))
    .sort((a, b) => b.balance - a.balance);
}

/** Top customers who owe money (FR-DASH-5). */
export function selectTopDebtors(state, count = 3) {
  return selectCustomersByBalance(state)
    .filter((c) => c.balance > 0)
    .slice(0, count);
}

/** Total udhaar still to be collected (advances are not subtracted). */
export function selectUdhaarPending(state) {
  return Object.values(selectBalances(state)).reduce((sum, b) => sum + Math.max(0, b), 0);
}

/** Today's sales and cash, matching SRS 8.1. */
export function selectTodayTotals(state, now = new Date()) {
  return todayTotals(state.transactions, now);
}

/** Items at or below their reorder level (FR-STOCK-2). */
export function selectLowStockItems(state) {
  return state.items.filter((item) => item.stock <= item.reorderLevel);
}

/** Sales per day for the last `days` days, oldest first (FR-DASH-4). */
export function selectDailySales(state, now = new Date(), days = 7) {
  const todayStart = startOfDay(now);
  const result = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(todayStart);
    date.setDate(date.getDate() - i);
    result.push({ key: dayKey(date), date, total: 0, isToday: i === 0 });
  }
  const byKey = Object.fromEntries(result.map((d) => [d.key, d]));
  for (const tx of state.transactions) {
    const day = byKey[dayKey(tx.ts)];
    if (day && SALE_TYPES.includes(tx.type)) day.total += tx.amount;
  }
  return result;
}

/** Newest transactions first (FR-DASH-6). */
export function selectRecentTransactions(state, count = 5) {
  return [...state.transactions].sort((a, b) => (a.ts < b.ts ? 1 : -1)).slice(0, count);
}

/** Customers whose name or any alias (Latin or Devanagari) contains the search text. */
export function selectCustomersMatching(state, query) {
  const needle = normalize(query);
  const all = selectCustomersByBalance(state);
  if (!needle) return all;
  return all.filter((c) => [c.name, ...c.aliases].some((name) => normalize(name).includes(needle)));
}

/** Items with "runs out in N days" (null when there were no sales) — FR-STOCK-3. */
export function selectItemsWithForecast(state, now = new Date()) {
  return state.items.map((item) => ({
    ...item,
    daysLeft: daysUntilEmpty(item, state.transactions, now),
  }));
}

/** A customer's latest transactions, newest first (FR-KHATA-2). */
export function selectCustomerTransactions(state, customerId, count = 10) {
  return state.transactions
    .filter((tx) => tx.customerId === customerId)
    .sort((a, b) => (a.ts < b.ts ? 1 : -1))
    .slice(0, count);
}
