// Price change by voice, order list, and fixing the open card by voice.
import { describe, expect, it } from 'vitest';
import { createSeedState } from '../src/data/seed.js';
import { applyCorrection } from '../src/lib/correction.js';
import { parseCommand, parseCorrection } from '../src/lib/parser/index.js';
import { answerQuery } from '../src/lib/queries.js';
import { shopReducer } from '../src/store/reducer.js';

const NOW = new Date('2026-10-28T15:00:00');
const seed = createSeedState(NOW);
const parse = (text) => parseCommand(text, seed);
const fix = (draft, text) => applyCorrection(draft, parseCorrection(text, seed));

describe('price change', () => {
  it.each([
    ['Maggi ka rate 15 kar do', 'maggi', 15],
    ['चीनी का भाव 48 करो', 'sugar', 48],
    ['साखर दर 50 करा', 'sugar', 50],
    ['Parle-G ka daam 12 rupaye kar do', 'parleg', 12],
  ])('%s', (text, itemId, price) => {
    const r = parse(text);
    expect([r.intent, r.items[0]?.itemId, r.amount]).toEqual(['price_update', itemId, price]);
  });

  it('a question about an item is still a question', () => {
    expect(parse('Maggi kitni bachi hai?').intent).toBe('query');
  });

  it('SET_PRICE changes only that item, and past entries keep their totals', () => {
    const next = shopReducer(seed, { type: 'SET_PRICE', payload: { itemId: 'maggi', price: 15 } });
    expect(next.items.find((i) => i.id === 'maggi').price).toBe(15);
    expect(next.items.find((i) => i.id === 'sugar').price).toBe(45);
    expect(next.transactions).toBe(seed.transactions);
  });
});

describe('order list', () => {
  it('"Kya mangwana hai?" lists what runs out, soonest first, with a week\'s quantity', () => {
    const r = parse('Kya mangwana hai?');
    expect(r.query).toEqual({ type: 'order_list' });
    const answer = answerQuery(r.query, seed, NOW);
    expect(answer.items.map((i) => i.itemId)).toEqual(['maggi', 'poha']);
    expect(answer.items.every((i) => i.qty >= 1)).toBe(true);
  });

  it('Hindi and Marathi', () => {
    expect(parse('क्या मंगवाना है?').query).toEqual({ type: 'order_list' });
    expect(parse('काय मागवायचे?').query).toEqual({ type: 'order_list' });
  });
});

describe('correct by voice', () => {
  const sale = {
    intent: 'cash_sale',
    customerId: null,
    lines: [
      { key: 0, itemId: 'maggi', qty: 2, unit: 'packet' },
      { key: 1, itemId: 'sugar', qty: 1, unit: 'kg' },
    ],
    amount: null,
  };

  it('"Nahi, teen Maggi" changes only the Maggi quantity', () => {
    const next = fix(sale, 'Nahi, teen Maggi');
    expect(next.lines.map((l) => [l.itemId, l.qty])).toEqual([
      ['maggi', 3],
      ['sugar', 1],
    ]);
  });

  it('a new item is added with a fresh key', () => {
    const next = fix(sale, 'nahi, 1 Parle-G bhi');
    expect(next.lines.map((l) => [l.key, l.itemId])).toEqual([
      [0, 'maggi'],
      [1, 'sugar'],
      [2, 'parleg'],
    ]);
  });

  it('payment: "nahi 300" fixes the amount; "nahi Sunita" fixes the customer', () => {
    const payment = { intent: 'payment', customerId: 'c1', lines: [], amount: 200 };
    expect(fix(payment, 'nahi 300').amount).toBe(300);
    expect(fix(payment, 'nahi Sunita').customerId).toBe('c2');
  });

  it('price card: "Nahi, 16" sets the new price', () => {
    const price = {
      intent: 'price_update',
      lines: [{ key: 0, itemId: 'maggi', qty: 1 }],
      amount: 15,
    };
    expect(fix(price, 'Nahi, 16').amount).toBe(16);
  });

  it('nothing usable heard → null, so the card is left alone', () => {
    expect(fix(sale, 'nahi nahi')).toBeNull();
  });
});
