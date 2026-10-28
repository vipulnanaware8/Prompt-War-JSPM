// Polite payment reminder to copy (FR-KHATA-3, SRS 7.8). It is only copied — never sent.

import { displayName } from './format.js';

const TEMPLATES = {
  hinglish: (name, shop, balance) =>
    `Namaste ${name} ji, ${shop} mein aapka ${balance} rupaye ka hisaab baaki hai. Suvidha ho to kripya chuka dijiye. Dhanyavaad!`,
  hi: (name, shop, balance) =>
    `नमस्ते ${name} जी, ${shop} में आपका ${balance} रुपये का हिसाब बाकी है। सुविधा हो तो कृपया चुका दीजिए। धन्यवाद!`,
  mr: (name, shop, balance) =>
    `नमस्कार ${name}, ${shop} मध्ये तुमचे ${balance} रुपये बाकी आहेत. सोयीनुसार कृपया भरावेत. धन्यवाद!`,
};

/**
 * @param {'hinglish'|'hi'|'mr'} lang
 * @param {{ name: string, aliases: string[], balance: number }} customer
 * @param {string} shop shop name
 * @returns {string}
 */
export function buildReminder(lang, customer, shop) {
  const template = TEMPLATES[lang] ?? TEMPLATES.hinglish;
  return template(displayName(customer, lang), shop, customer.balance);
}
