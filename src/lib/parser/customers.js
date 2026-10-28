// Step 5 (SRS 9.1): find the customer — alias match, then fuzzy; unknown names are flagged.

import { NAME_MARKERS, NAME_SUFFIXES } from './keywords.js';
import { buildAliasIndex, isReservedWord, matchAt } from './items.js';

/** "रमेशने" → "रमेश" (only used for exact matches, so it cannot cause wrong guesses). */
function stripSuffix(token) {
  const suffix = NAME_SUFFIXES.find((s) => token.endsWith(s) && token.length - s.length >= 3);
  return suffix ? token.slice(0, -suffix.length) : null;
}

/**
 * Find the customer among the tokens not already used by items.
 * @param {string[]} tokens
 * @param {Array<{ id: string, aliases: string[] }>} customers
 * @param {boolean[]} used marks tokens it uses
 * @returns {{ customer: { id: string, matchedText: string, confidence: number } | null,
 *   newCustomerName: string | null }}
 */
export function extractCustomer(tokens, customers, used) {
  const index = buildAliasIndex(customers);
  const exactAlias = new Map(index.map((alias) => [alias.text, alias.id]));
  let best = null;

  for (let i = 0; i < tokens.length; i += 1) {
    if (used[i]) continue;
    const match = matchAt(tokens, i, index);
    if (match && (!best || match.confidence > best.confidence)) best = { ...match, at: i };
    if (best?.confidence === 1) break;

    const stripped = stripSuffix(tokens[i]);
    if (stripped && exactAlias.has(stripped)) {
      best = {
        id: exactAlias.get(stripped),
        length: 1,
        matchedText: tokens[i],
        confidence: 1,
        at: i,
      };
      break;
    }
  }

  if (best) {
    for (let k = best.at; k < best.at + best.length; k += 1) used[k] = true;
    const { id, matchedText, confidence } = best;
    return {
      customer: { id, matchedText, confidence: Math.round(confidence * 100) / 100 },
      newCustomerName: null,
    };
  }
  return { customer: null, newCustomerName: findNewName(tokens, used) };
}

/** An unknown word followed by "ne"/"ko"/"ने"… (or with ने glued on) looks like a new name. */
function findNewName(tokens, used) {
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (used[i] || isReservedWord(token)) continue;
    if (NAME_MARKERS.includes(tokens[i + 1])) return capitalise(token);
    const stripped = stripSuffix(token);
    if (stripped && /[ऀ-ॿ]/.test(token)) return stripped;
  }
  return null;
}

function capitalise(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}
