// Mobile bottom bar: the "speak or type" quick bar (children) above four 64 px tabs,
// plus the safe area (FR-NAV-2). The mic lives in the quick bar. Hidden on desktop.
import { SECTIONS } from './navigation.js';
import { useStrings } from '../store/ShopContext.jsx';

function Tab({ id, icon: Icon, active, label, onNavigate }) {
  return (
    <li className="flex-1">
      <button
        type="button"
        onClick={() => onNavigate(id)}
        aria-current={active ? 'page' : undefined}
        className={`flex h-full w-full flex-col items-center justify-center gap-1 text-caption font-medium transition-[transform,opacity] duration-150 ease-out ${
          active ? 'text-primary' : 'text-muted'
        }`}
      >
        <Icon size={24} strokeWidth={active ? 2.5 : 2} aria-hidden="true" />
        {label}
      </button>
    </li>
  );
}

export function TabBar({ section, onNavigate, children }) {
  const t = useStrings();

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden">
      {children}
      <nav aria-label={t.mainNav}>
        <ul className="mx-auto flex h-16 max-w-[720px]">
          {SECTIONS.map((s) => (
            <Tab
              key={s.id}
              {...s}
              active={s.id === section}
              label={t.nav[s.id]}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      </nav>
    </div>
  );
}
