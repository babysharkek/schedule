import { describe, it, expect } from "vitest";
import type { Block, PeriodSlot } from "./types";
import { resolveBlocks, getNowUpNext } from "./timetable";

const periods: PeriodSlot[] = [
  { number: 1, startMins: 480, endMins: 528 },
  { number: 2, startMins: 532, endMins: 580 },
  { number: 3, startMins: 584, endMins: 632 },
  { number: 4, startMins: 636, endMins: 684 },
  { number: 5, startMins: 688, endMins: 736 },
  { number: 6, startMins: 740, endMins: 788 },
];

function makeBlock(
  id: string,
  day: number,
  orderIndex: number,
  periodNum: number
): Block {
  return {
    id,
    day,
    orderIndex,
    type: "class",
    periodNum,
    subject: `Subject ${periodNum}`,
    room: `Room ${periodNum}`,
    color: "#007AFF",
  };
}

function makeLunch(
  id: string,
  day: number,
  orderIndex: number,
  start: number,
  end: number
): Block {
  return {
    id,
    day,
    orderIndex,
    type: "lunch",
    startMins: start,
    endMins: end,
    color: "#8E8E93",
  };
}

describe("resolveBlocks", () => {
  it("resolves class blocks using period slots", () => {
    const blocks = [makeBlock("b1", 0, 0, 1), makeBlock("b2", 0, 1, 3)];
    const resolved = resolveBlocks(blocks, periods);
    expect(resolved).toHaveLength(2);
    expect(resolved[0].startMins).toBe(480);
    expect(resolved[1].startMins).toBe(584);
  });

  it("resolves lunch blocks with explicit times", () => {
    const blocks = [makeLunch("l1", 0, 2, 600, 636)];
    const resolved = resolveBlocks(blocks, periods);
    expect(resolved).toHaveLength(1);
    expect(resolved[0].startMins).toBe(600);
  });

  it("sorts by start time", () => {
    const blocks = [
      makeBlock("b2", 0, 1, 3),
      makeBlock("b1", 0, 0, 1),
      makeLunch("l1", 0, 2, 600, 636),
    ];
    const resolved = resolveBlocks(blocks, periods);
    expect(resolved.map((r) => r.startMins)).toEqual([480, 584, 600]);
  });

  it("drops blocks with missing period", () => {
    const blocks = [makeBlock("b1", 0, 0, 99)];
    const resolved = resolveBlocks(blocks, periods);
    expect(resolved).toHaveLength(0);
  });
});

describe("getNowUpNext", () => {
  const resolved = resolveBlocks(
    [
      makeBlock("b1", 0, 0, 1),
      makeLunch("l1", 0, 2, 540, 576),
      makeBlock("b2", 0, 1, 5),
    ],
    periods
  );

  it("before first class", () => {
    const result = getNowUpNext(resolved, 400);
    expect(result.status).toBe("before");
    expect(result.next?.periodNum).toBe(1);
  });

  it("during class", () => {
    const result = getNowUpNext(resolved, 500);
    expect(result.status).toBe("during");
    expect(result.current?.periodNum).toBe(1);
  });

  it("during lunch", () => {
    const result = getNowUpNext(resolved, 550);
    expect(result.status).toBe("during");
    expect(result.current?.type).toBe("lunch");
  });

  it("free period between classes", () => {
    const result = getNowUpNext(resolved, 530);
    expect(result.status).toBe("free");
  });

  it("after last class", () => {
    const result = getNowUpNext(resolved, 800);
    expect(result.status).toBe("after");
  });

  it("empty blocks", () => {
    const result = getNowUpNext([], 500);
    expect(result.status).toBe("empty");
  });
});
