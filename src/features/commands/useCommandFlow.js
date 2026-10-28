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
  linesTotal,
  priceLines,
} from '../../lib/ledger.js';
import { buildPromise, daysUntil } from '../../lib/promises.js';
import { applyCorrection } from '../../lib/correction.js';
import { newId } from '../../lib/ids.js';
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

  /** Speak and show a saved change, with Undo for 10 s. `undo` reverts it in the store. */
  const undoable = useCallback(
    (sentence, { message = sentence, undo, undoneMessage }) => {
      say(sentence);
      showToast({
        type: 'success',
        message,
        duration: 10000,
        action: {
          label: t.toast.undo,
          onClick: () => {
            undo();
            cancelSpeech();
            setTimeout(() => showToast({ type: 'warning', message: undoneMessage }), 0);
          },
        },
      });
    },
    [say, showToast, cancelSpeech, t],
  );

  /** Promises are not money, so no confirmation card: save now, speak back, offer Undo. */
  const savePromise = useCallback(
    (result) => {
      const promise = buildPromise(
        { customerId: result.customer.id, when: result.promiseDay, amount: result.amount },
        { id: newId('p') },
      );
      const customer = state.customers.find((c) => c.id === promise.customerId);
      const [y, m, d] = promise.due.split('-').map(Number);
      const when = t.promise.when(daysUntil(promise.due), new Date(y, m - 1, d).getDay());
      const sentence = t.promise.saved(spokenName(customer, language), when);
      dispatch({ type: 'ADD_PROMISE', payload: promise });
      setAnswer(null);
      setVoiceOpen(false);
      undoable(sentence, {
        undo: () => dispatch({ type: 'REMOVE_PROMISE', payload: promise.id }),
        undoneMessage: t.promise.removed,
      });
    },
    [state.customers, t, language, dispatch, undoable],
  );

  /** Open the confirmation card and read out the bill total (same maths as the card). */
  const openDraft = useCallback(
    (result) => {
      setAnswer(null);
      setVoiceOpen(false);
      const next = toDraft(result);
      setDraft(next);
      if (next.intent !== 'cash_sale' && next.intent !== 'credit_sale') return;
      const total =
        next.intent === 'credit_sale' && next.lines.length === 0
          ? Math.round(next.amount ?? 0)
          : linesTotal(priceLines(next.lines, state.items));
      // Quiet mode would turn this into "Ho gaya" before anything is saved, so skip it.
      if (total > 0 && !quiet) say(t.speech.billTotal(total));
    },
    [state.items, quiet, say, t],
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
        savePromise(result);
      } else if (result.intent === 'unknown') {
        setAnswer({ kind: 'unknown', suggestions: result.suggestions });
      } else {
        openDraft(result);
      }
      return result.intent;
    },
    [cancelSpeech, state, t, say, showToast, draft, savePromise, openDraft],
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
      dispatch({ type: 'SET_PRICE', payload: { itemId: item.id, price } });
      setDraft(null);
      undoable(t.price.saved(item.name, price), {
        undo: () =>
          dispatch({ type: 'SET_PRICE', payload: { itemId: item.id, price: item.price } }),
        undoneMessage: t.price.undone,
      });
      return;
    }
    const tx = buildTransaction(draft, state.items, { id: newId('t') });
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
    undoable(sentence, {
      message: `${t.toast.done} ${sentence}`,
      undo: () => dispatch({ type: 'UNDO_TX', payload: tx.id }),
      undoneMessage: t.toast.undone,
    });
  }, [draft, state, t, language, dispatch, undoable]);

  /** Add the unknown name from the command as a new customer and select it. */
  const addCustomer = useCallback(
    (name) => {
      const customer = buildCustomer({ name }, { id: newId('c') });
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

  const cancel = useCallback(() => setDraft(null), []);
  const replay = useCallback(() => answer?.sentence && say(answer.sentence), [answer, say]);

  return {
    text,
    setText,
    submit,
    run,
    mic,
    draft,
    setDraft,
    confirm,
    cancel,
    addCustomer,
    answer,
    replay,
    voiceOpen,
    openVoice,
    showVoice,
    closeVoice,
  };
}
