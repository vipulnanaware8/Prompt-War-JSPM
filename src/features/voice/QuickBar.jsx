// Mobile "speak or type" bar, always above the tab bar. Empty → the button is the mic
// (opens the voice sheet and listens); with text → it sends. Entries go straight to the
// confirmation card; answers and "not understood" open the voice sheet to show them.
import { useEffect, useState } from 'react';
import { Mic, SendHorizontal } from 'lucide-react';
import { DEMO_PHRASES } from '../../lib/parser/index.js';
import { useStrings } from '../../store/ShopContext.jsx';

const ROTATE_MS = 4000;

export function QuickBar({ flow }) {
  const t = useStrings();
  const [example, setExample] = useState(0);
  const [focused, setFocused] = useState(false);
  const text = flow.text.trim();

  // Cycle the example in the placeholder; stop while typing so it never jumps under the cursor.
  useEffect(() => {
    if (focused || text) return undefined;
    const timer = setInterval(() => setExample((i) => (i + 1) % DEMO_PHRASES.length), ROTATE_MS);
    return () => clearInterval(timer);
  }, [focused, text]);

  function handleSubmit(event) {
    event.preventDefault();
    if (!text) {
      flow.openVoice();
      return;
    }
    const intent = flow.submit(text);
    if (intent === 'query' || intent === 'unknown') flow.showVoice();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex max-w-[720px] items-center gap-2 px-4 py-2"
    >
      <input
        value={flow.text}
        onChange={(e) => flow.setText(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={t.voice.quickPlaceholder(DEMO_PHRASES[example])}
        aria-label={t.voice.inputLabel}
        maxLength={500}
        enterKeyHint="send"
        className="min-h-12 min-w-0 flex-1 rounded-full border border-border bg-bg px-4 text-body text-ink text-ellipsis placeholder:text-muted"
      />
      <button
        type="submit"
        aria-label={text ? t.voice.send : t.voice.open}
        title={text ? t.voice.send : t.voice.open}
        className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-raised transition-[transform,opacity] duration-150 ease-out hover:bg-primary-strong active:scale-[.98]"
      >
        {text ? (
          <SendHorizontal size={20} aria-hidden="true" />
        ) : (
          <Mic size={24} aria-hidden="true" />
        )}
      </button>
    </form>
  );
}
