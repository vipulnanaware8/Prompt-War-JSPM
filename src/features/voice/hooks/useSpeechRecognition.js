// Push-to-talk speech recognition (FR-VOICE-1/3/5/7) using the browser's Web Speech API.
// States: idle → listening → processing → idle, or error with a code.

import { useCallback, useEffect, useRef, useState } from 'react';

const MAX_LISTEN_MS = 10000; // auto-stop after 10 s (FR-VOICE-5)

/** Browser error codes → our message keys (SRS 7.7). */
function errorKey(code) {
  if (code === 'not-allowed' || code === 'service-not-allowed') return 'not-allowed';
  if (code === 'network') return 'network';
  if (code === 'audio-capture') return 'audio-capture';
  return 'no-speech';
}

function getRecognitionClass() {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

/**
 * @param {{ lang: string, onFinal: (text: string) => void }} options
 */
export function useSpeechRecognition({ lang, onFinal }) {
  const [status, setStatus] = useState('idle');
  const [transcript, setTranscript] = useState({ final: '', interim: '' });
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const onFinalRef = useRef(onFinal);
  const supported = getRecognitionClass() !== null;

  useEffect(() => {
    onFinalRef.current = onFinal;
  }, [onFinal]);

  const stop = useCallback(() => recognitionRef.current?.stop(), []);

  const start = useCallback(() => {
    const Recognition = getRecognitionClass();
    if (!Recognition) {
      setError('unsupported');
      setStatus('error');
      return;
    }
    if (recognitionRef.current) return;

    const recognition = new Recognition();
    recognition.lang = lang;
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;
    let finalText = '';
    let interimText = '';
    let failed = false;

    recognition.onresult = (event) => {
      finalText = '';
      interimText = '';
      for (const result of event.results) {
        if (result.isFinal) finalText += result[0].transcript;
        else interimText += result[0].transcript;
      }
      setTranscript({ final: finalText, interim: interimText });
    };
    recognition.onerror = (event) => {
      if (event.error === 'aborted') return;
      failed = true;
      setError(errorKey(event.error));
      setStatus('error');
    };
    recognition.onend = () => {
      clearTimeout(timerRef.current);
      recognitionRef.current = null;
      if (failed) return;
      const text = (finalText || interimText).trim();
      if (!text) {
        setStatus('idle');
        return;
      }
      // Parse automatically — no extra tap needed (FR-VOICE-6).
      setStatus('processing');
      setTimeout(() => {
        setStatus('idle');
        onFinalRef.current(text);
      }, 150);
    };

    recognitionRef.current = recognition;
    setError(null);
    setTranscript({ final: '', interim: '' });
    setStatus('listening');
    try {
      recognition.start();
      timerRef.current = setTimeout(() => recognition.stop(), MAX_LISTEN_MS);
    } catch {
      recognitionRef.current = null;
      setError('audio-capture');
      setStatus('error');
    }
  }, [lang]);

  const toggle = useCallback(() => {
    if (recognitionRef.current) stop();
    else start();
  }, [start, stop]);

  // Never leave the mic on after the component goes away.
  useEffect(
    () => () => {
      clearTimeout(timerRef.current);
      recognitionRef.current?.abort();
    },
    [],
  );

  return { supported, status, transcript, error, start, stop, toggle };
}
