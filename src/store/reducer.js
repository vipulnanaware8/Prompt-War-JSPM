// All state changes go through this reducer. Money and stock rules live in src/lib/ledger.js.

import { applyTransaction, undoLast } from '../lib/ledger.js';

/**
 * @param {import('../data/seed.js').ShopState} state
 * @param {{ type: 'CONFIRM_TX'|'UNDO_TX'|'ADD_CUSTOMER'|'UPDATE_CUSTOMER'|'ADD_PROMISE'|'REMOVE_PROMISE'|'SET_PRICE'|'UPDATE_SETTINGS'|'RESET', payload: any }} action
 */
export function shopReducer(state, action) {
  switch (action.type) {
    case 'CONFIRM_TX':
      return applyTransaction(state, action.payload);
    case 'UNDO_TX':
      return undoLast(state, action.payload);
    case 'ADD_CUSTOMER':
      return { ...state, customers: [...state.customers, action.payload] };
    case 'UPDATE_CUSTOMER': // e.g. WhatsApp number + consent for reminders
      return {
        ...state,
        customers: state.customers.map((c) =>
          c.id === action.payload.id ? { ...c, ...action.payload.changes } : c,
        ),
      };
    case 'ADD_PROMISE': // one open promise per customer; the newest replaces the old one
      return {
        ...state,
        promises: [
          ...(state.promises ?? []).filter((p) => p.customerId !== action.payload.customerId),
          action.payload,
        ],
      };
    case 'REMOVE_PROMISE':
      return {
        ...state,
        promises: (state.promises ?? []).filter((p) => p.id !== action.payload),
      };
    case 'SET_PRICE': // past entries keep the price they were saved with
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.itemId ? { ...item, price: action.payload.price } : item,
        ),
      };
    case 'RESET':
      return action.payload; // a fresh seed state, built by the caller
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    default:
      return state;
  }
}
