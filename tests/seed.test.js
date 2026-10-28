// Checks the seed matches SRS 8.2 / 8.3 so the dashboard and demo values are right.
import { describe, expect, it } from 'vitest';
import { createSeedState } from '../src/data/seed.js';
import { dayKey } from '../src/lib/format.js';
import {
  selectBalances,
  selectDailySales,
  selectLowStockItems,
  selectTodayTotals,
  selectTopDebtors,
} from '../src/store/selectors.js';

const NOW = new Date('2026-10-28T15:00:00');
const state = createSeedState(NOW);

describe('seed data', () => {
  it('is identical on every reset', () => {
    expect(createSeedState(NOW)).toEqual(state);
  });

  it('has 15 items, 6 customers and the opening balances', () => {
    expect(state.items).toHaveLength(15);
    expect(selectBalances(state)).toEqual({ c1: 240, c2: 650, c3: 120, c4: 0, c5: 480, c6: 90 });
  });

  it('starts with Maggi and Poha as the 2 low-stock items', () => {
    expect(selectLowStockItems(state).map((i) => i.id)).toEqual(['maggi', 'poha']);
  });

  it('top debtors are Sunita, Mohan, Ramesh', () => {
    expect(selectTopDebtors(state).map((c) => c.id)).toEqual(['c2', 'c5', 'c1']);
  });

  it('six previous days have 12–20 cash sales totalling ₹2,000–₹4,500 and one stock-in', () => {
    const days = selectDailySales(state, NOW);
    expect(days).toHaveLength(7);
    for (const day of days.slice(0, 6)) {
      const txs = state.transactions.filter((tx) => dayKey(tx.ts) === day.key);
      const sales = txs.filter((tx) => tx.type === 'cash_sale');
      expect(sales.length).toBeGreaterThanOrEqual(12);
      expect(sales.length).toBeLessThanOrEqual(20);
      expect(day.total).toBeGreaterThanOrEqual(2000);
      expect(day.total).toBeLessThanOrEqual(4500);
      expect(txs.filter((tx) => tx.type === 'stock_in')).toHaveLength(1);
    }
  });

  it('today has 4 small cash sales, none in the future', () => {
    const today = state.transactions.filter((tx) => dayKey(tx.ts) === dayKey(NOW));
    expect(today).toHaveLength(4);
    expect(today.every((tx) => new Date(tx.ts) <= NOW)).toBe(true);
    expect(selectTodayTotals(state, NOW)).toEqual({
      sales: 142,
      salesCount: 4,
      cash: 142,
      credit: 0,
      collected: 0,
    });
  });

  it('only Maggi (2 days) and Poha (3 days) run out within 3 days', () => {
    const sold = {};
    for (const tx of state.transactions) {
      if (tx.type !== 'cash_sale') continue;
      for (const line of tx.lines) sold[line.itemId] = (sold[line.itemId] || 0) + line.qty;
    }
    const days = Object.fromEntries(state.items.map((i) => [i.id, i.stock / (sold[i.id] / 7)]));
    expect(days.maggi).toBe(2);
    expect(days.poha).toBe(3);
    const runningOut = Object.keys(days).filter((id) => days[id] <= 3);
    expect(runningOut.sort()).toEqual(['maggi', 'poha']);
  });

  it('every subtotal is round(qty × price) and amount is their sum', () => {
    for (const tx of state.transactions) {
      for (const line of tx.lines) expect(line.subtotal).toBe(Math.round(line.qty * line.price));
      expect(tx.amount).toBe(tx.lines.reduce((sum, l) => sum + l.subtotal, 0));
    }
  });
});
