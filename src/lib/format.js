// Pure formatting and date helpers. No React, no DOM, no storage.

const rupeeFormatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

/**
 * Format whole rupees with Indian grouping: 1240 → "₹1,240", -50 → "-₹50".
 * @param {number} amount integer rupees
 * @returns {string}
 */
export function formatRupees(amount) {
  const sign = amount < 0 ? '-' : '';
  return `${sign}₹${rupeeFormatter.format(Math.abs(Math.round(amount)))}`;
}

/**
 * Format a quantity with its unit: (0.5, 'kg') → "0.5 kg".
 * @param {number} qty
 * @param {string} unit
 * @returns {string}
 */
export function formatQty(qty, unit) {
  const value = Number.isInteger(qty) ? String(qty) : String(Math.round(qty * 100) / 100);
  return `${value} ${unit}`;
}

/**
 * Midnight (local time) of the given date.
 * @param {Date} date
 * @returns {Date}
 */
export function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Local calendar-day key, e.g. "2026-10-28". Used to group transactions by day.
 * @param {Date|string} date
 * @returns {string}
 */
export function dayKey(date) {
  const d = new Date(date);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/**
 * How long ago a timestamp was, as a key + number the UI turns into words.
 * @param {string} iso timestamp
 * @param {Date} [now]
 * @returns {{ key: 'justNow'|'minutes'|'hours'|'days', n: number }}
 */
export function relativeTime(iso, now = new Date()) {
  const then = new Date(iso);
  const minutes = Math.floor((now.getTime() - then.getTime()) / 60000);
  if (minutes < 1) return { key: 'justNow', n: 0 };
  if (minutes < 60) return { key: 'minutes', n: minutes };
  // Anything from an earlier calendar day is counted in days, so "yesterday 9 PM" reads "Kal".
  const days = Math.round((startOfDay(now) - startOfDay(then)) / 86400000);
  if (days >= 1) return { key: 'days', n: days };
  return { key: 'hours', n: Math.floor(minutes / 60) };
}
