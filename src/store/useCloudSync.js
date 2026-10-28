// While WhatsApp alerts are on, upload the shop summary a moment after every change.
import { useEffect } from 'react';
import { alertSettings, buildAlertSnapshot } from '../lib/alertSnapshot.js';
import { cloudConfigured, pushSnapshot } from '../lib/cloud.js';
import { useShop } from './ShopContext.jsx';

const DEBOUNCE_MS = 2000;

export function useCloudSync() {
  const state = useShop();
  const enabled = cloudConfigured && alertSettings(state.settings).enabled;

  useEffect(() => {
    if (!enabled) return undefined;
    const timer = setTimeout(() => {
      // Offline or blocked: the next change (or reload) tries again.
      pushSnapshot(buildAlertSnapshot(state)).catch((error) =>
        console.error('WhatsApp alerts sync failed', error),
      );
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [enabled, state]);
}
