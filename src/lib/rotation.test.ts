import { describe, it, expect } from "vitest";
import {
  dateKey,
  parseDateKey,
  isWeekend,
  getRotation,
  nextSchoolDayAfter,
  datesInMonth,
} from "./rotation";

describe("dateKey / parseDateKey", () => {
  it("round-trips", () => {
    const d = new Date(2026, 8, 12);
    expect(dateKey(d)).toBe("2026-09-12");
    expect(dateKey(parseDateKey("2026-09-12"))).toBe("2026-09-12");
  });
});

describe("isWeekend", () => {
  it("Sat=5, Sun=0", () => {
    expect(isWeekend(new Date(2026, 8, 13))).toBe(true); // Sun
    expect(isWeekend(new Date(2026, 8, 12))).toBe(true); // Sat
    expect(isWeekend(new Date(2026, 8, 14))).toBe(false); // Mon
  });
});

describe("getRotation", () => {
  const ctx = {
    rotationStartDate: "2026-09-01",
    holidays: ["2026-09-07"],
  };

  it("returns before-start for dates before rotation start", () => {
    const r = getRotation(new Date(2026, 7, 30), ctx, []);
    expect(r.status).toBe("before-start");
  });

  it("returns weekend for Saturdays", () => {
    const r = getRotation(new Date(2026, 8, 5), ctx, []);
    expect(r.status).toBe("weekend");
  });

  it("returns holiday for configured holidays", () => {
    const r = getRotation(new Date(2026, 8, 7), ctx, []);
    expect(r.status).toBe("holiday");
  });

  it("returns A for first school day (Sep 1 2026 = Tue)", () => {
    const r = getRotation(new Date(2026, 8, 1), ctx, []);
    expect(r.letter).toBe("A");
    expect(r.day).toBe(0);
    expect(r.status).toBe("school");
  });

  it("skips holiday and continues rotation", () => {
    // Sep 1=A, Sep 2=B, Sep 3=C, Sep 4=D, Sep 5=weekend, Sep 6=weekend, Sep 7=holiday,
    // Sep 8=A (school day 4 -> 4%4=0)
    const r = getRotation(new Date(2026, 8, 8), ctx, []);
    expect(r.letter).toBe("A");
    expect(r.day).toBe(0);
  });

  it("applies override", () => {
    const overrides = [{ date: "2026-09-01", day: 2 }];
    const r = getRotation(new Date(2026, 8, 1), ctx, overrides);
    expect(r.letter).toBe("C");
    expect(r.overridden).toBe(true);
    expect(r.status).toBe("override");
  });
});

describe("nextSchoolDayAfter", () => {
  const ctx = { rotationStartDate: "2026-09-01", holidays: [] };
  it("finds next Monday after Friday", () => {
    const result = nextSchoolDayAfter(new Date(2026, 8, 11), ctx, []);
    expect(result).not.toBeNull();
    expect(dateKey(result!.date)).toBe("2026-09-14");
  });
});

describe("datesInMonth", () => {
  it("returns correct count", () => {
    const dates = datesInMonth(2026, 1);
    expect(dates.length).toBe(28);
    expect(dateKey(dates[0])).toBe("2026-02-01");
  });
});
