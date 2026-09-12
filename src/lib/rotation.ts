import { LETTERS } from "./types";
import type { LetterIndex, RotationResult } from "./types";

export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function isWeekend(d: Date): boolean {
  const day = d.getDay();
  return day === 0 || day === 6;
}

export function isHoliday(d: Date, holidays: string[]): boolean {
  return holidays.includes(dateKey(d));
}

export function isSchoolDay(d: Date, holidays: string[]): boolean {
  return !isWeekend(d) && !isHoliday(d, holidays);
}

export function getDayOfWeek(d: Date): string {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
}

function countSchoolDaysUpTo(
  start: Date,
  target: Date,
  holidays: string[]
): number {
  let count = 0;
  const d = new Date(start);
  while (d < target) {
    if (isSchoolDay(d, holidays)) count++;
    d.setDate(d.getDate() + 1);
  }
  return count;
}

export function getRotation(
  date: Date,
  ctx: { rotationStartDate: string; holidays: string[] },
  overrides: Array<{ date: string; day: number }> = []
): RotationResult {
  const override = overrides.find((o) => o.date === dateKey(date));
  if (override) {
    return {
      day: override.day,
      offset: null,
      letter: LETTERS[override.day],
      overridden: true,
      status: "override",
    };
  }

  if (!ctx.rotationStartDate) {
    return {
      day: null,
      offset: null,
      letter: null,
      overridden: false,
      status: "before-start",
    };
  }

  const start = parseDateKey(ctx.rotationStartDate);
  const key = dateKey(date);
  const keyStr = key;

  if (keyStr < ctx.rotationStartDate) {
    return {
      day: null,
      offset: null,
      letter: null,
      overridden: false,
      status: "before-start",
    };
  }

  if (isWeekend(date)) {
    return {
      day: null,
      offset: null,
      letter: null,
      overridden: false,
      status: "weekend",
    };
  }

  if (isHoliday(date, ctx.holidays)) {
    return {
      day: null,
      offset: null,
      letter: null,
      overridden: false,
      status: "holiday",
    };
  }

  const offset = countSchoolDaysUpTo(start, date, ctx.holidays);
  const dayIdx = offset % LETTERS.length;

  return {
    day: dayIdx,
    offset,
    letter: LETTERS[dayIdx],
    overridden: false,
    status: "school",
  };
}

export function advanceDay(letterIdx: LetterIndex): LetterIndex {
  return (letterIdx + 1) % LETTERS.length;
}

export function getLetterLabel(letterIdx: LetterIndex): string {
  return LETTERS[letterIdx];
}

export function nextSchoolDayAfter(
  date: Date,
  ctx: { rotationStartDate: string; holidays: string[] },
  overrides: Array<{ date: string; day: number }>
): { date: Date; rotation: RotationResult } | null {
  const d = new Date(date);
  for (let i = 1; i <= 60; i++) {
    d.setDate(d.getDate() + 1);
    const r = getRotation(d, ctx, overrides);
    if (r.status === "school" || r.status === "override") {
      return { date: new Date(d), rotation: r };
    }
  }
  return null;
}

export function datesInMonth(year: number, month: number): Date[] {
  const dates: Date[] = [];
  const d = new Date(year, month, 1);
  while (d.getMonth() === month) {
    dates.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return dates;
}
