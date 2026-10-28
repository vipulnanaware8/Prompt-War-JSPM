// Promises to pay ("Ramesh Sunday ko dega"). A promise is kept once that customer pays after
// making it, or their dues are cleared — so nothing extra has to be ticked off.

import { computeBalances } from './ledger.js';
import { dayKey, startOfDay } from './format.js';

const DAY = 86400000;

/**
 * Due date for a spoken day. A weekday means the next one; today's weekday means a week from now.
 * @param {{ days: number } | { weekday: number }} when
 * @param {Date} [now]
 * @returns {string} day key
 */
export function resolveDue(when, now = new Date()) {
  const days = 'weekday' in when ? (when.weekday - now.getDay() + 7) % 7 || 7 : when.days;
  return dayKey(new Date(startOfDay(now).getTime() + days * DAY + 12 * 60 * 60 * 1000));
}

/** Whole days from today until a due day key (negative = overdue). */
export function daysUntil(due, now = new Date()) {
  const [y, m, d] = due.split('-').map(Number);
  return Math.round((new Date(y, m - 1, d).getTime() - startOfDay(now).getTime()) / DAY);
}

/** @returns {{ id: string, customerId: string, due: string, amount: number|null, createdAt: string }} */
export function buildPromise({ customerId, when, amount }, { id, now = new Date() }) {
  return { id, customerId, due: resolveDue(when, now), amount, createdAt: now.toISOString() };
}

/**
 * Promises not yet kept (customer still owes and has not paid since promising), any due date.
 * @returns {object[]}
 */
export function openPromises(
  state,
  balances = computeBalances(state.customers, state.transactions),
) {
  return (state.promises ?? [])
    .filter((p) => balances[p.customerId] > 0)
    .filter(
      (p) =>
        !state.transactions.some(
          (tx) => tx.type === 'payment' && tx.customerId === p.customerId && tx.ts >= p.createdAt,
        ),
    );
}

/**
 * Promises not yet kept that are due today or earlier, most overdue first.
 * @returns {Array<{ promise: object, customer: object, balance: number, days: number }>}
 */
export function duePromises(state, now = new Date()) {
  const balances = computeBalances(state.customers, state.transactions);
  return openPromises(state, balances)
    .filter((p) => daysUntil(p.due, now) <= 0)
    .map((p) => ({
      promise: p,
      customer: state.customers.find((c) => c.id === p.customerId),
      balance: balances[p.customerId],
      days: daysUntil(p.due, now),
    }))
    .filter((row) => row.customer)
    .sort((a, b) => a.days - b.days);
}
