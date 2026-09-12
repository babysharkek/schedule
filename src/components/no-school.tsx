"use client";

import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { Sun01Icon } from "@hugeicons/core-free-icons";
import { cardSpring } from "@/lib/animations";
import { LetterBadge } from "./letter-badge";
import { dateLabel } from "./labels";

export function NoSchoolView({
  now,
  reason,
  nextLabel,
  nextLetter,
  nextBlocks,
}: {
  now: Date;
  reason: "weekend" | "holiday" | "before-start" | "no-classes";
  nextLabel?: string;
  nextLetter?: string | null;
  nextBlocks?: number;
}) {
  const message =
    reason === "weekend"
      ? "It's the weekend"
      : reason === "holiday"
        ? "Holiday — no school"
        : reason === "before-start"
          ? "The rotation hasn't started yet"
          : "No classes scheduled for today";

  return (
    <section className="px-4 pt-[max(env(safe-area-inset-top),20px)]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={cardSpring}
        className="glass relative flex flex-col items-center overflow-hidden rounded-[28px] px-8 py-12 text-center"
      >
        <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-warn/15 text-warn">
          <HugeiconsIcon icon={Sun01Icon} size={30} strokeWidth={1.5} />
        </span>
        <p className="text-xs font-semibold uppercase tracking-wide text-label-3">
          {dateLabel(now)}
        </p>
        <h1 className="mt-1 text-2xl font-bold">{message}</h1>

        {nextLetter && nextLabel ? (
          <div className="mt-5 flex items-center gap-3 rounded-2xl px-4 py-3">
            <LetterBadge letter={nextLetter} size="sm" />
            <div className="text-left">
              <p className="text-[13px] text-label-2">
                Next school day
              </p>
              <p className="text-[15px] font-semibold">
                {nextLabel} · Day {nextLetter}
                {nextBlocks ? (
                  <span className="ml-1 text-[13px] font-medium text-label-3">
                    · {nextBlocks} classes
                  </span>
                ) : null}
              </p>
            </div>
          </div>
        ) : null}
      </motion.div>
    </section>
  );
}