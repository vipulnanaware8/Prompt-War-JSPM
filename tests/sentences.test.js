// Spoken result and answer sentences (features/commands/sentences.js), plus record ids.
import { describe, expect, it } from 'vitest';
import { STRINGS } from '../src/i18n/strings.js';
import { answerView, resultSentence } from '../src/features/commands/sentences.js';
import { newId } from '../src/lib/ids.js';

const t = STRINGS.hinglish;
const items = [{ id: 'maggi', name: 'Maggi' }];

describe('resultSentence', () => {
  it('speaks the new balance after udhaar', () => {
    const tx = { type: 'credit_sale', amount: 100 };
    expect(resultSentence(t, tx, { name: 'Ramesh', balance: 340, items })).toBe(
      'Ramesh ka total udhaar 340 rupaye ho gaya.',
    );
  });

  it('speaks what is left, or the advance, after a payment', () => {
    const tx = { type: 'payment', amount: 200 };
    expect(resultSentence(t, tx, { name: 'Sunita', balance: 50, items })).toBe(
      'Sunita ne 200 rupaye diye. Ab baaki 50 rupaye.',
    );
    expect(resultSentence(t, tx, { name: 'Sunita', balance: -30, items })).toBe(
      'Sunita ne 200 rupaye diye. Ab advance 30 rupaye.',
    );
  });

  it('speaks cash sales and each stock line', () => {
    expect(resultSentence(t, { type: 'cash_sale', amount: 45 }, { items })).toBe(
      '45 rupaye ki bikri ho gayi.',
    );
    const stock = {
      type: 'stock_in',
      lines: [
        { itemId: 'maggi', qty: 10, unit: 'packet' },
        { itemId: 'gone', qty: 1, unit: 'kg' },
      ],
    };
    expect(resultSentence(t, stock, { items })).toBe(
      '10 packet Maggi stock mein jud gaya. 1 kg gone stock mein jud gaya.',
    );
  });
});

describe('answerView', () => {
  it('shows the balance due, advance or clear', () => {
    const view = (balance) => answerView(t, { type: 'customer_balance', name: 'Mohan', balance });
    expect(view(120)).toEqual({ value: '₹120', sentence: 'Mohan ka 120 rupaye baaki hai.' });
    expect(view(-20)).toEqual({ value: '₹20', sentence: 'Mohan ka 20 rupaye advance hai.' });
    expect(view(0).sentence).toBe('Mohan ka hisaab clear hai.');
  });

  it('formats stock, sales and the top debtor', () => {
    expect(answerView(t, { type: 'item_stock', name: 'Maggi', stock: 4, unit: 'packet' })).toEqual({
      value: '4 packet',
      sentence: 'Maggi 4 packet bacha hai.',
    });
    expect(answerView(t, { type: 'today_sales', total: 1240, count: 6 }).value).toBe('₹1,240');
    expect(answerView(t, { type: 'top_debtor', name: 'Ramesh', balance: 340 }).sentence).toBe(
      'Sabse zyada udhaar Ramesh ka hai — 340 rupaye.',
    );
    expect(answerView(t, { type: 'no_debtors' })).toEqual({
      value: null,
      sentence: t.answer.no_debtors,
    });
  });

  it('lists what to order, or says nothing is needed', () => {
    const order = answerView(t, {
      type: 'order_list',
      items: [{ name: 'Maggi', qty: 20, unit: 'packet' }],
    });
    expect(order.orderLines).toEqual(['Maggi 20 packet']);
    expect(order.sentence).toBe('Mangwana hai: Maggi 20 packet.');
    expect(answerView(t, { type: 'order_list', items: [] }).sentence).toBe(t.order.none);
  });

  it('lists items running out, or none', () => {
    const view = answerView(t, { type: 'running_out', items: [{ name: 'Maggi', days: 2 }] });
    expect(view.sentence).toBe('Maggi (2 din) jaldi khatam hone wale hain.');
    expect(answerView(t, { type: 'running_out', items: [] }).sentence).toBe(t.answer.running_none);
  });

  it('falls back to example questions', () => {
    const view = answerView(t, { type: 'something_else' });
    expect(view).toEqual({
      value: null,
      sentence: t.answer.unsupported,
      examples: t.answer.examples,
    });
  });
});

describe('newId', () => {
  it('prefixes the type and stays unique within one millisecond', () => {
    const a = newId('t', 1000);
    const b = newId('t', 1000);
    expect(a).toMatch(/^t_[0-9a-z]+$/);
    expect(b).not.toBe(a);
    expect(newId('c')).toMatch(/^c_/);
  });
});
