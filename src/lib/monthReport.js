// Month hisaab as spreadsheet sheets: Summary, Daily, Transactions, Khata. Pure functions only.

import { dayKey, formatQty } from './format.js';

const TYPE_LABEL = {
  cash_sale: 'Cash sale',
  credit_sale: 'Udhaar sale',
  payment: 'Payment received',
  stock_in: 'Stock in',
};

/**
 * "2026-10" for the month a date falls in (local time).
 * @param {Date} date
 */
export function monthKey(date) {
  return dayKey(date).slice(0, 7);
}

/** "2026-10" → "October 2026". */
export function monthLabel(key) {
  const [year, month] = key.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });
}

function emptyDay() {
  return { cash: 0, credit: 0, payments: 0, stockIn: 0 };
}

function addTo(totals, tx) {
  if (tx.type === 'cash_sale') totals.cash += tx.amount;
  if (tx.type === 'credit_sale') totals.credit += tx.amount;
  if (tx.type === 'payment') totals.payments += tx.amount;
  if (tx.type === 'stock_in') totals.stockIn += tx.amount;
}

/**
 * Build the sheets for one month.
 * @param {import('../data/seed.js').ShopState} state
 * @param {string} month "YYYY-MM"
 * @param {Date} [now] days after `now` are left out of the Daily sheet
 * @returns {import('./xlsx.js').Sheet[]}
 */
export function buildMonthSheets(state, month, now = new Date()) {
  const itemById = Object.fromEntries(state.items.map((i) => [i.id, i]));
  const customerById = Object.fromEntries(state.customers.map((c) => [c.id, c]));
  const monthTx = state.transactions.filter((tx) => dayKey(tx.ts).startsWith(month));
  const total = emptyDay();
  monthTx.forEach((tx) => addTo(total, tx));

  // Daily: every day of the month up to today, so quiet days show as zero.
  const [year, mon] = month.split('-').map(Number);
  const daysInMonth = new Date(year, mon, 0).getDate();
  const byDay = {};
  monthTx.forEach((tx) => addTo((byDay[dayKey(tx.ts)] ??= emptyDay()), tx));
  const today = dayKey(now);
  const dailyRows = [];
  for (let d = 1; d <= daysInMonth; d += 1) {
    const key = `${month}-${String(d).padStart(2, '0')}`;
    if (key > today) break;
    const day = byDay[key] ?? emptyDay();
    dailyRows.push([
      key,
      day.cash,
      day.credit,
      day.cash + day.credit,
      day.payments,
      day.cash + day.payments,
      day.stockIn,
    ]);
  }

  const txRows = monthTx.map((tx) => {
    const when = new Date(tx.ts);
    const time = `${String(when.getHours()).padStart(2, '0')}:${String(when.getMinutes()).padStart(2, '0')}`;
    const items = (tx.lines ?? [])
      .map((l) => `${itemById[l.itemId]?.name ?? l.itemId} ${formatQty(l.qty, l.unit)}`)
      .join(', ');
    return [
      dayKey(when),
      time,
      TYPE_LABEL[tx.type] ?? tx.type,
      customerById[tx.customerId]?.name ?? '',
      items,
      tx.amount,
    ];
  });

  // Khata: balance at the start of the month, this month's udhaar and payments, closing balance.
  const khataRows = state.customers.map((c) => {
    let opening = c.openingBalance;
    let credit = 0;
    let paid = 0;
    for (const tx of state.transactions) {
      if (tx.customerId !== c.id) continue;
      const txMonth = dayKey(tx.ts).slice(0, 7);
      if (txMonth > month) continue;
      const sign = tx.type === 'credit_sale' ? 1 : tx.type === 'payment' ? -1 : 0;
      if (txMonth < month) opening += sign * tx.amount;
      else if (sign > 0) credit += tx.amount;
      else if (sign < 0) paid += tx.amount;
    }
    return [c.name, opening, credit, paid, opening + credit - paid];
  });
  const khataTotals = khataRows.reduce(
    (sum, row) => sum.map((v, i) => (i === 0 ? v : v + row[i])),
    ['Total', 0, 0, 0, 0],
  );

  return [
    {
      name: 'Summary',
      widths: [26, 16],
      boldRows: [0],
      rows: [
        [`${state.settings.shopName} — ${monthLabel(month)}`],
        [],
        ['Total sales (₹)', total.cash + total.credit],
        ['Cash sales (₹)', total.cash],
        ['Udhaar sales (₹)', total.credit],
        ['Payments received (₹)', total.payments],
        ['Cash in hand (₹)', total.cash + total.payments],
        ['Stock bought (₹)', total.stockIn],
        ['Entries', monthTx.length],
      ],
    },
    {
      name: 'Daily',
      widths: [12, 12, 13, 13, 16, 12, 14],
      boldRows: [0, dailyRows.length + 1],
      rows: [
        [
          'Date',
          'Cash sales',
          'Udhaar sales',
          'Total sales',
          'Payments recd',
          'Cash in',
          'Stock bought',
        ],
        ...dailyRows,
        [
          'Total',
          total.cash,
          total.credit,
          total.cash + total.credit,
          total.payments,
          total.cash + total.payments,
          total.stockIn,
        ],
      ],
    },
    {
      name: 'Transactions',
      widths: [12, 8, 16, 18, 48, 10],
      boldRows: [0],
      rows: [['Date', 'Time', 'Type', 'Customer', 'Items', 'Amount (₹)'], ...txRows],
    },
    {
      name: 'Khata',
      widths: [20, 16, 16, 16, 16],
      boldRows: [0, khataRows.length + 1],
      rows: [
        ['Customer', 'Opening baaki', 'Udhaar diya', 'Payment mila', 'Closing baaki'],
        ...khataRows,
        khataTotals,
      ],
    },
  ];
}
