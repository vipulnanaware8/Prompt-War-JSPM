// All state changes go through this reducer. Money and stock rules live in src/lib/ledger.js.

import { applyTransaction, undoLast } from '../lib/ledger.js';

/**
 * @param {import('../data/seed.js').ShopState} state
 * @param {{ type: 'CONFIRM_TX'|'UNDO_TX'|'ADD_CUSTOMER'|'UPDATE_SETTINGS', payload: any }} action
 */
export function shopReducer(state, action) {
  switch (action.type) {
    case 'CONFIRM_TX':
      return applyTransaction(state, action.payload);
    case 'UNDO_TX':
      return undoLast(state, action.payload);
    case 'ADD_CUSTOMER':
      return { ...state, customers: [...state.customers, action.payload] };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    default:
      return state;
  }
}
