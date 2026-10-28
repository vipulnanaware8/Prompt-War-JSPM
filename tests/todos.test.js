// Dashboard to-dos and the "vs yesterday" comparison (selectors.js).
import { describe, expect, it } from 'vitest';
import { createSeedState } from '../src/data/seed.js';
import { selectTodos, selectYesterdaySalesSoFar } from '../src/store/selectors.js';

const NOW = new Date('2026-10-28T15:00:00');
// Without the seeded promise, so these tests cover only restock and collect.
const seed = { ...createSeedState(NOW), promises: [] };

describe('selectTodos', () => {
  it('seed: Maggi and Poha to restock, then the two biggest unpaid udhaar', () => {
    const todos = selectTodos(seed, NOW);
    expect(todos.map((t) => t.item?.id ?? t.customer.id)).toEqual(['maggi', 'poha', 'c2', 'c5']);
    expect(todos.map((t) => t.days)).toEqual([2, 3, 3, 5]);
  });

  it('skips udhaar paid in the last 3 days and balances under ₹100', () => {
    const paid = {
      id: 'p',
      ts: new Date('2026-10-27T10:00:00').toISOString(),
      type: 'payment',
      customerId: 'c2',
      amount: 50,
    };
    const ids = selectTodos({ ...seed, transactions: [...seed.transactions, paid] }, NOW).map(
      (t) => t.customer?.id,
    );
    expect(ids).not.toContain('c2'); // Sunita paid yesterday
    expect(ids).not.toContain('c6'); // Kavita owes ₹90
  });

  it('one kind fills the places the other does not need', () => {
    const noDebts = {
      ...seed,
      customers: seed.customers.map((c) => ({ ...c, openingBalance: 0 })),
    };
    expect(selectTodos(noDebts, NOW, 1).map((t) => t.kind)).toEqual(['restock']);
    const noStockWorries = { ...seed, items: seed.items.map((i) => ({ ...i, stock: 1000 })) };
    expect(selectTodos(noStockWorries, NOW).map((t) => t.kind)).toEqual([
      'collect',
      'collect',
      'collect',
    ]);
  });
});

describe('selectYesterdaySalesSoFar', () => {
  it('counts only yesterday up to the same time of day', () => {
    const at = (iso, amount) => ({
      id: iso,
      ts: new Date(iso).toISOString(),
      type: 'cash_sale',
      amount,
    });
    const state = {
      transactions: [
        at('2026-10-27T09:00:00', 100), // yesterday morning — counted
        at('2026-10-27T14:59:00', 50), // just before this time yesterday — counted
        at('2026-10-27T18:00:00', 999), // yesterday evening — later than now, not counted
        at('2026-10-26T12:00:00', 999), // two days ago
        at('2026-10-28T10:00:00', 999), // today
      ],
    };
    expect(selectYesterdaySalesSoFar(state, NOW)).toBe(150);
  });
});
