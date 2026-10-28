// Derived values (SRS 8.1). Balances are always computed from transactions, never stored.

import { dayKey, startOfDay } from '../lib/format.js';

const SALE_TYPES = ['credit_sale', 'cash_sale'];

/**
 * Balance of every customer: openingBalance + credit sales − payments.
 * @returns {Record<string, number>}
 */
export function selectBalances(state) {
  const balances = Object.fromEntries(state.customers.map((c) => [c.id, c.openingBalance]));
  for (const tx of state.transactions) {
    if (!tx.customerId || !(tx.customerId in balances)) continue;
    if (tx.type === 'credit_sale') balances[tx.customerId] += tx.amount;
    if (tx.type === 'payment') balances[tx.customerId] -= tx.amount;
  }
  return balances;
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
  const today = dayKey(now);
  const totals = { sales: 0, salesCount: 0, cash: 0 };
  for (const tx of state.transactions) {
    if (dayKey(tx.ts) !== today) continue;
    if (SALE_TYPES.includes(tx.type)) {
      totals.sales += tx.amount;
      totals.salesCount += 1;
    }
    if (tx.type === 'cash_sale' || tx.type === 'payment') totals.cash += tx.amount;
  }
  return totals;
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
