import type {
  Block,
  PeriodSlot,
  ResolvedBlock,
  NowUpNext,
  DayStatus,
} from "./types";
import { CLASS_COLORS } from "./defaults";

export function resolveBlocks(
  blocks: Block[],
  periods: PeriodSlot[]
): ResolvedBlock[] {
  return blocks
    .map((b) => {
      if (b.type === "class") {
        if (b.periodNum == null) return null;
        const p = periods.find((pp) => pp.number === b.periodNum);
        if (!p) return null;
        return {
          ...b,
          color: b.color ?? CLASS_COLORS[(b.periodNum - 1) % CLASS_COLORS.length],
          startMins: p.startMins,
          endMins: p.endMins,
        } satisfies ResolvedBlock;
      }
      if (b.startMins == null || b.endMins == null) return null;
      return {
        ...b,
        color: b.color ?? "#8E8E93",
        startMins: b.startMins,
        endMins: b.endMins,
      } satisfies ResolvedBlock;
    })
    .filter((b): b is ResolvedBlock => b !== null)
    .sort((a, b) => a.startMins - b.startMins || a.orderIndex - b.orderIndex);
}

export function getNowUpNext(
  blocks: ResolvedBlock[],
  nowMins: number
): NowUpNext {
  if (!blocks.length) {
    return {
      status: "empty",
      nowMins,
      untilCurrentEnd: 0,
      untilNextStart: 0,
    };
  }

  const current = blocks.find(
    (b) => nowMins >= b.startMins && nowMins < b.endMins
  );

  if (current) {
    const next = blocks.find((b) => b.startMins >= current.endMins);
    return {
      status: "during",
      current,
      next,
      nowMins,
      untilCurrentEnd: current.endMins - nowMins,
      untilNextStart: next ? next.startMins - nowMins : 0,
    };
  }

  if (nowMins < blocks[0].startMins) {
    return {
      status: "before",
      next: blocks[0],
      nowMins,
      untilCurrentEnd: 0,
      untilNextStart: blocks[0].startMins - nowMins,
    };
  }

  const last = blocks[blocks.length - 1];
  if (nowMins >= last.endMins) {
    return {
      status: "after",
      nowMins,
      untilCurrentEnd: 0,
      untilNextStart: 0,
    };
  }

  const next = blocks.find((b) => b.startMins > nowMins);
  return {
    status: "free",
    next,
    nowMins,
    untilCurrentEnd: 0,
    untilNextStart: next ? next.startMins - nowMins : 0,
  };
}

export function getStatusLabel(status: DayStatus): string {
  switch (status) {
    case "during":
      return "In Progress";
    case "free":
      return "Break";
    case "before":
      return "Coming Up";
    case "after":
      return "Finished";
    case "empty":
      return "No Classes";
  }
}

export function statusColor(status: DayStatus): string {
  switch (status) {
    case "during":
      return "#34C759";
    case "free":
      return "#FF9500";
    case "before":
      return "#007AFF";
    case "after":
      return "#8E8E93";
    case "empty":
      return "#C7C7CC";
  }
}
