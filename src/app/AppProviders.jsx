// Wraps the app: error boundary outermost, then toasts, then shop state.
import { MotionConfig } from 'framer-motion';
import { ErrorBoundary } from '../components/ui/ErrorBoundary.jsx';
import { ToastProvider } from '../components/ui/Toast.jsx';
import { ShopProvider } from '../store/ShopContext.jsx';

export function AppProviders({ children }) {
  return (
    <ErrorBoundary>
      {/* reducedMotion="user": movement is skipped when the OS asks for reduced motion (NFR-10) */}
      <MotionConfig reducedMotion="user">
        <ToastProvider>
          <ShopProvider>{children}</ShopProvider>
        </ToastProvider>
      </MotionConfig>
    </ErrorBoundary>
  );
}
