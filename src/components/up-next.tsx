"use client";

import type { ResolvedBlock } from "@/lib/types";
import { CountdownLabel } from "./countdown";

export function UpNextCard({
  next,
  secondsUntil,
  color,
}: {
  next: ResolvedBlock;
  secondsUntil: number;
  color: string;
}) {
  const title =
    next.type === "lunch"
      ? "Lunch"
      : next.subject && next.subject !== `Period ${next.periodNum}`
        ? next.subject
        : `Period ${next.periodNum}`;

  return (
    <div
      className="flex items-center gap-3 rounded-2xl px-4 py-3"
      style={{
        background: `linear-gradient(135deg, ${color}1f, ${color}0a)`,
        boxShadow: `inset 0 0 0 1px ${color}33`,
      }}
    >
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-label-3">
          Up next
        </p>
        <p className="truncate text-[15px] font-semibold">
          {title}
          {next.type === "class" ? (
            <span className="ml-1.5 text-xs font-medium text-label-3">
              P{next.periodNum}
            </span>
          ) : null}
        </p>
      </div>
      <div className="shrink-0 text-right" style={{ color }}>
        <CountdownLabel seconds={secondsUntil} />
        <p className="text-[10px] font-medium uppercase tracking-wide text-label-3">
          in
        </p>
      </div>
    </div>
  );
}