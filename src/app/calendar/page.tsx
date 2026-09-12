"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { useNow } from "@/hooks/use-now";
import { useSettings, useOverrides, useBlocks } from "@/hooks/use-data";
import {
  getRotation,
  datesInMonth,
  dateKey,
} from "@/lib/rotation";
import { resolveBlocks } from "@/lib/timetable";
import { LETTERS } from "@/lib/types";
import { ScreenHeader } from "@/components/header";
import { LetterBadge } from "@/components/letter-badge";
import { Timeline } from "@/components/timeline";
import { monthName, fullDateLabel } from "@/components/labels";
import { pressSpring, screenSpring } from "@/lib/animations";
import { useHaptics } from "@/hooks/use-haptics";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function DayCell({
  date,
  letter,
  status,
  overridden,
  isToday,
  onTap,
}: {
  date: Date;
  letter: string | null;
  status: "school" | "weekend" | "holiday" | "before-start" | "override";
  overridden: boolean;
  isToday: boolean;
  onTap: () => void;
}) {
  const isOff = status === "weekend" || status === "holiday" || status === "before-start";
  return (
    <motion.button
      whileTap={{ scale: 0.82 }}
      transition={pressSpring}
      onClick={onTap}
      className="flex aspect-square flex-col items-center justify-center gap-1"
      aria-label={`${fullDateLabel(date)}${letter ? `, Day ${letter}` : ""}`}
    >
      <span
        className={`text-[12px] font-medium ${
          isToday ? "text-white" : isOff ? "text-label-3" : "text-label-2"
        }`}
      >
        {date.getDate()}
      </span>
      <span
        className="relative flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-semibold"
        style={{
          background: letter ? letterColor(letter) : "transparent",
          color: letter ? "#fff" : "transparent",
          boxShadow: isToday
            ? "0 0 0 2px var(--label)"
            : letter
              ? `0 3px 8px -4px ${letterColor(letter)}`
              : undefined,
        }}
      >
        {letter ?? ""}
        {overridden ? (
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-warn ring-2 ring-system" />
        ) : null}
      </span>
    </motion.button>
  );
}

function letterColor(letter: string): string {
  const colors: Record<string, string> = {
    A: "#007AFF",
    B: "#FF9500",
    C: "#34C759",
    D: "#AF52DE",
  };
  return colors[letter] ?? "#007AFF";
}

export default function CalendarPage() {
  const now = useNow(60000);
  const settings = useSettings();
  const overrides = useOverrides();
  const blocks = useBlocks();
  const haptics = useHaptics();

  const todayKey = dateKey(now);
  const [viewMonth, setViewMonth] = useState(() => ({
    year: now.getFullYear(),
    month: now.getMonth(),
  }));
  const [selected, setSelected] = useState<string | null>(null);

  const days = useMemo(
    () => datesInMonth(viewMonth.year, viewMonth.month),
    [viewMonth]
  );

  const cells = useMemo(() => {
    const first = days[0];
    const leading = first.getDay();
    const grid: (Date | null)[] = [
      ...Array.from({ length: leading }, () => null),
      ...days,
    ];
    return grid;
  }, [days]);

const cellCount = cells.length;

  const selectedRotation = selected
    ? getRotation(
        new Date(Number(selected.slice(0, 4)), Number(selected.slice(5, 7)) - 1, Number(selected.slice(8, 10))),
        settings,
        overrides
      )
    : null;
  const selectedBlocks = selectedRotation?.day != null
    ? resolveBlocks(
        blocks.filter((b) => b.day === selectedRotation.day),
        settings.periods
      )
    : [];

  const shiftMonth = (delta: number) => {
    haptics("light");
    setViewMonth((prev) => {
      const d = new Date(prev.year, prev.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  return (
    <main className="mx-auto w-full max-w-lg px-4">
      <ScreenHeader title="Schedule" />

      <div className="mb-3 flex items-center justify-between rounded-2xl bg-system-2 px-3 py-2">
        <button
          onClick={() => shiftMonth(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-fill text-label-2"
          aria-label="Previous month"
        >
          <HugeiconsIcon icon={ChevronLeftIcon} size={18} strokeWidth={2} />
        </button>
        <p className="text-[15px] font-semibold">
          {monthName(viewMonth.month)} {viewMonth.year}
        </p>
        <button
          onClick={() => shiftMonth(1)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-fill text-label-2"
          aria-label="Next month"
        >
          <HugeiconsIcon icon={ChevronRightIcon} size={18} strokeWidth={2} />
        </button>
      </div>

      <div className="rounded-[20px] bg-system-2 px-2 py-3">
        <div className="mb-1 grid grid-cols-7">
          {WEEKDAYS.map((w, i) => (
            <span
              key={i}
              className="pb-1 text-center text-[11px] font-semibold uppercase text-label-3"
            >
              {w}
            </span>
          ))}
        </div>
        <div
          className="grid grid-cols-7"
          style={{ marginBottom: (7 - Math.ceil(cellCount / 7)) * 48 }}
        >
          {cells.map((d, i) => {
            if (!d) return <span key={`blank-${i}`} />;
            const r = getRotation(d, settings, overrides);
            const k = dateKey(d);
            return (
              <DayCell
                key={k}
                date={d}
                letter={r.letter ?? null}
                status={r.status}
                overridden={r.overridden}
                isToday={k === todayKey}
                onTap={() => {
                  haptics("light");
                  setSelected(k);
                }}
              />
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-4 rounded-2xl bg-system-2 px-4 py-3">
        {LETTERS.map((l) => (
          <span
            key={l}
            className="flex items-center gap-1.5 text-[12px] font-medium text-label-2"
          >
            <LetterBadge letter={l} size="sm" />
            Day {l}
          </span>
        ))}
        <span className="flex items-center gap-1.5 text-[12px] font-medium text-label-2">
          <span className="h-2 w-2 rounded-full bg-warn" />
          Override
        </span>
      </div>

      <p className="mt-3 pb-2 text-center text-[12px] text-label-3">
        Weekends and holidays skip the rotation automatically
      </p>

      <AnimatePresence>
        {selected ? (
          <motion.div
            className="fixed inset-0 z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.button
              className="absolute inset-0 h-full w-full bg-black/30 backdrop-blur-sm"
              onClick={() => setSelected(null)}
              aria-label="Close"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={screenSpring}
              className="glass-strong absolute inset-x-0 bottom-0 mx-auto max-w-lg rounded-t-[28px] p-5 pb-[max(env(safe-area-inset-bottom),20px)]"
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-fill" />
              {selectedRotation ? (
                <>
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-[15px] font-semibold">
                      {fullDateLabel(
                        new Date(
                          Number(selected.slice(0, 4)),
                          Number(selected.slice(5, 7)) - 1,
                          Number(selected.slice(8, 10))
                        )
                      )}
                    </p>
                    <button
                      onClick={() => setSelected(null)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-fill text-label-2"
                      aria-label="Close"
                    >
                      <HugeiconsIcon
                        icon={Cancel01Icon}
                        size={16}
                        strokeWidth={2}
                      />
                    </button>
                  </div>
                  <div className="mb-3 flex items-center gap-2">
                    {selectedRotation.letter ? (
                      <LetterBadge
                        letter={selectedRotation.letter}
                        size="md"
                      />
                    ) : null}
                    <span className="text-[13px] font-medium text-label-2">
                      {selectedRotation.status === "weekend"
                        ? "Weekend · no school"
                        : selectedRotation.status === "holiday"
                          ? "Holiday · no school"
                          : selectedRotation.status === "before-start"
                            ? "Before rotation start"
                            : selectedRotation.status === "override"
                              ? "Day-override applied"
                              : "School day"}
                    </span>
                  </div>
                  {selectedBlocks.length ? (
                    <Timeline blocks={selectedBlocks} nowMins={-1} />
                  ) : (
                    <p className="py-8 text-center text-[14px] text-label-2">
                      No classes scheduled for this day.
                    </p>
                  )}
                </>
              ) : null}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}