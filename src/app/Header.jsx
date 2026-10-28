// Header — shop name, today's date and the mute toggle (FR-NAV-4).
import { Volume2, VolumeX } from 'lucide-react';
import { IconButton } from '../components/ui/IconButton.jsx';
import { useShop, useShopDispatch, useStrings } from '../store/ShopContext.jsx';

export function Header() {
  const t = useStrings();
  const { shopName, muted } = useShop((s) => s.settings);
  const dispatch = useShopDispatch();
  const date = new Date().toLocaleDateString(t.locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <header className="flex items-center justify-between gap-3 py-4">
      <div className="min-w-0">
        <p className="truncate text-h2 font-semibold">{shopName}</p>
        <p className="text-small font-medium text-muted">{date}</p>
      </div>
      <IconButton
        label={muted ? t.muteOn : t.muteOff}
        aria-pressed={muted}
        onClick={() => dispatch({ type: 'UPDATE_SETTINGS', payload: { muted: !muted } })}
        className={muted ? 'bg-danger-soft text-danger' : ''}
      >
        {muted ? (
          <VolumeX size={24} aria-hidden="true" />
        ) : (
          <Volume2 size={24} aria-hidden="true" />
        )}
      </IconButton>
    </header>
  );
}
