// Answers to spoken questions (SRS 5.8). Returns data; the UI turns it into a sentence.

import { computeBalances, todayTotals } from './ledger.js';
import { orderList, runningOut } from './forecast.js';
import { duePromises } from './promises.js';

/**
 * @param {{ type: string, itemId?: string, customerId?: string } | null} query from parseCommand
 * @param {import('../data/seed.js').ShopState} state
 * @param {Date} [now]
 * @returns {object} answer; `type: 'unsupported'` when the question is not understood
 */
export function answerQuery(query, state, now = new Date()) {
  const balances = computeBalances(state.customers, state.transactions);
  const customerName = (id) => state.customers.find((c) => c.id === id)?.name ?? '';
  const item = (id) => state.items.find((i) => i.id === id);

  switch (query?.type) {
    case 'top_debtor': {
      const top = state.customers
        .map((c) => ({ customerId: c.id, name: c.name, balance: balances[c.id] }))
        .filter((c) => c.balance > 0)
        .sort((a, b) => b.balance - a.balance)[0];
      return top ? { type: 'top_debtor', ...top } : { type: 'no_debtors' };
    }
    case 'today_sales': {
      const { sales, salesCount } = todayTotals(state.transactions, now);
      return { type: 'today_sales', total: sales, count: salesCount };
    }
    case 'day_summary': {
      const totals = todayTotals(state.transactions, now);
      return {
        type: 'day_summary',
        total: totals.sales,
        count: totals.salesCount,
        credit: totals.credit,
        collected: totals.collected,
        promises: duePromises(state, now).length,
        runningOut: runningOut(state.items, state.transactions, now).length,
      };
    }
    case 'order_list':
      return {
        type: 'order_list',
        items: orderList(state.items, state.transactions, now).map((row) => ({
          ...row,
          name: item(row.itemId).name,
        })),
      };
    case 'item_stock': {
      const found = item(query.itemId);
      if (!found) return { type: 'unsupported' };
      return {
        type: 'item_stock',
        itemId: found.id,
        name: found.name,
        stock: found.stock,
        unit: found.unit,
      };
    }
    case 'customer_balance':
      if (!(query.customerId in balances)) return { type: 'unsupported' };
      return {
        type: 'customer_balance',
        customerId: query.customerId,
        name: customerName(query.customerId),
        balance: balances[query.customerId],
      };
    case 'running_out': {
      const list = runningOut(state.items, state.transactions, now)
        .slice(0, 3)
        .map(({ itemId, days }) => ({ itemId, days, name: item(itemId).name }));
      return { type: 'running_out', items: list };
    }
    default:
      return { type: 'unsupported' };
  }
}
