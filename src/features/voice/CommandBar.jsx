// Text input + send, always available; Enter submits (FR-VOICE-8).
import { SendHorizontal } from 'lucide-react';
import { useStrings } from '../../store/ShopContext.jsx';

export function CommandBar({ value, onChange, onSubmit }) {
  const t = useStrings();
  const text = value.trim();

  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (text) onSubmit(text);
      }}
    >
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t.voice.placeholder}
        aria-label={t.voice.inputLabel}
        maxLength={500}
        className="min-h-12 min-w-0 flex-1 rounded-md border border-panel-muted/30 bg-white/10 px-3 text-body text-panel-text placeholder:text-panel-muted"
      />
      <button
        type="submit"
        aria-label={t.voice.send}
        title={t.voice.send}
        disabled={!text}
        className="flex size-12 shrink-0 items-center justify-center rounded-md bg-primary text-white transition-[transform,opacity] duration-150 ease-out hover:bg-primary-strong active:scale-[.98] disabled:opacity-40"
      >
        <SendHorizontal size={20} aria-hidden="true" />
      </button>
    </form>
  );
}
