// Hero phone mockup: a spoken entry, its confirmation card, and the spoken reply.
import { motion } from 'framer-motion';
import { Check, Mic, Volume2 } from 'lucide-react';

const WAVE_HEIGHTS = [6, 10, 4, 12, 8, 11, 5, 9, 7, 12, 4];

/** Phone mockup: a spoken entry, its confirmation card, and the spoken reply. */
export function PhoneMock() {
  return (
    <div
      role="img"
      aria-label="App preview: Ramesh ne 2 kilo cheeni aur 1 Parle-G udhaar liya. Total ₹100, confirmed. Ramesh ka baaki ab ₹340 hai."
      className="relative mx-auto w-full max-w-[340px]"
    >
      <div
        aria-hidden="true"
        className="absolute -inset-8 rounded-full bg-gradient-to-br from-amber-200/60 via-emerald-200/40 to-transparent blur-3xl"
      />
      <div className="relative rounded-[2.5rem] border-[10px] border-stone-900 bg-stone-900 shadow-2xl">
        <div className="overflow-hidden rounded-[1.9rem] bg-[#f6eedd]">
          <div className="flex items-center gap-3 bg-emerald-700 px-4 py-3 text-white">
            <span className="grid size-9 place-items-center rounded-full bg-white/20 text-sm font-bold">
              BH
            </span>
            <div>
              <p className="text-sm font-semibold">Bol Ke Hisaab</p>
              <p className="text-xs text-emerald-100">sun raha hai…</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 p-4 text-[13px]">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-emerald-100 px-3 py-2 text-stone-800"
            >
              <span className="mb-1 flex items-center gap-1.5 text-emerald-800">
                <Mic size={14} aria-hidden="true" />
                <span className="flex h-3 items-end gap-[2px]" aria-hidden="true">
                  {WAVE_HEIGHTS.map((h, i) => (
                    <span
                      key={i}
                      className="w-[3px] rounded bg-emerald-700"
                      style={{ height: h }}
                    />
                  ))}
                </span>
                <span className="text-[11px]">0:04</span>
              </span>
              Ramesh ne 2 kilo cheeni aur 1 Parle-G udhaar liya
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="max-w-[92%] rounded-2xl rounded-tl-sm bg-white p-3 text-stone-700 shadow-sm"
            >
              <p className="mb-2 text-[11px] font-semibold tracking-wide text-amber-700 uppercase">
                Udhaar · Ramesh
              </p>
              <div className="flex justify-between">
                <span>Sugar 2 kg × ₹45</span>
                <span>₹90</span>
              </div>
              <div className="flex justify-between">
                <span>Parle-G 1 × ₹10</span>
                <span>₹10</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-dashed border-stone-300 pt-2 font-bold text-stone-900">
                <span>Total</span>
                <span>₹100</span>
              </div>
              <span className="mt-3 flex items-center justify-center gap-1.5 rounded-full bg-emerald-700 py-1.5 text-xs font-semibold text-white">
                <Check size={14} aria-hidden="true" /> Confirm
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white px-3 py-2 text-stone-700 shadow-sm"
            >
              <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
                <Volume2 size={14} aria-hidden="true" /> Ho gaya!
              </span>
              Ramesh ka baaki ab ₹340 hai.
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
