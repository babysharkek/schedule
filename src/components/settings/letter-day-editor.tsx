"use client";

import { useState } from "react";
import { Reorder, motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  GripIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon,
} from "@hugeicons/core-free-icons";
import type { Block } from "@/lib/types";
import { blocksRepo } from "@/services/storage";
import {
  createClassBlock,
  createLunchBlock,
  CLASS_COLORS,
} from "@/lib/defaults";
import { pressSpring } from "@/lib/animations";
import { useToast } from "@/components/toast-provider";

const MAX_PERIODS = 8;

function titleFor(block: Block): string {
  if (block.type === "lunch") return "Lunch";
  if (block.subject && block.subject !== `Period ${block.periodNum}`)
    return block.subject;
  return `Period ${block.periodNum}`;
}

function metaFor(block: Block): string {
  if (block.type === "lunch") return "Lunch break";
  const parts = [];
  if (block.room) parts.push(block.room);
  if (block.teacher) parts.push(block.teacher);
  return parts.join(" · ") || "No room set";
}

function sortBlocks(bs: Block[]): Block[] {
  return [...bs].sort((a, b) => a.orderIndex - b.orderIndex);
}

export function LetterDayEditor({ day, blocks }: { day: number; blocks: Block[] }) {
  const toast = useToast();
  const items = sortBlocks(blocks);

  const persist = async (next: Block[]) => {
    const ordered = next.map((b, i) => ({ ...b, orderIndex: i }));
    await blocksRepo.saveDay(day, ordered);
  };

  const usedPeriods = new Set(items.filter((b) => b.type === "class").map((b) => b.periodNum));
  const availablePeriods = Array.from(
    { length: MAX_PERIODS },
    (_, i) => i + 1
  ).filter((n) => !usedPeriods.has(n));

  const addClass = async (periodNum: number) => {
    await persist([...items, createClassBlock(day, items.length, periodNum)]);
    toast("Added", `Period ${periodNum} is on the schedule`);
  };

  const addLunch = async () => {
    const existing = items.find((b) => b.type === "lunch");
    if (existing) {
      toast("Already added", "Lunch is on this schedule");
      return;
    }
    await persist([...items, createLunchBlock(day, items.length)]);
    toast("Added", "Lunch is on the schedule");
  };

  const remove = async (id: string) => {
    await persist(items.filter((b) => b.id !== id));
  };

  const update = async (id: string, patch: Partial<Block>) => {
    await persist(items.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  };

  return (
    <div>
      {items.length ? (
        <Reorder.Group
          axis="y"
          values={items}
          onReorder={(next) => void persist(next)}
          className="flex flex-col gap-1.5"
        >
          {items.map((block) => {
            const isLunch = block.type === "lunch";
            return (
              <Reorder.Item
                key={block.id}
                value={block}
                whileDrag={{ scale: 1.02, zIndex: 5 }}
                className="rounded-2xl"
              >
                <BlockRow
                  block={block}
                  isLunch={isLunch}
                  onRemove={() => remove(block.id)}
                  onUpdate={(patch) => update(block.id, patch)}
                />
              </Reorder.Item>
            );
          })}
        </Reorder.Group>
      ) : (
        <p className="rounded-2xl bg-system-2 px-4 py-6 text-center text-[14px] text-label-2">
          No classes scheduled for Day {["A", "B", "C", "D"][day]}.
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {availablePeriods.map((n) => (
          <motion.button
            key={n}
            whileTap={{ scale: 0.88 }}
            transition={pressSpring}
            onClick={() => void addClass(n)}
            className="flex h-9 items-center justify-center gap-1 rounded-full bg-accent/10 px-4 text-[13px] font-semibold text-accent"
          >
            <HugeiconsIcon icon={PlusIcon} size={14} strokeWidth={2} />
            P{n}
          </motion.button>
        ))}
        <motion.button
          whileTap={{ scale: 0.88 }}
          transition={pressSpring}
          onClick={() => void addLunch()}
          className="flex h-9 items-center justify-center gap-1 rounded-full bg-system-3 px-4 text-[13px] font-semibold text-label"
        >
          <HugeiconsIcon icon={PlusIcon} size={14} strokeWidth={2} />
          Lunch
        </motion.button>
      </div>

      {availablePeriods.length ? (
        <p className="mt-2 text-[12px] text-label-3">
          Dropped this day:{" "}
          {availablePeriods.join(", ") || "none"} — hidden from the timeline.
        </p>
      ) : null}
    </div>
  );
}

function BlockRow({
  block,
  isLunch,
  onRemove,
  onUpdate,
}: {
  block: Block;
  isLunch: boolean;
  onRemove: () => void;
  onUpdate: (patch: Partial<Block>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const color = block.color ?? (isLunch ? "#8E8E93" : "#007AFF");

  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{ background: "var(--bg2)" }}
    >
      <div className="flex items-center gap-1.5 p-2">
        <span className="flex h-8 w-6 shrink-0 cursor-grab items-center justify-center text-label-3">
          <HugeiconsIcon icon={GripIcon} size={16} strokeWidth={1.5} />
        </span>

        <button
          onClick={() => setEditing((e) => !e)}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-xl px-1 text-left"
        >
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[12px] font-bold text-white"
            style={{ background: color }}
          >
            {isLunch ? "\u2615" : `P${block.periodNum}`}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[15px] font-medium">
              {titleFor(block)}
            </span>
            <span className="block truncate text-[12px] text-label-2">
              {metaFor(block)}
            </span>
          </span>
          <span className="ml-auto shrink-0 rounded-full bg-fill px-2 py-0.5 text-[11px] font-medium text-label-2">
            {isLunch ? "\u2615" : "edit"}
          </span>
        </button>

        <button
          onClick={onRemove}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-bad/70"
          aria-label="Delete"
        >
          <HugeiconsIcon icon={TrashIcon} size={16} strokeWidth={1.8} />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {editing ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={pressSpring}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-2 px-4 pb-3 pl-10">
              {isLunch ? (
                <LunchTimes block={block} onUpdate={onUpdate} />
              ) : (
                <>
                  <input
                    className="ios-input"
                    value={block.subject ?? ""}
                    placeholder="Subject"
                    onChange={(e) => onUpdate({ subject: e.target.value })}
                    aria-label="Subject"
                  />
                  <div className="flex gap-2">
                    <input
                      className="ios-input flex-1"
                      value={block.room ?? ""}
                      placeholder="Room"
                      onChange={(e) => onUpdate({ room: e.target.value })}
                      aria-label="Room"
                    />
                    <input
                      className="ios-input flex-1"
                      value={block.teacher ?? ""}
                      placeholder="Teacher"
                      onChange={(e) => onUpdate({ teacher: e.target.value })}
                      aria-label="Teacher"
                    />
                  </div>
                </>
              )}

              <div className="flex flex-wrap gap-2">
                {CLASS_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => onUpdate({ color: c })}
                    className="flex h-8 w-8 items-center justify-center rounded-full"
                    style={{
                      background: c,
                      outline:
                        color === c ? "2px solid var(--label)" : "none",
                      outlineOffset: 2,
                    }}
                    aria-label={`Color ${c}`}
                  >
                    {color === c ? (
                      <HugeiconsIcon
                        icon={CheckIcon}
                        size={14}
                        strokeWidth={3}
                      />
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function LunchTimes({
  block,
  onUpdate,
}: {
  block: Block;
  onUpdate: (patch: Partial<Block>) => void;
}) {
  const timeValue = (mins: number | undefined) => {
    const m = mins ?? 0;
    return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(
      m % 60
    ).padStart(2, "0")}`;
  };
  const fromTime = (v: string): number | null => {
    const [h, m] = v.split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    return h * 60 + m;
  };

  return (
    <div className="flex items-center gap-2">
      <label className="flex items-center gap-2">
        <span className="text-[13px] text-label-2">Start</span>
        <input
          type="time"
          value={timeValue(block.startMins)}
          onChange={(e) => {
            const v = fromTime(e.target.value);
            if (v != null) onUpdate({ startMins: v });
          }}
          className="ios-input w-[96px] tabular-nums"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="text-[13px] text-label-2">End</span>
        <input
          type="time"
          value={timeValue(block.endMins)}
          onChange={(e) => {
            const v = fromTime(e.target.value);
            if (v != null) onUpdate({ endMins: v });
          }}
          className="ios-input w-[96px] tabular-nums"
        />
      </label>
    </div>
  );
}