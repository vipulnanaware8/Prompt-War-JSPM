import { describe, expect, it } from 'vitest';
import { loadState, saveState, STORAGE_KEY } from '../src/store/persistence.js';
import { createSeedState } from '../src/data/seed.js';

const NOW = new Date('2026-10-28T15:00:00');

/** In-memory stand-in for localStorage. */
function memoryStorage(initial = {}) {
  const data = { ...initial };
  return {
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => {
      data[key] = String(value);
    },
    removeItem: (key) => delete data[key],
  };
}

/** Storage that throws on every call (blocked / private mode). */
const throwingStorage = {
  getItem: () => {
    throw new Error('blocked');
  },
  setItem: () => {
    throw new Error('blocked');
  },
  removeItem: () => {
    throw new Error('blocked');
  },
};

describe('persistence', () => {
  it('first run loads seed data', () => {
    const { state, status } = loadState(memoryStorage(), NOW);
    expect(status).toBe('fresh');
    expect(state).toEqual(createSeedState(NOW));
  });

  it('save → load round trip keeps the state exactly', () => {
    const storage = memoryStorage();
    const state = createSeedState(NOW);
    state.settings.shopName = 'Patil Kirana';
    expect(saveState(storage, state)).toBe(true);
    const loaded = loadState(storage, NOW);
    expect(loaded.status).toBe('loaded');
    expect(loaded.state).toEqual(state);
  });

  it('corrupt JSON resets to seed', () => {
    const { state, status } = loadState(memoryStorage({ [STORAGE_KEY]: '{not json' }), NOW);
    expect(status).toBe('reset');
    expect(state).toEqual(createSeedState(NOW));
  });

  it('wrong schemaVersion resets to seed', () => {
    const old = { ...createSeedState(NOW), schemaVersion: 0 };
    const { state, status } = loadState(memoryStorage({ [STORAGE_KEY]: JSON.stringify(old) }), NOW);
    expect(status).toBe('reset');
    expect(state.schemaVersion).toBe(1);
  });

  it('valid JSON with the wrong shape resets to seed', () => {
    const { status } = loadState(memoryStorage({ [STORAGE_KEY]: '{"schemaVersion":1}' }), NOW);
    expect(status).toBe('reset');
  });

  it('missing storage runs in memory with seed data', () => {
    const { state, status } = loadState(null, NOW);
    expect(status).toBe('unavailable');
    expect(state.items).toHaveLength(15);
  });

  it('storage that throws never crashes load or save', () => {
    expect(() => loadState(throwingStorage, NOW)).not.toThrow();
    expect(loadState(throwingStorage, NOW).state.customers).toHaveLength(6);
    expect(saveState(throwingStorage, createSeedState(NOW))).toBe(false);
  });
});
