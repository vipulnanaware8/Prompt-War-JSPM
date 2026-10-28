// Promises to pay, the end-of-day summary and the UPI reminder line.
import { describe, expect, it } from 'vitest';
import { createSeedState } from '../src/data/seed.js';
import { parseCommand } from '../src/lib/parser/index.js';
import { buildPromise, duePromises, resolveDue } from '../src/lib/promises.js';
import { answerQuery } from '../src/lib/queries.js';
import { buildReminder, isValidUpiId } from '../src/lib/reminders.js';
import { shopReducer } from '../src/store/reducer.js';
import { selectTodos } from '../src/store/selectors.js';

const NOW = new Date('2026-10-28T15:00:00'); // a Wednesday
const seed = createSeedState(NOW);
const parse = (text) => parseCommand(text, seed);

describe('promise parsing', () => {
  it.each([
    ['Mohan Sunday ko dega', 'c5', { weekday: 0 }],
    ['Ramesh kal dega', 'c1', { days: 1 }],
    ['रमेश परसों देगा', 'c1', { days: 2 }],
    ['सुनीता रविवारी देईल', 'c2', { weekday: 0 }],
    ['Anil dega', 'c3', { days: 1 }],
  ])('%s', (text, customerId, promiseDay) => {
    const r = parse(text);
    expect([r.intent, r.customer?.id, r.promiseDay]).toEqual(['promise', customerId, promiseDay]);
  });

  it('keeps an amount if one is said', () => {
    expect(parse('Ramesh 200 rupaye kal dega').amount).toBe(200);
  });

  it('a question is not a promise', () => {
    expect(parse('Ramesh kab dega?').intent).toBe('query');
  });
});

describe('due dates', () => {
  it('weekday means the next one; the same weekday means next week', () => {
    expect(resolveDue({ weekday: 0 }, NOW)).toBe('2026-11-01');
    expect(resolveDue({ weekday: 3 }, NOW)).toBe('2026-11-04');
    expect(resolveDue({ days: 0 }, NOW)).toBe('2026-10-28');
  });
});

describe('duePromises', () => {
  it('seed: Sunita promised to pay today and is on the to-do list first', () => {
    expect(duePromises(seed, NOW).map((r) => [r.customer.id, r.days])).toEqual([['c2', 0]]);
    expect(selectTodos(seed, NOW)[0]).toMatchObject({ kind: 'promise', customer: { id: 'c2' } });
  });

  it('a payment after the promise keeps it', () => {
    const paid = {
      id: 'tp',
      ts: NOW.toISOString(),
      type: 'payment',
      customerId: 'c2',
      amount: 200,
    };
    expect(duePromises({ ...seed, transactions: [...seed.transactions, paid] }, NOW)).toEqual([]);
  });

  it('future promises are not due yet; a new one replaces the old', () => {
    const p = buildPromise(
      { customerId: 'c2', when: { days: 1 }, amount: null },
      { id: 'p2', now: NOW },
    );
    const next = shopReducer(seed, { type: 'ADD_PROMISE', payload: p });
    expect(next.promises).toHaveLength(1);
    expect(duePromises(next, NOW)).toEqual([]);
    expect(shopReducer(next, { type: 'REMOVE_PROMISE', payload: 'p2' }).promises).toEqual([]);
  });

  it('old saved data without promises still works', () => {
    const { promises, ...old } = seed;
    expect(promises).toBeDefined();
    expect(duePromises(old, NOW)).toEqual([]);
  });
});

describe('day summary', () => {
  it('"Aaj ka hisaab batao" answers with today\'s totals', () => {
    const r = parse('Aaj ka hisaab batao');
    expect([r.intent, r.query]).toEqual(['query', { type: 'day_summary' }]);
    expect(answerQuery(r.query, seed, NOW)).toEqual({
      type: 'day_summary',
      total: 142,
      count: 4,
      credit: 0,
      collected: 0,
      promises: 1,
      runningOut: 2,
    });
  });

  it('works in Hindi and Marathi', () => {
    expect(parse('आज का हिसाब बताओ').query).toEqual({ type: 'day_summary' });
    expect(parse('आजचा हिशोब सांगा').query).toEqual({ type: 'day_summary' });
  });
});

describe('UPI reminder', () => {
  const customer = { name: 'Ramesh Patil', aliases: ['ramesh', 'रमेश'], balance: 340 };

  it('adds a UPI line and pay link only when a UPI ID is set', () => {
    expect(buildReminder('hinglish', customer, 'Sharma Store')).not.toContain('upi://');
    const text = buildReminder('hinglish', customer, 'Sharma Store', 'sharma@upi');
    expect(text).toContain('UPI se bhejein: sharma@upi');
    expect(text).toContain('upi://pay?pa=sharma%40upi&pn=Sharma+Store&am=340&cu=INR');
  });

  it('checks UPI IDs loosely', () => {
    expect(isValidUpiId('sharma.store@okicici')).toBe(true);
    expect(isValidUpiId('sharma upi')).toBe(false);
    expect(isValidUpiId('@upi')).toBe(false);
  });
});
