// Marketing landing page served at "/". The app itself lives at "/app" (see main.jsx).
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BellRing,
  BookOpenText,
  Check,
  CheckCircle2,
  HandCoins,
  Languages,
  Mic,
  Package,
  PencilLine,
  Smartphone,
  Volume2,
  WifiOff,
  X,
} from 'lucide-react';

const APP_URL = '/app';

const OLD_WAY = [
  'Paper bahi-khata that gets torn, wet or lost',
  'Totting up udhaar by hand at the end of the day',
  'Maggi runs out before you notice',
  'English-only apps with tiny forms to type into',
  'Awkward to remind customers about dues',
];

const NEW_WAY = [
  'Just speak — Hinglish, Hindi or Marathi',
  'Every amount worked out from your own price list',
  'Low-stock list tells you what to mangwao',
  'One tap to confirm, then the app says the result aloud',
  'Polite WhatsApp reminders, ready to send',
];

const STEPS = [
  {
    n: '01',
    title: 'Bolo',
    body: 'Tap the mic and say the entry the way you would tell your munshi.',
  },
  {
    n: '02',
    title: 'Check karo',
    body: 'A confirmation card shows items, rates and total. Fix anything by tap or by voice.',
  },
  {
    n: '03',
    title: 'Ho gaya!',
    body: 'Khata, stock and dashboard update instantly — and the new balance is spoken back.',
  },
];

const FEATURES = [
  {
    icon: Languages,
    title: 'Your language',
    body: 'Hinglish, हिंदी and मराठी — in Roman or Devanagari, mixed however you speak.',
  },
  {
    icon: PencilLine,
    title: 'Nothing is guessed',
    body: 'Every entry opens a card to confirm. Say “Nahi, teen Maggi” and only that changes.',
  },
  {
    icon: BookOpenText,
    title: 'Udhaar khata',
    body: 'Customer-wise balances, full history, and promises like “Mohan Sunday ko dega”.',
  },
  {
    icon: Package,
    title: 'Stock that keeps up',
    body: 'Sales deduct stock, deliveries add it, and the reorder list says how much to order.',
  },
  {
    icon: BellRing,
    title: 'Alerts on WhatsApp',
    body: 'Connect your number once: daily hisaab at 9 PM, low-stock alerts and udhaar reminders arrive automatically.',
  },
  {
    icon: WifiOff,
    title: 'Works offline',
    body: 'Install it on your phone like an app. Your khata opens even without internet.',
  },
];

const PHRASES = [
  {
    title: 'Bikri & udhaar',
    items: [
      '“Ramesh ne 2 kilo cheeni udhaar liya”',
      '“3 Maggi cash mein becha”',
      '“Sunita ne 200 rupaye diye”',
    ],
  },
  {
    title: 'Stock',
    items: ['“10 packet Maggi aaya”', '“Maggi ka rate 15 kar do”', '“Kya mangwana hai?”'],
  },
  {
    title: 'Sawaal',
    items: ['“Aaj ka hisaab batao”', '“Kiska udhaar sabse zyada hai?”', '“Maggi kitni bachi hai?”'],
  },
  {
    title: 'Vaade',
    items: [
      '“Mohan Sunday ko dega”',
      '“Ramesh ka kitna baaki hai?”',
      '“Kya khatam hone wala hai?”',
    ],
  },
];

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
};

function Eyebrow({ children }) {
  return (
    <p className="text-[13px] font-semibold tracking-[0.14em] text-emerald-700 uppercase">
      {children}
    </p>
  );
}

function Heading({ children, className = '' }) {
  return (
    <h2 className={`font-display text-3xl font-bold text-stone-800 sm:text-4xl ${className}`}>
      {children}
    </h2>
  );
}

function PrimaryCta({ children, className = '' }) {
  return (
    <a
      href={APP_URL}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-emerald-700 px-7 py-3 font-semibold text-white shadow-lg shadow-emerald-700/25 transition hover:-translate-y-0.5 hover:bg-emerald-800 ${className}`}
    >
      <Mic size={18} aria-hidden="true" />
      {children}
      <ArrowRight size={18} aria-hidden="true" />
    </a>
  );
}

/** Phone mockup: a spoken entry, its confirmation card, and the spoken reply. */
function PhoneMock() {
  return (
    <div className="relative mx-auto w-full max-w-[340px]">
      <div className="absolute -inset-8 rounded-full bg-gradient-to-br from-amber-200/60 via-emerald-200/40 to-transparent blur-3xl" />
      <div className="relative rounded-[2.5rem] border-[10px] border-stone-900 bg-stone-900 shadow-2xl">
        <div className="overflow-hidden rounded-[1.9rem] bg-[#f6eedd]">
          <div className="flex items-center gap-3 bg-emerald-700 px-4 py-3 text-white">
            <span className="grid size-9 place-items-center rounded-full bg-white/20 text-sm font-bold">
              BH
            </span>
            <div>
              <p className="text-sm font-semibold">Bol Ke Hisaab</p>
              <p className="text-xs text-emerald-100">sun raha hai…</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 p-4 text-[13px]">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-emerald-100 px-3 py-2 text-stone-800"
            >
              <span className="mb-1 flex items-center gap-1.5 text-emerald-800">
                <Mic size={14} aria-hidden="true" />
                <span className="flex h-3 items-end gap-[2px]" aria-hidden="true">
                  {[6, 10, 4, 12, 8, 11, 5, 9, 7, 12, 4].map((h, i) => (
                    <span
                      key={i}
                      className="w-[3px] rounded bg-emerald-700"
                      style={{ height: h }}
                    />
                  ))}
                </span>
                <span className="text-[11px]">0:04</span>
              </span>
              Ramesh ne 2 kilo cheeni aur 1 Parle-G udhaar liya
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="max-w-[92%] rounded-2xl rounded-tl-sm bg-white p-3 text-stone-700 shadow-sm"
            >
              <p className="mb-2 text-[11px] font-semibold tracking-wide text-amber-700 uppercase">
                Udhaar · Ramesh
              </p>
              <div className="flex justify-between">
                <span>Sugar 2 kg × ₹45</span>
                <span>₹90</span>
              </div>
              <div className="flex justify-between">
                <span>Parle-G 1 × ₹10</span>
                <span>₹10</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-dashed border-stone-300 pt-2 font-bold text-stone-900">
                <span>Total</span>
                <span>₹100</span>
              </div>
              <span className="mt-3 flex items-center justify-center gap-1.5 rounded-full bg-emerald-700 py-1.5 text-xs font-semibold text-white">
                <Check size={14} aria-hidden="true" /> Confirm
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white px-3 py-2 text-stone-700 shadow-sm"
            >
              <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
                <Volume2 size={14} aria-hidden="true" /> Ho gaya!
              </span>
              Ramesh ka baaki ab ₹340 hai.
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="font-landing min-h-dvh bg-white text-stone-700">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-stone-200/70 bg-white/85 backdrop-blur">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <a href="/" className="font-display text-xl font-bold text-emerald-700">
            Bol Ke Hisaab
          </a>
          <div className="flex items-center gap-6 text-sm text-stone-600">
            <a href="#features" className="hidden hover:text-emerald-700 md:inline">
              Features
            </a>
            <a href="#how" className="hidden hover:text-emerald-700 md:inline">
              How it Works
            </a>
            <a href="#bolo" className="hidden hover:text-emerald-700 md:inline">
              Bolo Aise
            </a>
            <a
              href={APP_URL}
              className="rounded-full bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800"
            >
              Open App
            </a>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="bg-stone-100">
          <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
            <motion.div {...reveal}>
              <Eyebrow>Voice-first khata for kirana shops</Eyebrow>
              <h1 className="font-display mt-4 text-5xl leading-[1.05] font-extrabold text-stone-800 sm:text-6xl">
                Bolo, aur
                <br />
                <span className="text-emerald-700">Hisaab Ho Gaya</span>
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-stone-600">
                Record udhaar, sales, payments and stock just by speaking. Every rupee is calculated
                from your own price list and confirmed by you — your digital <strong>munshi</strong>{' '}
                on the counter.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <PrimaryCta>Start Bolna</PrimaryCta>
                <a
                  href="#how"
                  className="inline-flex min-h-12 items-center rounded-full border-2 border-emerald-200 bg-white px-7 py-3 font-semibold text-emerald-800 transition hover:border-emerald-400"
                >
                  See How It Works
                </a>
              </div>
              <p className="mt-4 text-sm text-stone-500">
                Free · No signup · Works in Chrome, installs like an app
              </p>
            </motion.div>
            <PhoneMock />
          </div>
        </section>

        {/* Old vs new */}
        <section className="mx-auto grid max-w-6xl gap-6 px-4 py-20 sm:px-6 md:grid-cols-2">
          <motion.div {...reveal} className="rounded-3xl border border-stone-200 bg-stone-50 p-8">
            <span className="grid size-10 place-items-center rounded-xl bg-red-100 text-red-600">
              <X size={20} aria-hidden="true" />
            </span>
            <h3 className="font-display mt-5 text-2xl font-bold text-stone-800">Purana Tareeka</h3>
            <ul className="mt-5 space-y-3">
              {OLD_WAY.map((line) => (
                <li key={line} className="flex gap-3">
                  <X size={18} className="mt-1 shrink-0 text-red-500" aria-hidden="true" />
                  {line}
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div
            {...reveal}
            className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 size={20} aria-hidden="true" />
            </span>
            <h3 className="font-display mt-5 text-2xl font-bold text-stone-800">
              Bol Ke Hisaab Tareeka
            </h3>
            <ul className="mt-5 space-y-3">
              {NEW_WAY.map((line) => (
                <li key={line} className="flex gap-3">
                  <Check size={18} className="mt-1 shrink-0 text-emerald-600" aria-hidden="true" />
                  {line}
                </li>
              ))}
            </ul>
          </motion.div>
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-16 bg-stone-100 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <motion.div {...reveal} className="text-center">
              <Eyebrow>Simple process</Eyebrow>
              <Heading className="mt-3">Teen Kadam, Bas</Heading>
            </motion.div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {STEPS.map((step, i) => (
                <motion.div
                  key={step.n}
                  {...reveal}
                  transition={{ ...reveal.transition, delay: i * 0.1 }}
                  className="rounded-3xl bg-white p-8 shadow-sm"
                >
                  <span className="font-display text-5xl font-extrabold text-emerald-100">
                    {step.n}
                  </span>
                  <h3 className="font-display mt-2 text-2xl font-bold text-stone-800">
                    {step.title}
                  </h3>
                  <p className="mt-3 leading-relaxed">{step.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-6xl scroll-mt-16 px-4 py-20 sm:px-6">
          <motion.div {...reveal} className="text-center">
            <Eyebrow>Features</Eyebrow>
            <Heading className="mt-3">Kirana Dukaan Ke Liye Bana</Heading>
          </motion.div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, body }, i) => (
              <motion.div
                key={title}
                {...reveal}
                transition={{ ...reveal.transition, delay: (i % 3) * 0.08 }}
                className="rounded-3xl border border-stone-200 p-7 transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg"
              >
                <span className="grid size-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <Icon size={24} aria-hidden="true" />
                </span>
                <h3 className="font-display mt-5 text-xl font-bold text-stone-800">{title}</h3>
                <p className="mt-2 leading-relaxed">{body}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Highlight band */}
        <section className="bg-stone-100 py-20">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr]">
            <motion.div {...reveal}>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold tracking-wider text-amber-800">
                HAR SHAAM
              </span>
              <Heading className="mt-4">Aaj Ka Hisaab, Ek Sawaal Mein</Heading>
              <p className="mt-4 text-lg leading-relaxed">
                Ask “Aaj ka hisaab batao” and hear today’s sales, cash collected and udhaar given.
                The dashboard shows the week’s trend, top debtors, promises due and what to reorder.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-sm">
                {['Sales chart', 'Top debtors', 'Promises due', 'Reorder list', 'UPI QR'].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-stone-300 bg-white px-4 py-1.5"
                    >
                      {tag}
                    </span>
                  ),
                )}
              </div>
            </motion.div>
            <motion.div {...reveal} className="grid grid-cols-2 gap-4">
              {[
                { label: 'Aaj ki bikri', value: '₹4,820', icon: HandCoins },
                { label: 'Cash mila', value: '₹3,150', icon: CheckCircle2 },
                { label: 'Udhaar diya', value: '₹1,670', icon: BookOpenText },
                { label: 'Khatam hone wala', value: '3 items', icon: Package },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="rounded-3xl bg-white p-6 shadow-sm">
                  <Icon size={20} className="text-emerald-700" aria-hidden="true" />
                  <p className="font-display mt-3 text-3xl font-bold text-stone-800">{value}</p>
                  <p className="mt-1 text-sm text-stone-500">{label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Phrases */}
        <section id="bolo" className="mx-auto max-w-6xl scroll-mt-16 px-4 py-20 sm:px-6">
          <motion.div {...reveal} className="text-center">
            <Eyebrow>Just speak</Eyebrow>
            <Heading className="mt-3">Ek Awaaz, Poora Hisaab</Heading>
          </motion.div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PHRASES.map((group) => (
              <motion.div
                key={group.title}
                {...reveal}
                className="rounded-3xl bg-emerald-50/60 p-6"
              >
                <h3 className="font-display text-lg font-bold text-emerald-800">{group.title}</h3>
                <ul className="mt-4 space-y-3">
                  {group.items.map((item) => (
                    <li key={item} className="rounded-2xl bg-white px-4 py-3 text-sm shadow-sm">
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-4 pb-20 sm:px-6">
          <motion.div
            {...reveal}
            className="mx-auto max-w-6xl rounded-[2rem] bg-gradient-to-br from-emerald-700 to-emerald-900 px-6 py-16 text-center text-white"
          >
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Dukaan Ka Hisaab, Ab Aasaan
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-emerald-100">
              Open it in Chrome, tap the mic and say your first entry. Add it to your home screen
              and it works like an app — even offline.
            </p>
            <a
              href={APP_URL}
              className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-8 py-3 font-semibold text-emerald-800 transition hover:-translate-y-0.5"
            >
              <Smartphone size={18} aria-hidden="true" />
              Open Bol Ke Hisaab
              <ArrowRight size={18} aria-hidden="true" />
            </a>
            <p className="mt-4 text-sm text-emerald-200">
              Demo shop data is pre-loaded — try it in one minute.
            </p>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-stone-200">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-stone-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="font-display text-lg font-bold text-emerald-700">Bol Ke Hisaab</p>
            <p>Voice-first khata for kirana shops</p>
          </div>
          <p>© {new Date().getFullYear()} Bol Ke Hisaab</p>
        </div>
      </footer>
    </div>
  );
}
