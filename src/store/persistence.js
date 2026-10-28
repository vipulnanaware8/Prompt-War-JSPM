// Load/save the whole shop under one localStorage key (FR-SYS-1/2/3).
// Every storage call is wrapped in try/catch: storage can be missing, full or blocked.

import { createSeedState, SCHEMA_VERSION } from '../data/seed.js';

export const STORAGE_KEY = 'bkh:v1';

/**
 * The browser's localStorage, or null when it cannot be used (e.g. blocked in private mode).
 * @returns {Storage|null}
 */
export function getBrowserStorage() {
  try {
    const storage = globalThis.localStorage;
    const probe = '__bkh_probe__';
    storage.setItem(probe, '1');
    storage.removeItem(probe);
    return storage;
  } catch {
    return null;
  }
}

/** Minimal shape check so old or hand-edited data can never crash the app. */
function isValidState(data) {
  return (
    data !== null &&
    typeof data === 'object' &&
    data.schemaVersion === SCHEMA_VERSION &&
    typeof data.settings === 'object' &&
    data.settings !== null &&
    typeof data.settings.shopName === 'string' &&
    Array.isArray(data.items) &&
    Array.isArray(data.customers) &&
    Array.isArray(data.transactions)
  );
}

/**
 * Load saved state, falling back to seed data.
 * status: 'loaded' (saved data), 'fresh' (first run), 'reset' (data was corrupt or old),
 * 'unavailable' (no storage — app runs in memory only).
 * @param {Storage|null} storage
 * @param {Date} [now]
 * @returns {{ state: import('../data/seed.js').ShopState, status: 'loaded'|'fresh'|'reset'|'unavailable' }}
 */
export function loadState(storage, now = new Date()) {
  if (!storage) return { state: createSeedState(now), status: 'unavailable' };
  try {
    const text = storage.getItem(STORAGE_KEY);
    if (text === null) return { state: createSeedState(now), status: 'fresh' };
    const data = JSON.parse(text);
    if (isValidState(data)) return { state: data, status: 'loaded' };
    return { state: createSeedState(now), status: 'reset' };
  } catch {
    // JSON.parse failed (corrupt data) or storage threw while reading.
    return { state: createSeedState(now), status: 'reset' };
  }
}

/**
 * Save state. Returns false instead of throwing when storage fails.
 * @param {Storage|null} storage
 * @param {object} state
 * @returns {boolean}
 */
export function saveState(storage, state) {
  if (!storage) return false;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
