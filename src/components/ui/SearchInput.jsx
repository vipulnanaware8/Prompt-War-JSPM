// SearchInput — search icon, clear button; works with Devanagari input (SRS 7.4).
import { Search, X } from 'lucide-react';

export function SearchInput({ value, onChange, label, placeholder, clearLabel }) {
  return (
    <div className="relative">
      <Search
        size={20}
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        placeholder={placeholder}
        className="min-h-12 w-full rounded-md border border-border bg-surface pr-12 pl-10 text-body text-ink placeholder:text-muted [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label={clearLabel}
          title={clearLabel}
          className="absolute top-1/2 right-1 flex size-11 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:bg-primary-soft hover:text-primary-strong"
        >
          <X size={20} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
