// Short local ids for new records: newId('t') → "t_mh3k9x2a". Pure, no storage.

let last = 0;

/**
 * A new id with a type prefix. Based on the clock, but always increasing, so two records
 * made in the same millisecond still get different ids.
 * @param {'t'|'c'|'p'} prefix t = transaction, c = customer, p = promise
 * @param {number} [now] milliseconds since epoch
 * @returns {string}
 */
export function newId(prefix, now = Date.now()) {
  last = Math.max(now, last + 1);
  return `${prefix}_${last.toString(36)}`;
}
