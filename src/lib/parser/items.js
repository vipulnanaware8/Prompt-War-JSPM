// Step 4 (SRS 9.1): find "quantity → optional unit → item" groups in the tokens.

import { KNOWN_WORDS, UNIT_WORDS } from './keywords.js';
import { MULTIPLIERS, NUMBER_WORDS, readNumber } from './numbers.js';
import { matchAlias } from './fuzzy.js';
import { normalize } from './normalize.js';

/** True for words that must only ever match exactly (keywords, numbers, digits). */
export function isReservedWord(token) {
  return (
    KNOWN_WORDS.has(token) || token in NUMBER_WORDS || token in MULTIPLIERS || /\d/.test(token)
  );
}

/**
 * Alias list for matching, longest first so "toor dal" wins over "dal".
 * @param {Array<{ id: string, aliases: string[] }>} entries items or customers
 * @returns {Array<{ id: string, words: string[], text: string }>}
 */
export function buildAliasIndex(entries) {
  return entries
    .flatMap((entry) =>
      entry.aliases.map((alias) => {
        const text = normalize(alias);
        return { id: entry.id, words: text.split(' '), text };
      }),
    )
    .sort((a, b) => b.words.length - a.words.length || b.text.length - a.text.length);
}

/**
 * Best alias that starts at tokens[i]: exact first, then fuzzy for unknown words.
 * @returns {{ id: string, length: number, matchedText: string, confidence: number } | null}
 */
export function matchAt(tokens, i, index) {
  let best = null;
  for (const alias of index) {
    const slice = tokens.slice(i, i + alias.words.length);
    if (slice.length < alias.words.length) continue;
    const heard = slice.join(' ');
    if (heard === alias.text) {
      return { id: alias.id, length: alias.words.length, matchedText: heard, confidence: 1 };
    }
    if (slice.some(isReservedWord)) continue;
    const confidence = matchAlias(heard, alias.text);
    if (confidence > 0 && (!best || confidence > best.confidence)) {
      best = { id: alias.id, length: alias.words.length, matchedText: heard, confidence };
    }
  }
  return best;
}

/** Convert a spoken quantity to the item's own unit (500 g of a kg item → 0.5). */
function toItemUnit(qty, spokenUnit, itemUnit) {
  if (spokenUnit === 'g' && itemUnit === 'kg') return qty / 1000;
  return qty;
}

/**
 * Extract line items. Marks every token it uses in `used`.
 * @param {string[]} tokens normalised tokens
 * @param {Array<{ id: string, unit: string, aliases: string[] }>} items catalogue
 * @param {boolean[]} used
 * @returns {Array<{ itemId: string, qty: number, unit: string, matchedText: string, confidence: number }>}
 */
export function extractItems(tokens, items, used) {
  const index = buildAliasIndex(items);
  const unitOf = Object.fromEntries(items.map((item) => [item.id, item.unit]));
  // A number word is a quantity only if a unit or an item follows it.
  const isQuantityContext = (j) =>
    tokens[j] in UNIT_WORDS || tokens[j] === '₹' || matchAt(tokens, j, index) !== null;
  const lines = [];

  let i = 0;
  while (i < tokens.length) {
    let j = i;
    let qty = null;
    let spokenUnit = null;

    const number = readNumber(tokens, j, isQuantityContext);
    if (number) {
      qty = number.value;
      j += number.length;
    }
    if (tokens[j] in UNIT_WORDS) {
      spokenUnit = UNIT_WORDS[tokens[j]];
      j += 1;
    }
    const match = j < tokens.length ? matchAt(tokens, j, index) : null;
    if (!match) {
      i += 1;
      continue;
    }
    let end = j + match.length;

    // Quantity after the item: "cheeni do kilo" (only when a unit follows the number).
    if (qty === null) {
      const after = readNumber(tokens, end, (k) => tokens[k] in UNIT_WORDS);
      if (after && tokens[end + after.length] in UNIT_WORDS) {
        qty = after.value;
        spokenUnit = UNIT_WORDS[tokens[end + after.length]];
        end += after.length + 1;
      }
    }

    for (let k = i; k < end; k += 1) used[k] = true;
    const itemUnit = unitOf[match.id];
    lines.push({
      itemId: match.id,
      qty: toItemUnit(qty ?? 1, spokenUnit, itemUnit),
      unit: itemUnit,
      matchedText: match.matchedText,
      confidence: Math.round(match.confidence * 100) / 100,
    });
    i = end;
  }
  return lines;
}
