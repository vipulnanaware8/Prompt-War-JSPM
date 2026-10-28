// The 120 px mic (SRS 7.5): idle / listening / processing / error, each with its own look and label.
import { motion } from 'framer-motion';
import { Mic, MicOff, Square } from 'lucide-react';
import { useStrings } from '../../store/ShopContext.jsx';
import { Waveform } from './Waveform.jsx';

export function MicOrb({ status, error, onToggle }) {
  const t = useStrings();
  const listening = status === 'listening';
  const label = {
    idle: t.voice.idle,
    listening: t.voice.listening,
    processing: t.voice.processing,
    error: error ? t.voice.errors[error] : t.voice.idle,
  }[status];

  let ring = 'shadow-raised';
  if (listening) ring = 'shadow-mic';
  if (status === 'error') ring = 'ring-4 ring-danger';

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        {status === 'processing' && (
          <span
            className="absolute -inset-2 animate-spin rounded-full border-4 border-primary-soft/30 border-t-primary-soft"
            aria-hidden="true"
          />
        )}
        <motion.button
          type="button"
          onClick={onToggle}
          aria-label={listening ? t.voice.stop : t.voice.start}
          aria-pressed={listening}
          animate={listening ? { scale: [1, 1.08, 1] } : { scale: 1 }}
          transition={
            listening ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.15 }
          }
          className={`flex size-[120px] items-center justify-center rounded-full bg-primary text-white transition-shadow duration-200 ${ring}`}
        >
          {listening && <Square size={32} fill="currentColor" aria-hidden="true" />}
          {!listening && status === 'error' && <MicOff size={32} aria-hidden="true" />}
          {!listening && status !== 'error' && <Mic size={32} aria-hidden="true" />}
        </motion.button>
      </div>
      <Waveform active={listening} />
      <p
        className={`max-w-[300px] text-center text-small font-medium ${status === 'error' ? 'text-danger-soft' : 'text-panel-text'}`}
        aria-live="polite"
      >
        {label}
      </p>
    </div>
  );
}
