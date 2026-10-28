// One context for the whole shop (SRS 10.3): state + dispatch via useReducer,
// saved to localStorage after every change.

import { createContext, useContext, useEffect, useReducer, useRef, useState } from 'react';
import { shopReducer } from './reducer.js';
import { getBrowserStorage, loadState, saveState } from './persistence.js';
import { STRINGS } from '../i18n/strings.js';
import { useToast } from '../components/ui/Toast.jsx';

const StateContext = createContext(null);
const DispatchContext = createContext(null);
const StorageContext = createContext(true);

export function ShopProvider({ children }) {
  // Load once on first render: saved data, or seed data on first run / corrupt data.
  const [boot] = useState(() => {
    const storage = getBrowserStorage();
    return { storage, ...loadState(storage) };
  });
  const [state, dispatch] = useReducer(shopReducer, boot.state);
  const { showToast } = useToast();
  const toastShown = useRef(false);

  // Corrupt or old data was replaced by the seed: tell the owner once (FR-SYS-2).
  useEffect(() => {
    if (boot.status === 'reset' && !toastShown.current) {
      toastShown.current = true;
      showToast({ type: 'warning', message: STRINGS[state.settings.language].resetToast });
    }
  }, [boot.status, showToast, state.settings.language]);

  // Persist after every change (FR-SYS-1).
  useEffect(() => {
    saveState(boot.storage, state);
  }, [boot.storage, state]);

  return (
    <StorageContext.Provider value={boot.storage !== null}>
      <StateContext.Provider value={state}>
        <DispatchContext.Provider value={dispatch}>{children}</DispatchContext.Provider>
      </StateContext.Provider>
    </StorageContext.Provider>
  );
}

/**
 * Read shop state through a selector: useShop(selectTodayTotals).
 * Without a selector, returns the whole state.
 */
export function useShop(selector) {
  const state = useContext(StateContext);
  return selector ? selector(state) : state;
}

export function useShopDispatch() {
  return useContext(DispatchContext);
}

/** False when the browser blocks storage (FR-SYS-3). */
export function useStorageAvailable() {
  return useContext(StorageContext);
}

/** UI strings for the selected language. */
export function useStrings() {
  const language = useContext(StateContext).settings.language;
  return STRINGS[language] || STRINGS.hinglish;
}
