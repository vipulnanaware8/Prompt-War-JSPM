// Mobile bottom tab bar, 64 px + safe area (FR-NAV-2). Hidden on desktop.
import { SECTIONS } from './navigation.js';
import { useStrings } from '../store/ShopContext.jsx';

export function TabBar({ section, onNavigate }) {
  const t = useStrings();
  return (
    <nav
      aria-label={t.mainNav}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="mx-auto flex h-16 max-w-[720px]">
        {SECTIONS.map(({ id, icon: Icon }) => {
          const active = id === section;
          return (
            <li key={id} className="flex-1">
              <button
                type="button"
                onClick={() => onNavigate(id)}
                aria-current={active ? 'page' : undefined}
                className={`flex h-full w-full flex-col items-center justify-center gap-1 text-caption font-medium transition duration-150 ease-out ${
                  active ? 'text-primary' : 'text-muted'
                }`}
              >
                <Icon size={24} strokeWidth={active ? 2.5 : 2} aria-hidden="true" />
                {t.nav[id]}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
