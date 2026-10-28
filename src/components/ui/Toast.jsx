// Toast system (FR-SYS-5): success / warning / error, one at a time, auto-dismiss after 4 s.
// An optional action (Undo) gets a progress bar showing the time left (SRS 7.4).
// Hovering or focusing the toast pauses it; leaving restarts the full time (WCAG 2.2.1).
// Sits bottom-centre, above the mobile quick bar and tab bar.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

const ToastContext = createContext({ showToast: () => {} });

const TYPES = {
  success: { icon: CheckCircle2, tone: 'text-success-soft' },
  warning: { icon: AlertTriangle, tone: 'text-warning-soft' },
  error: { icon: XCircle, tone: 'text-danger-soft' },
};

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const [paused, setPaused] = useState(false);
  const [run, setRun] = useState(0); // bumps on resume to restart the timer and progress bar

  // A new toast replaces the current one (one at a time).
  const showToast = useCallback(({ type = 'success', message, action, duration = 4000 }) => {
    setToast({ id: Date.now(), type, message, action, duration });
    setPaused(false);
  }, []);

  useEffect(() => {
    if (!toast || paused) return undefined;
    const timer = setTimeout(() => setToast(null), toast.duration);
    return () => clearTimeout(timer);
  }, [toast, paused, run]);

  const pause = useCallback(() => setPaused(true), []);
  const resume = useCallback(() => {
    setPaused(false);
    setRun((n) => n + 1);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);
  const Icon = toast ? TYPES[toast.type].icon : null;

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-[calc(144px+env(safe-area-inset-bottom))] z-50 flex justify-center px-4 lg:bottom-6"
      >
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              onMouseEnter={pause}
              onMouseLeave={resume}
              onFocus={pause}
              onBlur={resume}
              className="pointer-events-auto relative flex max-w-md items-center gap-3 overflow-hidden rounded-lg bg-ink py-2 pr-2 pl-4 text-small font-medium text-panel-text shadow-raised"
            >
              <Icon size={20} className={`shrink-0 ${TYPES[toast.type].tone}`} aria-hidden="true" />
              <span className="py-1">{toast.message}</span>
              {toast.action && (
                <button
                  type="button"
                  onClick={() => {
                    toast.action.onClick();
                    setToast(null);
                  }}
                  className="min-h-11 shrink-0 rounded-md px-4 font-semibold text-primary-soft hover:bg-white/10"
                >
                  {toast.action.label}
                </button>
              )}
              {toast.action && !paused && (
                // Time left to undo: shrinks from full width to zero.
                <motion.span
                  key={run}
                  className="absolute bottom-0 left-0 h-1 w-full origin-left bg-primary"
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: toast.duration / 1000, ease: 'linear' }}
                  aria-hidden="true"
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
