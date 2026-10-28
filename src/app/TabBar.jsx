// Mobile bottom tab bar, 64 px + safe area, with a raised centre mic button (FR-NAV-2).
// Hidden on desktop.
import { Mic } from 'lucide-react';
import { SECTIONS } from './navigation.js';
import { useStrings } from '../store/ShopContext.jsx';

function Tab({ id, icon: Icon, active, label, onNavigate }) {
  return (
    <li className="flex-1">
      <button
        type="button"
        onClick={() => onNavigate(id)}
        aria-current={active ? 'page' : undefined}
        className={`flex h-full w-full flex-col items-center justify-center gap-1 text-caption font-medium transition duration-150 ease-out ${
          active ? 'text-primary' : 'text-muted'
        }`}
      >
        <Icon size={24} strokeWidth={active ? 2.5 : 2} aria-hidden="true" />
        {label}
      </button>
    </li>
  );
}

export function TabBar({ section, onNavigate, onMic }) {
  const t = useStrings();
  const tab = (s) => (
    <Tab key={s.id} {...s} active={s.id === section} label={t.nav[s.id]} onNavigate={onNavigate} />
  );

  return (
    <nav
      aria-label={t.mainNav}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="mx-auto flex h-16 max-w-[720px]">
        {SECTIONS.slice(0, 2).map(tab)}
        <li className="flex w-20 justify-center">
          {/* 72 px mic, raised 24 px above the bar */}
          <button
            type="button"
            onClick={onMic}
            aria-label={t.voice.open}
            className="-mt-6 flex size-[72px] items-center justify-center rounded-full bg-primary text-white shadow-raised ring-4 ring-bg transition duration-150 ease-out active:scale-[.98]"
          >
            <Mic size={32} aria-hidden="true" />
          </button>
        </li>
        {SECTIONS.slice(2).map(tab)}
      </ul>
    </nav>
  );
}
