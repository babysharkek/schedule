"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusIcon, TrashIcon } from "@hugeicons/core-free-icons";
import type { DayOverride } from "@/lib/types";
import { LETTERS } from "@/lib/types";
import { overridesRepo } from "@/services/storage";
import { pressSpring } from "@/lib/animations";
import { useToast } from "@/components/toast-provider";

export function OverrideManager({ overrides }: { overrides: DayOverride[] }) {
  const [adding, setAdding] = useState(false);
  const [date, setDate] = useState("");
  const [day, setDay] = useState(0);
  const toast = useToast();

  const sorted = [...overrides].sort((a, b) => (a.date < b.date ? 1 : -1));

  const add = async () => {
    if (!date) return;
    await overridesRepo.set({ date, day });
    toast("Override saved", `${date} → Day ${LETTERS[day]}`);
    setAdding(false);
    setDate("");
  };

  const remove = async (d: string) => {
    await overridesRepo.remove(d);
    toast("Override removed", d);
  };

  return (
    <div>
      {sorted.length ? (
        <div className="ios-group">
          {sorted.map((o) => (
            <div key={o.date} className="ios-row flex items-center">
              <span className="text-[15px]">{o.date}</span>
              <span
                className="ml-2 rounded-full px-2 py-0.5 text-[12px] font-bold text-white"
                style={{ background: letterColor(LETTERS[o.day]) }}
              >
                Day {LETTERS[o.day]}
              </span>
              <button
                onClick={() => void remove(o.date)}
                className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-bad/70"
                aria-label="Delete override"
              >
                <HugeiconsIcon icon={TrashIcon} size={16} strokeWidth={1.8} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-2xl bg-system-2 px-4 py-5 text-center text-[14px] text-label-2">
          No overrides saved.
        </p>
      )}

      <motion.button
        whileTap={{ scale: 0.95 }}
        transition={pressSpring}
        onClick={() => setAdding((a) => !a)}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent/10 py-3 text-[15px] font-semibold text-accent"
      >
        <HugeiconsIcon icon={PlusIcon} size={18} strokeWidth={2} />
        Add override
      </motion.button>

      <AnimatePresence>
        {adding ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={pressSpring}
            className="overflow-hidden"
          >
            <div className="mt-3 flex items-end gap-2 rounded-2xl bg-system-2 p-3">
              <label className="flex flex-1 flex-col gap-1">
                <span className="text-[12px] font-medium text-label-3">Date</span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="ios-input"
                />
              </label>
              <label className="flex flex-1 flex-col gap-1">
                <span className="text-[12px] font-medium text-label-3">Letter</span>
                <select
                  value={day}
                  onChange={(e) => setDay(Number(e.target.value))}
                  className="ios-input"
                >
                  {LETTERS.map((l, i) => (
                    <option key={l} value={i}>
                      Day {l}
                    </option>
                  ))}
                </select>
              </label>
              <button
                onClick={() => void add()}
                disabled={!date}
                className="rounded-2xl bg-accent px-5 py-2.5 text-[15px] font-semibold text-white disabled:opacity-40"
              >
                Save
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function letterColor(letter: string): string {
  return (
    {
      A: "#007AFF",
      B: "#FF9500",
      C: "#34C759",
      D: "#AF52DE",
    }[letter] ?? "#007AFF"
  );
}