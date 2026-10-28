// Desktop left sidebar, 240 px (FR-NAV-3).
import { Mic } from 'lucide-react';
import { SECTIONS } from './navigation.js';
import { useStrings } from '../store/ShopContext.jsx';

export function Sidebar({ section, onNavigate }) {
  const t = useStrings();
  return (
    <aside className="sticky top-0 hidden h-dvh flex-col gap-8 border-r border-border bg-surface px-4 py-6 lg:flex">
      <div className="flex items-center gap-3 px-2">
        <span className="flex size-10 items-center justify-center rounded-md bg-primary text-white">
          <Mic size={20} aria-hidden="true" />
        </span>
        <span className="text-h2 font-bold">{t.appName}</span>
      </div>
      <nav aria-label={t.mainNav}>
        <ul className="flex flex-col gap-1">
          {SECTIONS.map(({ id, icon: Icon }) => {
            const active = id === section;
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => onNavigate(id)}
                  aria-current={active ? 'page' : undefined}
                  className={`flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-body font-medium transition-[transform,opacity] duration-150 ease-out ${
                    active
                      ? 'bg-primary-soft text-primary-strong'
                      : 'text-muted hover:bg-bg hover:text-ink'
                  }`}
                >
                  <Icon size={24} aria-hidden="true" />
                  {t.nav[id]}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
