// Marketing landing page served at "/". The app itself lives at "/app" (see main.jsx).
import { motion } from 'framer-motion';
import { ArrowRight, Check, CheckCircle2, Mic, Smartphone, X } from 'lucide-react';
import {
  FEATURES,
  HIGHLIGHT_TAGS,
  NEW_WAY,
  OLD_WAY,
  PHRASES,
  SAMPLE_STATS,
  STEPS,
} from './landing/content.js';
import { PhoneMock } from './landing/PhoneMock.jsx';

const APP_URL = '/app';

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

const COMPARE_TONES = {
  old: {
    Icon: X,
    BadgeIcon: X,
    card: 'border-stone-200 bg-stone-50',
    badge: 'bg-red-100 text-red-600',
    mark: 'text-red-500',
  },
  new: {
    Icon: Check,
    BadgeIcon: CheckCircle2,
    card: 'border-emerald-200 bg-emerald-50',
    badge: 'bg-emerald-100 text-emerald-700',
    mark: 'text-emerald-600',
  },
};

/** One side of the "old way vs new way" comparison. */
function CompareCard({ tone, title, lines }) {
  const { Icon, BadgeIcon, card, badge, mark } = COMPARE_TONES[tone];
  return (
    <motion.div {...reveal} className={`rounded-3xl border p-8 ${card}`}>
      <span className={`grid size-10 place-items-center rounded-xl ${badge}`}>
        <BadgeIcon size={20} aria-hidden="true" />
      </span>
      <h3 className="font-display mt-5 text-2xl font-bold text-stone-800">{title}</h3>
      <ul className="mt-5 space-y-3">
        {lines.map((line) => (
          <li key={line} className="flex gap-3">
            <Icon size={18} className={`mt-1 shrink-0 ${mark}`} aria-hidden="true" />
            {line}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export function LandingPage() {
  return (
    <div className="font-landing min-h-dvh bg-white text-stone-700">
      <a
        href="#main"
        className="sr-only rounded-full bg-emerald-700 px-4 py-2 font-semibold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-30 border-b border-stone-200/70 bg-white/85 backdrop-blur">
        <nav
          aria-label="Main"
          className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6"
        >
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

      <main id="main">
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

        <section className="mx-auto grid max-w-6xl gap-6 px-4 py-20 sm:px-6 md:grid-cols-2">
          <CompareCard tone="old" title="Purana Tareeka" lines={OLD_WAY} />
          <CompareCard tone="new" title="Bol Ke Hisaab Tareeka" lines={NEW_WAY} />
        </section>

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
                {HIGHLIGHT_TAGS.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-stone-300 bg-white px-4 py-1.5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
            <motion.div {...reveal} className="grid grid-cols-2 gap-4">
              {SAMPLE_STATS.map(({ label, value, icon: Icon }) => (
                <div key={label} className="rounded-3xl bg-white p-6 shadow-sm">
                  <Icon size={20} className="text-emerald-700" aria-hidden="true" />
                  <p className="font-display mt-3 text-3xl font-bold text-stone-800">{value}</p>
                  <p className="mt-1 text-sm text-stone-500">{label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

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
