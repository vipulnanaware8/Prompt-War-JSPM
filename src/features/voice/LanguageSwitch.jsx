// Language chips: Hinglish · हिंदी · मराठी (FR-VOICE-2). The choice is saved in settings.
import { Chip } from '../../components/ui/Chip.jsx';
import { LANGUAGES } from '../../i18n/strings.js';
import { useShop, useShopDispatch, useStrings } from '../../store/ShopContext.jsx';

export function LanguageSwitch({ dark = false }) {
  const t = useStrings();
  const language = useShop((s) => s.settings.language);
  const dispatch = useShopDispatch();
  return (
    <div role="group" aria-label={t.languageLabel} className="flex flex-wrap gap-2">
      {LANGUAGES.map(({ id, label }) => (
        <Chip
          key={id}
          dark={dark}
          selected={id === language}
          lang={id === 'hinglish' ? 'en' : id}
          onClick={() => dispatch({ type: 'UPDATE_SETTINGS', payload: { language: id } })}
        >
          {label}
        </Chip>
      ))}
    </div>
  );
}
