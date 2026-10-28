// Settings — shop name, voice language, mute (FR-SET-1/2/3).
import { useState } from 'react';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import { LanguageSwitch } from '../features/voice/LanguageSwitch.jsx';
import { useShop, useShopDispatch, useStrings } from '../store/ShopContext.jsx';

export function SettingsPage() {
  const t = useStrings();
  const { shopName, muted } = useShop((s) => s.settings);
  const dispatch = useShopDispatch();
  const { showToast } = useToast();
  const [name, setName] = useState(shopName);
  const trimmed = name.trim();

  function saveName(event) {
    event.preventDefault();
    dispatch({ type: 'UPDATE_SETTINGS', payload: { shopName: trimmed } });
    showToast({ type: 'success', message: t.saved });
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="py-2 text-h1 font-bold">{t.settingsTitle}</h1>

      <Card title={t.shopCard}>
        <form onSubmit={saveName} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex flex-1 flex-col gap-1 text-small font-medium text-muted">
            {t.shopNameLabel}
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              className="min-h-11 rounded-md border border-border bg-surface px-3 text-body text-ink"
            />
          </label>
          <Button type="submit" disabled={!trimmed || trimmed === shopName}>
            {t.save}
          </Button>
        </form>
      </Card>

      <Card title={t.voiceCard}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <p className="text-small font-medium text-muted">{t.languageLabel}</p>
            <LanguageSwitch />
          </div>
          <label className="flex min-h-11 cursor-pointer items-center justify-between gap-4">
            <span>
              <span className="block text-body font-semibold">{t.muteLabel}</span>
              <span className="block text-small text-muted">{t.muteHelp}</span>
            </span>
            {/* Checked = speech on; unchecked = muted (FR-SET-3) */}
            <input
              type="checkbox"
              role="switch"
              checked={!muted}
              onChange={() => dispatch({ type: 'UPDATE_SETTINGS', payload: { muted: !muted } })}
              className="size-6 shrink-0 cursor-pointer accent-primary"
            />
          </label>
        </div>
      </Card>
    </div>
  );
}
