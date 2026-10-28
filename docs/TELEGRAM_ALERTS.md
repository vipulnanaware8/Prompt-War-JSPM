# Telegram alerts — setup (free)

Once a shopkeeper links Telegram in **Settings → Telegram alerts**, they get:

| Alert | When | To |
| --- | --- | --- |
| Daily summary (sales, cash, udhaar, low stock) | 9 PM IST | Shopkeeper |
| Low stock | As soon as an item drops to its reorder level (max once a day per item) | Shopkeeper |
| Promises due today | 9 AM IST | Shopkeeper |
| Udhaar reminder (with UPI ID if set) | 9 AM IST, every 3 / 7 / 15 days | Customers who tapped Start on their invite link; `/stop` ends it |

**Cost: ₹0.** Telegram bots are free with no per-message charge. The server runs on Firebase's free tier (see below).

Without the setup below the app works exactly as before; the Settings card just says alerts are not set up.

## How it works

1. Shopkeeper taps **Telegram jodiye** → Telegram opens the bot → taps **Start**. The bot receives `/start <one-time code>` and links that chat to the shop (`connections/{uid}`).
2. For a customer: with customer reminders on, the customer's sheet in Khata shows **Telegram reminder ka link bhejiye**. It opens a WhatsApp share with the invite link (the shopkeeper sends it themselves, free). The customer taps Start → linked (`customerChats`). Starting the bot is their consent; `/stop` unlinks.
3. While alerts are on, the app uploads a small summary to `shops/{uid}` (today's totals, low-stock items, open promises, invited customers with dues) — never the full ledger. Each phone signs in anonymously. No phone numbers are stored.
4. Cloud Functions send the messages through the Telegram Bot API.

**Telegram hataiye** in Settings deletes the link and the uploaded summary.

## One-time setup

### 1. Create the bot (2 minutes)

1. In Telegram, open **@BotFather** → `/newbot` → pick a name (e.g. *Bol Ke Hisaab*) and a username ending in `bot` (e.g. `BolKeHisaabBot`).
2. Copy the **bot token** it gives you. Keep it secret.

### 2. Firebase

1. Upgrade project `bol-ke-hisaab-2026` to **Blaze**. Cloud Functions require it, but this usage (a few hundred invocations a day, 2 scheduled jobs) stays inside the always-free quota, so the bill is ₹0. Set a budget alert at ₹1 in Google Cloud Billing for peace of mind.
2. **Authentication → Sign-in method →** enable **Anonymous**.
3. **Firestore Database →** create a database (region `asia-south1`, production mode).
4. **Project settings → Your apps →** add a **Web app**. Copy its config and the bot username into `.env.local` (see `.env.example`).

### 3. Deploy the functions

```bash
cd functions && npm install && cd ..
firebase functions:secrets:set TELEGRAM_BOT_TOKEN       # the token from BotFather
firebase functions:secrets:set TELEGRAM_WEBHOOK_SECRET  # any random string: letters, digits, _ or -
firebase deploy --only firestore:rules,functions
```

### 4. Point the bot at the webhook

Open this URL once in a browser (fill in your token and secret):

```
https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://asia-south1-bol-ke-hisaab-2026.cloudfunctions.net/telegramWebhook&secret_token=<WEBHOOK_SECRET>&allowed_updates=["message"]
```

It should answer `{"ok":true,"result":true,"description":"Webhook was set"}`.

### 5. Ship the app

```bash
npm run build && firebase deploy --only hosting
```

Open `/app` → Settings → **Telegram jodiye** → Start in the bot. The card turns green and the bot confirms.

## Testing

- `npm test` covers the alert rules (`functions/alerts.js`) and the summary the app uploads.
- To fire the scheduled jobs now: Google Cloud console → **Cloud Scheduler** → *Force run* on `firebase-schedule-dailySummary-asia-south1` / `firebase-schedule-morningAlerts-asia-south1`.
- Logs: `firebase functions:log`.

## Limits

- Customers need the Telegram app. Those who don't use Telegram can still get the manual WhatsApp reminder from their sheet (as before).
- A bot can only message people who pressed Start on it — that is why customers get an invite link.
- Each shop sends at most 50 customer reminders a day; Telegram itself allows ~30 messages a second, far above this.
