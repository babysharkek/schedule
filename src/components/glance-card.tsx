"use client";

import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { Clock01Icon, GridIcon } from "@hugeicons/core-free-icons";
import { cardSpring } from "@/lib/animations";
import type { AppSettings, ResolvedBlock } from "@/lib/types";
import { getRotation, nextSchoolDayAfter } from "@/lib/rotation";
import { formatMinutesRange } from "@/lib/time";
import { LetterBadge } from "./letter-badge";
import { dateLabel, fullDateLabel } from "./labels";
import type { DayOverride } from "@/lib/types";

export function GlanceCard({
  blocks,
  now,
  settings,
  overrides,
}: {
  blocks: ResolvedBlock[];
  now: Date;
  settings: AppSettings;
  overrides: DayOverride[];
}) {
  const nowMins = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  const todayRotation = getRotation(now, settings, overrides);
  const todayLetter = todayRotation.letter;

  const nextDay = nextSchoolDayAfter(now, settings, overrides);

  const upcoming = blocks.find((b) => b.endMins > nowMins);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={cardSpring}
      className="flex items-stretch justify-between gap-3 rounded-2xl bg-system-2 px-4 py-3"
    >
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-label-3">
          At a glance
        </p>
        {upcoming ? (
          <p className="mt-0.5 flex items-center gap-1.5 truncate text-[14px] font-medium">
            <HugeiconsIcon
              icon={Clock01Icon}
              size={14}
              strokeWidth={1.8}
              color="var(--label-2)"
            />
            <span className="truncate">
              {upcoming.subject || `Period ${upcoming.periodNum}`}
            </span>
            <span className="shrink-0 text-label-3">
              {formatMinutesRange(upcoming.startMins, upcoming.endMins)}
            </span>
          </p>
        ) : (
          <p className="mt-0.5 text-[14px] font-medium text-label-2">
            No more classes today
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 border-l border-sep pl-3">
        {nextDay ? (
          <>
            <LetterBadge letter={nextDay.rotation.letter ?? "A"} size="sm" />
            <div className="leading-tight">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-label-3">
                Next day
              </p>
              <p className="text-[13px] font-semibold">
                {fullDateLabel(nextDay.date).split(",")[0]} · Day{" "}
                {nextDay.rotation.letter}
              </p>
            </div>
          </>
        ) : (
          <span className="flex items-center gap-1.5 text-xs text-label-3">
            <HugeiconsIcon
              icon={GridIcon}
              size={14}
              strokeWidth={1.5}
              color="var(--label-3)"
            />
            No upcoming days
          </span>
        )}
      </div>
      <div className="text-right">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-label-3">
          Today
        </p>
        <p className="text-[12px] font-medium text-label-2">
          {dateLabel(now)} {todayLetter ? `· Day ${todayLetter}` : ""}
        </p>
      </div>
    </motion.div>
  );
}