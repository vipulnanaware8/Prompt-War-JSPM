import { describe, expect, it } from 'vitest';
import { buildAlertSnapshot } from '../src/lib/alertSnapshot.js';
import { createSeedState } from '../src/data/seed.js';
import { shopReducer } from '../src/store/reducer.js';
import {
  MAX_REMINDERS_PER_DAY,
  customersToRemind,
  dailySummaryText,
  escapeHtml,
  indiaDayKey,
  isStopMessage,
  lowStockText,
  newlyLowItems,
  notRecentlyAlerted,
  parseStartCode,
  paymentReminderText,
  promisesDue,
  webhookAction,
} from '../functions/alerts.js';
import { isValidSecret, sendMessage } from '../functions/telegram.js';

const NOW = new Date('2026-10-28T10:00:00');

describe('buildAlertSnapshot', () => {
  it('includes only invited customers who owe money', () => {
    let state = createSeedState(NOW);
    const [invited, other] = state.customers;
    state = shopReducer(state, {
      type: 'UPDATE_CUSTOMER',
      payload: { id: invited.id, changes: { telegramInvited: true } },
    });
    const snapshot = buildAlertSnapshot(state, NOW);
    expect(snapshot.customers.map((c) => c.id)).toEqual([invited.id]);
    expect(snapshot.customers[0]).toEqual({
      id: invited.id,
      name: invited.name,
      balance: expect.any(Number),
    });
    expect(snapshot.customers.some((c) => c.id === other.id)).toBe(false);
  });

  it('carries today, low stock and default alert settings', () => {
    const snapshot = buildAlertSnapshot(createSeedState(NOW), NOW);
    expect(snapshot.day).toBe('2026-10-28');
    expect(snapshot.today.salesCount).toBe(4);
    expect(snapshot.alerts).toMatchObject({ enabled: false, dailySummary: true });
    for (const item of snapshot.lowStock) {
      expect(Object.keys(item)).toEqual(['id', 'name', 'stock', 'unit']);
    }
  });
});

describe('server alert rules', () => {
  const shop = {
    shopName: 'Sharma <General> Store',
    upiId: 'sharma@upi',
    day: '2026-10-28',
    today: { sales: 1240, salesCount: 5, cash: 800, credit: 440 },
    lowStock: [{ id: 'maggi', name: 'Maggi', stock: 2, unit: 'packet' }],
    promises: [
      { customerId: 'c1', name: 'Ramesh', due: '2026-10-27', balance: 340 },
      { customerId: 'c2', name: 'Sunita', due: '2026-10-29', balance: 650 },
    ],
    customers: [
      { id: 'c1', name: 'Ramesh', balance: 340 },
      { id: 'c2', name: 'Sunita', balance: 650 },
    ],
    alerts: { reminderEveryDays: 7 },
  };

  it('reads /start codes for shops and customers, and stop replies', () => {
    expect(parseStartCode('/start AB12CD')).toEqual({ kind: 'shop', code: 'AB12CD' });
    expect(parseStartCode('/start CAB12CD9')).toEqual({ kind: 'customer', code: 'CAB12CD9' });
    expect(parseStartCode('/start ab12cd')).toBeNull();
    expect(parseStartCode('/start')).toBeNull();
    expect(isStopMessage('/stop')).toBe(true);
    expect(isStopMessage('band')).toBe(true);
    expect(isStopMessage('stop sending maggi')).toBe(false);
  });

  it('writes the summary, with zero totals when the last upload was another day', () => {
    const text = dailySummaryText(shop, '2026-10-28');
    expect(text).toContain('Sharma &lt;General&gt; Store');
    expect(text).toContain('Bikri: <b>₹1,240</b> (5)');
    expect(text).toContain('Maggi — 2 packet');
    expect(dailySummaryText(shop, '2026-10-29')).toContain('Bikri: <b>₹0</b> (0)');
  });

  it('alerts only for newly low items, once a day', () => {
    const before = { lowStock: [{ id: 'poha' }] };
    const after = { lowStock: [{ id: 'poha' }, { id: 'maggi' }] };
    expect(newlyLowItems(before, after).map((i) => i.id)).toEqual(['maggi']);
    expect(newlyLowItems(undefined, after)).toHaveLength(2);
    const log = { maggi: '2026-10-28T08:00:00Z' };
    expect(notRecentlyAlerted([{ id: 'maggi' }], log, new Date('2026-10-28T12:00:00Z'))).toEqual(
      [],
    );
    expect(
      notRecentlyAlerted([{ id: 'maggi' }], log, new Date('2026-10-29T09:00:00Z')),
    ).toHaveLength(1);
    expect(lowStockText(shop.lowStock)).toContain('Maggi — 2 packet');
  });

  it('lists promises due today or overdue', () => {
    expect(promisesDue(shop, '2026-10-28').map((p) => p.name)).toEqual(['Ramesh']);
  });

  it('reminds only linked customers not reminded recently', () => {
    const now = new Date('2026-10-28T03:30:00Z');
    const chats = new Map([
      ['c1', 111],
      ['c2', 222],
    ]);
    const log = { c1: '2026-10-25T03:30:00Z' };
    expect(customersToRemind(shop, log, chats, now).map((c) => c.id)).toEqual(['c2']);
    expect(customersToRemind(shop, {}, new Map([['c1', 111]]), now).map((c) => c.id)).toEqual([
      'c1',
    ]);
    const many = {
      ...shop,
      customers: Array.from({ length: 80 }, (_, i) => ({ id: `x${i}`, name: 'X', balance: 10 })),
    };
    const allChats = new Map(many.customers.map((c, i) => [c.id, i]));
    expect(customersToRemind(many, {}, allChats, now)).toHaveLength(MAX_REMINDERS_PER_DAY);
  });

  it('writes the customer reminder with UPI and stop hint', () => {
    const text = paymentReminderText(shop, shop.customers[0]);
    expect(text).toContain('Ramesh ji');
    expect(text).toContain('<b>₹340</b>');
    expect(text).toContain('<code>sharma@upi</code>');
    expect(text).toContain('/stop');
  });

  it('escapes HTML and uses India dates', () => {
    expect(escapeHtml('<b>&')).toBe('&lt;b&gt;&amp;');
    expect(indiaDayKey(new Date('2026-10-28T19:00:00Z'))).toBe('2026-10-29');
  });
});

describe('telegram client', () => {
  it('accepts only the exact webhook secret', () => {
    expect(isValidSecret('s3cret-token', 's3cret-token')).toBe(true);
    expect(isValidSecret('s3cret-tokeX', 's3cret-token')).toBe(false);
    expect(isValidSecret('short', 's3cret-token')).toBe(false);
    expect(isValidSecret(undefined, 's3cret-token')).toBe(false);
    expect(isValidSecret('s3cret-token', '')).toBe(false);
  });

  it('posts HTML messages and throws on API errors', async () => {
    const calls = [];
    const realFetch = globalThis.fetch;
    globalThis.fetch = async (url, init) => {
      calls.push({ url, body: JSON.parse(init.body) });
      return calls.length === 1
        ? { ok: true, json: async () => ({ ok: true }) }
        : { ok: false, status: 403, text: async () => 'Forbidden' };
    };
    try {
      await expect(sendMessage({ token: 'T', chatId: 7, text: '<b>Hi</b>' })).resolves.toEqual({
        ok: true,
      });
      expect(calls[0].url).toBe('https://api.telegram.org/botT/sendMessage');
      expect(calls[0].body).toMatchObject({ chat_id: 7, text: '<b>Hi</b>', parse_mode: 'HTML' });
      await expect(sendMessage({ token: 'T', chatId: 7, text: 'x' })).rejects.toThrow(
        'Telegram API 403: Forbidden',
      );
    } finally {
      globalThis.fetch = realFetch;
    }
  });
});

describe('webhookAction', () => {
  const chat = { id: 5, type: 'private' };

  it('routes start codes, stop and plain /start', () => {
    expect(webhookAction({ chat, text: '/start ABC123' })).toEqual({
      kind: 'shop',
      code: 'ABC123',
    });
    expect(webhookAction({ chat, text: '/start CABC1234' })).toEqual({
      kind: 'customer',
      code: 'CABC1234',
    });
    expect(webhookAction({ chat, text: '/stop' })).toEqual({ kind: 'stop' });
    expect(webhookAction({ chat, text: '/start' })).toEqual({ kind: 'hello' });
    expect(webhookAction({ chat, text: 'kuch bhi' })).toEqual({ kind: 'ignore' });
  });

  it('ignores groups, non-text updates and empty bodies', () => {
    expect(webhookAction({ chat: { id: 5, type: 'group' }, text: '/start ABC123' })).toEqual({
      kind: 'ignore',
    });
    expect(webhookAction({ chat, sticker: {} })).toEqual({ kind: 'ignore' });
    expect(webhookAction(undefined)).toEqual({ kind: 'ignore' });
  });
});
