// Speak-back (FR-TTS-1/2/5) with the browser's speechSynthesis.
// Voice choice: the language's own voice, else hi-IN, else en-IN, else text only.

import { useCallback, useEffect, useRef } from 'react';

const VOICE_ORDER = {
  hinglish: ['en-IN', 'hi-IN'],
  hi: ['hi-IN', 'en-IN'],
  mr: ['mr-IN', 'hi-IN', 'en-IN'],
};

function getSynth() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
    ? window.speechSynthesis
    : null;
}

/** First voice for the first language in the order; Google voices preferred (they sound best). */
function pickVoice(voices, language) {
  for (const code of VOICE_ORDER[language] ?? VOICE_ORDER.hinglish) {
    const matches = voices.filter(
      (v) => v.lang.replace('_', '-').toLowerCase() === code.toLowerCase(),
    );
    if (matches.length > 0) return matches.find((v) => v.name.includes('Google')) ?? matches[0];
  }
  return null;
}

export function useSpeechSynthesis() {
  const voicesRef = useRef([]);

  // Voices load asynchronously in Chrome: read them now and on `voiceschanged`.
  useEffect(() => {
    const synth = getSynth();
    if (!synth) return undefined;
    const load = () => {
      voicesRef.current = synth.getVoices();
    };
    load();
    synth.addEventListener('voiceschanged', load);
    return () => synth.removeEventListener('voiceschanged', load);
  }, []);

  const cancel = useCallback(() => getSynth()?.cancel(), []);

  /** Speak `text`; returns false when no suitable voice exists (text is still on screen). */
  const speak = useCallback((text, language) => {
    const synth = getSynth();
    if (!synth) return false;
    const voice = pickVoice(voicesRef.current, language);
    if (!voice) return false;
    synth.cancel(); // never overlap voices (FR-TTS-5)
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.lang = voice.lang;
    synth.speak(utterance);
    return true;
  }, []);

  return { speak, cancel };
}
