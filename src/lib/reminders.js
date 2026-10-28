// Polite payment reminder (FR-KHATA-3, SRS 7.8). The app never sends it: the owner copies it
// or hands it to WhatsApp, which opens with the text filled in.

import { displayName } from './format.js';

const TEMPLATES = {
  hinglish: (name, shop, balance) =>
    `Namaste ${name} ji, ${shop} mein aapka ${balance} rupaye ka hisaab baaki hai. Suvidha ho to kripya chuka dijiye. Dhanyavaad!`,
  hi: (name, shop, balance) =>
    `नमस्ते ${name} जी, ${shop} में आपका ${balance} रुपये का हिसाब बाकी है। सुविधा हो तो कृपया चुका दीजिए। धन्यवाद!`,
  mr: (name, shop, balance) =>
    `नमस्कार ${name}, ${shop} मध्ये तुमचे ${balance} रुपये बाकी आहेत. सोयीनुसार कृपया भरावेत. धन्यवाद!`,
};

const UPI_LINES = {
  hinglish: (upi) => `UPI se bhejein: ${upi}`,
  hi: (upi) => `UPI से भेजें: ${upi}`,
  mr: (upi) => `UPI ने पाठवा: ${upi}`,
};

/**
 * UPI deep link with the amount filled in. It is only text in the message — no payment
 * is made or checked by the app.
 */
export function upiLink(upiId, shop, amount) {
  const params = new URLSearchParams({ pa: upiId, pn: shop, am: String(amount), cu: 'INR' });
  return `upi://pay?${params}`;
}

/** Loose check: something@something, no spaces. */
export const isValidUpiId = (value) => /^[\w.-]{2,}@[a-zA-Z][\w.-]*$/.test(value);

/**
 * @param {'hinglish'|'hi'|'mr'} lang
 * @param {{ name: string, aliases: string[], balance: number }} customer
 * @param {string} shop shop name
 * @param {string} [upiId] adds a UPI line and pay link when set
 * @returns {string}
 */
export function buildReminder(lang, customer, shop, upiId = '') {
  const template = TEMPLATES[lang] ?? TEMPLATES.hinglish;
  const message = template(displayName(customer, lang), shop, customer.balance);
  if (!upiId) return message;
  const upiLine = (UPI_LINES[lang] ?? UPI_LINES.hinglish)(upiId);
  return `${message}\n\n${upiLine}\n${upiLink(upiId, shop, customer.balance)}`;
}
