// Stock — every catalogue item with its stock level (SRS 7.5).
import { ItemList } from '../features/stock/ItemList.jsx';
import { useShop, useStrings } from '../store/ShopContext.jsx';

export function StockPage() {
  const t = useStrings();
  const items = useShop((s) => s.items);

  return (
    <div className="flex flex-col gap-4">
      <div className="py-2">
        <h1 className="text-h1 font-bold">{t.stockTitle}</h1>
        <p className="text-body text-muted">{t.stockSub(items.length)}</p>
      </div>
      <ItemList items={items} />
    </div>
  );
}
