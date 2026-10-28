// Settings — Shop, Voice, Data, About (SRS 7.5).
import { Card } from '../components/ui/Card.jsx';
import { AboutCard } from '../features/settings/AboutCard.jsx';
import { DataCard } from '../features/settings/DataCard.jsx';
import { ShopNameForm } from '../features/settings/ShopNameForm.jsx';
import { UpiForm } from '../features/settings/UpiForm.jsx';
import { LanguageSwitch } from '../features/voice/LanguageSwitch.jsx';
import { useShop, useShopDispatch, useStrings } from '../store/ShopContext.jsx';

export function SettingsPage() {
  const t = useStrings();
  const { shopName, muted, quiet = false, upiId = '' } = useShop((s) => s.settings);
  const dispatch = useShopDispatch();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="py-2 text-h1 font-bold">{t.settingsTitle}</h1>

      <Card title={t.shopCard}>
        {/* key: after "Reset demo data" the form starts again from the seed name */}
        <div className="flex flex-col gap-4">
          <ShopNameForm key={shopName} shopName={shopName} />
          <UpiForm key={upiId} upiId={upiId} />
        </div>
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
          <label className="flex min-h-11 cursor-pointer items-center justify-between gap-4">
            <span>
              <span className="block text-body font-semibold">{t.quietLabel}</span>
              <span className="block text-small text-muted">{t.quietHelp}</span>
            </span>
            {/* Checked = only "Ho gaya" is spoken; nothing to choose while muted */}
            <input
              type="checkbox"
              role="switch"
              checked={quiet}
              disabled={muted}
              onChange={() => dispatch({ type: 'UPDATE_SETTINGS', payload: { quiet: !quiet } })}
              className="size-6 shrink-0 cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-50"
            />
          </label>
        </div>
      </Card>

      <DataCard />
      <AboutCard />
    </div>
  );
}
