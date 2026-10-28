// Deterministic demo history — SRS Section 8.3.
// Same pseudo-random seed every time, so "Reset demo data" always gives the same shop,
// shifted so that the last day is always today.

import { CATALOGUE } from './catalogue.js';
import { CUSTOMERS } from './customers.js';
import { dayKey, startOfDay } from '../lib/format.js';

export const SCHEMA_VERSION = 1;

/**
 * @typedef {{ itemId: string, qty: number, unit: string, price: number, subtotal: number }} TxLine
 * @typedef {{ id: string, ts: string, type: 'credit_sale'|'cash_sale'|'payment'|'stock_in',
 *   customerId?: string, lines?: TxLine[], amount: number }} Transaction
 * @typedef {{ schemaVersion: number,
 *   settings: { shopName: string, language: 'hinglish'|'hi'|'mr', muted: boolean, quiet?: boolean, upiId?: string },
 *   items: object[], customers: object[], transactions: Transaction[] }} ShopState
 */

const HOUR = 3600000;
const DAY = 24 * HOUR;

// Units of each item sold on a normal day. Chosen so no item except Maggi and Poha
// runs out within 3 days (checked in tests/seed.test.js).
const DAILY_UNITS = {
  sugar: 5,
  rice: 8,
  atta: 6,
  toor: 2,
  oil: 3,
  tea: 2,
  parleg: 8,
  milk: 4,
  salt: 3,
  soap: 5,
  eggs: 1,
  bread: 1,
  besan: 1,
};
// Busy and quiet days for the 6 previous days (oldest first), so the chart has shape.
const DAY_MULTIPLIERS = [0.85, 1.2, 0.95, 1.3, 0.9, 1.1];
// One delivery (stock-in) per previous day.
const DELIVERIES = [
  ['rice', 20],
  ['sugar', 10],
  ['atta', 15],
  ['oil', 6],
  ['milk', 10],
  ['parleg', 24],
];
// Today starts with 4 small cash sales so the dashboard is not empty.
const TODAY_SALES = [
  ['maggi', 3],
  ['poha', 1],
  ['parleg', 2],
  ['milk', 1],
];

/** Small seeded PRNG (mulberry32): same seed → same sequence. */
function createRandom(seed) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const itemById = Object.fromEntries(CATALOGUE.map((item) => [item.id, item]));

function makeLine(itemId, qty) {
  const { unit, price } = itemById[itemId];
  return { itemId, qty, unit, price, subtotal: Math.round(qty * price) };
}

/** Lines sold on one previous day: every item scaled by the day's multiplier. */
function linesForDay(multiplier) {
  const lines = Object.entries(DAILY_UNITS).map(([id, units]) =>
    makeLine(id, Math.max(1, Math.round(units * multiplier))),
  );
  lines.push(makeLine('maggi', 3), makeLine('poha', 1)); // ~3 Maggi and ~1 kg Poha a day
  return lines;
}

/** Shuffle lines into 12–15 cash sales (some sales have two items). */
function groupIntoSales(lines, random) {
  const shuffled = [...lines];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const sales = shuffled.map((line) => [line]);
  const merges = Math.floor(random() * 4); // 0–3 merges → 12–15 sales
  for (let i = 0; i < merges; i += 1) {
    const at = Math.floor(random() * (sales.length - 1));
    sales.splice(at, 2, [...sales[at], ...sales[at + 1]]);
  }
  return sales;
}

/**
 * Build the full first-run state: settings, catalogue, customers and 7 days of history.
 * @param {Date} [now]
 * @returns {ShopState}
 */
export function createSeedState(now = new Date()) {
  const random = createRandom(2026);
  const today = startOfDay(now).getTime();
  const raw = [];

  DAY_MULTIPLIERS.forEach((multiplier, index) => {
    const dayStart = today - (DAY_MULTIPLIERS.length - index) * DAY;
    const sales = groupIntoSales(linesForDay(multiplier), random);
    // Spread sales across shop hours, 8 AM to 9 PM.
    sales.forEach((lines, i) => {
      const ts = dayStart + 8 * HOUR + ((i + random() * 0.8) / sales.length) * 13 * HOUR;
      raw.push({ ts, type: 'cash_sale', lines });
    });
    const [itemId, qty] = DELIVERIES[index];
    raw.push({ ts: dayStart + 7.5 * HOUR, type: 'stock_in', lines: [makeLine(itemId, qty)] });
  });

  // Today's sales happen between midnight and "now", so they are never in the future.
  const elapsed = now.getTime() - today;
  TODAY_SALES.forEach(([itemId, qty], i) => {
    raw.push({
      ts: today + elapsed * (0.3 + i * 0.18),
      type: 'cash_sale',
      lines: [makeLine(itemId, qty)],
    });
  });

  const transactions = raw
    .sort((a, b) => a.ts - b.ts)
    .map((tx, i) => ({
      id: `t_${String(i + 1).padStart(3, '0')}`,
      ts: new Date(tx.ts).toISOString(),
      type: tx.type,
      lines: tx.lines,
      amount: tx.lines.reduce((sum, line) => sum + line.subtotal, 0),
    }));

  return {
    schemaVersion: SCHEMA_VERSION,
    settings: { shopName: 'Sharma General Store', language: 'hinglish', muted: false },
    items: CATALOGUE.map((item) => ({ ...item, aliases: [...item.aliases] })),
    customers: CUSTOMERS.map(({ joinedDaysAgo, ...customer }) => ({
      ...customer,
      aliases: [...customer.aliases],
      createdAt: new Date(today - joinedDaysAgo * DAY + 10 * HOUR).toISOString(),
    })),
    transactions,
    // Sunita promised yesterday to pay today, so the dashboard shows it on first run.
    promises: [
      {
        id: 'p_seed',
        customerId: 'c2',
        due: dayKey(now),
        amount: null,
        createdAt: new Date(today - DAY + 18 * HOUR).toISOString(),
      },
    ],
  };
}
