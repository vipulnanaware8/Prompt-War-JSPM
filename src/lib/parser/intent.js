// Step 3 (SRS 9.3): decide what the command means. First matching rule wins.

import {
  DAY_WORDS,
  INTENT_KEYWORDS,
  PROMISE_WORDS,
  QUERY_WORDS,
  SUMMARY_WORDS,
} from './keywords.js';

const has = (tokens, words) => tokens.some((t) => words.includes(t));

/**
 * @param {string[]} tokens normalised tokens
 * @param {{ hasQuestionMark: boolean, items: object[], customer: object|null, amount: number|null }} found
 * @returns {{ intent: 'credit_sale'|'cash_sale'|'payment'|'stock_in'|'query'|'promise'|'unknown', confidence: number }}
 */
export function detectIntent(tokens, { hasQuestionMark, items, customer, amount }) {
  const hasItems = items.length > 0;

  // "Ramesh Sunday ko dega" — a promise to pay, not a question or a payment.
  if (!hasQuestionMark && customer && has(tokens, PROMISE_WORDS)) {
    return { intent: 'promise', confidence: 1 };
  }
  if (hasQuestionMark || has(tokens, INTENT_KEYWORDS.query))
    return { intent: 'query', confidence: 1 };
  if (has(tokens, SUMMARY_WORDS) && !customer && !hasItems)
    return { intent: 'query', confidence: 1 };
  if (has(tokens, INTENT_KEYWORDS.credit_sale) && (hasItems || amount !== null)) {
    return { intent: 'credit_sale', confidence: 1 };
  }
  // Payment needs a customer and no items; a missing amount is asked for on the card.
  if (has(tokens, INTENT_KEYWORDS.payment) && customer && !hasItems) {
    return { intent: 'payment', confidence: 1 };
  }
  if (has(tokens, INTENT_KEYWORDS.stock_in) && hasItems)
    return { intent: 'stock_in', confidence: 1 };
  if (has(tokens, INTENT_KEYWORDS.cash_sale) && hasItems)
    return { intent: 'cash_sale', confidence: 1 };

  // Fallback (rule 6)
  if (hasItems && customer) return { intent: 'credit_sale', confidence: 0.5 };
  if (hasItems) return { intent: 'cash_sale', confidence: 0.5 };
  return { intent: 'unknown', confidence: 0 };
}

/**
 * Which question was asked (SRS 9.3 "Query types"); null when we cannot answer it.
 * @returns {{ type: string, itemId?: string, customerId?: string } | null}
 */
export function detectQuery(tokens, { items, customer }) {
  const aboutUdhaar = has(tokens, INTENT_KEYWORDS.credit_sale);
  if (has(tokens, SUMMARY_WORDS) && !customer) return { type: 'day_summary' };
  if (has(tokens, QUERY_WORDS.most) && aboutUdhaar) return { type: 'top_debtor' };
  if (has(tokens, QUERY_WORDS.sales)) return { type: 'today_sales' };
  if (has(tokens, QUERY_WORDS.runningOut)) return { type: 'running_out' };
  if (items.length > 0) return { type: 'item_stock', itemId: items[0].itemId };
  if (customer && (has(tokens, QUERY_WORDS.due) || aboutUdhaar)) {
    return { type: 'customer_balance', customerId: customer.id };
  }
  return null;
}

/**
 * When a promise is due, from words like "kal" or "Sunday"; tomorrow when none is said.
 * @returns {{ days: number } | { weekday: number }}
 */
export function detectPromiseDay(tokens) {
  const word = tokens.find((t) => t in DAY_WORDS);
  return word ? DAY_WORDS[word] : { days: 1 };
}
