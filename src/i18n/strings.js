// All UI text, one file per language (NFR-11). Keys are the same in every language.
import { hi } from './hi.js';
import { hinglish } from './hinglish.js';
import { mr } from './mr.js';

export const STRINGS = { hinglish, hi, mr };

/** Speech recognition and speech output language for each app language. */
export const SPEECH_LANG = { hinglish: 'en-IN', hi: 'hi-IN', mr: 'mr-IN' };

/** Language options shown on chips; labels are always in their own script. */
export const LANGUAGES = [
  { id: 'hinglish', label: 'Hinglish' },
  { id: 'hi', label: 'हिंदी' },
  { id: 'mr', label: 'मराठी' },
];
