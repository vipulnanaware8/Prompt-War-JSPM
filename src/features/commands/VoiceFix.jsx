// Fix the open card by voice: "Nahi, teen Maggi". The example chip does the same without a mic.
import { Mic } from 'lucide-react';
import { useStrings } from '../../store/ShopContext.jsx';

export function VoiceFix({ flow, example }) {
  const t = useStrings();
  const listening = flow.mic.status === 'listening';
  const heard = flow.mic.transcript?.interim || flow.mic.transcript?.final;

  return (
    <div className="flex flex-col gap-2 rounded-md bg-bg p-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={listening ? flow.mic.stop : flow.mic.start}
          aria-pressed={listening}
          className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-small font-semibold transition-[transform,opacity] duration-150 ease-out active:scale-[.98] ${
            listening ? 'bg-danger text-white' : 'bg-primary-soft text-primary-strong'
          }`}
        >
          <Mic size={18} aria-hidden="true" />
          {listening ? t.correct.listening : t.correct.button}
        </button>
        {example && (
          <button
            type="button"
            onClick={() => flow.submit(example)}
            className="min-h-11 rounded-full border border-border px-3 text-left text-small font-medium text-muted hover:bg-surface"
          >
            “{example}”
          </button>
        )}
      </div>
      {listening && heard && <p className="text-small text-muted">{heard}</p>}
    </div>
  );
}
