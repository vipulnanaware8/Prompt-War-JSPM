// Numbers (SRS 9.4): digits, decimals, and number words in Hinglish, Hindi and Marathi.

/** Number words → value. Devanagari is written without nukta (normalize removes it). */
export const NUMBER_WORDS = {
  // Fractions
  paav: 0.25,
  पाव: 0.25,
  aadha: 0.5,
  aadhaa: 0.5,
  adha: 0.5,
  आधा: 0.5,
  अर्धा: 0.5,
  dedh: 1.5,
  डेढ: 1.5,
  दीड: 1.5,
  dhai: 2.5,
  ढाई: 2.5,
  अडीच: 2.5,
  // Whole numbers
  ek: 1,
  एक: 1,
  do: 2,
  दो: 2,
  दोन: 2,
  teen: 3,
  तीन: 3,
  char: 4,
  chaar: 4,
  चार: 4,
  paanch: 5,
  panch: 5,
  पांच: 5,
  पाच: 5,
  chhe: 6,
  chah: 6,
  che: 6,
  छह: 6,
  छः: 6,
  सहा: 6,
  saat: 7,
  सात: 7,
  aath: 8,
  आठ: 8,
  nau: 9,
  नौ: 9,
  नऊ: 9,
  das: 10,
  दस: 10,
  दहा: 10,
  barah: 12,
  बारह: 12,
  बारा: 12,
  pandrah: 15,
  पंद्रह: 15,
  पंधरा: 15,
  bees: 20,
  बीस: 20,
  वीस: 20,
  pachaas: 50,
  पचास: 50,
  पन्नास: 50,
  // English words, because en-IN speech recognition often writes "two kilo"
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  twelve: 12,
  fifteen: 15,
  twenty: 20,
  fifty: 50,
  half: 0.5,
};

/** Multipliers: "do sau" = 200, "ek hazaar" = 1000. */
export const MULTIPLIERS = {
  sau: 100,
  सौ: 100,
  शंभर: 100,
  hundred: 100,
  hazaar: 1000,
  hazar: 1000,
  हजार: 1000,
  thousand: 1000,
};

const DIGITS = /^\d+(\.\d+)?$/;

/**
 * Read a number starting at tokens[i].
 * Digits always count. A number word counts only when `isQuantityContext(nextIndex)` says
 * what follows is a unit, an item or "₹" — so "likh do" never becomes 2.
 * @param {string[]} tokens
 * @param {number} i
 * @param {(nextIndex: number) => boolean} isQuantityContext
 * @returns {{ value: number, length: number } | null}
 */
export function readNumber(tokens, i, isQuantityContext) {
  const token = tokens[i];
  let value;
  let isWord = false;

  if (DIGITS.test(token)) value = parseFloat(token);
  else if (token in NUMBER_WORDS) {
    value = NUMBER_WORDS[token];
    isWord = true;
  } else if (token in MULTIPLIERS) {
    return { value: MULTIPLIERS[token], length: 1 }; // "sau rupaye" = 100
  } else return null;

  let length = 1;
  const next = tokens[i + 1];
  if (next in MULTIPLIERS) {
    value *= MULTIPLIERS[next];
    length = 2;
    isWord = false; // "do sau" is clearly a number
  }
  if (isWord && !isQuantityContext(i + length)) return null;
  return { value, length };
}
