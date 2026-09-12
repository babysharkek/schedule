"use client";

import { AnimatePresence, motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { pressSpring, screenSpring } from "@/lib/animations";
import { LETTERS } from "@/lib/types";
import type { DayOverride } from "@/lib/types";
import { overridesRepo } from "@/services/storage";
import { useToast } from "./toast-provider";
import { useHaptics } from "@/hooks/use-haptics";

export function OverrideSheet({
  open,
  onClose,
  dateKey,
  currentDay,
  overrides,
}: {
  open: boolean;
  onClose: () => void;
  dateKey: string;
  currentDay: number | null;
  overrides: DayOverride[];
}) {
  const toast = useToast();
  const haptics = useHaptics();
  const activeOverride = overrides.find((o) => o.date === dateKey);

  const apply = async (day: number) => {
    await overridesRepo.set({ date: dateKey, day });
    haptics("medium");
    toast(`Today is now Day ${LETTERS[day]}`, "Override applied");
    onClose();
  };

  const clearOverride = async () => {
    await overridesRepo.remove(dateKey);
    haptics("tap");
    toast("Override cleared", "Back to normal rotation");
    onClose();
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[60]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.button
            aria-label="Close"
            className="absolute inset-0 h-full w-full bg-black/30 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={screenSpring}
            className="glass-strong absolute inset-x-0 bottom-0 mx-auto max-w-lg rounded-t-[28px] p-5 pb-[max(env(safe-area-inset-bottom),16px)]"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-fill" />
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Today&rsquo;s letter</h2>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-fill text-label-2"
                aria-label="Close"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={16} strokeWidth={2} />
              </button>
            </div>

            <p className="mb-3 text-[13px] text-label-2">
              Schedule change or assembly? Tell Saturn which letter today really
              is.
            </p>

            <div className="grid grid-cols-4 gap-2">
              {LETTERS.map((letter, i) => {
                const active = activeOverride?.day === i;
                const isCurrent = currentDay === i && !activeOverride;
                return (
                  <motion.button
                    key={letter}
                    whileTap={{ scale: 0.88 }}
                    transition={pressSpring}
                    onClick={() => apply(i)}
                    className="flex h-16 flex-col items-center justify-center gap-0.5 rounded-2xl border text-lg font-bold"
                    style={{
                      borderColor: active ? "var(--accent)" : "transparent",
                      background: active ? "var(--accent)" : "var(--bg2)",
                      color: active ? "#fff" : "var(--label)",
                    }}
                  >
                    {letter}
                    <span
                      className="text-[10px] font-medium"
                      style={{ color: active ? "rgba(255,255,255,0.7)" : "var(--label-3)" }}
                    >
                      {isCurrent ? "today" : active ? "override" : "day"}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {activeOverride ? (
              <button
                onClick={clearOverride}
                className="mt-4 w-full rounded-2xl bg-bad/10 py-3 text-[15px] font-semibold text-bad"
              >
                Clear override (back to Day {LETTERS[currentDay ?? 0]})
              </button>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}