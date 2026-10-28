// Khata — customer list sorted by balance (SRS 7.5).
import { CustomerList } from '../features/khata/CustomerList.jsx';
import { selectCustomersByBalance } from '../store/selectors.js';
import { useShop, useStrings } from '../store/ShopContext.jsx';

export function KhataPage() {
  const t = useStrings();
  const customers = useShop(selectCustomersByBalance);

  return (
    <div className="flex flex-col gap-4">
      <div className="py-2">
        <h1 className="text-h1 font-bold">{t.khataTitle}</h1>
        <p className="text-body text-muted">{t.khataSub(customers.length)}</p>
      </div>
      <CustomerList customers={customers} />
    </div>
  );
}
