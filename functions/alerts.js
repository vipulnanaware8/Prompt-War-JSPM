// Pure alert rules: what to send, to whom, and when. No Firebase or network here, so it is
// unit-tested from tests/telegram-alerts.test.js. The shop document is built by the app in
// src/lib/alertSnapshot.js.

const rupees = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
const DAY = 86400000;

/** Most customer reminders one shop can send in a day. */
export const MAX_REMINDERS_PER_DAY = 50;

/** Calendar day in India, e.g. "2026-10-28" — the app's day keys use the phone's local time. */
export function indiaDayKey(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(date);
}

const money = (amount) => `₹${rupees.format(Math.round(amount))}`;

/** Messages are sent as Telegram HTML, so shop and customer names must be escaped. */
export function escapeHtml(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * "/start AB12CD" → { kind: 'shop', code }; "/start CAB12CD9" → { kind: 'customer', code };
 * anything else → null. Shop codes are 6 characters, customer invites "C" + 7.
 */
export function parseStartCode(text) {
  const match = /^\/start\s+([A-Z0-9]{6}|C[A-Z0-9]{7})\s*$/.exec(String(text).trim());
  if (!match) return null;
  return { kind: match[1].length === 6 ? 'shop' : 'customer', code: match[1] };
}

/** Replies that stop messages to this chat. */
export function isStopMessage(text) {
  return /^\s*\/?(stop|band|bandh|unsubscribe|बंद)\s*$/i.test(String(text));
}

/**
 * What a bot update asks for. Only private text chats count; everything else is ignored.
 * @param {object|undefined} message Telegram `update.message`
 * @returns {{ kind: 'shop'|'customer', code: string } | { kind: 'stop'|'hello'|'ignore' }}
 */
export function webhookAction(message) {
  if (message?.chat?.type !== 'private' || typeof message.text !== 'string') {
    return { kind: 'ignore' };
  }
  const start = parseStartCode(message.text);
  if (start) return start;
  if (isStopMessage(message.text)) return { kind: 'stop' };
  if (message.text.startsWith('/start')) return { kind: 'hello' };
  return { kind: 'ignore' };
}

const itemList = (items) =>
  items.map((i) => `• ${escapeHtml(i.name)} — ${i.stock} ${escapeHtml(i.unit)}`).join('\n');

/** 9 PM summary. A summary uploaded on an earlier day means nothing was sold today. */
export function dailySummaryText(shop, today) {
  const t = shop.day === today ? shop.today : { sales: 0, salesCount: 0, cash: 0, credit: 0 };
  return [
    `📒 <b>${escapeHtml(shop.shopName)} — aaj ka hisaab</b>`,
    '',
    `Bikri: <b>${money(t.sales)}</b> (${t.salesCount})`,
    `Cash mila: ${money(t.cash)}`,
    `Udhaar diya: ${money(t.credit)}`,
    '',
    shop.lowStock?.length ? `⚠️ Kam stock:\n${itemList(shop.lowStock)}` : '✅ Stock theek hai',
  ].join('\n');
}

/** Items that are low now but were not low in the previous upload. */
export function newlyLowItems(before, after) {
  const wasLow = new Set((before?.lowStock ?? []).map((i) => i.id));
  return (after?.lowStock ?? []).filter((i) => !wasLow.has(i.id));
}

/** Leaves out items already alerted within `withinMs` (log: itemId → ISO time). */
export function notRecentlyAlerted(items, log = {}, now = new Date(), withinMs = DAY) {
  return items.filter((i) => !log[i.id] || now - new Date(log[i.id]) >= withinMs);
}

export function lowStockText(items) {
  return `⚠️ <b>Stock kam ho gaya hai</b>\n${itemList(items)}\n\nSamay par mangwa lijiye.`;
}

/** Open promises due today or earlier. */
export function promisesDue(shop, today) {
  return (shop.promises ?? []).filter((p) => p.due <= today);
}

export function promiseDueText(promises) {
  const lines = promises.map((p) => `• ${escapeHtml(p.name)} — ${money(p.balance)}`).join('\n');
  return `🤝 <b>Aaj ke vaade</b>\nIn grahakon ne aaj paise dene ka vaada kiya hai:\n${lines}`;
}

/**
 * Customers to remind now: they owe money, have linked Telegram, and were not reminded in the
 * last `reminderEveryDays` days. At most MAX_REMINDERS_PER_DAY.
 * @param {object} shop
 * @param {Record<string, string>} log customerId → ISO time of the last reminder
 * @param {Map<string, number>} chats customerId → Telegram chat id
 */
export function customersToRemind(shop, log = {}, chats = new Map(), now = new Date()) {
  const every = (shop.alerts?.reminderEveryDays ?? 7) * DAY - 2 * 3600000; // ±2 h for cron drift
  return (shop.customers ?? [])
    .filter((c) => c.balance > 0 && chats.has(c.id))
    .filter((c) => !log[c.id] || now - new Date(log[c.id]) >= every)
    .slice(0, MAX_REMINDERS_PER_DAY);
}

export function paymentReminderText(shop, customer) {
  const upi = shop.upiId ? `\n\nUPI se bhejein: <code>${escapeHtml(shop.upiId)}</code>` : '';
  return (
    `🙏 Namaste ${escapeHtml(customer.name)} ji,\n` +
    `<b>${escapeHtml(shop.shopName)}</b> mein aapka <b>${money(customer.balance)}</b> ka hisaab baaki hai. ` +
    `Suvidha ho to kripya chuka dijiye. Dhanyavaad!${upi}\n\n` +
    `<i>Reminder band karne ke liye /stop bhejiye.</i>`
  );
}
