"use client";

import type { ResolvedBlock } from "@/lib/types";
import { minsToTimeLabel } from "@/lib/time";
import { motion } from "framer-motion";
import { cardSpring } from "@/lib/animations";

function BlockTitle(block: ResolvedBlock): string {
  if (block.type === "lunch") return "Lunch";
  if (block.subject && block.subject !== `Period ${block.periodNum}`)
    return block.subject;
  return `Period ${block.periodNum}`;
}

function BlockMeta(block: ResolvedBlock): string {
  if (block.type === "lunch") return "Lunch break";
  const parts = [];
  if (block.room) parts.push(block.room);
  if (block.teacher) parts.push(block.teacher);
  return parts.join(" · ") || "No room set";
}

export function Timeline({
  blocks,
  nowMins,
}: {
  blocks: ResolvedBlock[];
  nowMins: number;
}) {
  const current = blocks.find(
    (b) => nowMins >= b.startMins && nowMins < b.endMins
  );

  return (
    <div className="relative flex flex-col gap-2">
      <div
        className="pointer-events-none absolute bottom-2 left-[11px] top-2 w-px"
        style={{ background: "var(--separator)" }}
      />
      {blocks.map((block) => {
        const isCurrent = current?.id === block.id;
        const nextStart = current && current.id === block.id;
        void nextStart;
        return (
          <div key={block.id} className="relative flex items-stretch gap-3">
            <div className="flex w-14 shrink-0 flex-col items-start pt-3">
              <span className="text-[13px] font-semibold tabular-nums text-label-2">
                {minsToTimeLabel(block.startMins)}
              </span>
            </div>

            <div className="relative flex w-6 shrink-0 items-stretch justify-center">
              <span
                className="absolute top-3 z-10 h-2.5 w-2.5 rounded-full border-2 border-system"
                style={{
                  background: isCurrent ? block.color : "var(--bg3)",
                  borderColor: isCurrent ? block.color : "var(--separator)",
                  boxShadow: isCurrent
                    ? `0 0 0 4px ${block.color}22, 0 0 12px ${block.color}88`
                    : undefined,
                }}
              />
            </div>

            <motion.div
              layout
              transition={cardSpring}
              className={`mb-2 min-w-0 flex-1 rounded-2xl px-4 py-3 ${
                isCurrent ? "glass" : "bg-system-2"
              }`}
              style={{
                boxShadow: isCurrent
                  ? `0 0 0 1.5px ${block.color}, 0 8px 24px -14px ${block.color}B3`
                  : "none",
                transition: "box-shadow 0.2s",
              }}
            >
              <div className="flex items-center gap-2">
                {block.type === "lunch" ? (
                  <span
                    className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                    style={{ color: block.color, background: `${block.color}1a` }}
                  >
                    Lunch
                  </span>
                ) : (
                  <span
                    className="rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums"
                    style={{ color: block.color, background: `${block.color}1a` }}
                  >
                    P{block.periodNum}
                  </span>
                )}
                <span className="truncate text-[15px] font-semibold">
                  {BlockTitle(block)}
                </span>
                {block.type === "class" ? (
                  <span className="ml-auto shrink-0 text-xs text-label-3">
                    {minsToTimeLabel(block.endMins)}
                  </span>
                ) : (
                  <span className="ml-auto shrink-0 text-xs text-label-3">
                    {minsToTimeLabel(block.endMins)}
                  </span>
                )}
              </div>
              {block.type === "class" ? (
                <p className="mt-0.5 truncate text-[13px] text-label-2">
                  {BlockMeta(block)}
                </p>
              ) : (
                <p className="mt-0.5 text-[13px] text-label-2">
                  Ends at {minsToTimeLabel(block.endMins)}
                </p>
              )}
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}