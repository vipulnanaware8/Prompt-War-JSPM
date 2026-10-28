// Khata — search + customers sorted by balance + add customer (SRS 7.5).
import { useState } from 'react';
import { UserPlus, UserSearch } from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { SearchInput } from '../components/ui/SearchInput.jsx';
import { AddCustomerSheet } from '../features/khata/AddCustomerSheet.jsx';
import { CustomerList } from '../features/khata/CustomerList.jsx';
import { selectCustomersMatching } from '../store/selectors.js';
import { useShop, useStrings } from '../store/ShopContext.jsx';

export function KhataPage({ onOpenCustomer }) {
  const t = useStrings();
  const [query, setQuery] = useState('');
  const [adding, setAdding] = useState(false);
  const [formKey, setFormKey] = useState(0); // new key = fresh form each time it opens
  const customers = useShop((s) => selectCustomersMatching(s, query));
  const total = useShop((s) => s.customers.length);

  function openAdd() {
    setFormKey((k) => k + 1);
    setAdding(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-3 py-2">
        <div>
          <h1 className="text-h1 font-bold">{t.khataTitle}</h1>
          <p className="text-body text-muted">{t.khataSub(total)}</p>
        </div>
        <Button variant="secondary" onClick={openAdd}>
          <UserPlus size={20} aria-hidden="true" />
          <span className="hidden sm:inline">{t.khata.addCustomer}</span>
        </Button>
      </div>

      <SearchInput
        value={query}
        onChange={setQuery}
        label={t.khata.searchLabel}
        placeholder={t.khata.searchPlaceholder}
        clearLabel={t.khata.clearSearch}
      />

      {customers.length > 0 ? (
        <CustomerList customers={customers} onOpen={onOpenCustomer} />
      ) : (
        <div className="flex flex-col items-center rounded-lg border border-border bg-surface pb-6 shadow-card">
          <EmptyState icon={UserSearch} title={t.khata.noResults} hint={t.khata.noResultsHint} />
          <Button onClick={openAdd}>
            <UserPlus size={20} aria-hidden="true" />
            {t.khata.addCustomer}
          </Button>
        </div>
      )}

      <AddCustomerSheet
        key={formKey}
        open={adding}
        initialName={query.trim()}
        onClose={() => setAdding(false)}
        onAdded={(id) => {
          setAdding(false);
          setQuery('');
          onOpenCustomer(id);
        }}
      />
    </div>
  );
}
