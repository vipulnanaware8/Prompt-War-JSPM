// All state changes go through this reducer. More actions arrive with the voice flow.

/**
 * @param {import('../data/seed.js').ShopState} state
 * @param {{ type: 'UPDATE_SETTINGS', payload: object }} action
 */
export function shopReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    default:
      return state;
  }
}
