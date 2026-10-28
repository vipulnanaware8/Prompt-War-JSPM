// Every language must have the same keys, with the same kind of value, so no screen
// ever shows "undefined" after switching language.
import { describe, expect, it } from 'vitest';
import { LANGUAGES, SPEECH_LANG, STRINGS } from '../src/i18n/strings.js';

/** Flatten nested strings to { 'a.b': 'function' | 'string' | 'array' }. */
function shape(obj, prefix = '') {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (Array.isArray(value)) acc[path] = 'array';
    else if (value && typeof value === 'object') Object.assign(acc, shape(value, path));
    else acc[path] = typeof value;
    return acc;
  }, {});
}

describe('i18n', () => {
  const reference = shape(STRINGS.hinglish);

  it.each(['hi', 'mr'])('%s has exactly the Hinglish keys and value types', (lang) => {
    expect(shape(STRINGS[lang])).toEqual(reference);
  });

  it('has no empty strings', () => {
    for (const [lang, strings] of Object.entries(STRINGS)) {
      const empty = Object.entries(shape(strings)).filter(
        ([path, type]) =>
          type === 'string' && path.split('.').reduce((o, k) => o[k], strings) === '',
      );
      expect(empty, lang).toEqual([]);
    }
  });

  it('every language chip has strings and a speech language', () => {
    for (const { id } of LANGUAGES) {
      expect(STRINGS[id]).toBeDefined();
      expect(SPEECH_LANG[id]).toMatch(/^[a-z]{2}-IN$/);
    }
  });
});
