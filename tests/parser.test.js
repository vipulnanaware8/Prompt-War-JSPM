// Parser tests — SRS Section 11.1 (parser.test.js) and the demo phrases in 9.7.
import { describe, expect, it } from 'vitest';
import { parseCommand, DEMO_PHRASES } from '../src/lib/parser/index.js';
import { createSeedState } from '../src/data/seed.js';

const { items, customers } = createSeedState(new Date('2026-10-28T15:00:00'));
const parse = (text) => parseCommand(text, { items, customers });
/** Just the item ids and quantities, for short assertions. */
const lines = (result) => result.items.map((i) => [i.itemId, i.qty]);

describe('demo phrases (SRS 9.7)', () => {
  it('1: credit sale for Ramesh with sugar and Parle-G', () => {
    const r = parse('Ramesh ne 2 kilo cheeni aur 1 Parle-G udhaar liya');
    expect(r.intent).toBe('credit_sale');
    expect(r.customer.id).toBe('c1');
    expect(lines(r)).toEqual([
      ['sugar', 2],
      ['parleg', 1],
    ]);
  });

  it('2: payment of 200 from Sunita', () => {
    const r = parse('Sunita ne 200 rupaye diye');
    expect(r.intent).toBe('payment');
    expect(r.customer.id).toBe('c2');
    expect(r.amount).toBe(200);
    expect(r.items).toEqual([]);
  });

  it('3: stock in of 10 packets Maggi', () => {
    const r = parse('10 packet Maggi aaya');
    expect(r.intent).toBe('stock_in');
    expect(lines(r)).toEqual([['maggi', 10]]);
  });

  it('4: cash sale of 3 Maggi', () => {
    const r = parse('3 Maggi cash mein becha');
    expect(r.intent).toBe('cash_sale');
    expect(lines(r)).toEqual([['maggi', 3]]);
  });

  it('5: top debtor question', () => {
    const r = parse('Kiska udhaar sabse zyada hai?');
    expect(r.intent).toBe('query');
    expect(r.query).toEqual({ type: 'top_debtor' });
  });

  it('DEMO_PHRASES lists the five phrases in order', () => {
    expect(DEMO_PHRASES).toHaveLength(5);
    expect(DEMO_PHRASES[0]).toBe('Ramesh ne 2 kilo cheeni aur 1 Parle-G udhaar liya');
  });
});

describe('Devanagari (Hindi) and Marathi', () => {
  it('Hindi phrase 1', () => {
    const r = parse('रमेश ने दो किलो चीनी और एक पारले उधार लिया');
    expect(r.intent).toBe('credit_sale');
    expect(r.customer.id).toBe('c1');
    expect(lines(r)).toEqual([
      ['sugar', 2],
      ['parleg', 1],
    ]);
  });

  it('Marathi phrase 1 (name with attached ने)', () => {
    const r = parse('रमेशने दोन किलो साखर उधार घेतली');
    expect(r.intent).toBe('credit_sale');
    expect(r.customer.id).toBe('c1');
    expect(lines(r)).toEqual([['sugar', 2]]);
  });

  it('Hindi phrases 2–5', () => {
    const pay = parse('सुनीता ने 200 रुपये दिए');
    expect([pay.intent, pay.customer.id, pay.amount]).toEqual(['payment', 'c2', 200]);
    const stock = parse('10 पैकेट मैगी आया');
    expect([stock.intent, ...lines(stock)]).toEqual(['stock_in', ['maggi', 10]]);
    const cash = parse('3 मैगी नकद बेचा');
    expect([cash.intent, ...lines(cash)]).toEqual(['cash_sale', ['maggi', 3]]);
    const query = parse('किसका उधार सबसे ज़्यादा है?');
    expect([query.intent, query.query?.type]).toEqual(['query', 'top_debtor']);
  });

  it('Marathi phrases 2–5', () => {
    const pay = parse('सुनीताने 200 रुपये दिले');
    expect([pay.intent, pay.customer.id, pay.amount]).toEqual(['payment', 'c2', 200]);
    const stock = parse('10 पाकीट मॅगी आले');
    expect([stock.intent, ...lines(stock)]).toEqual(['stock_in', ['maggi', 10]]);
    const cash = parse('3 मॅगी रोख विकले');
    expect([cash.intent, ...lines(cash)]).toEqual(['cash_sale', ['maggi', 3]]);
    const query = parse('सर्वात जास्त उधारी कोणाची आहे?');
    expect([query.intent, query.query?.type]).toEqual(['query', 'top_debtor']);
  });

  it('Devanagari digits parse like ASCII digits', () => {
    expect(lines(parse('२ किलो चीनी'))).toEqual(lines(parse('2 kilo cheeni')));
  });
});

describe('numbers', () => {
  const words = {
    latin: ['ek', 'do', 'teen', 'char', 'paanch', 'chhe', 'saat', 'aath', 'nau', 'das'],
    hindi: ['एक', 'दो', 'तीन', 'चार', 'पांच', 'छह', 'सात', 'आठ', 'नौ', 'दस'],
    marathi: ['एक', 'दोन', 'तीन', 'चार', 'पाच', 'सहा', 'सात', 'आठ', 'नऊ', 'दहा'],
  };

  for (const [language, list] of Object.entries(words)) {
    it(`number words 1–10 in ${language}`, () => {
      list.forEach((word, index) => {
        expect(parse(`${word} kilo cheeni`).items[0].qty).toBe(index + 1);
      });
    });
  }

  it('"do sau" = 200', () => {
    expect(parse('Sunita ne do sau rupaye diye').amount).toBe(200);
  });

  it('"dedh kilo" = 1.5 and "aadha kilo" = 0.5', () => {
    expect(parse('dedh kilo cheeni').items[0].qty).toBe(1.5);
    expect(parse('aadha kilo cheeni').items[0].qty).toBe(0.5);
  });

  it('"500 gram cheeni" → 0.5 kg', () => {
    expect(parse('500 gram cheeni').items[0]).toMatchObject({
      itemId: 'sugar',
      qty: 0.5,
      unit: 'kg',
    });
  });

  it('"1 Parle-G" reads Parle-G, not g as gram', () => {
    expect(lines(parse('1 Parle-G'))).toEqual([['parleg', 1]]);
  });

  it('missing quantity defaults to 1 and unit to the item unit', () => {
    expect(parse('cheeni').items[0]).toMatchObject({ qty: 1, unit: 'kg' });
  });

  it('"do" without a unit or item is not a number', () => {
    expect(parse('Ramesh ke khate mein likh do').items).toEqual([]);
  });
});

describe('fuzzy matching', () => {
  it('"chinni" → Sugar, "magi" → Maggi', () => {
    expect(parse('2 kilo chinni').items[0].itemId).toBe('sugar');
    expect(parse('3 magi').items[0].itemId).toBe('maggi');
  });

  it('"Rames" → Ramesh Patil', () => {
    expect(parse('Rames ne 1 maggi udhaar liya').customer.id).toBe('c1');
  });

  it('stock-in verb "aaya" is never mistaken for atta', () => {
    expect(lines(parse('10 packet Maggi aaya'))).toEqual([['maggi', 10]]);
  });
});

describe('multiple items', () => {
  it.each([
    ['aur', 'Ramesh ne 1 maggi aur 2 kilo cheeni udhaar liya'],
    ['और', 'रमेश ने एक मैगी और दो किलो चीनी उधार लिया'],
    ['आणि', 'रमेशने एक मॅगी आणि दोन किलो साखर उधार घेतली'],
    ['comma', 'Ramesh ne 1 maggi, 2 kilo cheeni udhaar liya'],
  ])('joined by %s', (_, text) => {
    expect(lines(parse(text))).toEqual([
      ['maggi', 1],
      ['sugar', 2],
    ]);
  });
});

describe('unknown and edge cases', () => {
  it('unknown customer → new-customer flag', () => {
    const r = parse('Suresh ne 2 kilo cheeni udhaar liya');
    expect(r.intent).toBe('credit_sale');
    expect(r.customer).toBeNull();
    expect(r.newCustomerName).toBe('Suresh');
  });

  it('gibberish → unknown + 3 suggestions', () => {
    const r = parse('blorp zxqv wibble');
    expect(r.intent).toBe('unknown');
    expect(r.suggestions).toEqual(DEMO_PHRASES.slice(0, 3));
    expect(r.unmatched.length).toBeGreaterThan(0);
  });

  it('empty string → unknown', () => {
    expect(parse('').intent).toBe('unknown');
    expect(parse('   ').intent).toBe('unknown');
  });

  it('500-character input does not throw', () => {
    const long = 'Ramesh ne 2 kilo cheeni aur '.repeat(20).slice(0, 500);
    expect(() => parse(long)).not.toThrow();
  });

  it('bad arguments never throw', () => {
    expect(parseCommand(null, { items, customers }).intent).toBe('unknown');
    expect(parseCommand('2 kilo cheeni', {}).intent).toBe('unknown');
  });

  it('result follows the ParseResult schema (SRS 9.2)', () => {
    const r = parse('Ramesh ne 2 kilo cheeni udhaar liya');
    expect(Object.keys(r).sort()).toEqual(
      [
        'amount',
        'customer',
        'intent',
        'items',
        'newCustomerName',
        'query',
        'raw',
        'suggestions',
        'unmatched',
      ].sort(),
    );
    expect(r.raw).toBe('Ramesh ne 2 kilo cheeni udhaar liya');
    expect(r.customer).toEqual({ id: 'c1', matchedText: 'ramesh', confidence: 1 });
    expect(r.items[0]).toEqual({
      itemId: 'sugar',
      qty: 2,
      unit: 'kg',
      matchedText: 'cheeni',
      confidence: 1,
    });
  });
});

describe('questions (SRS 9.3 query types)', () => {
  it.each([
    ['Aaj kitni bikri hui?', { type: 'today_sales' }],
    ['Maggi kitni bachi hai?', { type: 'item_stock', itemId: 'maggi' }],
    ['Ramesh ka kitna baaki hai?', { type: 'customer_balance', customerId: 'c1' }],
    ['Kya khatam hone wala hai?', { type: 'running_out' }],
  ])('%s', (text, query) => {
    const r = parse(text);
    expect(r.intent).toBe('query');
    expect(r.query).toEqual(query);
  });

  it('a question we cannot answer is a query with no type', () => {
    const r = parse('Kya mausam accha hai?');
    expect(r.intent).toBe('query');
    expect(r.query).toBeNull();
  });
});

describe('performance', () => {
  it('parses each demo phrase in under 50 ms', () => {
    for (const phrase of DEMO_PHRASES) {
      const start = performance.now();
      parse(phrase);
      expect(performance.now() - start).toBeLessThan(50);
    }
  });
});
