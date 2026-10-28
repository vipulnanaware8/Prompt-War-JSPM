import { lazy, StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';

// Each route loads only its own code: landing visitors never download the app, and back.
const AppRoot = lazy(() => import('./app/AppRoot.jsx'));
const LandingPage = lazy(() =>
  import('./pages/LandingPage.jsx').then((m) => ({ default: m.LandingPage })),
);

// "/" is the landing page; the app lives at "/app" (Firebase rewrites every path to index.html).
const isApp = window.location.pathname.startsWith('/app');

// Installable + offline (PWA). Only in production builds, so dev reloads stay fresh.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Suspense fallback={null}>{isApp ? <AppRoot /> : <LandingPage />}</Suspense>
  </StrictMode>,
);
