import type { PeriodSlot, AppSettings, Block } from "./types";

export const DEFAULT_PERIODS: PeriodSlot[] = [
  { number: 1, startMins: 480, endMins: 528 },
  { number: 2, startMins: 532, endMins: 580 },
  { number: 3, startMins: 584, endMins: 632 },
  { number: 4, startMins: 636, endMins: 684 },
  { number: 5, startMins: 688, endMins: 736 },
  { number: 6, startMins: 740, endMins: 788 },
  { number: 7, startMins: 792, endMins: 840 },
  { number: 8, startMins: 844, endMins: 892 },
];

export const DEFAULT_SETTINGS: AppSettings = {
  rotationStartDate: "",
  holidays: [],
  periods: DEFAULT_PERIODS,
  theme: "system",
  reminderLeadMins: 5,
  remindersEnabled: false,
  fontScale: 1,
};

export const CLASS_COLORS = [
  "#5856D6",
  "#007AFF",
  "#34C759",
  "#FF9500",
  "#FF2D55",
  "#AF52DE",
  "#FFCC00",
  "#FF3B30",
];

export const PERIOD_COLOR_DEFAULTS = [
  "#5856D6",
  "#007AFF",
  "#34C759",
  "#FF9500",
  "#FF2D55",
  "#AF52DE",
  "#FFCC00",
  "#FF3B30",
];

let counter = 0;

export function generateId(): string {
  counter++;
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${ts}-${rand}-${counter}`;
}

export function createClassBlock(
  day: number,
  orderIndex: number,
  periodNum: number
): Block {
  return {
    id: generateId(),
    day,
    orderIndex,
    type: "class",
    periodNum,
    subject: `Period ${periodNum}`,
    room: "",
    teacher: "",
    color: PERIOD_COLOR_DEFAULTS[(periodNum - 1) % PERIOD_COLOR_DEFAULTS.length],
  };
}

export function createLunchBlock(
  day: number,
  orderIndex: number,
  startMins: number = 736,
  endMins: number = 788
): Block {
  return {
    id: generateId(),
    day,
    orderIndex,
    type: "lunch",
    startMins,
    endMins,
    color: "#8E8E93",
  };
}
