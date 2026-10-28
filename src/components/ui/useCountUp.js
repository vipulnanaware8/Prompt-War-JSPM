// Animates a number from its previous value to `target` in 600 ms (FR-DASH-3).
// Under reduced motion it returns the exact value straight away.

import { useEffect, useRef, useState } from 'react';
import { animate, useReducedMotion } from 'framer-motion';

export function useCountUp(target, duration = 0.6) {
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(0);
  const from = useRef(0);

  useEffect(() => {
    if (reduceMotion) return undefined;
    const controls = animate(from.current, target, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (value) => {
        from.current = value;
        setDisplay(Math.round(value));
      },
      onComplete: () => setDisplay(target), // final value is always exact
    });
    return () => controls.stop();
  }, [target, duration, reduceMotion]);

  return reduceMotion ? target : display;
}
