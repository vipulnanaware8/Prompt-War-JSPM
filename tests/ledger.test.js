// Ledger tests — SRS Section 11.1 (ledger.test.js).
import { describe, expect, it } from 'vitest';
import { createSeedState } from '../src/data/seed.js';
import {
  applyTransaction,
  balanceAfter,
  buildTransaction,
  computeBalances,
  lineSubtotal,
  stockWarnings,
  todayTotals,
  undoLast,
} from '../src/lib/ledger.js';

const NOW = new Date('2026-10-28T15:00:00');
const seed = createSeedState(NOW);
const stockOf = (state, id) => state.items.find((i) => i.id === id).stock;
const balanceOf = (state, id) => computeBalances(state.customers, state.transactions)[id];
const confirm = (state, draft, id = 't_new') =>
  applyTransaction(state, buildTransaction(draft, state.items, { id, now: NOW }));

describe('ledger', () => {
  it('credit sale updates stock and balance (demo 1: Ramesh ₹240 → ₹340)', () => {
    const draft = {
      intent: 'credit_sale',
      customerId: 'c1',
      lines: [
        { itemId: 'sugar', qty: 2 },
        { itemId: 'parleg', qty: 1 },
      ],
    };
    const tx = buildTransaction(draft, seed.items, { id: 't_x', now: NOW });
    expect(tx).toMatchObject({ id: 't_x', type: 'credit_sale', customerId: 'c1', amount: 100 });
    expect(tx.lines).toEqual([
      { itemId: 'sugar', qty: 2, unit: 'kg', price: 45, subtotal: 90 },
      { itemId: 'parleg', qty: 1, unit: 'packet', price: 10, subtotal: 10 },
    ]);
    const after = applyTransaction(seed, tx);
    expect(balanceOf(after, 'c1')).toBe(340);
    expect(stockOf(after, 'sugar')).toBe(23);
    expect(stockOf(after, 'parleg')).toBe(39);
    expect(after.transactions.at(-1)).toBe(tx);
  });

  it('cash sale lowers stock and adds to cash collected (demo 4)', () => {
    const after = confirm(seed, { intent: 'cash_sale', lines: [{ itemId: 'maggi', qty: 3 }] });
    expect(after.transactions.at(-1).amount).toBe(42);
    expect(stockOf(after, 'maggi')).toBe(3);
    expect(todayTotals(after.transactions, NOW).cash).toBe(
      todayTotals(seed.transactions, NOW).cash + 42,
    );
  });

  it('payment lowers the balance and adds to cash (demo 2: Sunita ₹650 → ₹450)', () => {
    const after = confirm(seed, { intent: 'payment', customerId: 'c2', amount: 200 });
    expect(balanceOf(after, 'c2')).toBe(450);
    expect(todayTotals(after.transactions, NOW).cash).toBe(142 + 200);
    expect(todayTotals(after.transactions, NOW).sales).toBe(142); // payments are not sales
  });

  it('payment above the balance becomes an advance (negative balance)', () => {
    const after = confirm(seed, { intent: 'payment', customerId: 'c6', amount: 150 });
    expect(balanceOf(after, 'c6')).toBe(-60);
    expect(balanceAfter(90, { type: 'payment', amount: 150 })).toBe(-60);
  });

  it('stock in adds stock (demo 3: Maggi 6 → 16)', () => {
    const after = confirm(seed, { intent: 'stock_in', lines: [{ itemId: 'maggi', qty: 10 }] });
    expect(stockOf(after, 'maggi')).toBe(16);
    expect(todayTotals(after.transactions, NOW)).toEqual(todayTotals(seed.transactions, NOW));
  });

  it('subtotal rounds to whole rupees: 0.5 × ₹45 = ₹23', () => {
    expect(lineSubtotal(0.5, 45)).toBe(23);
    const tx = buildTransaction(
      { intent: 'cash_sale', lines: [{ itemId: 'sugar', qty: 0.5 }] },
      seed.items,
      { id: 't', now: NOW },
    );
    expect(tx.amount).toBe(23);
  });

  it('amount-only udhaar has no lines and the spoken amount', () => {
    const after = confirm(seed, {
      intent: 'credit_sale',
      customerId: 'c1',
      lines: [],
      amount: 100,
    });
    expect(after.transactions.at(-1)).toMatchObject({ lines: [], amount: 100 });
    expect(balanceOf(after, 'c1')).toBe(340);
  });

  it.each([
    [
      'credit sale',
      { intent: 'credit_sale', customerId: 'c1', lines: [{ itemId: 'sugar', qty: 1.5 }] },
    ],
    ['cash sale', { intent: 'cash_sale', lines: [{ itemId: 'maggi', qty: 8 }] }],
    ['payment', { intent: 'payment', customerId: 'c2', amount: 200 }],
    ['stock in', { intent: 'stock_in', lines: [{ itemId: 'poha', qty: 2.5 }] }],
  ])('undo reverses a %s exactly', (_, draft) => {
    const after = confirm(seed, draft, 't_undo');
    expect(undoLast(after, 't_undo')).toEqual(seed);
  });

  it('undo only removes the latest transaction', () => {
    const one = confirm(seed, { intent: 'payment', customerId: 'c2', amount: 100 }, 't_a');
    const two = confirm(one, { intent: 'payment', customerId: 'c2', amount: 50 }, 't_b');
    expect(undoLast(two, 't_a')).toBe(two);
    expect(undoLast(two, 't_b')).toEqual(one);
  });

  it('sale above stock returns a warning (and is still allowed)', () => {
    const lines = [{ itemId: 'maggi', qty: 8 }];
    expect(stockWarnings('cash_sale', lines, seed.items)).toEqual([
      { itemId: 'maggi', stock: 6, unit: 'packet' },
    ]);
    expect(stockWarnings('stock_in', lines, seed.items)).toEqual([]);
    expect(stockOf(confirm(seed, { intent: 'cash_sale', lines }), 'maggi')).toBe(-2);
  });
});
