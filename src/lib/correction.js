// "Nahi, teen Maggi" while the card is open: fix the draft instead of starting a new entry.
// Only what was said changes; everything else on the card stays as it was.

/**
 * @param {object} draft the open card
 * @param {{ items: object[], customer: object|null, amount: number|null }} result from parseCorrection
 * @returns {object|null} the new draft, or null when nothing usable was heard
 */
export function applyCorrection(draft, result) {
  let next = draft;
  let changed = false;
  const amountOnly =
    draft.intent === 'payment' ||
    draft.intent === 'price_update' ||
    (draft.intent === 'credit_sale' && draft.lines.length === 0);

  if (result.items.length > 0 && draft.intent !== 'price_update') {
    let lines = [...draft.lines];
    let key = lines.reduce((max, l) => Math.max(max, l.key), -1);
    for (const item of result.items) {
      const index = lines.findIndex((l) => l.itemId === item.itemId);
      if (index >= 0) lines[index] = { ...lines[index], qty: item.qty, unit: item.unit };
      else lines = [...lines, { ...item, key: (key += 1) }];
    }
    next = { ...next, lines };
    changed = true;
  } else if (amountOnly && result.amount !== null) {
    next = { ...next, amount: result.amount };
    changed = true;
  }

  const needsCustomer = draft.intent === 'credit_sale' || draft.intent === 'payment';
  if (needsCustomer && result.customer) {
    next = {
      ...next,
      customerId: result.customer.id,
      customerConfidence: 1,
      newCustomerName: null,
    };
    changed = true;
  }
  return changed ? next : null;
}
