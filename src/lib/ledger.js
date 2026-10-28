// The ledger: every rule that touches money or stock (SRS 5.6, 8.1). Pure functions only.

import { dayKey } from './format.js';

/**
 * Money in whole rupees: subtotal = round(qty × price). 0.5 kg × ₹45 = ₹23.
 * @param {number} qty
 * @param {number} price
 * @returns {number}
 */
export function lineSubtotal(qty, price) {
  return Math.round(qty * price);
}

/**
 * Attach catalogue price and subtotal to draft lines. Prices only ever come from the catalogue.
 * @param {Array<{ itemId: string, qty: number }>} lines
 * @param {Array<{ id: string, unit: string, price: number }>} items
 * @returns {Array<{ itemId: string, qty: number, unit: string, price: number, subtotal: number }>}
 */
export function priceLines(lines, items) {
  return lines.map(({ itemId, qty }) => {
    const item = items.find((i) => i.id === itemId);
    return {
      itemId,
      qty,
      unit: item.unit,
      price: item.price,
      subtotal: lineSubtotal(qty, item.price),
    };
  });
}

/**
 * Total = sum of rounded subtotals.
 * @param {Array<{ subtotal: number }>} pricedLines
 * @returns {number}
 */
export function linesTotal(pricedLines) {
  return pricedLines.reduce((sum, line) => sum + line.subtotal, 0);
}

/**
 * Turn a confirmed draft into an immutable transaction record (FR-LEDG-7).
 * @param {{ intent: string, customerId?: string|null, lines?: Array<{ itemId: string, qty: number }>, amount?: number|null }} draft
 * @param {Array<object>} items catalogue
 * @param {{ id: string, now?: Date }} meta
 * @returns {import('../data/seed.js').Transaction}
 */
export function buildTransaction(draft, items, { id, now = new Date() }) {
  const tx = { id, ts: now.toISOString(), type: draft.intent };
  if (draft.intent === 'payment') {
    return { ...tx, customerId: draft.customerId, amount: Math.round(draft.amount) };
  }
  const lines = priceLines(draft.lines ?? [], items);
  if (draft.intent === 'credit_sale') tx.customerId = draft.customerId;
  // Amount-only udhaar ("Ramesh ka 100 udhaar likh do") has no lines.
  const amount = lines.length > 0 ? linesTotal(lines) : Math.round(draft.amount ?? 0);
  return { ...tx, lines, amount };
}

/** +1 for stock in, −1 for sales, 0 for payments. */
function stockDirection(type) {
  if (type === 'stock_in') return 1;
  if (type === 'credit_sale' || type === 'cash_sale') return -1;
  return 0;
}

function adjustStock(items, tx, sign) {
  const direction = stockDirection(tx.type) * sign;
  if (direction === 0 || !tx.lines) return items;
  return items.map((item) => {
    const qty = tx.lines.filter((l) => l.itemId === item.id).reduce((sum, l) => sum + l.qty, 0);
    return qty
      ? { ...item, stock: Math.round((item.stock + direction * qty) * 1000) / 1000 }
      : item;
  });
}

/**
 * Apply a transaction: log it and update stock. Balances are derived, so they follow automatically.
 * @param {import('../data/seed.js').ShopState} state
 * @param {import('../data/seed.js').Transaction} tx
 */
export function applyTransaction(state, tx) {
  return {
    ...state,
    items: adjustStock(state.items, tx, 1),
    transactions: [...state.transactions, tx],
  };
}

/**
 * Undo the latest transaction only, reversing its stock effect exactly (FR-LEDG-6).
 * Does nothing if `txId` is not the latest record.
 */
export function undoLast(state, txId) {
  const last = state.transactions[state.transactions.length - 1];
  if (!last || last.id !== txId) return state;
  return {
    ...state,
    items: adjustStock(state.items, last, -1),
    transactions: state.transactions.slice(0, -1),
  };
}

/**
 * Balance of every customer: openingBalance + credit sales − payments.
 * @returns {Record<string, number>}
 */
export function computeBalances(customers, transactions) {
  const balances = Object.fromEntries(customers.map((c) => [c.id, c.openingBalance]));
  for (const tx of transactions) {
    if (!tx.customerId || !(tx.customerId in balances)) continue;
    if (tx.type === 'credit_sale') balances[tx.customerId] += tx.amount;
    if (tx.type === 'payment') balances[tx.customerId] -= tx.amount;
  }
  return balances;
}

/**
 * Balance after a transaction: credit sale adds, payment subtracts. Negative = advance.
 * @param {number} balance
 * @param {{ type: string, amount: number }} tx
 * @returns {number}
 */
export function balanceAfter(balance, { type, amount }) {
  if (type === 'credit_sale') return balance + amount;
  if (type === 'payment') return balance - amount;
  return balance;
}

/**
 * Sale lines that ask for more than is in stock (FR-CONF-6). Allowed after a warning.
 * @returns {Array<{ itemId: string, stock: number, unit: string }>}
 */
export function stockWarnings(intent, lines, items) {
  if (intent !== 'credit_sale' && intent !== 'cash_sale') return [];
  return lines
    .map((line) => ({ line, item: items.find((i) => i.id === line.itemId) }))
    .filter(({ line, item }) => item && line.qty > item.stock)
    .map(({ item }) => ({ itemId: item.id, stock: item.stock, unit: item.unit }));
}

/**
 * Today's sales (credit + cash) and cash collected (cash sales + payments) — SRS 8.1.
 * @returns {{ sales: number, salesCount: number, cash: number }}
 */
export function todayTotals(transactions, now = new Date()) {
  const today = dayKey(now);
  const totals = { sales: 0, salesCount: 0, cash: 0, credit: 0, collected: 0 };
  for (const tx of transactions) {
    if (dayKey(tx.ts) !== today) continue;
    if (tx.type === 'credit_sale' || tx.type === 'cash_sale') {
      totals.sales += tx.amount;
      totals.salesCount += 1;
    }
    if (tx.type === 'cash_sale' || tx.type === 'payment') totals.cash += tx.amount;
    if (tx.type === 'credit_sale') totals.credit += tx.amount;
    if (tx.type === 'payment') totals.collected += tx.amount;
  }
  return totals;
}

/**
 * New customer record (FR-KHATA-4). Only a name and an optional second name — never a
 * phone, address or ID. Aliases let the parser recognise them in commands immediately.
 * @param {{ name: string, alias?: string }} input
 * @param {{ id: string, now?: Date }} meta
 */
export function buildCustomer({ name, alias = '' }, { id, now = new Date() }) {
  const clean = name.trim().replace(/\s+/g, ' ');
  const aliases = [
    clean.toLowerCase(),
    clean.split(' ')[0].toLowerCase(),
    alias.trim().toLowerCase(),
  ];
  return {
    id,
    name: clean,
    aliases: [...new Set(aliases.filter(Boolean))],
    openingBalance: 0,
    createdAt: now.toISOString(),
  };
}
