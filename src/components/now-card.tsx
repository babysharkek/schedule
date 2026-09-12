"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import type { NowUpNext, ResolvedBlock } from "@/lib/types";
import { pressSpring } from "@/lib/animations";
import { minsToTimeLabelFull } from "@/lib/time";
import { getStatusLabel, statusColor } from "@/lib/timetable";
import { CountdownLabel } from "./countdown";

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function ProgressRing({
  progress,
  color,
  size = 64,
}: {
  progress: number;
  color: string;
  size?: number;
}) {
  const stroke = 5;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = useMotionValue(circ);
  const springOffset = useSpring(offset, {
    stiffness: 60,
    damping: 18,
    mass: 0.6,
  });

  useEffect(() => {
    offset.set(circ * (1 - clamp01(progress)));
  }, [progress, circ, offset]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--fill)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={springOffset}
          style={{ filter: `drop-shadow(0 0 6px ${color}88)` }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-semibold tabular-nums text-accent" />
    </div>
  );
}

function blockTitle(block: ResolvedBlock): string {
  if (block.type === "lunch") return "Lunch";
  return block.subject && block.subject !== `Period ${block.periodNum}`
    ? block.subject
    : `Period ${block.periodNum}`;
}

function blockMeta(block: ResolvedBlock): string {
  if (block.type === "lunch") return "Lunchtime";
  const parts = [];
  if (block.room) parts.push(block.room);
  if (block.teacher) parts.push(block.teacher);
  return parts.join(" · ") || `Period ${block.periodNum}`;
}

export function NowCard({
  info,
  accentColor,
  dateLabel,
  letter,
}: {
  info: NowUpNext;
  accentColor: string;
  dateLabel: string;
  letter: string;
}) {
  if (info.status === "empty") return null;

  const block = info.current ?? info.next;

  if (info.status === "after") {
    return (
      <CardShell accentColor={accentColor}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-label-2">
              {dateLabel}
            </p>
            <h2 className="mt-1 text-2xl font-bold">All done for today</h2>
            <p className="mt-1 text-sm text-label-2">
              No classes left. Enjoy the rest of your day.
            </p>
          </div>
          <DonePill />
        </div>
      </CardShell>
    );
  }

  const progress =
    info.status === "during" && info.current
      ? (info.nowMins - info.current.startMins) /
        Math.max(1, info.current.endMins - info.current.startMins)
      : info.status === "free"
        ? 1
        : 0;

  const countdownSeconds =
    info.status === "during"
      ? info.untilCurrentEnd * 60
      : info.untilNextStart * 60;

  const countdownLabel =
    info.status === "during"
      ? info.current?.type === "lunch"
        ? "until lunch is over"
        : "until class ends"
      : "until it starts";

  return (
    <CardShell
      accentColor={block ? accentColor : "var(--accent)"}
      onClick={undefined}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
              style={{
                color: statusColor(info.status),
                background: `${statusColor(info.status)}1a`,
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: statusColor(info.status) }}
              />
              {getStatusLabel(info.status)}
            </span>
            {info.status === "during" && info.current?.type === "lunch" ? null : (
              <span className="text-xs text-label-3">
                Day {letter} · {dateLabel}
              </span>
            )}
          </div>

          {block ? (
            <h2
              className="mt-2 text-[26px] font-bold leading-tight"
              style={{
                color:
                  info.status === "during" && info.current
                    ? info.current.type
                    : undefined,
              }}
            >
              {info.status === "during"
                ? blockTitle(info.current!)
                : blockTitle(info.next!)}
            </h2>
          ) : null}

          {block ? (
            <p className="mt-0.5 truncate text-sm text-label-2">
              {info.status === "during"
                ? blockMeta(info.current!)
                : `${blockMeta(info.next!)} · starts ${minsToTimeLabelFull(block.startMins)}`}
            </p>
          ) : null}
        </div>

        {(info.status === "during" || info.status === "free" || info.status === "before") && (
          <div className="flex flex-col items-end gap-1.5">
            <ProgressRing progress={progress} color={statusColor(info.status)} />
            <CountdownLabel seconds={countdownSeconds} />
            <span className="text-[10px] font-medium uppercase tracking-wide text-label-3">
              {countdownLabel}
            </span>
          </div>
        )}
      </div>
    </CardShell>
  );
}

function CardShell({
  children,
  accentColor,
  onClick,
}: {
  children: React.ReactNode;
  accentColor: string;
  onClick?: () => void;
}) {
  return (
    <motion.div
      whileTap={onClick ? { scale: 0.97 } : undefined}
      transition={pressSpring}
      onClick={onClick}
      className="glass relative overflow-hidden rounded-[28px] p-5 shadow-sm"
      style={{
        boxShadow: `0 12px 40px -18px ${accentColor}66, 0 2px 8px -4px rgba(0,0,0,0.06)`,
      }}
    >
      <div
        className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full opacity-40 blur-3xl"
        style={{ background: accentColor }}
      />
      {children}
    </motion.div>
  );
}

function DonePill() {
  return (
    <span className="inline-flex h-11 w-11 items-center justify-center rounded-full text-2xl font-bold text-good">
      <CheckGlyph />
    </span>
  );
}

function CheckGlyph() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 12.5l4.5 4.5L19 7.5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}