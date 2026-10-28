// Query tests — SRS Section 11.1 (queries.test.js).
import { describe, expect, it } from 'vitest';
import { createSeedState } from '../src/data/seed.js';
import { answerQuery } from '../src/lib/queries.js';
import { applyTransaction, buildTransaction } from '../src/lib/ledger.js';

const NOW = new Date('2026-10-28T15:00:00');
const seed = createSeedState(NOW);

describe('answerQuery', () => {
  it('top_debtor: Sunita at first, Mohan after demo phrases 1–2', () => {
    expect(answerQuery({ type: 'top_debtor' }, seed, NOW)).toEqual({
      type: 'top_debtor',
      customerId: 'c2',
      name: 'Sunita Jadhav',
      balance: 650,
    });
    let state = seed;
    for (const draft of [
      {
        intent: 'credit_sale',
        customerId: 'c1',
        lines: [
          { itemId: 'sugar', qty: 2 },
          { itemId: 'parleg', qty: 1 },
        ],
      },
      { intent: 'payment', customerId: 'c2', amount: 200 },
    ]) {
      state = applyTransaction(
        state,
        buildTransaction(draft, state.items, { id: draft.intent, now: NOW }),
      );
    }
    expect(answerQuery({ type: 'top_debtor' }, state, NOW)).toMatchObject({
      name: 'Mohan Deshmukh',
      balance: 480,
    });
  });

  it('today_sales matches the dashboard', () => {
    expect(answerQuery({ type: 'today_sales' }, seed, NOW)).toEqual({
      type: 'today_sales',
      total: 142,
      count: 4,
    });
  });

  it('item_stock gives stock with unit', () => {
    expect(answerQuery({ type: 'item_stock', itemId: 'maggi' }, seed, NOW)).toEqual({
      type: 'item_stock',
      itemId: 'maggi',
      name: 'Maggi',
      stock: 6,
      unit: 'packet',
    });
  });

  it('customer_balance gives the balance', () => {
    expect(answerQuery({ type: 'customer_balance', customerId: 'c1' }, seed, NOW)).toMatchObject({
      name: 'Ramesh Patil',
      balance: 240,
    });
  });

  it('running_out lists up to 3 items', () => {
    expect(answerQuery({ type: 'running_out' }, seed, NOW)).toEqual({
      type: 'running_out',
      items: [
        { itemId: 'maggi', days: 2, name: 'Maggi' },
        { itemId: 'poha', days: 3, name: 'Poha' },
      ],
    });
  });

  it('no customers → friendly "no debtors" answer', () => {
    expect(answerQuery({ type: 'top_debtor' }, { ...seed, customers: [] }, NOW)).toEqual({
      type: 'no_debtors',
    });
  });

  it('unknown question → unsupported', () => {
    expect(answerQuery(null, seed, NOW)).toEqual({ type: 'unsupported' });
  });
});
