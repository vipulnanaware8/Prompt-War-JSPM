// Telegram alerts for Bol Ke Hisaab (Cloud Functions, Mumbai region). Telegram bots are free.
//
//   telegramWebhook  — bot updates: "/start <code>" links a shop owner or a customer, /stop unlinks.
//   lowStockAlert    — runs on every shop upload; alerts when an item newly drops to its reorder level.
//   dailySummary     — 9 PM IST: today's sales, cash, udhaar and low stock to the owner.
//   morningAlerts    — 9 AM IST: promises due today to the owner, udhaar reminders to customers.
//
// Firestore: shops/{uid} (written by the app), connectCodes/{code} and inviteCodes/{code}
// (one-time link codes, created by the app), connections/{uid}, customerChats/{uid}_{customerId}
// and alertLog/{uid} (server only). See firestore.rules.

import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { logger, setGlobalOptions } from 'firebase-functions/v2';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { onRequest } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { defineSecret } from 'firebase-functions/params';
import {
  customersToRemind,
  dailySummaryText,
  escapeHtml,
  indiaDayKey,
  lowStockText,
  newlyLowItems,
  notRecentlyAlerted,
  paymentReminderText,
  promiseDueText,
  promisesDue,
  webhookAction,
} from './alerts.js';
import { isValidSecret, sendMessage } from './telegram.js';

initializeApp();
setGlobalOptions({ region: 'asia-south1', maxInstances: 5 });

const db = getFirestore();
const TELEGRAM_BOT_TOKEN = defineSecret('TELEGRAM_BOT_TOKEN');
const TELEGRAM_WEBHOOK_SECRET = defineSecret('TELEGRAM_WEBHOOK_SECRET');

const SHOP_CODE_TTL_MS = 30 * 60 * 1000;
const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const IST = 'Asia/Kolkata';

const send = (chatId, text) => sendMessage({ token: TELEGRAM_BOT_TOKEN.value(), chatId, text });

/** Every linked shop whose alerts are on: [{ uid, chatId, shop }]. */
async function linkedShops() {
  const links = await db.collection('connections').get();
  const shops = await Promise.all(
    links.docs.map(async (link) => {
      const shop = (await db.doc(`shops/${link.id}`).get()).data();
      return shop?.alerts?.enabled ? { uid: link.id, chatId: link.get('chatId'), shop } : null;
    }),
  );
  return shops.filter(Boolean);
}

/** Runs `task` for each shop; one shop failing never stops the others. */
async function forEachShop(label, task) {
  for (const entry of await linkedShops()) {
    try {
      await task(entry);
    } catch (error) {
      logger.error(`${label} failed`, { uid: entry.uid, error: error.message });
    }
  }
}

/** Reads and deletes a one-time code; null when missing or expired. */
async function claimCode(collection, code, ttl) {
  const ref = db.doc(`${collection}/${code}`);
  const snap = await ref.get();
  const createdAt = snap.get('createdAt')?.toMillis?.() ?? 0;
  if (!snap.exists || Date.now() - createdAt > ttl) return null;
  await ref.delete();
  return snap.data();
}

async function linkShop(chat, from, code) {
  const data = await claimCode('connectCodes', code, SHOP_CODE_TTL_MS);
  if (!data) {
    await send(
      chat.id,
      'Yeh link purana ho gaya. App ke Settings mein "Telegram jodiye" dobara dabaiye.',
    );
    return;
  }
  await db.doc(`connections/${data.uid}`).set({
    chatId: chat.id,
    name: from?.first_name ?? from?.username ?? '',
    connectedAt: new Date().toISOString(),
  });
  await send(
    chat.id,
    '✅ <b>Bol Ke Hisaab se jud gaya!</b>\nRoz raat 9 baje ka hisaab, kam stock aur vaadon ke alerts ab yahin aayenge.',
  );
}

async function linkCustomer(chat, code) {
  const data = await claimCode('inviteCodes', code, INVITE_TTL_MS);
  if (!data) {
    await send(chat.id, 'Yeh link purana ho gaya. Dukaan se naya link maangiye.');
    return;
  }
  const shopName = (await db.doc(`shops/${data.uid}`).get()).get('shopName') ?? 'dukaan';
  await db.doc(`customerChats/${data.uid}_${data.customerId}`).set({
    uid: data.uid,
    customerId: data.customerId,
    chatId: chat.id,
    linkedAt: new Date().toISOString(),
  });
  await send(
    chat.id,
    `✅ <b>${escapeHtml(shopName)}</b> se jud gaye. Udhaar ka reminder yahin aayega.\nBand karne ke liye /stop bhejiye.`,
  );
}

/** /stop: remove this chat from every shop and customer link. */
async function unlinkChat(chatId) {
  const [customers, shops] = await Promise.all([
    db.collection('customerChats').where('chatId', '==', chatId).get(),
    db.collection('connections').where('chatId', '==', chatId).get(),
  ]);
  await Promise.all([...customers.docs, ...shops.docs].map((doc) => doc.ref.delete()));
  await send(chatId, 'Theek hai, ab aapko koi message nahi bheja jayega.');
}

export const telegramWebhook = onRequest(
  { secrets: [TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET] },
  async (req, res) => {
    const header = req.get('x-telegram-bot-api-secret-token');
    if (req.method !== 'POST' || !isValidSecret(header, TELEGRAM_WEBHOOK_SECRET.value())) {
      res.status(401).send('Unauthorized');
      return;
    }
    const message = req.body?.message;
    const action = webhookAction(message);
    try {
      if (action.kind === 'shop') await linkShop(message.chat, message.from, action.code);
      if (action.kind === 'customer') await linkCustomer(message.chat, action.code);
      if (action.kind === 'stop') await unlinkChat(message.chat.id);
      if (action.kind === 'hello') {
        await send(message.chat.id, 'Namaste! Jodne ke liye Bol Ke Hisaab app wala link kholiye.');
      }
    } catch (error) {
      logger.error('Webhook update failed', { error: error.message });
    }
    res.sendStatus(200); // always 200, or Telegram retries the same update
  },
);

export const lowStockAlert = onDocumentWritten(
  { document: 'shops/{uid}', secrets: [TELEGRAM_BOT_TOKEN] },
  async (event) => {
    const before = event.data?.before?.data();
    const after = event.data?.after?.data();
    if (!after?.alerts?.enabled || !after.alerts.lowStock) return;

    const fresh = newlyLowItems(before, after);
    if (fresh.length === 0) return;
    const { uid } = event.params;
    const [link, logSnap] = await Promise.all([
      db.doc(`connections/${uid}`).get(),
      db.doc(`alertLog/${uid}`).get(),
    ]);
    if (!link.exists) return;

    const now = new Date();
    const items = notRecentlyAlerted(fresh, logSnap.get('lowStock') ?? {}, now);
    if (items.length === 0) return;
    await send(link.get('chatId'), lowStockText(items));
    const stamped = Object.fromEntries(items.map((i) => [i.id, now.toISOString()]));
    await db.doc(`alertLog/${uid}`).set({ lowStock: stamped }, { merge: true });
  },
);

export const dailySummary = onSchedule(
  { schedule: '0 21 * * *', timeZone: IST, secrets: [TELEGRAM_BOT_TOKEN] },
  () =>
    forEachShop('Daily summary', async ({ chatId, shop }) => {
      if (shop.alerts.dailySummary) await send(chatId, dailySummaryText(shop, indiaDayKey()));
    }),
);

export const morningAlerts = onSchedule(
  { schedule: '0 9 * * *', timeZone: IST, secrets: [TELEGRAM_BOT_TOKEN] },
  () =>
    forEachShop('Morning alerts', async ({ uid, chatId, shop }) => {
      const due = promisesDue(shop, indiaDayKey());
      if (shop.alerts.promises && due.length > 0) await send(chatId, promiseDueText(due));
      if (!shop.alerts.customerReminders) return;

      const [chatSnaps, logSnap] = await Promise.all([
        db.collection('customerChats').where('uid', '==', uid).get(),
        db.doc(`alertLog/${uid}`).get(),
      ]);
      const chats = new Map(chatSnaps.docs.map((d) => [d.get('customerId'), d.get('chatId')]));
      const now = new Date();

      const sent = {};
      for (const customer of customersToRemind(shop, logSnap.get('reminders') ?? {}, chats, now)) {
        try {
          await send(chats.get(customer.id), paymentReminderText(shop, customer));
          sent[customer.id] = now.toISOString();
        } catch (error) {
          logger.error('Reminder failed', { uid, customer: customer.id, error: error.message });
        }
      }
      if (Object.keys(sent).length > 0) {
        await db.doc(`alertLog/${uid}`).set({ reminders: sent }, { merge: true });
      }
    }),
);
