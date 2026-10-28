// parseCommand() — the rule-based parser (SRS Section 9).
// It never throws, never does money maths, and always returns something the card can show.

import { normalize } from './normalize.js';
import { detectIntent, detectQuery } from './intent.js';
import { extractItems, isReservedWord } from './items.js';
import { extractCustomer } from './customers.js';
import { readNumber } from './numbers.js';

/** The five demo phrases (SRS 9.7), shown as chips and as suggestions. */
export const DEMO_PHRASES = [
  'Ramesh ne 2 kilo cheeni aur 1 Parle-G udhaar liya',
  'Sunita ne 200 rupaye diye',
  '10 packet Maggi aaya',
  '3 Maggi cash mein becha',
  'Kiska udhaar sabse zyada hai?',
];

/**
 * @typedef {Object} ParseResult
 * @property {'credit_sale'|'cash_sale'|'payment'|'stock_in'|'query'|'unknown'} intent
 * @property {{ id: string, matchedText: string, confidence: number } | null} customer
 * @property {string|null} newCustomerName  name-like word that is not a known customer
 * @property {Array<{ itemId: string, qty: number, unit: string, matchedText: string, confidence: number }>} items
 * @property {number|null} amount           only for payment or amount-only credit
 * @property {{ type: string, itemId?: string, customerId?: string } | null} query
 * @property {string[]} unmatched           words not understood, shown as a hint
 * @property {string} raw                   original text
 * @property {string[]} suggestions         filled when intent is 'unknown'
 */

/**
 * Step 6: money amount — a number next to "₹", else any number left over.
 * @returns {number|null}
 */
function extractAmount(tokens, used) {
  let fallback = null;
  for (let i = 0; i < tokens.length; i += 1) {
    if (used[i]) continue;
    const number = readNumber(tokens, i, (j) => tokens[j] === '₹');
    if (!number) continue;
    const nearRupee = tokens[i - 1] === '₹' || tokens[i + number.length] === '₹';
    if (nearRupee || fallback === null) {
      for (let k = i; k < i + number.length; k += 1) used[k] = true;
      if (nearRupee) return number.value;
      fallback = number.value;
    }
  }
  return fallback;
}

function unknownResult(raw, unmatched = []) {
  return {
    intent: 'unknown',
    customer: null,
    newCustomerName: null,
    items: [],
    amount: null,
    query: null,
    unmatched,
    raw,
    suggestions: DEMO_PHRASES.slice(0, 3),
  };
}

/**
 * Turn one spoken or typed sentence into a structured result.
 * @param {string} text
 * @param {{ items: object[], customers: object[] }} catalogue
 * @returns {ParseResult}
 */
export function parseCommand(text, { items, customers } = {}) {
  const raw = typeof text === 'string' ? text : '';
  try {
    const tokens = normalize(raw).split(' ').filter(Boolean);
    if (tokens.length === 0) return unknownResult(raw);

    const used = tokens.map(() => false);
    const lines = extractItems(tokens, items, used);
    const { customer, newCustomerName } = extractCustomer(tokens, customers, used);
    const amount = extractAmount(tokens, used);
    const unmatched = tokens.filter((t, i) => !used[i] && !isReservedWord(t));

    const { intent } = detectIntent(tokens, {
      hasQuestionMark: raw.includes('?'),
      items: lines,
      customer,
      amount,
    });
    if (intent === 'unknown') return unknownResult(raw, unmatched);

    const isMoneyOnly = intent === 'payment' || (intent === 'credit_sale' && lines.length === 0);
    return {
      intent,
      customer,
      newCustomerName: customer ? null : newCustomerName,
      items: intent === 'payment' ? [] : lines,
      amount: isMoneyOnly ? amount : null,
      query: intent === 'query' ? detectQuery(tokens, { items: lines, customer }) : null,
      unmatched,
      raw,
      suggestions: [],
    };
  } catch (error) {
    if (import.meta.env?.DEV) console.error(error);
    return unknownResult(raw);
  }
}
