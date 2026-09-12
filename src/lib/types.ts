export const LETTERS = ["A", "B", "C", "D"] as const;
export type Letter = (typeof LETTERS)[number];
export type LetterIndex = number;
export const MAX_PERIODS = 8;

export interface PeriodSlot {
  number: number;
  startMins: number;
  endMins: number;
}

export interface Block {
  id: string;
  day: LetterIndex;
  orderIndex: number;
  type: "class" | "lunch";
  periodNum?: number;
  subject?: string;
  room?: string;
  teacher?: string;
  color?: string;
  startMins?: number;
  endMins?: number;
}

export interface ResolvedBlock {
  id: string;
  day: LetterIndex;
  orderIndex: number;
  type: "class" | "lunch";
  periodNum?: number;
  subject?: string;
  room?: string;
  teacher?: string;
  color: string;
  startMins: number;
  endMins: number;
}

export interface DayOverride {
  date: string;
  day: LetterIndex;
  reason?: string;
}

export type ThemeMode = "system" | "light" | "dark";

export interface AppSettings {
  rotationStartDate: string;
  holidays: string[];
  periods: PeriodSlot[];
  theme: ThemeMode;
  reminderLeadMins: number;
  remindersEnabled: boolean;
  fontScale: number;
}

export interface ExportFile {
  app: "saturn";
  version: 1;
  exportedAt: string;
  settings: AppSettings;
  blocks: Block[];
  dayOverrides: DayOverride[];
}

export type RotationStatus =
  | "school"
  | "override"
  | "weekend"
  | "holiday"
  | "before-start";

export interface RotationResult {
  day: LetterIndex | null;
  offset: number | null;
  letter: Letter | null;
  overridden: boolean;
  status: RotationStatus;
}

export type DayStatus =
  | "during"
  | "free"
  | "before"
  | "after"
  | "empty";

export interface NowUpNext {
  status: DayStatus;
  current?: ResolvedBlock;
  next?: ResolvedBlock;
  nowMins: number;
  untilCurrentEnd: number;
  untilNextStart: number;
}
