import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import { AppProviders } from './app/AppProviders.jsx';
import { App } from './app/App.jsx';
import { LandingPage } from './pages/LandingPage.jsx';

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
    {isApp ? (
      <AppProviders>
        <App />
      </AppProviders>
    ) : (
      <LandingPage />
    )}
  </StrictMode>,
);
