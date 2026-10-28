// Minimal Telegram Bot API client. Free, no templates, no per-message cost.
import { timingSafeEqual } from 'node:crypto';

/**
 * Send an HTML-formatted message.
 * @param {{ token: string, chatId: number|string, text: string }} opts
 */
export async function sendMessage({ token, chatId, text }) {
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      link_preview_options: { is_disabled: true },
    }),
  });
  if (!res.ok) throw new Error(`Telegram API ${res.status}: ${await res.text()}`);
  return res.json();
}

/** Telegram echoes the secret given to setWebhook in this header on every update. */
export function isValidSecret(header, secret) {
  if (!header || !secret) return false;
  const given = Buffer.from(header);
  const expected = Buffer.from(secret);
  return given.length === expected.length && timingSafeEqual(given, expected);
}
