"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { MoreIcon } from "@hugeicons/core-free-icons";
import { useNow } from "@/hooks/use-now";
import { useSettings, useOverrides, useBlocks } from "@/hooks/use-data";
import { getRotation, nextSchoolDayAfter, dateKey } from "@/lib/rotation";
import { resolveBlocks, getNowUpNext } from "@/lib/timetable";
import { dateToMins } from "@/lib/time";
import { LETTERS } from "@/lib/types";
import type { ResolvedBlock } from "@/lib/types";
import { NowCard } from "@/components/now-card";
import { UpNextCard } from "@/components/up-next";
import { DayPager } from "@/components/day-pager";
import { Timeline } from "@/components/timeline";
import { GlanceCard } from "@/components/glance-card";
import { EmptyState } from "@/components/empty-state";
import { NoSchoolView } from "@/components/no-school";
import { OverrideSheet } from "@/components/override-sheet";
import { LetterBadge } from "@/components/letter-badge";
import { useReminders } from "@/hooks/use-reminders";
import { useHaptics } from "@/hooks/use-haptics";
import { fullDateLabel } from "@/components/labels";
import { pressSpring } from "@/lib/animations";

function TodayHeader({
  date,
  letter,
  onOpenOverride,
}: {
  date: Date;
  letter: string | null;
  onOpenOverride: () => void;
}) {
  return (
    <header className="mb-4 flex items-center gap-3 px-1 pt-[max(env(safe-area-inset-top),20px)]">
      <div className="min-w-0">
        <h1 className="text-[28px] font-bold leading-none tracking-tight">
          Today
        </h1>
        <p className="mt-1 text-[13px] font-medium text-label-2">
          {fullDateLabel(date)}
        </p>
      </div>
      <div className="ml-auto flex items-center gap-2">
        {letter ? (
          <LetterBadge letter={letter} size="md" />
        ) : null}
        <motion.button
          whileTap={{ scale: 0.85 }}
          transition={pressSpring}
          onClick={onOpenOverride}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-fill text-label-2"
          aria-label="Set today's letter"
        >
          <HugeiconsIcon icon={MoreIcon} size={18} strokeWidth={1.8} />
        </motion.button>
      </div>
    </header>
  );
}

export function HeroBlock({
  day,
  blocks,
  leadMins,
  remindersEnabled,
}: {
  day: number;
  blocks: ResolvedBlock[];
  leadMins: number;
  remindersEnabled: boolean;
}) {
  const now = useNow(1000);
  useReminders(blocks, now, leadMins, remindersEnabled);

  const nowMins = dateToMins(now);
  const info = getNowUpNext(blocks, nowMins);
  const accent =
    info.current?.color ?? info.next?.color ?? "var(--accent)";
  const nowLabel = `${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][now.getDay()]} · ${
    now.getMonth() + 1
  }/${now.getDate()}`;

  return (
    <div className="mb-3">
      <NowCard
        info={info}
        accentColor={accent}
        dateLabel={nowLabel}
        letter={LETTERS[day]}
      />
      {info.status === "during" && info.next ? (
        <div className="mt-2">
          <UpNextCard
            next={info.next}
            secondsUntil={info.untilNextStart * 60}
            color={info.next.color}
          />
        </div>
      ) : null}
    </div>
  );
}

export default function HomePage() {
  const slowNow = useNow(30000);
  const settings = useSettings();
  const overrides = useOverrides();
  const blocks = useBlocks();
  const haptics = useHaptics();
  const [overrideOpen, setOverrideOpen] = useState(false);

  const rotation = getRotation(slowNow, settings, overrides);
  const todayDay = rotation.day;
  const todayLetter = rotation.letter;

  const byDay = useMemo(
    () =>
      LETTERS.map((letter, i) =>
        resolveBlocks(
          blocks.filter((b) => b.day === i),
          settings.periods
        )
      ),
    [blocks, settings.periods]
  );

  const todayBlocks = todayDay != null ? byDay[todayDay] : [];

  const todayKey = dateKey(slowNow);

  let nextDayBlockCount: number | undefined;
  let nextDayLetter: string | null = null;
  let nextDayLabel: string | undefined;
  if (rotation.status !== "school" && rotation.status !== "override") {
    const nd = nextSchoolDayAfter(slowNow, settings, overrides);
    if (nd) {
      nextDayLetter = nd.rotation.letter;
      nextDayLabel = fullDateLabel(nd.date);
      nextDayBlockCount = byDay[nd.rotation.day ?? 0]?.length ?? 0;
    }
  }

  const hasAnyBlocks = blocks.length > 0;

  if (!hasAnyBlocks) {
    return (
      <main className="mx-auto w-full max-w-lg">
        <EmptyState />
      </main>
    );
  }

  const isSchoolDay =
    rotation.status === "school" || rotation.status === "override";

  return (
    <main className="mx-auto w-full max-w-lg px-4">
      <TodayHeader
        date={slowNow}
        letter={todayLetter}
        onOpenOverride={() => {
          haptics("light");
          setOverrideOpen(true);
        }}
      />

      {isSchoolDay && todayDay != null ? (
        todayBlocks.length > 0 ? (
          <HeroBlock
            day={todayDay}
            blocks={todayBlocks}
            leadMins={settings.reminderLeadMins}
            remindersEnabled={settings.remindersEnabled}
          />
        ) : (
          <NoSchoolView now={slowNow} reason="no-classes" />
        )
      ) : (
        <NoSchoolView
          now={slowNow}
          reason={rotation.status === "before-start" ? "before-start" : rotation.status === "holiday" ? "holiday" : "weekend"}
          nextLabel={nextDayLabel}
          nextLetter={nextDayLetter}
          nextBlocks={nextDayBlockCount}
        />
      )}

      <GlanceCard
        blocks={todayBlocks}
        now={slowNow}
        settings={settings}
        overrides={overrides}
      />

      <section className="mt-6">
        <h2 className="mb-3 px-1 text-[13px] font-semibold uppercase tracking-wide text-label-2">
          Schedule
        </h2>
        <DayPager initialPage={todayDay ?? 0}>
          {(page) => (
            <DayPageView
              day={page}
              blocks={byDay[page]}
              nowMins={dateToMins(slowNow)}
              isToday={page === todayDay}
            />
          )}
        </DayPager>
      </section>

      <OverrideSheet
        open={overrideOpen}
        onClose={() => setOverrideOpen(false)}
        dateKey={todayKey}
        currentDay={todayDay}
        overrides={overrides}
      />
    </main>
  );
}

function DayPageView({
  day,
  blocks,
  nowMins,
  isToday,
}: {
  day: number;
  blocks: ResolvedBlock[];
  nowMins: number;
  isToday: boolean;
}) {
  if (!blocks.length) {
    return (
      <div className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-[20px] bg-system-2 px-6 text-center">
        <p className="text-[15px] font-semibold text-label-2">
          No classes for Day {LETTERS[day]}
        </p>
        <Link
          href="/settings"
          className="text-[13px] font-medium text-accent"
        >
          Add them in Settings
        </Link>
      </div>
    );
  }
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 px-1">
        <LetterBadge letter={LETTERS[day]} size="sm" />
        <span className="text-[13px] font-semibold text-label-2">
          Day {LETTERS[day]} · {blocks.length} blocks
        </span>
        {isToday ? (
          <span className="ml-auto rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent">
            today
          </span>
        ) : null}
      </div>
      <Timeline blocks={blocks} nowMins={isToday ? nowMins : -1} />
    </div>
  );
}