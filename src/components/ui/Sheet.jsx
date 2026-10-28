// Sheet — bottom sheet on mobile, centred 480 px modal on desktop (SRS 7.4).
// Drag handle, focus trap, Esc closes, backdrop click closes. Rendered in a portal.

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useDragControls, useIsPresent } from 'framer-motion';

const FOCUSABLE =
  'button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';
const SPRING = { type: 'spring', stiffness: 400, damping: 34 };

/**
 * Full-screen layer for the sheet. While it is leaving (exit animation) it no longer takes
 * clicks and is hidden from screen readers, so a closing sheet can never block the app.
 */
function Layer({ children }) {
  const isPresent = useIsPresent();
  return (
    <div
      aria-hidden={!isPresent || undefined}
      className={`fixed inset-0 z-[45] flex items-end justify-center lg:items-center lg:p-6 ${isPresent ? '' : 'pointer-events-none'}`}
    >
      {children}
    </div>
  );
}

export function Sheet({ open, onClose, label, dark = false, full = false, onKeyDown, children }) {
  const panelRef = useRef(null);
  const dragControls = useDragControls();
  const isDesktop =
    typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches;

  // On open: lock page scroll and focus the first control; on close: restore focus.
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    document.body.style.overflow = 'hidden';
    // A control marked data-autofocus (e.g. Confirm) gets focus first, else the first control.
    const timer = setTimeout(() => {
      const panel = panelRef.current;
      const target =
        panel?.querySelector('[data-autofocus]:not([disabled])') ?? panel?.querySelector(FOCUSABLE);
      target?.focus();
    }, 50);
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = '';
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, [open]);

  function handleKeyDown(event) {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key === 'Tab') {
      // Focus trap: Tab from the last control goes back to the first, and the reverse.
      const nodes = [...panelRef.current.querySelectorAll(FOCUSABLE)];
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    onKeyDown?.(event);
  }

  const tone = dark ? 'bg-ink text-panel-text' : 'bg-surface text-ink';
  const size = full ? 'h-dvh max-h-dvh rounded-none' : 'max-h-[92dvh] rounded-t-xl lg:rounded-xl';

  return createPortal(
    <AnimatePresence>
      {open && (
        <Layer>
          <motion.div
            className="absolute inset-0 bg-ink/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            onKeyDown={handleKeyDown}
            initial={isDesktop ? { opacity: 0, y: 24 } : { y: '100%' }}
            animate={isDesktop ? { opacity: 1, y: 0 } : { y: 0 }}
            exit={isDesktop ? { opacity: 0, y: 24 } : { y: '100%' }}
            transition={SPRING}
            drag={isDesktop ? false : 'y'}
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => info.offset.y > 120 && onClose()}
            className={`relative flex w-full flex-col overflow-hidden shadow-raised lg:max-w-[480px] ${tone} ${size}`}
          >
            {/* Drag handle (mobile): pull down to close */}
            <div
              className="flex shrink-0 cursor-grab touch-none justify-center pt-3 pb-1 lg:hidden"
              onPointerDown={(e) => dragControls.start(e)}
              aria-hidden="true"
            >
              <span
                className={`h-1.5 w-10 rounded-full ${dark ? 'bg-panel-muted/50' : 'bg-border'}`}
              />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </Layer>
      )}
    </AnimatePresence>,
    document.body,
  );
}
