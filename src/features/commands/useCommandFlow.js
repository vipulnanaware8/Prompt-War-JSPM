// The whole voice flow in one hook (SRS 10.2):
// speak or type → parse → confirmation card → confirm → speak back → undo for 10 s.

import { useCallback, useState } from 'react';
import { parseCommand, parseCorrection } from '../../lib/parser/index.js';
import { answerQuery } from '../../lib/queries.js';
import {
  balanceAfter,
  buildCustomer,
  buildTransaction,
  computeBalances,
} from '../../lib/ledger.js';
import { buildPromise, daysUntil } from '../../lib/promises.js';
import { applyCorrection } from '../../lib/correction.js';
import { SPEECH_LANG } from '../../i18n/strings.js';
import { useShop, useShopDispatch, useStrings } from '../../store/ShopContext.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { useSpeechRecognition } from '../voice/hooks/useSpeechRecognition.js';
import { useSpeechSynthesis } from '../voice/hooks/useSpeechSynthesis.js';
import { answerView, resultSentence, spokenName } from './sentences.js';

/** Editable draft for the confirmation card, built from a parse result. */
function toDraft(result) {
  return {
    intent: result.intent,
    customerId: result.customer?.id ?? null,
    customerConfidence: result.customer?.confidence ?? 1,
    newCustomerName: result.newCustomerName,
    lines: result.items.map((line, key) => ({ ...line, key })),
    amount: result.amount,
  };
}

export function useCommandFlow() {
  const state = useShop();
  const dispatch = useShopDispatch();
  const t = useStrings();
  const { showToast } = useToast();
  const { speak, cancel: cancelSpeech } = useSpeechSynthesis();
  const { language, muted, quiet } = state.settings;

  const [text, setText] = useState('');
  const [draft, setDraft] = useState(null);
  const [answer, setAnswer] = useState(null); // { kind: 'answer'|'unknown', ... }
  const [voiceOpen, setVoiceOpen] = useState(false); // mobile voice sheet

  // Quiet mode: at a busy counter, say only "Ho gaya" — no names or amounts out loud.
  const say = useCallback(
    (sentence) => {
      if (!muted) speak(quiet ? t.quietSpeech : sentence, language);
    },
    [muted, quiet, t, speak, language],
  );

  /** Parse a command and show the card, an answer, or "not understood". Returns the intent. */
  const submit = useCallback(
    (input) => {
      cancelSpeech();
      // While the card is open, speech corrects it instead of starting a new entry.
      if (draft) {
        const fixed = applyCorrection(draft, parseCorrection(input, state));
        if (fixed) {
          setDraft(fixed);
          say(t.correct.done);
        } else {
          showToast({ type: 'warning', message: t.correct.failed });
        }
        return;
      }
      const result = parseCommand(input, state);
      if (result.intent === 'query') {
        const data = answerQuery(result.query, state);
        const view = answerView(t, data);
        // customerId lets the answer card open that customer's khata
        setAnswer({ kind: 'answer', ...view, customerId: data.customerId ?? null });
        say(view.sentence);
      } else if (result.intent === 'promise') {
        // Not money, so no confirmation card: save now, speak back, offer Undo.
        const promise = buildPromise(
          { customerId: result.customer.id, when: result.promiseDay, amount: result.amount },
          { id: `p_${Date.now().toString(36)}` },
        );
        const customer = state.customers.find((c) => c.id === promise.customerId);
        const [y, m, d] = promise.due.split('-').map(Number);
        const when = t.promise.when(daysUntil(promise.due), new Date(y, m - 1, d).getDay());
        const sentence = t.promise.saved(spokenName(customer, language), when);
        dispatch({ type: 'ADD_PROMISE', payload: promise });
        setAnswer(null);
        setVoiceOpen(false);
        say(sentence);
        showToast({
          type: 'success',
          message: sentence,
          duration: 10000,
          action: {
            label: t.toast.undo,
            onClick: () => {
              dispatch({ type: 'REMOVE_PROMISE', payload: promise.id });
              cancelSpeech();
              setTimeout(() => showToast({ type: 'warning', message: t.promise.removed }), 0);
            },
          },
        });
      } else if (result.intent === 'unknown') {
        setAnswer({ kind: 'unknown', suggestions: result.suggestions });
      } else {
        setAnswer(null);
        setVoiceOpen(false);
        setDraft(toDraft(result));
      }
      return result.intent;
    },
    [cancelSpeech, state, t, say, language, dispatch, showToast, draft],
  );

  const mic = useSpeechRecognition({
    lang: SPEECH_LANG[language],
    onFinal: (heard) => {
      setText(heard); // final text goes into the command bar (FR-VOICE-3)
      submit(heard);
    },
  });

  /** Fill the command bar with a phrase and parse it (demo chips, suggestions). */
  const run = useCallback(
    (phrase) => {
      setText(phrase);
      submit(phrase);
    },
    [submit],
  );

  /** Save the confirmed draft, speak the result and offer Undo for 10 s. */
  const confirm = useCallback(() => {
    if (draft.intent === 'price_update') {
      const item = state.items.find((i) => i.id === draft.lines[0].itemId);
      const price = Math.round(draft.amount * 100) / 100;
      const sentence = t.price.saved(item.name, price);
      dispatch({ type: 'SET_PRICE', payload: { itemId: item.id, price } });
      setDraft(null);
      say(sentence);
      showToast({
        type: 'success',
        message: sentence,
        duration: 10000,
        action: {
          label: t.toast.undo,
          onClick: () => {
            dispatch({ type: 'SET_PRICE', payload: { itemId: item.id, price: item.price } });
            cancelSpeech();
            setTimeout(() => showToast({ type: 'warning', message: t.price.undone }), 0);
          },
        },
      });
      return;
    }
    const tx = buildTransaction(draft, state.items, { id: `t_${Date.now().toString(36)}` });
    const customer = state.customers.find((c) => c.id === tx.customerId);
    const before = customer ? computeBalances(state.customers, state.transactions)[customer.id] : 0;
    const sentence = resultSentence(t, tx, {
      name: spokenName(customer, language),
      balance: balanceAfter(before, tx),
      items: state.items,
    });
    dispatch({ type: 'CONFIRM_TX', payload: tx });
    setDraft(null);
    setText(''); // ready for the next entry
    say(sentence);
    showToast({
      type: 'success',
      message: `${t.toast.done} ${sentence}`,
      duration: 10000,
      action: {
        label: t.toast.undo,
        onClick: () => {
          dispatch({ type: 'UNDO_TX', payload: tx.id });
          cancelSpeech();
          setTimeout(() => showToast({ type: 'warning', message: t.toast.undone }), 0);
        },
      },
    });
  }, [draft, state, t, language, dispatch, say, showToast, cancelSpeech]);

  /** Add the unknown name from the command as a new customer and select it. */
  const addCustomer = useCallback(
    (name) => {
      const customer = buildCustomer({ name }, { id: `c_${Date.now().toString(36)}` });
      dispatch({ type: 'ADD_CUSTOMER', payload: customer });
      setDraft((d) => ({
        ...d,
        customerId: customer.id,
        newCustomerName: null,
        customerConfidence: 1,
      }));
      showToast({ type: 'success', message: t.card.customerAdded(name) });
    },
    [dispatch, showToast, t],
  );

  const openVoice = useCallback(() => {
    setVoiceOpen(true);
    mic.start();
  }, [mic]);

  /** Open the voice sheet without listening, e.g. to show an answer to a typed question. */
  const showVoice = useCallback(() => setVoiceOpen(true), []);

  const closeVoice = useCallback(() => {
    mic.stop();
    setVoiceOpen(false);
  }, [mic]);

  return {
    text,
    setText,
    submit,
    run,
    mic,
    draft,
    setDraft,
    confirm,
    cancel: () => setDraft(null),
    addCustomer,
    answer,
    replay: () => answer?.sentence && say(answer.sentence),
    voiceOpen,
    openVoice,
    showVoice,
    closeVoice,
  };
}
