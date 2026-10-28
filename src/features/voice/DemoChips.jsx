// "Try saying:" — one tap fills the command bar and parses (FR-VOICE-9).
import { DEMO_PHRASES } from '../../lib/parser/index.js';
import { useStrings } from '../../store/ShopContext.jsx';

export function DemoChips({ onPick }) {
  const t = useStrings();
  return (
    <div className="flex flex-col gap-2">
      <p className="text-caption font-medium text-panel-muted">{t.voice.tryLabel}</p>
      <div className="flex flex-wrap gap-2">
        {DEMO_PHRASES.map((phrase) => (
          <button
            key={phrase}
            type="button"
            onClick={() => onPick(phrase)}
            className="min-h-11 rounded-full border border-panel-muted/40 px-3 py-2 text-left text-small font-medium text-panel-text transition duration-150 ease-out hover:bg-white/10 active:scale-[.98]"
          >
            {phrase}
          </button>
        ))}
      </div>
    </div>
  );
}
