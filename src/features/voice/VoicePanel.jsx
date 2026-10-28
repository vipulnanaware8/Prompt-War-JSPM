// Voice panel content (SRS 7.5): language, mic, live transcript, command bar, demo chips,
// hint and answers. Desktop shows it in the right column; mobile in a full-height sheet.
import { AnswerCard } from '../commands/AnswerCard.jsx';
import { useStrings } from '../../store/ShopContext.jsx';
import { CommandBar } from './CommandBar.jsx';
import { DemoChips } from './DemoChips.jsx';
import { LanguageSwitch } from './LanguageSwitch.jsx';
import { MicOrb } from './MicOrb.jsx';

export function VoicePanel({ flow, onOpenCustomer }) {
  const t = useStrings();
  const { mic } = flow;
  const { final, interim } = mic.transcript;
  const showTranscript = mic.status === 'listening' && (final || interim);

  return (
    <div className="flex flex-col gap-6 px-6 py-6">
      <LanguageSwitch dark />
      <MicOrb status={mic.status} error={mic.error} onToggle={mic.toggle} />

      {/* Live transcript: final words solid, words still being heard at 60% (FR-VOICE-3) */}
      {showTranscript && (
        <blockquote className="text-center text-h2 font-medium" aria-live="polite">
          “{final}
          <span className="opacity-60">{interim}</span>”
        </blockquote>
      )}

      <CommandBar value={flow.text} onChange={flow.setText} onSubmit={flow.submit} />
      <AnswerCard
        answer={flow.answer}
        onReplay={flow.replay}
        onPick={flow.run}
        onOpenCustomer={onOpenCustomer}
      />
      <DemoChips onPick={flow.run} />
      {mic.status === 'idle' && (
        <p className="text-caption font-medium text-panel-muted">{t.voice.hint}</p>
      )}
    </div>
  );
}
