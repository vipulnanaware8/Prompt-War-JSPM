// 5 bars that move while listening (FR-VOICE-4). Only `transform` is animated (NFR-2).
import { motion } from 'framer-motion';

// Different heights and speeds per bar so it looks like a live voice.
const BARS = [
  { heights: [0.3, 0.9, 0.5, 0.8, 0.3], duration: 0.9 },
  { heights: [0.5, 0.4, 1, 0.6, 0.5], duration: 0.7 },
  { heights: [0.8, 0.5, 0.7, 1, 0.8], duration: 0.8 },
  { heights: [0.4, 1, 0.6, 0.4, 0.4], duration: 0.75 },
  { heights: [0.6, 0.3, 0.9, 0.5, 0.6], duration: 0.95 },
];

export function Waveform({ active }) {
  return (
    <div className="flex h-8 items-center gap-1.5" aria-hidden="true">
      {BARS.map((bar, i) => (
        <motion.span
          key={i}
          className={`h-8 w-1.5 origin-center rounded-full ${active ? 'bg-primary-soft' : 'bg-panel-muted/30'}`}
          animate={active ? { scaleY: bar.heights } : { scaleY: 0.2 }}
          transition={
            active
              ? { duration: bar.duration, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 0.2 }
          }
        />
      ))}
    </div>
  );
}
