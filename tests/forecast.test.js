// Forecast tests — SRS Section 11.1 (forecast.test.js).
import { describe, expect, it } from 'vitest';
import { createSeedState } from '../src/data/seed.js';
import { avgDailySales, daysUntilEmpty, runningOut } from '../src/lib/forecast.js';

const NOW = new Date('2026-10-28T15:00:00');
const seed = createSeedState(NOW);

describe('forecast', () => {
  it('avgDailySales = units sold in the last 7 days ÷ 7', () => {
    expect(avgDailySales('maggi', seed.transactions, NOW)).toBe(3);
    expect(avgDailySales('poha', seed.transactions, NOW)).toBe(1);
  });

  it('ignores sales older than 7 days and stock-ins', () => {
    const old = {
      id: 'o',
      ts: '2026-10-01T10:00:00.000Z',
      type: 'cash_sale',
      lines: [{ itemId: 'besan', qty: 70 }],
      amount: 0,
    };
    const delivery = {
      id: 'd',
      ts: NOW.toISOString(),
      type: 'stock_in',
      lines: [{ itemId: 'besan', qty: 70 }],
      amount: 0,
    };
    expect(avgDailySales('besan', [old, delivery], NOW)).toBe(0);
  });

  it('daysUntilEmpty: Maggi 2 days, Poha 3 days', () => {
    const item = (id) => seed.items.find((i) => i.id === id);
    expect(daysUntilEmpty(item('maggi'), seed.transactions, NOW)).toBe(2);
    expect(daysUntilEmpty(item('poha'), seed.transactions, NOW)).toBe(3);
  });

  it('no sales → null (shown as "—")', () => {
    expect(daysUntilEmpty({ id: 'besan', stock: 7 }, [], NOW)).toBeNull();
  });

  it('runningOut lists Maggi then Poha', () => {
    expect(runningOut(seed.items, seed.transactions, NOW)).toEqual([
      { itemId: 'maggi', days: 2 },
      { itemId: 'poha', days: 3 },
    ]);
  });
});
