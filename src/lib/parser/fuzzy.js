// Fuzzy matching (SRS 9.5): Levenshtein distance on normalised strings.

/**
 * Edit distance between two strings (insert, delete, replace = 1 each).
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
export function levenshtein(a, b) {
  let previous = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost);
    }
    previous = current;
  }
  return previous[b.length];
}

/**
 * How many typos a word may have: ≤ 3 chars exact, 4–6 chars 1, ≥ 7 chars 2.
 * @param {number} length
 * @returns {number}
 */
export function allowedDistance(length) {
  if (length <= 3) return 0;
  if (length <= 6) return 1;
  return 2;
}

/**
 * Confidence that `heard` means `alias`: 1 for exact, 1 − distance ÷ length for a close
 * match, 0 when it is too far off.
 * @param {string} heard
 * @param {string} alias
 * @returns {number}
 */
export function matchAlias(heard, alias) {
  if (heard === alias) return 1;
  const distance = levenshtein(heard, alias);
  if (distance > allowedDistance(Math.min(heard.length, alias.length))) return 0;
  return 1 - distance / alias.length;
}
