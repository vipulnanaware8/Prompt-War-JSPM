// Copy a polite reminder in Hinglish / हिंदी / मराठी (FR-KHATA-3). Copied only — nothing is sent.
import { useState } from 'react';
import { Copy } from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { Chip } from '../../components/ui/Chip.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { LANGUAGES } from '../../i18n/strings.js';
import { buildReminder } from '../../lib/reminders.js';
import { useShop, useStrings } from '../../store/ShopContext.jsx';

/** Clipboard API first; the old textarea trick as a fallback (e.g. non-secure contexts). */
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  }
}

export function ReminderButton({ customer }) {
  const t = useStrings();
  const { shopName, language } = useShop((s) => s.settings);
  const [lang, setLang] = useState(language);
  const { showToast } = useToast();
  const message = buildReminder(lang, customer, shopName);

  async function handleCopy() {
    const ok = await copyText(message);
    showToast(
      ok
        ? { type: 'success', message: t.khata.copied }
        : { type: 'error', message: t.khata.copyFailed },
    );
  }

  return (
    <section className="flex flex-col gap-3 rounded-lg bg-bg p-4">
      <h3 className="text-body font-semibold">{t.khata.reminderTitle}</h3>
      <div role="group" aria-label={t.khata.reminderLang} className="flex flex-wrap gap-2">
        {LANGUAGES.map(({ id, label }) => (
          <Chip key={id} selected={id === lang} onClick={() => setLang(id)}>
            {label}
          </Chip>
        ))}
      </div>
      <p className="rounded-md border border-border bg-surface p-3 text-small text-muted">
        {message}
      </p>
      <Button size="lg" onClick={handleCopy}>
        <Copy size={20} aria-hidden="true" />
        {t.khata.copyReminder}
      </Button>
    </section>
  );
}
