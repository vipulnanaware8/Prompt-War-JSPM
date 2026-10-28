// Answers to spoken questions, and the "not understood" message with suggestions (SRS 7.5, 7.7).
import { BookOpenText, MessageCircle, MessageCircleQuestion, Volume2 } from 'lucide-react';
import { IconButton } from '../../components/ui/IconButton.jsx';
import { useShop, useStrings } from '../../store/ShopContext.jsx';

function SuggestionChips({ phrases, onPick }) {
  return (
    <div className="flex flex-wrap gap-2">
      {phrases.map((phrase) => (
        <button
          key={phrase}
          type="button"
          onClick={() => onPick(phrase)}
          className="min-h-11 rounded-full bg-primary-soft px-3 py-2 text-left text-small font-semibold text-primary-strong hover:opacity-90"
        >
          {phrase}
        </button>
      ))}
    </div>
  );
}

export function AnswerCard({ answer, onReplay, onPick, onOpenCustomer }) {
  const t = useStrings();
  const shopName = useShop((s) => s.settings.shopName);
  if (!answer) return null;

  if (answer.kind === 'unknown') {
    return (
      <section className="flex flex-col gap-3 rounded-lg bg-surface p-4 text-ink shadow-raised">
        <p className="text-body font-semibold">{t.voice.unknown}</p>
        <SuggestionChips phrases={answer.suggestions} onPick={onPick} />
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-2 rounded-lg bg-surface p-4 text-ink shadow-raised">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-caption font-semibold text-muted">
          <MessageCircleQuestion size={20} aria-hidden="true" />
          {t.answer.title}
        </p>
        <IconButton label={t.answer.replay} onClick={onReplay}>
          <Volume2 size={20} aria-hidden="true" />
        </IconButton>
      </div>
      {answer.value && (
        <p className="font-ledger text-display font-bold tabular-nums">{answer.value}</p>
      )}
      <p className="text-body">{answer.sentence}</p>
      {answer.examples && <SuggestionChips phrases={answer.examples} onPick={onPick} />}
      {answer.orderLines && (
        <button
          type="button"
          onClick={() =>
            window.open(
              `https://wa.me/?text=${encodeURIComponent(t.order.share(shopName, answer.orderLines))}`,
              '_blank',
              'noopener',
            )
          }
          className="inline-flex min-h-11 items-center gap-2 self-start rounded-md px-1 text-small font-semibold text-primary-strong hover:underline"
        >
          <MessageCircle size={20} aria-hidden="true" />
          {t.order.whatsapp}
        </button>
      )}
      {answer.customerId && (
        <button
          type="button"
          onClick={() => onOpenCustomer(answer.customerId)}
          className="inline-flex min-h-11 items-center gap-2 self-start rounded-md px-1 text-small font-semibold text-primary-strong hover:underline"
        >
          <BookOpenText size={20} aria-hidden="true" />
          {t.khata.open}
        </button>
      )}
    </section>
  );
}
