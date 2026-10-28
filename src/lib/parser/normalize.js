// Step 1 of the pipeline (SRS 9.1): make spoken or typed text uniform before matching.

import { CURRENCY_WORDS } from './keywords.js';

const DEVANAGARI_DIGITS = '०१२३४५६७८९';

/**
 * Lowercase, Devanagari digits → ASCII, remove nukta, chandrabindu → anusvara,
 * punctuation → spaces (decimal points kept), split "2kg" → "2 kg",
 * and every currency word (₹, rs, rupaye, रुपये …) → the token "₹".
 * @param {string} text
 * @returns {string}
 */
export function normalize(text) {
  const cleaned = String(text)
    .toLowerCase()
    .replace(/[०-९]/g, (d) => String(DEVANAGARI_DIGITS.indexOf(d)))
    .replace(/़/g, '') // nukta: ज़ → ज
    .replace(/ँ/g, 'ं') // chandrabindu ँ → anusvara ं
    .replace(/₹/g, ' ₹ ')
    .replace(/[^\p{L}\p{M}\p{N}₹\s.]/gu, ' ') // punctuation (incl. । and -) → space
    .replace(/\.(?!\d)|(?<!\d)\./g, ' ') // keep "2.5", drop other dots
    .replace(/(\d)(\p{L})/gu, '$1 $2') // "2kg" → "2 kg"
    .replace(/(\p{L}\p{M}*)(\d)/gu, '$1 $2'); // "rs200" → "rs 200"

  return cleaned
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => (CURRENCY_WORDS.has(word) ? '₹' : word))
    .join(' ');
}
