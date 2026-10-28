// Reducer, selectors, storage probing, formatting and query edge cases.
import { afterEach, describe, expect, it } from 'vitest';
import { createSeedState } from '../src/data/seed.js';
import { relativeTime, displayName, formatQty, formatRupees } from '../src/lib/format.js';
import { answerQuery } from '../src/lib/queries.js';
import { balanceAfter, buildCustomer, stockWarnings } from '../src/lib/ledger.js';
import { buildReminder, isValidUpiId, upiLink } from '../src/lib/reminders.js';
import { getBrowserStorage } from '../src/store/persistence.js';
import { shopReducer } from '../src/store/reducer.js';
import {
  selectCustomerTransactions,
  selectCustomersMatching,
  selectDailySales,
  selectItemsWithForecast,
  selectRecentTransactions,
  selectTopDebtors,
  selectUdhaarPending,
} from '../src/store/selectors.js';

const NOW = new Date('2026-10-28T15:00:00');
const seed = createSeedState(NOW);

describe('shopReducer', () => {
  it('adds and updates customers', () => {
    const customer = buildCustomer(
      { name: '  Asha   Devi ', alias: 'आशा' },
      { id: 'c9', now: NOW },
    );
    expect(customer).toEqual({
      id: 'c9',
      name: 'Asha Devi',
      aliases: ['asha devi', 'asha', 'आशा'],
      openingBalance: 0,
      createdAt: NOW.toISOString(),
    });
    const added = shopReducer(seed, { type: 'ADD_CUSTOMER', payload: customer });
    expect(added.customers.at(-1)).toBe(customer);
    const updated = shopReducer(added, {
      type: 'UPDATE_CUSTOMER',
      payload: { id: 'c9', changes: { telegramInvited: true } },
    });
    expect(updated.customers.at(-1).telegramInvited).toBe(true);
    expect(updated.customers[0]).toBe(seed.customers[0]); // others untouched
  });

  it('keeps one promise per customer and removes by id', () => {
    const first = { id: 'p1', customerId: 'c1', due: '2026-11-01' };
    const second = { id: 'p2', customerId: 'c1', due: '2026-11-02' };
    let state = shopReducer(
      { ...seed, promises: undefined },
      { type: 'ADD_PROMISE', payload: first },
    );
    state = shopReducer(state, { type: 'ADD_PROMISE', payload: second });
    expect(state.promises).toEqual([second]);
    expect(shopReducer(state, { type: 'REMOVE_PROMISE', payload: 'p2' }).promises).toEqual([]);
    expect(
      shopReducer({ ...seed, promises: undefined }, { type: 'REMOVE_PROMISE', payload: 'x' })
        .promises,
    ).toEqual([]);
  });

  it('sets a price, merges settings, resets, and ignores unknown actions', () => {
    const itemId = seed.items[0].id;
    const priced = shopReducer(seed, { type: 'SET_PRICE', payload: { itemId, price: 99 } });
    expect(priced.items[0].price).toBe(99);
    expect(priced.items[1]).toBe(seed.items[1]);
    const renamed = shopReducer(seed, { type: 'UPDATE_SETTINGS', payload: { shopName: 'Naya' } });
    expect(renamed.settings).toEqual({ ...seed.settings, shopName: 'Naya' });
    const fresh = createSeedState(NOW);
    expect(shopReducer(priced, { type: 'RESET', payload: fresh })).toBe(fresh);
    expect(shopReducer(seed, { type: 'NOPE' })).toBe(seed);
  });
});

describe('selectors', () => {
  it('lists debtors, total udhaar and search results', () => {
    const top = selectTopDebtors(seed, 2);
    expect(top).toHaveLength(2);
    expect(top[0].balance).toBeGreaterThanOrEqual(top[1].balance);
    expect(top.every((c) => c.balance > 0)).toBe(true);
    const pending = selectUdhaarPending(seed);
    expect(pending).toBeGreaterThanOrEqual(top[0].balance + top[1].balance);

    const name = seed.customers[0].name;
    expect(selectCustomersMatching(seed, name.slice(0, 3)).map((c) => c.id)).toContain(
      seed.customers[0].id,
    );
    expect(selectCustomersMatching(seed, '')).toHaveLength(seed.customers.length);
    expect(selectCustomersMatching(seed, 'zzzz')).toEqual([]);
  });

  it('builds seven days of sales ending today', () => {
    const days = selectDailySales(seed, NOW);
    expect(days).toHaveLength(7);
    expect(days.at(-1)).toMatchObject({ key: '2026-10-28', isToday: true });
    expect(days.filter((d) => d.isToday)).toHaveLength(1);
    expect(days.every((d) => d.total >= 0)).toBe(true);
  });

  it('sorts recent and per-customer transactions newest first', () => {
    const recent = selectRecentTransactions(seed, 3);
    expect(recent).toHaveLength(3);
    expect(recent[0].ts >= recent[1].ts && recent[1].ts >= recent[2].ts).toBe(true);
    const customerId = seed.customers[0].id;
    const withKhata = {
      ...seed,
      transactions: [
        ...seed.transactions,
        { id: 'k1', type: 'credit_sale', customerId, amount: 10, ts: '2026-10-27T10:00:00Z' },
        { id: 'k2', type: 'payment', customerId, amount: 5, ts: '2026-10-28T10:00:00Z' },
      ],
    };
    const own = selectCustomerTransactions(withKhata, customerId, 50);
    expect(own.map((tx) => tx.id)).toEqual(['k2', 'k1']);
    expect(own.every((tx) => tx.customerId === customerId)).toBe(true);
  });

  it('adds a forecast to every item', () => {
    const items = selectItemsWithForecast(seed, NOW);
    expect(items).toHaveLength(seed.items.length);
    expect(items.every((i) => 'daysLeft' in i)).toBe(true);
  });
});

describe('ledger helpers', () => {
  it('changes the balance only for udhaar and payments', () => {
    expect(balanceAfter(100, { type: 'credit_sale', amount: 40 })).toBe(140);
    expect(balanceAfter(100, { type: 'payment', amount: 150 })).toBe(-50);
    expect(balanceAfter(100, { type: 'cash_sale', amount: 40 })).toBe(100);
  });

  it('warns only for sales that ask for more than the stock', () => {
    const item = seed.items[0];
    const lines = [
      { itemId: item.id, qty: item.stock + 1 },
      { itemId: 'missing', qty: 99 },
    ];
    expect(stockWarnings('cash_sale', lines, seed.items)).toEqual([
      { itemId: item.id, stock: item.stock, unit: item.unit },
    ]);
    expect(stockWarnings('stock_in', lines, seed.items)).toEqual([]);
  });
});

describe('reminders', () => {
  const customer = { name: 'Ramesh Patil', aliases: ['ramesh', 'रमेश'], balance: 340 };

  it('adds a UPI line and link only when a UPI id is set', () => {
    expect(buildReminder('hinglish', customer, 'Sharma Store')).not.toContain('upi://');
    const withUpi = buildReminder('hi', customer, 'Sharma Store', 'sharma@okaxis');
    expect(withUpi).toContain('रमेश');
    expect(withUpi).toContain('UPI से भेजें: sharma@okaxis');
    expect(withUpi).toContain(upiLink('sharma@okaxis', 'Sharma Store', 340));
  });

  it('falls back to Hinglish for an unknown language', () => {
    expect(buildReminder('xx', customer, 'S', 'a@b')).toMatch(/^Namaste Ramesh ji[\s\S]*UPI se/);
  });

  it('builds UPI links and checks ids loosely', () => {
    expect(upiLink('a@b', 'My Shop', 50)).toBe('upi://pay?pa=a%40b&pn=My+Shop&am=50&cu=INR');
    expect(isValidUpiId('sharma.store@okaxis')).toBe(true);
    expect(isValidUpiId('no spaces@ok')).toBe(false);
    expect(isValidUpiId('missing-at')).toBe(false);
  });
});

describe('format', () => {
  it('formats rupees and quantities', () => {
    expect(formatRupees(123456)).toBe('₹1,23,456');
    expect(formatRupees(-49.6)).toBe('-₹50');
    expect(formatQty(0.333, 'kg')).toBe('0.33 kg');
    expect(formatQty(2, 'packet')).toBe('2 packet');
  });

  it('describes how long ago something happened', () => {
    const at = (iso) => relativeTime(iso, NOW);
    expect(at('2026-10-28T14:59:30')).toEqual({ key: 'justNow', n: 0 });
    expect(at('2026-10-28T14:20:00')).toEqual({ key: 'minutes', n: 40 });
    expect(at('2026-10-28T11:00:00')).toEqual({ key: 'hours', n: 4 });
    expect(at('2026-10-27T21:00:00')).toEqual({ key: 'days', n: 1 }); // yesterday reads "Kal"
    expect(at('2026-10-25T15:00:00')).toEqual({ key: 'days', n: 3 });
  });

  it('picks the name to show for each language', () => {
    const customer = { name: 'Ramesh Patil', aliases: ['ramesh', 'रमेश'] };
    expect(displayName(customer, 'hinglish')).toBe('Ramesh');
    expect(displayName(customer, 'mr')).toBe('रमेश');
    expect(displayName({ name: 'Asha Devi', aliases: ['asha'] }, 'hi')).toBe('Asha');
    expect(displayName(null, 'hi')).toBe('');
  });
});

describe('answerQuery edge cases', () => {
  it('answers unknown items, customers and questions as unsupported', () => {
    expect(answerQuery({ type: 'item_stock', itemId: 'nope' }, seed, NOW)).toEqual({
      type: 'unsupported',
    });
    expect(answerQuery({ type: 'customer_balance', customerId: 'nope' }, seed, NOW)).toEqual({
      type: 'unsupported',
    });
    expect(answerQuery(null, seed, NOW)).toEqual({ type: 'unsupported' });
  });

  it('says nobody owes money when every balance is clear', () => {
    const clear = {
      ...seed,
      transactions: [],
      customers: seed.customers.map((c) => ({ ...c, openingBalance: 0 })),
    };
    expect(answerQuery({ type: 'top_debtor' }, clear, NOW)).toEqual({ type: 'no_debtors' });
  });

  it('lists at most three items running out, with names', () => {
    const answer = answerQuery({ type: 'running_out' }, seed, NOW);
    expect(answer.type).toBe('running_out');
    expect(answer.items.length).toBeLessThanOrEqual(3);
    expect(answer.items.every((i) => typeof i.name === 'string' && i.days >= 0)).toBe(true);
  });
});

describe('getBrowserStorage', () => {
  const real = globalThis.localStorage;
  afterEach(() => {
    globalThis.localStorage = real;
  });

  it('returns working storage', () => {
    const data = {};
    globalThis.localStorage = {
      setItem: (k, v) => (data[k] = v),
      removeItem: (k) => delete data[k],
    };
    expect(getBrowserStorage()).toBe(globalThis.localStorage);
    expect(data).toEqual({}); // the probe is cleaned up
  });

  it('returns null when storage is blocked', () => {
    globalThis.localStorage = {
      setItem: () => {
        throw new Error('blocked');
      },
    };
    expect(getBrowserStorage()).toBeNull();
  });
});
