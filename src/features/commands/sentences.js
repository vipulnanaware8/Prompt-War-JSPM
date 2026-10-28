// Turn ledger results and query answers into sentences in the selected language (SRS 7.8).
// Speech uses digits ("340 rupaye"), never the ₹ symbol, so voices read them correctly.

import { displayName, formatQty, formatRupees } from '../../lib/format.js';

/** Name to speak: Devanagari alias for Hindi/Marathi, else the first name. */
export const spokenName = displayName;

/**
 * Sentence spoken and shown after Confirm.
 * @param {object} t strings
 * @param {object} tx confirmed transaction
 * @param {{ name: string, balance: number, items: object[] }} context
 */
export function resultSentence(t, tx, { name, balance, items }) {
  if (tx.type === 'credit_sale') return t.speech.credit_sale(name, balance);
  if (tx.type === 'payment') {
    return balance < 0
      ? t.speech.paymentAdvance(name, tx.amount, -balance)
      : t.speech.payment(name, tx.amount, balance);
  }
  if (tx.type === 'cash_sale') return t.speech.cash_sale(tx.amount);
  const parts = tx.lines.map((line) => {
    const item = items.find((i) => i.id === line.itemId);
    return t.speech.stock_in(line.qty, line.unit, item?.name ?? line.itemId);
  });
  return parts.join(' ');
}

/**
 * What the answer card shows: a big value (or none) and a sentence.
 * @returns {{ value: string|null, sentence: string, examples?: string[] }}
 */
export function answerView(t, answer) {
  const a = t.answer;
  switch (answer.type) {
    case 'top_debtor':
      return {
        value: formatRupees(answer.balance),
        sentence: a.top_debtor(answer.name, answer.balance),
      };
    case 'no_debtors':
      return { value: null, sentence: a.no_debtors };
    case 'today_sales':
      return {
        value: formatRupees(answer.total),
        sentence: a.today_sales(answer.total, answer.count),
      };
    case 'item_stock':
      return {
        value: formatQty(answer.stock, answer.unit),
        sentence: a.item_stock(answer.name, answer.stock, answer.unit),
      };
    case 'customer_balance': {
      const { name, balance } = answer;
      let sentence = a.balanceClear(name);
      if (balance > 0) sentence = a.balanceDue(name, balance);
      if (balance < 0) sentence = a.balanceAdvance(name, -balance);
      return { value: formatRupees(Math.abs(balance)), sentence };
    }
    case 'day_summary':
      return { value: formatRupees(answer.total), sentence: t.summary(answer) };
    case 'running_out':
      if (answer.items.length === 0) return { value: null, sentence: a.running_none };
      return {
        value: null,
        sentence: a.running_out(answer.items.map((i) => a.runningItem(i.name, i.days)).join(', ')),
      };
    default:
      return { value: null, sentence: a.unsupported, examples: a.examples };
  }
}
