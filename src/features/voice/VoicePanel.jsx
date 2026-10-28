// Desktop right voice panel, 380 px, dark and sticky (FR-NAV-3).
// Phase 1 shell: language switch + tagline. Mic, transcript and chips arrive with the voice core.
import { LanguageSwitch } from './LanguageSwitch.jsx';
import { useStrings } from '../../store/ShopContext.jsx';

export function VoicePanel() {
  const t = useStrings();
  return (
    <aside className="sticky top-0 hidden h-dvh flex-col gap-10 bg-ink px-6 py-6 text-panel-text lg:flex">
      <LanguageSwitch dark />
      <div className="flex flex-1 flex-col justify-center gap-3">
        <p className="text-h1 font-bold">{t.tagline}</p>
        <p className="text-small text-panel-muted">{t.appName}</p>
      </div>
    </aside>
  );
}
