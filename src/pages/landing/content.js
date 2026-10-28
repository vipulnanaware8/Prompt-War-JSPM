// Landing page copy. Kept apart from the layout so wording changes never touch markup.
import {
  BellRing,
  BookOpenText,
  CheckCircle2,
  HandCoins,
  Languages,
  Package,
  PencilLine,
  WifiOff,
} from 'lucide-react';

export const OLD_WAY = [
  'Paper bahi-khata that gets torn, wet or lost',
  'Totting up udhaar by hand at the end of the day',
  'Maggi runs out before you notice',
  'English-only apps with tiny forms to type into',
  'Awkward to remind customers about dues',
];

export const NEW_WAY = [
  'Just speak — Hinglish, Hindi or Marathi',
  'Every amount worked out from your own price list',
  'Low-stock list tells you what to mangwao',
  'One tap to confirm, then the app says the result aloud',
  'Polite WhatsApp reminders, ready to send',
];

export const STEPS = [
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

export const FEATURES = [
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
    title: 'Free alerts on Telegram',
    body: 'Connect once: daily hisaab at 9 PM, low-stock alerts and udhaar reminders arrive automatically.',
  },
  {
    icon: WifiOff,
    title: 'Works offline',
    body: 'Install it on your phone like an app. Your khata opens even without internet.',
  },
];

export const PHRASES = [
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

export const HIGHLIGHT_TAGS = [
  'Sales chart',
  'Top debtors',
  'Promises due',
  'Reorder list',
  'UPI QR',
];

export const SAMPLE_STATS = [
  { label: 'Aaj ki bikri', value: '₹4,820', icon: HandCoins },
  { label: 'Cash mila', value: '₹3,150', icon: CheckCircle2 },
  { label: 'Udhaar diya', value: '₹1,670', icon: BookOpenText },
  { label: 'Khatam hone wala', value: '3 items', icon: Package },
];
