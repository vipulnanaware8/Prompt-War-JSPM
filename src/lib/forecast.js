// Stock forecast (FR-STOCK-3): how many days until an item runs out.

import { startOfDay } from './format.js';

const DAY = 86400000;

/**
 * Average units sold per day over the last 7 days (today and the 6 days before).
 * @param {string} itemId
 * @param {Array<object>} transactions
 * @param {Date} [now]
 * @returns {number}
 */
export function avgDailySales(itemId, transactions, now = new Date()) {
  const from = startOfDay(now).getTime() - 6 * DAY;
  let units = 0;
  for (const tx of transactions) {
    if (tx.type !== 'credit_sale' && tx.type !== 'cash_sale') continue;
    if (new Date(tx.ts).getTime() < from) continue;
    for (const line of tx.lines ?? []) if (line.itemId === itemId) units += line.qty;
  }
  return units / 7;
}

/**
 * Whole days until the item runs out; null when it has not sold (shown as "—").
 * @param {{ id: string, stock: number }} item
 * @param {Array<object>} transactions
 * @param {Date} [now]
 * @returns {number|null}
 */
export function daysUntilEmpty(item, transactions, now = new Date()) {
  const perDay = avgDailySales(item.id, transactions, now);
  if (perDay <= 0) return null;
  return Math.max(0, Math.floor(item.stock / perDay));
}

/**
 * Items that run out within `withinDays`, soonest first.
 * @returns {Array<{ itemId: string, days: number }>}
 */
export function runningOut(items, transactions, now = new Date(), withinDays = 3) {
  return items
    .map((item) => ({ itemId: item.id, days: daysUntilEmpty(item, transactions, now) }))
    .filter(({ days }) => days !== null && days <= withinDays)
    .sort((a, b) => a.days - b.days);
}
