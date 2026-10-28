# Bol Ke Hisaab

**Voice-first khata for kirana shops.** The owner speaks in Hinglish, Hindi or Marathi. The app reads the sentence, works out every amount from the shop's own price list, asks for one tap to confirm, and says the result back. The app understands, the code calculates, and the owner confirms, so no rupee is ever guessed.

Built for PromptWars × KickToTech 2026, Entrepreneurship & Local Business track. The full specification is in [docs/SRS.md](docs/SRS.md).

**Live demo:** https://bol-ke-hisaab-2026.web.app (open in Chrome; it can be installed to the home screen as an app).

## Run it

You need **Node.js 20 or newer** and **Google Chrome** (Edge also works).

```bash
npm install
npm run dev
```

Open **http://localhost:5173** in Chrome. The app starts with fictional demo data (a shop, 6 customers and 7 days of sales), so it is ready to use right away. You don't need an account, API key or `.env` file.

When you tap the mic for the first time, allow microphone access. The mic needs `localhost` or `https`, plus an internet connection, because Chrome sends the audio to its own speech service. If there is no mic or no internet, you can still type in the command bar or tap a demo chip.

### Other scripts

| Command | What it does |
| --- | --- |
| `npm test` | Runs the Vitest unit tests (parser, ledger, queries, forecast, reminders, promises, to-dos, voice fixes, store, i18n, month report, Telegram alerts) |
| `npm run test:coverage` | Runs the tests with V8 coverage; fails below 90% statements / 85% branches on the logic modules |
| `npm run lint` | Runs ESLint (react, react-hooks, jsx-a11y) and the Prettier check |
| `npm run build` | Builds for production into `dist/` |
| `npm run check` | Lint + coverage + build — the same steps CI runs on every push (`.github/workflows/ci.yml`) |
| `npm run preview` | Serves the production build at http://localhost:4173 |
| `npm run build && firebase deploy` | Deploys `dist/` to Firebase Hosting (project in `.firebaserc`) |

## Try it in one minute

Tap the mic and say one of these phrases, or tap it as a chip under **Try saying**:

| # | Say | You get |
| --- | --- | --- |
| 1 | Ramesh ne 2 kilo cheeni aur 1 Parle-G udhaar liya | Credit sale: Sugar 2 kg × ₹45 + Parle-G 1 × ₹10 = **₹100**. Ramesh's balance goes from ₹240 to ₹340 |
| 2 | Sunita ne 200 rupaye diye | Payment of ₹200. Sunita's balance goes from ₹650 to ₹450 |
| 3 | 10 packet Maggi aaya | Stock in: Maggi goes from 6 to 16 |
| 4 | 3 Maggi cash mein becha | Cash sale: 3 × ₹14 = **₹42** |
| 5 | Kiska udhaar sabse zyada hai? | Spoken answer: Sunita Jadhav, ₹650 |
| 6 | Mohan Sunday ko dega | Promise to pay, due next Sunday. Shows on Home until Mohan pays or clears his dues |
| 7 | Maggi ka rate 15 kar do | Price change: old price → new price, editable on the card before you confirm |
| 8 | Aaj ka hisaab batao | Spoken day summary: sales, cash collected and udhaar given today |
| 9 | Kya mangwana hai? | Order list: items at or below their reorder level, with how much to order |

Every entry opens a **confirmation card**. On the card you can change quantities, remove items, switch the customer or the entry type, and then confirm. You can also **fix the card by voice**: tap **Bolkar badliye** and say "Nahi, teen Maggi", and only what you said changes. After you confirm, the dashboard, khata and stock update, the app speaks the new balance, and an **Undo** button stays up for 10 seconds.

You can also ask questions like:

- Aaj kitni bikri hui?
- Maggi kitni bachi hai?
- Ramesh ka kitna baaki hai?
- Kya khatam hone wala hai?

The same sentences also work in Devanagari, for example "रमेश ने दो किलो चीनी और एक पारले उधार लिया" or "रमेशने दोन किलो साखर उधार घेतली". Pick the language with the switch at the top of the voice panel.

**Keyboard:** Space toggles the mic, Enter confirms the card, Esc cancels it, and Tab moves through every control.

## What's inside

| Screen | What it shows |
| --- | --- |
| **Home** | Today's sales as the headline number, compared with yesterday at the same time, plus cash collected. A **What to do now** list (items to restock, udhaar to collect, promises due) with one action each, then total udhaar, low-stock count, a 7-day sales chart, top debtors and recent entries |
| **Khata** | Customers sorted by balance, with search in Latin and Devanagari. Each customer shows their last entries, any promise to pay, and a polite **reminder you can copy** in Hinglish, Hindi or Marathi, with a UPI pay link when the shop has a UPI ID. The reminder is copied only, never sent |
| **Stock** | Every item with price, a stock bar against its reorder level, and "runs out in N days" based on the last 7 days of sales |
| **Settings** | Shop name, shop UPI ID (for reminders), voice language, mute, export data as JSON, and reset demo data |

On phones, a **speak-or-type bar** sits above the tab bar on every screen: tap it to talk, or type and send. The app is an installable **PWA** with a manifest, icons and a service worker, so it opens offline after the first visit.

## How it works

```
UI (src/pages, src/features, src/components/ui)
        │  dispatches actions, reads selectors
        ▼
State (src/store)  — one React context + useReducer, saved to localStorage key "bkh:v1"
        │  calls
        ▼
Logic (src/lib)    — pure functions, no React, no DOM, no storage, fully unit-tested
```

- **Parser** (`src/lib/parser/`): a rule-based `parseCommand()`. It normalises Latin and Devanagari text, reads number words in all three languages ("do sau" = 200, "dedh kilo" = 1.5), detects the intent from keyword tables, and fuzzy-matches items and customers ("chinni" → Sugar, "magi" → Maggi). It never throws. When it can't understand a sentence it returns three suggestions instead.
- **Money is never guessed.** Prices come only from the catalogue. Each line is `round(qty × price)` in whole rupees, and nothing is saved until the owner taps Confirm.
- **Ledger** (`src/lib/ledger.js`): transactions are immutable records, so Undo reverses each effect exactly.
- **Speech:** the browser's Web Speech API (`webkitSpeechRecognition`, `speechSynthesis`). The voice falls back from the language's own voice to hi-IN, then en-IN, then text only.

**Stack:** React 19, Vite, Tailwind CSS v4, framer-motion, recharts, lucide-react, Vitest, ESLint and Prettier. There is no backend, no LLM call and no API key.

## Privacy

All data stays in this browser's `localStorage`. The app collects no phone numbers or addresses and sends no messages. The only data that leaves the device is the audio Chrome sends to its own speech service while the mic is on. All names and prices in the demo data are fictional.

## Limitations

- Understanding is rule-based on purpose. It covers the common sentence patterns in [SRS Section 9](docs/SRS.md#9-command-parser-specification). For unusual sentences, edit them on the card or type them instead.
- Voice input needs Chrome or Edge and an internet connection. Typing, the demo chips and the whole ledger work offline.
- The app runs on a single device with no cloud sync. Firebase only hosts the static files; the khata itself never leaves the browser. Clearing the site data clears the khata.
- Which speech-output voices are available depends on the device. If there is no Hindi or Marathi voice, the app speaks with an Indian English voice or shows the answer as text only.

## Project layout

```
docs/SRS.md            specification (PRD, FRs, design system, parser rules, test plan)
src/app/               layout: sidebar / tab bar / voice panel
src/pages/             Home, Khata, Stock, Settings
src/features/          voice, commands (confirmation card), dashboard, khata, stock, settings
src/components/ui/     shared UI components
src/lib/               pure logic: parser, ledger, queries, forecast, reminders, promises, correction, format
public/                PWA manifest, service worker, icons
src/store/             context, reducer, selectors, persistence
src/data/              catalogue, customers, deterministic 7-day seed
src/i18n/              UI text and speech templates: hinglish.js, hi.js, mr.js (strings.js combines them)
tests/                 Vitest unit tests for src/lib
```
