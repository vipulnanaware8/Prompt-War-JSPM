# Bol Ke Hisaab — SRS, PRD & UI/UX Specification

Oct 28, 2026 · @VN

## How to use this document

Export this doc as Markdown, save it in the project as `docs/SRS.md`, and give Claude in Antigravity this prompt:

> Read `docs/SRS.md` completely. Implement Bol Ke Hisaab exactly as specified, phase by phase (Section 12 timeline). Follow the folder structure in Section 10, the design system in Section 7 and the parser rules in Section 9. After each phase: run the app, fix every terminal and console error, run `npm test`, and commit. Mark each FR as done only after you have verified it in the running app. Never add features that are not in this document.

Priority rule for every decision: **1) never breaks on stage, 2) looks premium, 3) feature count.** FRs marked **Must** are the MVP; **Should** only after every Must works; **Could** only if time remains.

## 1. Introduction

Bol Ke Hisaab is a voice-first, browser-based shop ledger that lets a kirana owner record sales, payments, stock and credit by speaking, and confirms every entry before saving it.

**Purpose.** This document specifies the problem, product requirements, every functional requirement, non-functional requirements, UI/UX design system, data model, parser rules, architecture and test plan for the hackathon MVP.

**Scope (MVP).** A single-device, frontend-only web app. No backend, no login, no API keys, no payments, no messages sent. All data is fictional demo data stored in the browser.

**Event context.** PromptWars × KickToTech 2026, Entrepreneurship & Local Business track. Build window 12:15 PM to 5:30 PM, target submission 4:30 PM.

### Definitions

| Term | Meaning |
| --- | --- |
| Kirana | Small neighbourhood grocery / general store |
| Udhaar | Goods given on credit; customer pays later |
| Khata | The ledger of a customer's udhaar balance |
| Jama | Money deposited / paid back |
| Command | One spoken or typed sentence, e.g. "Ramesh ne 2 kilo cheeni udhaar liya" |
| Intent | What a command means: credit sale, cash sale, payment, stock in, query |
| Confirmation card | The sheet that shows a parsed command for the owner to confirm |
| Hinglish | Hindi written or spoken with English words, in Latin script |
| FR / NFR | Functional / non-functional requirement |

## 2. Problem statement

Kirana owners lose money and time because recording sales and udhaar in a notebook does not fit a busy shop counter, and typing-based apps do not either.

1. **Typing does not fit the counter.** Owners serve customers with both hands busy, and many are not comfortable with English forms.
2. **Mistakes cost real money.** A missed udhaar entry or a wrong total is money lost; apps that guess amounts make this worse.
3. **The owner cannot see the business.** Who owes the most, what sold today and what will run out are buried in notebook pages.

**Problem statement (submission version):** Small kirana owners in Maharashtra record sales, stock and customer credit in paper notebooks during busy hours, leading to missed entries, disputes over dues and surprise stock-outs. Existing ledger apps require typing and form-filling. Bol Ke Hisaab lets the owner simply speak in Hinglish, Hindi or Marathi; it calculates every amount from the shop's own price list, asks for a one-tap confirmation, and speaks the result back.

**One-line summary:** Bol Ke Hisaab lets kirana owners run their khata by voice: the app understands, the code calculates, the owner confirms, so no rupee is ever guessed.

## 3. Product requirements (PRD)

The product goal for today is a demo that never breaks, looks premium, and shows a shop owner running the khata by voice in under 3 minutes.

### 3.1 Vision

"Bolo, aur hisaab ho gaya" — the owner speaks, the shop's books update correctly, and the app talks back in the owner's language.

### 3.2 Goals and demo success criteria

| Goal | Success criterion (verified before submission) |
| --- | --- |
| Voice entry works | All 5 demo phrases produce the correct confirmation card by voice and by chip |
| Money is never guessed | Every total equals quantity × catalogue price; 100% of ledger tests pass |
| Premium look | Every screen matches Section 7; no layout breaks at 375 px or 1440 px width |
| Never breaks | No console errors during a full demo run; app works with mic denied |
| Judges understand it fast | Full demo flow fits in 3 minutes |

### 3.3 Personas

| Persona | Context | Needs | Frustration |
| --- | --- | --- | --- |
| Suresh Sharma, 48, kirana owner, Pune | Serves 150+ customers a day, 20 regulars on udhaar | Record entries without stopping work; know who owes what | Notebook pages, disputes over dues, surprise stock-outs |
| Kavita, 24, owner's daughter | Helps in the evening, comfortable with phones | See today's sales and dues at a glance | Reading father's handwriting |

### 3.4 User stories

| ID | As a… | I want to… | So that… |
| --- | --- | --- | --- |
| US-1 | shop owner | say a credit sale out loud | I don't stop serving to write |
| US-2 | shop owner | see the total before it is saved | no wrong amount enters my khata |
| US-3 | shop owner | hear the new balance spoken back | I can confirm without looking |
| US-4 | shop owner | record a payment by voice | the customer's dues update instantly |
| US-5 | shop owner | add new stock by voice | my stock count stays right |
| US-6 | shop owner | ask "kiska udhaar sabse zyada hai?" | I know whom to remind |
| US-7 | shop owner | see what will run out in 3 days | I order before it runs out |
| US-8 | shop owner | copy a polite reminder message | I can ask for dues without awkwardness |
| US-9 | shop owner | undo a wrong entry | a mistake costs nothing |
| US-10 | shop owner | type when the shop is too noisy | the app always works |

### 3.5 Scope

**In scope:** voice and text commands, rule-based parsing in Hinglish / Hindi / Marathi, confirmation card, ledger updates, speak-back, spoken questions, dashboard, khata, stock, reminders (copy only), settings, demo data.

**Out of scope:** login, cloud sync, multiple devices, real payments or UPI, sending SMS/WhatsApp, GST invoices, printing bills, AI/LLM calls, phone numbers or addresses of customers.

### 3.6 Positioning

Voice khata apps already exist (for example VoiceKhata, LikhLo AI and UdharKhata Plus). Bol Ke Hisaab does not claim to be the first; it competes on trust and experience:

- **Money is never guessed:** amounts come only from the shop's catalogue, never from speech recognition or AI.
- **Confirmation-first:** nothing is saved without one tap.
- **Talks back** in the owner's language, and answers spoken questions from real data.
- **Marathi + Hindi + Hinglish,** including Devanagari script and number words.
- **Works with zero setup:** open in a browser, no account, data stays on the device.

## 4. Overall description

Bol Ke Hisaab runs entirely in the browser; the only external dependency is the browser's own speech recognition, which needs internet.

### 4.1 Operating environment

| Item | Requirement |
| --- | --- |
| Browser | Google Chrome (desktop and Android), latest version. Edge as fallback. |
| Screen | 360 px to 1920 px wide; demo on a laptop at 1280–1440 px |
| Speech recognition | Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`); needs internet in Chrome |
| Speech output | `speechSynthesis`; available voices depend on the device |
| Mic access | Only on `localhost` or `https` |
| Node.js | v20 or newer for development |

### 4.2 Constraints

- Frontend only: React + Vite + Tailwind CSS + lucide-react + framer-motion + recharts + Vitest.
- No backend, no API keys, no LLM calls, no network requests other than the browser's speech service and Google Fonts.
- All data stored in `localStorage`; all demo data fictional.
- JavaScript (ES modules) with JSDoc types on all `src/lib` functions.
- Build window: about 3.5 hours of development.

### 4.3 Assumptions and dependencies

- The demo laptop has Chrome, a working mic and internet (phone hotspot as backup).
- The owner speaks common sentence patterns (Section 9); unusual sentences fall back to typing or editing on the confirmation card.
- Prices are whole rupees per unit; quantities may be decimals for kg / litre.

## 5. Functional requirements

There are 82 functional requirements in 12 modules; 66 are Must (MVP), 12 Should and 4 Could. An FR is done only when its acceptance criterion is verified in the running app.

### 5.1 App shell and navigation (FR-NAV)

| ID | Requirement | Priority | Acceptance criteria |
| --- | --- | --- | --- |
| FR-NAV-1 | Four sections: Home, Khata, Stock, Settings | Must | Each section reachable in one tap/click from anywhere |
| FR-NAV-2 | Mobile (< 1024 px): bottom tab bar with a raised centre mic button | Must | Tab bar fixed at bottom; active tab shows icon + label in primary colour |
| FR-NAV-3 | Desktop (≥ 1024 px): left sidebar + right sticky voice panel | Must | Voice panel visible on every section on desktop |
| FR-NAV-4 | Header shows shop name, today's date and a mute toggle | Must | Date formatted "Wed, 28 Oct"; mute state visible |
| FR-NAV-5 | Section switch uses a 200 ms fade/slide; respects reduced motion | Should | No animation when `prefers-reduced-motion` is set |

### 5.2 Dashboard (FR-DASH)

| ID | Requirement | Priority | Acceptance criteria |
| --- | --- | --- | --- |
| FR-DASH-1 | Greeting "Namaste, \<shop name>" with time-of-day subline | Must | Shop name comes from settings |
| FR-DASH-2 | Stat cards: Today's Sales, Udhaar Pending, Cash Collected Today, Low-Stock Items | Must | Values match ledger selectors; ₹ formatted en-IN (₹1,240) |
| FR-DASH-3 | Stat values count up on load and on change (600 ms) | Should | Final value always exact; disabled with reduced motion |
| FR-DASH-4 | 7-day sales bar chart (cash + credit sales per day) | Must | Seed data shows 7 bars; today's bar highlighted |
| FR-DASH-5 | Top 3 udhaar customers with balance and last activity | Must | Sorted by balance, highest first; tap opens customer sheet |
| FR-DASH-6 | Recent activity: last 5 transactions with icon, text and time | Must | New confirmed entry appears at top instantly |
| FR-DASH-7 | Tapping a stat card opens its related section | Could | Udhaar → Khata, Low stock → Stock filtered |

### 5.3 Voice input (FR-VOICE)

| ID | Requirement | Priority | Acceptance criteria |
| --- | --- | --- | --- |
| FR-VOICE-1 | Push-to-talk mic button: tap to start, tap to stop | Must | States idle / listening / processing / error each look different and have a text label |
| FR-VOICE-2 | Language switch: Hinglish (en-IN), हिंदी (hi-IN), मराठी (mr-IN) | Must | Selection persisted; recognition uses the selected `lang` |
| FR-VOICE-3 | Live interim transcript while listening | Must | Words appear while speaking; final text placed in the command bar |
| FR-VOICE-4 | Listening animation: pulsing orb + 5 animated bars | Must | Animation runs only while listening |
| FR-VOICE-5 | Auto-stop after 10 s, or on the browser's end of speech | Must | Mic never stays on indefinitely |
| FR-VOICE-6 | On final transcript, parse automatically and open the confirmation card | Must | No extra tap needed after speaking |
| FR-VOICE-7 | Errors handled: not-allowed, no-speech, network, audio-capture, unsupported | Must | Each shows a specific friendly message (Section 7.7); typing still works |
| FR-VOICE-8 | Command bar text input, always available; Enter submits | Must | Works with mic denied or unsupported browser |
| FR-VOICE-9 | Five demo chips under the mic (Section 9.7); one tap fills and parses | Must | Each chip produces the documented confirmation card |
| FR-VOICE-10 | Hint "Best in Chrome · mic needs internet" when idle | Should | Visible but subtle (muted text) |

### 5.4 Command parsing (FR-PARSE)

| ID | Requirement | Priority | Acceptance criteria |
| --- | --- | --- | --- |
| FR-PARSE-1 | Normalise input: lowercase, trim, strip punctuation, Devanagari digits → ASCII, unify ₹ / rs / rupaye | Must | "२ किलो" and "2 kilo" parse identically |
| FR-PARSE-2 | Detect intent: credit\_sale, cash\_sale, payment, stock\_in, query, unknown | Must | Follows precedence rules in Section 9.3 |
| FR-PARSE-3 | Extract quantities from digits, decimals, number words (3 languages), aadha / dedh / dhai | Must | "do kilo", "दो किलो", "दोन किलो", "2 kg" → 2 |
| FR-PARSE-4 | Extract units: kg, g, packet, litre, piece, dozen (3 languages) | Must | Missing unit → item's default unit |
| FR-PARSE-5 | Match items by alias, then fuzzy (Section 9.5) | Must | "chini", "cheeni", "चीनी", "साखर" → Sugar |
| FR-PARSE-6 | Support multiple items joined by aur / और / आणि / and / comma | Must | Demo phrase 1 returns 2 line items |
| FR-PARSE-7 | Match customer by alias, then fuzzy; unknown name → "New customer?" option | Must | "Ramesh", "रमेश", "Rames" → Ramesh Patil |
| FR-PARSE-8 | Extract amount for payments | Must | "200 rupaye diye" → 200 |
| FR-PARSE-9 | Output a structured result (Section 9.2) with a confidence per match | Must | Unit test covers the schema |
| FR-PARSE-10 | Unknown input returns a friendly message + 3 suggestions; never throws | Must | Gibberish test passes; no console error |
| FR-PARSE-11 | Parse time < 50 ms | Should | Measured on the 5 demo phrases |

### 5.5 Confirmation card (FR-CONF)

| ID | Requirement | Priority | Acceptance criteria |
| --- | --- | --- | --- |
| FR-CONF-1 | Bottom sheet slides up with intent badge, customer and line items (qty × price = subtotal) | Must | Matches Section 7.5 layout |
| FR-CONF-2 | Large TOTAL in tabular numbers | Must | Total = sum of rounded subtotals |
| FR-CONF-3 | Edit: quantity stepper, remove item, change customer, change intent | Must | Total recalculates instantly |
| FR-CONF-4 | Unknown item → inline "Add to catalogue" (name, unit, price) | Should | New item usable immediately |
| FR-CONF-5 | Validation: qty > 0; credit sale and payment need a customer; payment amount > 0 | Must | Confirm disabled with the reason shown |
| FR-CONF-6 | Warning if a sale exceeds stock (allowed after warning) | Must | Amber warning text, stock not negative after confirm unless accepted |
| FR-CONF-7 | Warning if a payment exceeds the balance (recorded as advance) | Should | Balance can go negative; shown as "Advance ₹X" |
| FR-CONF-8 | Confirm / Edit / Cancel buttons; Esc cancels; Enter confirms | Must | Nothing saved before Confirm |
| FR-CONF-9 | Success animation (check mark) on Confirm, 600 ms | Should | Card closes after animation |

### 5.6 Ledger (FR-LEDG)

| ID | Requirement | Priority | Acceptance criteria |
| --- | --- | --- | --- |
| FR-LEDG-1 | Credit sale: stock − qty, customer balance + total, transaction logged | Must | Demo phrase 1: Ramesh ₹240 → ₹340 |
| FR-LEDG-2 | Cash sale: stock − qty, cash collected + total | Must | Dashboard updates instantly |
| FR-LEDG-3 | Payment: balance − amount, cash collected + amount | Must | Demo phrase 2: Sunita ₹650 → ₹450 |
| FR-LEDG-4 | Stock in: stock + qty | Must | Demo phrase 3: Maggi stock + 10 |
| FR-LEDG-5 | Money in whole rupees: subtotal = round(qty × price) | Must | 0.5 kg × ₹45 = ₹23 |
| FR-LEDG-6 | Undo last transaction from a toast for 10 s | Must | All effects reversed exactly |
| FR-LEDG-7 | Transactions are immutable records (id, timestamp, type, customerId, lines, total) | Must | Undo removes the record; no edits in place |

### 5.7 Speak-back (FR-TTS)

| ID | Requirement | Priority | Acceptance criteria |
| --- | --- | --- | --- |
| FR-TTS-1 | After Confirm, speak a result sentence in the selected language (Section 7.8) | Must | e.g. "Ramesh ka total udhaar 340 rupaye ho gaya" |
| FR-TTS-2 | Voice choice: matching language voice, else hi-IN, else en-IN, else text only | Must | Voices loaded via the `voiceschanged` event |
| FR-TTS-3 | Mute toggle persisted | Must | Muted → no speech, text still shown |
| FR-TTS-4 | Speak query answers | Must | Same voice rules |
| FR-TTS-5 | Cancel speech when a new command starts | Should | Voices never overlap |

### 5.8 Spoken questions (FR-QRY)

| ID | Requirement | Priority | Acceptance criteria |
| --- | --- | --- | --- |
| FR-QRY-1 | "Kiska udhaar sabse zyada hai?" → top debtor and amount | Must | Answer card + speech |
| FR-QRY-2 | "Aaj kitni bikri hui?" → today's sales total and count | Must | Matches dashboard |
| FR-QRY-3 | "\<item> kitni bachi hai?" → stock with unit | Must | "Maggi kitni bachi hai" works |
| FR-QRY-4 | "\<customer> ka kitna baaki hai?" → balance | Must | "Ramesh ka kitna baaki hai" works |
| FR-QRY-5 | "Kya khatam hone wala hai?" → items running out within 3 days | Should | Lists up to 3 items |
| FR-QRY-6 | Unrecognised question → list of supported questions | Must | Never a blank answer |

### 5.9 Khata (FR-KHATA)

| ID | Requirement | Priority | Acceptance criteria |
| --- | --- | --- | --- |
| FR-KHATA-1 | Customer list sorted by balance, with search | Must | Search matches Latin and Devanagari aliases |
| FR-KHATA-2 | Customer detail sheet: balance, last 10 transactions | Must | Opens from list, dashboard and query answers |
| FR-KHATA-3 | "Copy reminder" in Hinglish / Hindi / Marathi (Section 7.8) | Must | Copied to clipboard + toast; nothing is sent |
| FR-KHATA-4 | Add customer (name + optional alias); no phone or address fields | Should | Usable in commands immediately |
| FR-KHATA-5 | Balance chip: red text "Due ₹X", green "Clear", blue "Advance ₹X" | Must | Status always has text, not only colour |

### 5.10 Stock (FR-STOCK)

| ID | Requirement | Priority | Acceptance criteria |
| --- | --- | --- | --- |
| FR-STOCK-1 | Item list: name, price/unit, stock, stock bar vs. reorder level | Must | Bar colour + text label |
| FR-STOCK-2 | Low-stock label when stock ≤ reorder level | Must | Count matches dashboard card |
| FR-STOCK-3 | "Runs out in N days" = stock ÷ average daily sales (last 7 days) | Must | "—" when no sales; unit tested |
| FR-STOCK-4 | Filter: All / Low stock / Running out (≤ 3 days) | Should | Filter state kept while on screen |
| FR-STOCK-5 | Edit price and stock; add item | Could | Changes persist |

### 5.11 Settings (FR-SET)

| ID | Requirement | Priority | Acceptance criteria |
| --- | --- | --- | --- |
| FR-SET-1 | Edit shop name | Must | Updates header and greeting |
| FR-SET-2 | Default voice language | Must | Same as FR-VOICE-2 |
| FR-SET-3 | Mute speech | Must | Same as FR-TTS-3 |
| FR-SET-4 | Reset demo data with confirmation dialog | Must | Restores seed exactly |
| FR-SET-5 | Export data as JSON file | Could | Download works |
| FR-SET-6 | About panel: privacy note + version | Could | Text from Section 7.8 |

### 5.12 Persistence and errors (FR-SYS)

| ID | Requirement | Priority | Acceptance criteria |
| --- | --- | --- | --- |
| FR-SYS-1 | Save state to `localStorage` key `bkh:v1` after every change, wrapped in try/catch | Must | Survives page refresh |
| FR-SYS-2 | Corrupt or old-version data → reset to seed + toast | Must | Manually corrupted key does not crash the app |
| FR-SYS-3 | Storage unavailable → run in memory + banner "Changes won't be saved" | Should | Works in private mode |
| FR-SYS-4 | Global error boundary with friendly screen and Reload button | Must | Thrown test error shows it |
| FR-SYS-5 | Toast system: success, warning, error; auto-dismiss 4 s; one at a time | Must | Used by undo, copy, errors |
| FR-SYS-6 | Seed data loaded on first run (Section 8.3) | Must | Dashboard looks alive on first open |

## 6. Non-functional requirements

The non-functional bar is set by the demo: instant response, no crashes, readable by a first-time user, and accessible.

| ID | Category | Requirement | How verified |
| --- | --- | --- | --- |
| NFR-1 | Performance | First load < 2 s on the demo laptop; command → confirmation card < 300 ms after speech ends | Manual timing |
| NFR-2 | Performance | Animations at 60 fps; only `transform` and `opacity` animated | Chrome performance panel |
| NFR-3 | Reliability | Zero console errors or warnings in a full demo run | Console check |
| NFR-4 | Reliability | App fully usable with mic denied, no speech support, or offline (typing + chips) | Manual test |
| NFR-5 | Usability | A first-time user records a credit sale in < 30 s without help | Hallway test with a friend |
| NFR-6 | Accessibility | Text contrast ≥ 4.5:1 (large text ≥ 3:1), per WCAG 2.1 AA | Colour tokens in Section 7.2 |
| NFR-7 | Accessibility | Touch targets ≥ 44 × 44 px; visible focus ring on every control | Manual check |
| NFR-8 | Accessibility | Full keyboard use: Tab order, Space toggles mic, Enter confirms, Esc cancels | Manual test |
| NFR-9 | Accessibility | Status never shown by colour alone; icons have `aria-label`; live regions announce results | Code review |
| NFR-10 | Accessibility | `prefers-reduced-motion` disables non-essential animation | DevTools emulation |
| NFR-11 | Localisation | UI strings in Hinglish, Hindi, Marathi via one strings file; Devanagari renders with Noto Sans Devanagari | Visual check |
| NFR-12 | Privacy | No data leaves the device except audio sent by the browser's speech service; no phone numbers, addresses or IDs collected | Code review |
| NFR-13 | Maintainability | Business logic only in `src/lib` (pure, tested); components < 150 lines; no logic duplicated | Code review |
| NFR-14 | Maintainability | ESLint + Prettier pass with zero errors | `npm run lint` |
| NFR-15 | Compatibility | Layout works from 360 px to 1920 px; tested at 375, 768, 1280, 1440 px | DevTools device mode |
| NFR-16 | Build | `npm run build` succeeds with no warnings | Build log |

## 7. UI/UX specification

The interface is built around one idea: the mic is the hero, the confirmation card is the trust moment, and every number is big, exact and readable at arm's length.

### 7.1 Design principles

1. **Voice first, touch always.** The mic is the biggest control on every screen; typing and chips are always one tap away.
2. **Show the maths.** Every total shows quantity × price, so the owner trusts it at a glance.
3. **Nothing saves silently.** Every write passes through the confirmation card and can be undone.
4. **Big and calm.** Large numbers, generous spacing, one primary action per screen, no clutter.
5. **Speak the owner's language.** Microcopy in simple Hinglish by default; Hindi and Marathi one tap away.
6. **Delight with restraint.** Motion explains what changed (count-ups, slides, check marks); nothing moves for decoration.

### 7.2 Design tokens

All colours pass WCAG AA for the text sizes they are used at. Define them once in `src/styles/tokens.css` and map them in `tailwind.config.js`; never hard-code a hex value in a component.

| Token | Value | Use |
| --- | --- | --- |
| `--bg` | #FFFBF5 | App background (warm off-white) |
| `--surface` | #FFFFFF | Cards, sheets |
| `--ink` | #1C1917 | Primary text; dark voice panel background |
| `--muted` | #57534E | Secondary text (7.6:1 on white) |
| `--border` | #E7E0D6 | Card borders, dividers |
| `--primary` | #C2410C | Primary buttons, active tab, mic (white text 5.2:1) |
| `--primary-strong` | #9A3412 | Primary text on soft backgrounds, pressed state |
| `--primary-soft` | #FFEDD5 | Udhaar badge, selected chip background |
| `--success` / `--success-soft` | #15803D / #DCFCE7 | Confirm, "Clear" balance, payment badge |
| `--danger` / `--danger-soft` | #B91C1C / #FEE2E2 | "Due" balance, errors, leaks |
| `--warning` / `--warning-soft` | #92400E / #FEF3C7 | Stock warnings, low stock |
| `--info` / `--info-soft` | #1D4ED8 / #DBEAFE | Stock-in badge, "Advance" balance |
| `--panel-text` / `--panel-muted` | #FAFAF9 / #A8A29E | Text on the dark voice panel |

```css
:root {
  --bg:#FFFBF5; --surface:#FFFFFF; --ink:#1C1917; --muted:#57534E; --border:#E7E0D6;
  --primary:#C2410C; --primary-strong:#9A3412; --primary-soft:#FFEDD5;
  --success:#15803D; --success-soft:#DCFCE7; --danger:#B91C1C; --danger-soft:#FEE2E2;
  --warning:#92400E; --warning-soft:#FEF3C7; --info:#1D4ED8; --info-soft:#DBEAFE;
  --panel-text:#FAFAF9; --panel-muted:#A8A29E;
  --radius-sm:8px; --radius-md:12px; --radius-lg:16px; --radius-xl:24px;
  --shadow-card:0 1px 2px rgba(28,25,23,.06),0 4px 12px rgba(28,25,23,.06);
  --shadow-raised:0 12px 32px rgba(28,25,23,.12);
  --glow-mic:0 0 0 8px rgba(234,88,12,.15),0 0 40px rgba(234,88,12,.35);
  --ease-out:cubic-bezier(.22,1,.36,1); --dur-fast:150ms; --dur-base:200ms; --dur-slow:300ms;
}
```

**Typography.** Inter (400, 500, 600, 700) for Latin; Noto Sans Devanagari (400, 600) for Hindi and Marathi; both from Google Fonts. All money and counts use `font-variant-numeric: tabular-nums`.

| Style | Size / line height | Weight | Use |
| --- | --- | --- | --- |
| Display | 40 / 48 px | 700 | Confirmation total, answer card number |
| H1 | 28 / 36 px | 700 | Greeting, screen titles |
| H2 | 20 / 28 px | 600 | Card titles, section headers |
| Body | 16 / 24 px | 400 | Default text (never smaller for primary content) |
| Small | 14 / 20 px | 500 | Secondary info, list meta |
| Caption | 12 / 16 px | 500 | Labels, chart axes, timestamps |

**Spacing** uses a 4 px grid: 4, 8, 12, 16, 24, 32, 48. Card padding 16 px (mobile) / 24 px (desktop); gap between cards 16 px.

**Motion.** Fast 150 ms (hover, press), base 200 ms (fades, tab switch), slow 300 ms (sheets). Easing `--ease-out`; sheets use a framer-motion spring (stiffness 400, damping 34). Count-ups 600 ms. All disabled under `prefers-reduced-motion` except opacity fades.

**Icons.** lucide-react, 20 px in lists, 24 px in navigation, 32 px in the mic; stroke 2. Intent icons: credit sale `NotebookPen`, cash sale `Banknote`, payment `HandCoins`, stock in `PackagePlus`, query `MessageCircleQuestion`.

### 7.3 Layout and breakpoints

| Breakpoint | Layout |
| --- | --- |
| < 640 px (mobile) | Single column, 16 px side padding; stat cards 2 × 2; bottom tab bar 64 px + safe area; mic FAB 72 px raised 24 px above the bar; voice panel opens as a full-height sheet |
| 640–1023 px (tablet) | Same as mobile with 24 px padding and wider cards (max 720 px centred) |
| ≥ 1024 px (desktop) | Left sidebar 240 px; main content max 760 px; right voice panel 380 px, sticky, full height, dark (`--ink`); stat cards 4 in a row |

### 7.4 Component library

All components live in `src/components/ui/` and are the only place visual styles are defined.

| Component | Variants | States / notes |
| --- | --- | --- |
| Button | primary, secondary, ghost, danger; sizes md (44 px), lg (56 px) | hover, pressed (scale .98), focus ring 2 px `--primary` offset 2 px, disabled (40% opacity + reason tooltip), loading spinner |
| IconButton | ghost, filled | Always has `aria-label` |
| Card | default, interactive | Interactive: hover lift 2 px + shadow-raised |
| StatCard | — | Icon, label, count-up value, delta text ("+₹340 aaj") |
| Badge | udhaar, cash, payment, stock, query, warning | Icon + text, soft background + strong text |
| BalanceChip | due, clear, advance | Text always present ("Due ₹340") |
| Sheet | bottom (mobile), modal (desktop 480 px) | Drag handle, focus trap, Esc closes, backdrop click closes |
| Toast | success, warning, error; with action (Undo) | Bottom centre above tab bar; `role=status`; auto-dismiss 4 s (undo toast 10 s with progress bar) |
| QtyStepper | — | − / value / +; min 0.5 for kg/litre else 1 |
| SearchInput | — | Clear button, Devanagari-friendly |
| MicOrb | idle, listening, processing, error | See 7.5 |
| Waveform | — | 5 bars animating with random heights while listening |
| Chip | demo, filter, language | Selected = `--primary-soft` + `--primary-strong` text |
| EmptyState | — | Illustration icon 48 px, title, one-line hint, optional action |
| Skeleton | line, card | Shown only if a render takes > 150 ms |
| ConfirmDialog | danger | Used for Reset demo data |

### 7.5 Screen specifications

**Home / Dashboard**

1. Header: shop name (H2), date (Small, muted), mute IconButton.
2. Greeting "Namaste, Sharma General Store" (H1, no emoji) + subline "Aaj ka hisaab ek nazar mein" (muted).
3. Stat grid: Today's Sales, Udhaar Pending, Cash Collected, Low Stock — each StatCard with icon tinted by meaning.
4. Card "Pichhle 7 din ki bikri": recharts BarChart, 200 px tall, bars `--primary` at 85% opacity, today's bar full `--primary`, rounded tops 6 px, no grid lines except a faint baseline, ₹ tooltips.
5. Card "Sabse zyada udhaar": 3 rows (avatar initial circle, name, last activity, BalanceChip).
6. Card "Haal ki entries": 5 rows (intent icon, sentence like "Ramesh — udhaar ₹100", relative time).

**Voice panel** (desktop right panel; mobile full-height sheet from the FAB)

1. Top: language chips (Hinglish · हिंदी · मराठी).
2. Centre: MicOrb 120 px. Idle = solid `--primary` circle with mic icon and soft shadow; Listening = scale pulse 1 → 1.08 (1.2 s loop) + `--glow-mic` + Waveform below + label "Sun raha hoon…"; Processing = spinner ring + "Samajh raha hoon…"; Error = `--danger` ring + message.
3. Live transcript in a large quote style (20 px), interim text at 60% opacity.
4. Command bar: text input + send button.
5. Demo chips (wrap, 2 rows) labelled "Try saying:".
6. Hint (Caption, `--panel-muted`): "Best in Chrome · mic needs internet".
7. Answer card area: query answers appear here (Display number + sentence + replay-speech IconButton).

**Confirmation card** (bottom sheet mobile / modal desktop)

1. Drag handle; intent Badge ("Udhaar sale").
2. Customer row: avatar initial, name, change link, balance preview "₹240 → ₹340" with arrow.
3. Line items: item name + Devanagari alias in Caption, "heard: cheeni" chip (muted, builds trust), QtyStepper, "× ₹45", subtotal right-aligned; remove IconButton.
4. Warnings (warning-soft box) e.g. "Stock mein sirf 1 bacha hai".
5. Divider, then TOTAL row: label "Total" + Display amount.
6. Actions: Cancel (ghost) and Confirm (primary lg, full width on mobile) labelled "Confirm ₹100".
7. On confirm: Confirm button morphs into a success check (600 ms), sheet closes, toast "Ho gaya! Undo" with 10 s progress bar, stat cards count up.

**Khata**: title, SearchInput, list of customers (avatar, name, alias in Devanagari, last activity, BalanceChip), sorted by balance. Tapping opens the Customer sheet: big balance, "Copy reminder" button with language picker, last 10 transactions.

**Stock**: title, filter chips (All · Low stock · Running out), item rows: name, price/unit, stock number + unit, stock bar (width = stock ÷ (2 × reorder level), capped at 100%; colours success / warning / danger with text label), "Runs out in 3 days" caption.

**Settings**: grouped cards: Shop (name), Voice (default language, mute), Data (Reset demo data — danger button + ConfirmDialog; Export JSON), About (privacy note, version).

### 7.6 Key user flows

1. **Credit sale by voice:** tap mic → speak "Ramesh ne 2 kilo cheeni aur 1 Parle-G udhaar liya" → card shows 2 × ₹45 + 1 × ₹10 = ₹100, "₹240 → ₹340" → Confirm → check animation → app speaks "Ramesh ka total udhaar 340 rupaye ho gaya" → dashboard counts up.
2. **Payment:** "Sunita ne 200 rupaye diye" → payment card "₹650 → ₹450" → Confirm → speech.
3. **Stock in:** "10 packet Maggi aaya" → stock card "Maggi 6 → 16 packet" → Confirm.
4. **Question:** "Kiska udhaar sabse zyada hai?" → answer card "Mohan Deshmukh — ₹480" (after flows 1–2) + speech, with "Open khata" link.
5. **Mistake recovery:** wrong item on the card → tap stepper or remove → Confirm; or Undo within 10 s.
6. **Mic failure:** error message → tap a demo chip or type → same card appears.

### 7.7 Empty, loading and error states

| Situation | What the user sees |
| --- | --- |
| No entries today | EmptyState "Aaj abhi tak koi entry nahi" + hint "Mic dabaiye aur boliye" |
| No low stock | "Sab stock theek hai" with check icon |
| Search no results | "Koi grahak nahi mila" + "Naya grahak jodiye" button |
| Mic permission denied | "Mic ki permission chahiye. Address bar mein mic icon dabaiye — ya type kariye." |
| No speech heard | "Kuch sunai nahi diya. Phir se boliye." |
| Network error | "Awaaz pehchanne ke liye internet chahiye. Type kariye ya demo chip dabaiye." |
| No mic found | "Mic nahi mila. Type karke entry kariye." |
| Browser unsupported | "Is browser mein voice nahi chalta. Chrome use kariye — typing chalu hai." |
| Command not understood | "Samajh nahi aaya — dobara boliye ya type kariye" + 3 suggestion chips |
| Storage unavailable | Banner "Is browser mein data save nahi hoga" |
| App crash | Error boundary: "Kuch gadbad ho gayi" + Reload button |

### 7.8 Microcopy and speech templates

| Event | Hinglish | हिंदी | मराठी |
| --- | --- | --- | --- |
| Credit sale | {name} ka total udhaar {balance} rupaye ho gaya. | {name} का कुल उधार {balance} रुपये हो गया। | {name} यांची एकूण उधारी {balance} रुपये झाली. |
| Payment | {name} ne {amount} rupaye diye. Ab baaki {balance} rupaye. | {name} ने {amount} रुपये दिए। अब बाकी {balance} रुपये। | {name} यांनी {amount} रुपये दिले. आता बाकी {balance} रुपये. |
| Cash sale | {total} rupaye ki bikri ho gayi. | {total} रुपये की बिक्री हो गई। | {total} रुपयांची विक्री झाली. |
| Stock in | {qty} {unit} {item} stock mein jud gaya. | {qty} {unit} {item} स्टॉक में जुड़ गया। | {qty} {unit} {item} स्टॉकमध्ये जमा झाले. |
| Reminder (copy) | Namaste {name} ji, {shop} mein aapka {balance} rupaye ka hisaab baaki hai. Suvidha ho to kripya chuka dijiye. Dhanyavaad! | नमस्ते {name} जी, {shop} में आपका {balance} रुपये का हिसाब बाकी है। सुविधा हो तो कृपया चुका दीजिए। धन्यवाद! | नमस्कार {name}, {shop} मध्ये तुमचे {balance} रुपये बाकी आहेत. सोयीनुसार कृपया भरावेत. धन्यवाद! |
| Privacy note | Aapka data sirf is device par rehta hai. Hum koi message nahi bhejte. | आपका डेटा सिर्फ इसी डिवाइस पर रहता है। हम कोई मैसेज नहीं भेजते। | तुमचा डेटा फक्त याच डिव्हाइसवर राहतो. आम्ही कोणताही मेसेज पाठवत नाही. |

Speech uses numbers as digits ("340 rupaye"), never the ₹ symbol, so voices read them correctly. Have a native speaker glance at the Hindi and Marathi lines if one is available.

## 8. Data model and seed data

The whole app state is one JSON object in `localStorage` under `bkh:v1`; customer balances are derived from transactions, so they can never drift out of sync.

### 8.1 Entities

| Entity | Fields (type) | Rules |
| --- | --- | --- |
| Settings | `shopName` (string), `language` ('hinglish' \| 'hi' \| 'mr'), `muted` (boolean) | Defaults: "Sharma General Store", 'hinglish', false |
| Item | `id` (string), `name` (string), `unit` ('kg' \| 'g' \| 'litre' \| 'packet' \| 'piece' \| 'dozen'), `price` (integer ₹ per unit), `stock` (number), `reorderLevel` (number), `aliases` (string\[\], Latin + Devanagari) | `stock` is stored and updated by the ledger |
| Customer | `id`, `name`, `aliases` (string\[\]), `openingBalance` (integer ₹), `createdAt` (ISO string) | No phone, address or ID fields, ever |
| Transaction | `id`, `ts` (ISO string), `type` ('credit\_sale' \| 'cash\_sale' \| 'payment' \| 'stock\_in'), `customerId?`, `lines?` \[{`itemId`, `qty`, `unit`, `price`, `subtotal`}\], `amount` (integer ₹) | Immutable; undo deletes the latest record only |

**Derived values (selectors in `src/store/selectors.js`):**

- Customer balance = `openingBalance` + Σ credit\_sale amounts − Σ payment amounts.
- Today's sales = Σ amount of today's credit\_sale + cash\_sale.
- Cash collected today = Σ today's cash\_sale + payment.
- Average daily sales of an item = units sold in the last 7 days ÷ 7.

```json
{
  "schemaVersion": 1,
  "settings": { "shopName": "Sharma General Store", "language": "hinglish", "muted": false },
  "items": [ { "id": "sugar", "name": "Sugar", "unit": "kg", "price": 45, "stock": 25, "reorderLevel": 10, "aliases": ["sugar", "cheeni", "chini", "चीनी", "साखर"] } ],
  "customers": [ { "id": "c1", "name": "Ramesh Patil", "aliases": ["ramesh", "रमेश", "patil"], "openingBalance": 240, "createdAt": "2026-10-01T09:00:00.000Z" } ],
  "transactions": [ { "id": "t_001", "ts": "2026-10-28T10:15:00.000Z", "type": "cash_sale", "lines": [ { "itemId": "maggi", "qty": 2, "unit": "packet", "price": 14, "subtotal": 28 } ], "amount": 28 } ]
}
```

### 8.2 Catalogue seed (fictional demo prices)

| id | Name | Unit | Price ₹ | Stock | Reorder | Aliases |
| --- | --- | --- | --- | --- | --- | --- |
| sugar | Sugar | kg | 45 | 25 | 10 | sugar, cheeni, chini, चीनी, साखर |
| rice | Rice | kg | 60 | 40 | 15 | rice, chawal, चावल, तांदूळ |
| atta | Wheat Atta | kg | 40 | 30 | 10 | atta, aata, gehu, आटा, कणीक |
| toor | Toor Dal | kg | 140 | 12 | 5 | toor dal, tur dal, arhar, dal, तूर दाल, तूर डाळ, दाल |
| oil | Cooking Oil | litre | 150 | 18 | 6 | oil, tel, तेल |
| tea | Tea Powder | packet | 120 | 10 | 4 | tea, chai patti, chai, चाय पत्ती, चहा |
| parleg | Parle-G | packet | 10 | 40 | 15 | parle g, parleg, parle, biscuit, पारले, बिस्किट |
| maggi | Maggi | packet | 14 | 6 | 10 | maggi, magi, मैगी, मॅगी |
| milk | Milk | packet | 30 | 20 | 8 | milk, doodh, दूध |
| salt | Salt | packet | 25 | 15 | 5 | salt, namak, नमक, मीठ |
| soap | Bath Soap | piece | 35 | 24 | 8 | soap, sabun, साबुन, साबण |
| eggs | Eggs | dozen | 84 | 5 | 3 | eggs, egg, anda, ande, अंडे, अंडी |
| bread | Bread | packet | 45 | 8 | 4 | bread, pav, double roti, ब्रेड, पाव |
| poha | Poha | kg | 50 | 3 | 4 | poha, पोहा, पोहे |
| besan | Besan | kg | 90 | 7 | 3 | besan, बेसन |

Maggi (6 ≤ 10) and Poha (3 ≤ 4) start as low stock, so the dashboard shows 2 low-stock items.

### 8.3 Customers and transaction seed (fictional)

| id | Name | Aliases | Opening balance ₹ |
| --- | --- | --- | --- |
| c2 | Sunita Jadhav | sunita, सुनीता, सुनिता, jadhav | 650 |
| c5 | Mohan Deshmukh | mohan, मोहन, deshmukh | 480 |
| c1 | Ramesh Patil | ramesh, रमेश, patil | 240 |
| c3 | Anil Shinde | anil, अनिल, shinde | 120 |
| c6 | Kavita More | kavita, कविता, kavita more | 90 |
| c4 | Priya Kulkarni | priya, प्रिया, kulkarni | 0 |

Transaction seed (`src/data/seed.js`): generated on first run relative to today's date with a fixed pseudo-random seed, so it is identical on every reset. Six previous days get 12–20 cash sales each (daily totals between ₹2,000 and ₹4,500) plus one stock-in per day. Maggi sells about 3 packets a day and Poha about 1 kg a day, so "Kya khatam hone wala hai?" returns Maggi (2 days) and Poha (3 days). Today starts with 4 small cash sales so the dashboard is not empty.

**Demo check values:** after demo phrase 1, Ramesh is ₹340; after demo phrase 2, Sunita is ₹450; then the top debtor is Mohan Deshmukh at ₹480.

## 9. Command parser specification

The parser is a pure, rule-based function `parseCommand(text, { items, customers })` in `src/lib/parser/`; it never throws, never does maths on money, and always returns a result the confirmation card can show.

### 9.1 Pipeline

1. **Normalise** (`normalize.js`): lowercase; trim; replace punctuation with spaces; Devanagari digits ०–९ → 0–9; remove nukta (़); chandrabindu ँ → anusvara ं; collapse spaces; unify currency (₹, rs, rs., rupay, rupaye, rupees, रुपये, रुपए, रुपया) → token `₹`.
2. **Tokenise** on spaces; keep the original text for the "heard:" chips.
3. **Detect intent** (`intent.js`) using the keyword table and precedence below.
4. **Extract line items** (`items.js`): scan for quantity → optional unit → item alias, longest alias match first; split on joiners (aur, और, आणि, and, comma).
5. **Extract customer** (`customers.js`): alias match, then fuzzy, usually the first name-like token.
6. **Extract amount** for payments and amount-only credit: number next to `₹` or the verb.
7. **Build result** with confidence values and the list of unmatched words.

### 9.2 Output schema

```js
/**
 * @typedef {Object} ParseResult
 * @property {'credit_sale'|'cash_sale'|'payment'|'stock_in'|'query'|'unknown'} intent
 * @property {{ id: string, matchedText: string, confidence: number } | null} customer
 * @property {Array<{ itemId: string, qty: number, unit: string, matchedText: string, confidence: number }>} items
 * @property {number|null} amount            // only for payment or amount-only credit
 * @property {{ type: 'top_debtor'|'today_sales'|'item_stock'|'customer_balance'|'running_out', itemId?: string, customerId?: string } | null} query
 * @property {string[]} unmatched             // words not understood, shown as a hint
 * @property {string} raw                     // original text
 * @property {string[]} suggestions           // filled when intent is 'unknown'
 */
```

### 9.3 Intent keywords and precedence

Check in this order; the first rule that matches wins.

| Order | Intent | Keywords (Latin) | Keywords (हिंदी) | Keywords (मराठी) | Extra condition |
| --- | --- | --- | --- | --- | --- |
| 1 | query | kitna, kitni, kitne, kiska, kiski, kaun, kya, bacha, bachi, baaki, khatam, "?" | कितना, कितनी, किसका, कौन, क्या, बचा, बची, बाकी, खत्म | किती, कोणाचे, कोण, काय, शिल्लक, संपणार | Question word present |
| 2 | credit\_sale | udhaar, udhar, udhari, credit, khate, likh do | उधार, उधारी, खाते | उधार, उधारी, खात्यावर | Items or an amount present |
| 3 | payment | diye, diya, de diye, jama, paid, wapas, chukaya | दिए, दिया, जमा, चुकाया | दिले, जमा, भरले | Customer + amount present, no items |
| 4 | stock\_in | aaya, aaye, aa gaya, maal, stock, jodo | आया, आए, माल, स्टॉक | आले, आला, माल, स्टॉक | Items present |
| 5 | cash\_sale | becha, beche, bika, cash, nakad, sold | बेचा, बेचे, बिका, नकद | विकले, विकला, रोख | Items present |
| 6 | fallback | — | — | — | Items + customer → credit\_sale (confidence 0.5); items only → cash\_sale (0.5); else unknown |

Query types: "sabse zyada / सबसे ज्यादा / सर्वात जास्त" + udhaar → `top_debtor`; "aaj / आज" + bikri / बिक्री / विक्री → `today_sales`; item + bacha / बची / शिल्लक → `item_stock`; customer + baaki / बाकी → `customer_balance`; khatam / खत्म / संपणार → `running_out`.

### 9.4 Numbers

Digits and decimals are read directly ("2", "2.5"). A number word counts as a quantity only when followed by a unit, an item, `sau`/`hazaar`, or `₹` (this stops "do" in other senses from becoming 2).

| Value | Latin | हिंदी | मराठी |
| --- | --- | --- | --- |
| 0.25 | paav | पाव | पाव |
| 0.5 | aadha, aadhaa | आधा | अर्धा |
| 1 | ek | एक | एक |
| 1.5 | dedh | डेढ | दीड |
| 2 | do | दो | दोन |
| 2.5 | dhai | ढाई | अडीच |
| 3 | teen | तीन | तीन |
| 4 | char, chaar | चार | चार |
| 5 | paanch, panch | पांच | पाच |
| 6 | chhe, chah, che | छह, छः | सहा |
| 7 | saat | सात | सात |
| 8 | aath | आठ | आठ |
| 9 | nau | नौ | नऊ |
| 10 | das | दस | दहा |
| 12 | barah | बारह | बारा |
| 15 | pandrah | पंद्रह | पंधरा |
| 20 | bees | बीस | वीस |
| 50 | pachaas | पचास | पन्नास |
| ×100 | sau | सौ | शंभर |
| ×1000 | hazaar, hazar | हजार | हजार |

"do sau" = 200; "dedh sau" = 150; "ek hazaar" = 1000. A quantity missing before an item defaults to 1.

### 9.5 Units and fuzzy matching

| Unit | Words |
| --- | --- |
| kg | kg, kilo, kilogram, किलो |
| g | g, gram, gm, ग्राम (converted to kg for kg items: 500 g → 0.5) |
| litre | l, litre, liter, ltr, लीटर, लिटर |
| packet | packet, pkt, packet, पैकेट, पाकीट, पुडा |
| piece | piece, pc, nag, नग |
| dozen | dozen, darjan, दर्जन, डझन |

**Fuzzy rules** (`fuzzy.js`, Levenshtein distance on normalised strings): words of ≤ 3 characters must match exactly; 4–6 characters allow distance 1; ≥ 7 characters allow distance 2. Multi-word aliases ("toor dal", "chai patti") are tried first, longest first. Confidence = 1 − distance ÷ length. Below 0.7 the match is shown with an amber "Check this" label on the card.

### 9.6 Unknown handling

If nothing matches, return `intent: 'unknown'` with `suggestions` = the first 3 demo phrases. Never throw: wrap the whole function in try/catch and return `unknown` on any internal error, logging only in development.

### 9.7 Demo phrases and expected results

| # | Phrase | Expected result |
| --- | --- | --- |
| 1 | Ramesh ne 2 kilo cheeni aur 1 Parle-G udhaar liya | credit\_sale · Ramesh Patil · Sugar 2 kg × ₹45 = ₹90 · Parle-G 1 × ₹10 = ₹10 · total ₹100 · balance ₹240 → ₹340 |
| 2 | Sunita ne 200 rupaye diye | payment · Sunita Jadhav · ₹200 · balance ₹650 → ₹450 |
| 3 | 10 packet Maggi aaya | stock\_in · Maggi +10 packet · stock 6 → 16 |
| 4 | 3 Maggi cash mein becha | cash\_sale · Maggi 3 × ₹14 = ₹42 |
| 5 | Kiska udhaar sabse zyada hai? | query top\_debtor · the customer with the highest balance |

The same phrases must also parse in Devanagari, e.g. "रमेश ने दो किलो चीनी और एक पारले उधार लिया" and Marathi "रमेशने दोन किलो साखर उधार घेतली" (add घेतली / घेतले / लिया / ले गया as credit-sale verbs when an udhaar keyword is present).

## 10. Architecture, folder structure and coding standards

The code splits into three layers that only talk downwards: UI components → store (state + selectors) → pure logic in `src/lib`, so every rule that touches money is testable without a browser.

### 10.1 Layers

| Layer | Folder | Knows about | Never does |
| --- | --- | --- | --- |
| UI | `src/pages`, `src/features`, `src/components/ui` | store hooks, i18n strings | maths on money, parsing, `localStorage` |
| State | `src/store` | `src/lib`, persistence | render anything |
| Logic | `src/lib` | plain data only | import React, touch the DOM or storage |
| Browser services | `src/features/voice/hooks` | Web Speech APIs | business rules |

### 10.2 Folder structure

```
bol-ke-hisaab/
├─ docs/
│  ├─ SRS.md                  # this document
│  └─ PROMPT_LOG.md           # prompts + iterations (judged criterion)
├─ public/
│  └─ favicon.svg
├─ src/
│  ├─ main.jsx                # mounts <App/>
│  ├─ app/
│  │  ├─ App.jsx              # layout: sidebar / tab bar + voice panel
│  │  ├─ AppProviders.jsx     # ShopProvider, ToastProvider, ErrorBoundary
│  │  └─ navigation.js        # section ids, labels, icons
│  ├─ pages/
│  │  ├─ HomePage.jsx
│  │  ├─ KhataPage.jsx
│  │  ├─ StockPage.jsx
│  │  └─ SettingsPage.jsx
│  ├─ features/
│  │  ├─ voice/
│  │  │  ├─ VoicePanel.jsx
│  │  │  ├─ MicOrb.jsx
│  │  │  ├─ Waveform.jsx
│  │  │  ├─ LanguageSwitch.jsx
│  │  │  ├─ DemoChips.jsx
│  │  │  ├─ CommandBar.jsx
│  │  │  └─ hooks/
│  │  │     ├─ useSpeechRecognition.js
│  │  │     └─ useSpeechSynthesis.js
│  │  ├─ commands/
│  │  │  ├─ ConfirmationSheet.jsx
│  │  │  ├─ LineItemRow.jsx
│  │  │  ├─ AnswerCard.jsx
│  │  │  └─ useCommandFlow.js    # parse → card → confirm → speak → undo
│  │  ├─ dashboard/
│  │  │  ├─ StatGrid.jsx
│  │  │  ├─ SalesChart.jsx
│  │  │  ├─ TopDebtors.jsx
│  │  │  └─ RecentActivity.jsx
│  │  ├─ khata/
│  │  │  ├─ CustomerList.jsx
│  │  │  ├─ CustomerSheet.jsx
│  │  │  └─ ReminderButton.jsx
│  │  └─ stock/
│  │     ├─ ItemList.jsx
│  │     └─ StockBar.jsx
│  ├─ components/ui/          # Button, IconButton, Card, StatCard, Badge, BalanceChip,
│  │                          # Sheet, Toast, QtyStepper, SearchInput, Chip, EmptyState,
│  │                          # Skeleton, ConfirmDialog, ErrorBoundary (one file each)
│  ├─ lib/                    # PURE logic — no React, no DOM, no storage
│  │  ├─ parser/
│  │  │  ├─ index.js          # parseCommand()
│  │  │  ├─ normalize.js
│  │  │  ├─ numbers.js
│  │  │  ├─ keywords.js       # intent + unit + joiner word lists
│  │  │  ├─ intent.js
│  │  │  ├─ items.js
│  │  │  ├─ customers.js
│  │  │  └─ fuzzy.js          # levenshtein + matchAlias
│  │  ├─ ledger.js            # applyTransaction, undoLast, buildTransaction
│  │  ├─ queries.js           # answerQuery
│  │  ├─ forecast.js          # avgDailySales, daysUntilEmpty
│  │  ├─ reminders.js         # buildReminder(lang, customer, shop)
│  │  └─ format.js            # formatRupees, formatQty, relativeTime
│  ├─ store/
│  │  ├─ ShopContext.jsx      # provider + useShop()
│  │  ├─ reducer.js           # actions: CONFIRM_TX, UNDO_TX, ADD_ITEM, ADD_CUSTOMER, UPDATE_SETTINGS, RESET
│  │  ├─ selectors.js         # balances, today totals, low stock, top debtors
│  │  └─ persistence.js       # load/save bkh:v1 with schemaVersion + try/catch
│  ├─ data/
│  │  ├─ catalogue.js
│  │  ├─ customers.js
│  │  └─ seed.js              # deterministic 7-day history
│  ├─ i18n/
│  │  └─ strings.js           # all UI text + speech templates (hinglish, hi, mr)
│  └─ styles/
│     ├─ tokens.css
│     └─ index.css            # Tailwind layers + font imports
├─ tests/                     # mirrors src/lib
│  ├─ parser.test.js
│  ├─ ledger.test.js
│  ├─ queries.test.js
│  ├─ forecast.test.js
│  └─ persistence.test.js
├─ .eslintrc.cjs  ├─ .prettierrc  ├─ tailwind.config.js  ├─ vite.config.js
├─ package.json  └─ README.md
```

### 10.3 State management

One React context (`ShopContext`) holds the state object from Section 8 and a `useReducer`. Components read through selectors (`useShop(selectTodaySales)`) and write only by dispatching actions. Persistence runs in one `useEffect` after every state change. No other global state, no Redux, no router (sections are a simple state value in `App.jsx`).

### 10.4 Coding standards

- JavaScript ES modules; JSDoc types on every exported `src/lib` function.
- Components: function components, one per file, PascalCase, under 150 lines; split when larger.
- Hooks: `useX` names, in a `hooks/` folder next to their feature.
- No hard-coded colours, sizes or strings in components: use Tailwind classes mapped to tokens, and `strings.js`.
- Money is always an integer of rupees; format only at render with `formatRupees` (en-IN grouping).
- No `console.log` in committed code; errors go to the toast or error boundary.
- Accessibility: every interactive element is a real `button`/`input`; icon-only buttons have `aria-label`; sheets trap focus; results announced via an `aria-live="polite"` region.
- ESLint (react, react-hooks, jsx-a11y) + Prettier; zero errors before every commit.
- Commits: `feat: …`, `fix: …`, `test: …`, `style: …`, `docs: …`; one commit per working step.

### 10.5 Dependencies and scripts

| Package | Purpose |
| --- | --- |
| react, react-dom | UI |
| vite, @vitejs/plugin-react | Dev server and build |
| tailwindcss (+ its Vite setup) | Styling via tokens |
| framer-motion | Sheets, count-ups, mic animations |
| lucide-react | Icons |
| recharts | 7-day sales chart |
| vitest | Unit tests |
| eslint, eslint-plugin-react, eslint-plugin-react-hooks, eslint-plugin-jsx-a11y, prettier | Code quality |

Scripts: `npm run dev` (Vite), `npm test` (`vitest run`), `npm run lint`, `npm run build`. Use stable versions that install cleanly together; verify by running all four scripts.

## 11. Testing plan

Every rule that touches money or meaning is unit-tested in `src/lib`; everything the judges see is checked manually against a checklist before submission.

### 11.1 Unit tests (Vitest)

| File | Test cases (each must pass) |
| --- | --- |
| parser.test.js | All 5 demo phrases → results in Section 9.7 · same phrases in Devanagari and Marathi · number words 1–10 in 3 languages · "do sau" = 200, "dedh kilo" = 1.5, "aadha kilo" = 0.5 · "500 gram cheeni" → 0.5 kg · "1 Parle-G" reads Parle-G, not "g" as gram · fuzzy "chinni", "magi", "Rames" · multi-item with aur / और / आणि · unknown customer → new-customer flag · gibberish → unknown + 3 suggestions · empty string → unknown · 500-character input does not throw |
| ledger.test.js | Credit sale updates stock and balance · cash sale · payment · payment above balance → advance · stock in · subtotal rounding (0.5 × 45 = 23) · undo reverses each type exactly · sale above stock returns a warning |
| queries.test.js | top\_debtor, today\_sales, item\_stock, customer\_balance, running\_out against seed data · no customers → friendly answer |
| forecast.test.js | avgDailySales over 7 days · daysUntilEmpty · no sales → null (shown as "—") |
| persistence.test.js | Save/load round trip · corrupt JSON → seed · wrong schemaVersion → seed · storage throwing → in-memory mode |

### 11.2 Manual test checklist

- [x] ✅ Fresh load: dashboard shows seed data, 2 low-stock items, chart with 7 bars
- [ ] Each demo phrase by **voice** gives the correct card (Hinglish mode) — *not verified: needs a real mic in Chrome (the recognition → card path was checked with a stubbed recogniser only)*
- [x] ✅ Each demo phrase by **chip** gives the correct card
- [ ] Confirm updates dashboard, khata and stock; speech plays; undo restores everything — *dashboard, khata, stock, undo and the exact spoken sentence verified; audible playback not verified (headless browser has no voices)*
- [x] ✅ Edit on card: stepper, remove item, change customer, change intent
- [x] ✅ Validation: confirm disabled with reason when customer or quantity is missing
- [x] ✅ All 5 spoken questions answered correctly, shown and spoken
- [x] ✅ Copy reminder in all 3 languages; toast appears; nothing is sent
- [x] ✅ Mic permission denied → message, typing works (browser `not-allowed` error simulated)
- [x] ✅ Wi-Fi off → network message, chips and typing work (browser offline + simulated `network` error)
- [x] ✅ Mute → no speech, text still shown
- [x] ✅ Refresh keeps data; Reset demo data restores seed
- [x] ✅ Keyboard only: Tab through, Space for mic, Enter confirm, Esc cancel
- [x] ✅ Layout at 375, 768, 1280 and 1440 px; no horizontal scroll
- [x] ✅ Reduced motion setting removes animations
- [x] ✅ Zero console errors during the full demo run
- [x] ✅ `npm test`, `npm run lint`, `npm run build` all pass
- [x] ✅ Fresh clone → `npm install` → `npm run dev` works using only README steps

## 12. Risks, timeline and demo plan

The plan builds the visible demo path first, so a working, good-looking app exists by 2:45 PM even if later phases are cut; submit at 4:30 PM.

### 12.1 Build timeline

| Phase | Time | Build | FRs covered | Commit |
| --- | --- | --- | --- | --- |
| 1. Foundation | 12:55–1:45 | Vite + Tailwind + tokens, fonts, UI components, App layout (sidebar / tab bar / voice panel shell), store + seed + persistence, Home dashboard | NAV, DASH, SYS-1/2/4/5/6 | `feat: foundation and dashboard` |
| 2. Voice core | 1:45–2:45 | Parser + tests, mic + transcript + chips + command bar, confirmation sheet, ledger + undo, speak-back | VOICE, PARSE, CONF, LEDG, TTS | `feat: voice commands end to end` |
| 3. Screens | 2:45–3:30 | Spoken questions + answer card, Khata + customer sheet + reminders, Stock, Settings | QRY, KHATA, STOCK, SET | `feat: khata, stock, queries` |
| 4. Polish | 3:30–4:00 | Responsive pass, accessibility pass, empty/error states, animations, lint, build | NFR-1 to NFR-16 | `style: polish and a11y` |
| 5. Ship | 4:00–4:30 | README, screenshots, PROMPT\_LOG, two timed rehearsals, submit | — | `docs: readme and demo` |

**Cut rule:** if Phase 2 is not working by 2:45, stop all new work, fix the demo path, and skip every Should and Could item. Stock and Settings can ship as simple lists.

### 12.2 Risks and mitigations

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| Hall noise makes recognition mishear | High | Demo chips + editable transcript + confirmation card; rehearse exact phrases; demo from the quietest spot |
| Venue Wi-Fi fails (speech needs internet) | Medium | Phone hotspot ready; chips and typing work offline |
| Hindi/Marathi recognition returns unexpected script or spelling | Medium | Parser handles Devanagari + Latin; demo in Hinglish mode |
| No Hindi/Marathi voice installed for speech output | Medium | Fallback chain hi-IN → en-IN → text only |
| Judge says "Khatabook / voice khata apps exist" | High | Answer with positioning in Section 3.6 |
| Time overrun | Medium | Phase order + cut rule; commit after each phase |
| Parser picks the wrong item | Medium | Confidence label, "heard:" chips, edit on card, undo |

### 12.3 Three-minute demo script

1. **0:00–0:20 Problem.** "Kirana owners run their khata in a notebook while serving customers. Entries get missed and dues get disputed."
2. **0:20–1:20 Voice credit sale.** Tap mic, say demo phrase 1. Show the card: "₹45 × 2 + ₹10 = ₹100 — the app never guesses money; it uses the shop's own price list." Confirm; the app speaks "Ramesh ka total udhaar 340 rupaye ho gaya." Point at the dashboard counting up.
3. **1:20–1:50 Payment + question.** Say demo phrase 2, confirm. Ask "Kiska udhaar sabse zyada hai?" and let it answer aloud.
4. **1:50–2:20 Khata and stock.** Open the customer, copy a Marathi reminder. Show Maggi "runs out in 2 days".
5. **2:20–2:40 Hand it to a judge.** Let them tap a demo chip or speak a sale.
6. **2:40–3:00 Trust.** "Every entry needs one tap to confirm and can be undone; data stays on the device; tests cover the parser and ledger. Limitations: rule-based understanding covers common sentences, and voice needs internet."

### 12.4 Likely judge questions

| Question | Answer |
| --- | --- |
| How is this different from existing khata apps? | Money comes only from the shop's catalogue, every entry is confirmed, it speaks back in Hindi/Marathi, and it answers spoken questions from real data. |
| What if it mishears? | The confirmation card shows exactly what it heard; edit or cancel in one tap; undo for 10 seconds. |
| Where is the AI? | It was built with AI in Antigravity (see PROMPT\_LOG); the app itself uses rule-based parsing on purpose so money is never guessed. An LLM fallback for messy sentences is the next step. |
| Does it work offline? | Ledger, typing and chips work offline; the browser's speech recognition needs internet. |
| Is customer data safe? | Everything stays in the browser; no phone numbers or addresses are collected; nothing is sent. |
