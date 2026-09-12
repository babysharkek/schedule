import { describe, it, expect } from "vitest";
import {
  pad2,
  minsToTimeLabel,
  minsToTimeLabelFull,
  secsToCountdown,
  formatDuration,
  formatUntil,
} from "./time";

describe("pad2", () => {
  it("pads single digits", () => {
    expect(pad2(0)).toBe("00");
    expect(pad2(5)).toBe("05");
    expect(pad2(12)).toBe("12");
  });
});

describe("minsToTimeLabel", () => {
  it("formats midnight", () => expect(minsToTimeLabel(0)).toBe("00:00"));
  it("formats 8:00 AM", () => expect(minsToTimeLabel(480)).toBe("08:00"));
  it("formats 1:30 PM", () => expect(minsToTimeLabel(810)).toBe("13:30"));
});

describe("minsToTimeLabelFull", () => {
  it("formats 8:00 AM", () => expect(minsToTimeLabelFull(480)).toBe("8 AM"));
  it("formats 8:15 AM", () =>
    expect(minsToTimeLabelFull(495)).toBe("8:15 AM"));
  it("formats 12:00 PM", () => expect(minsToTimeLabelFull(720)).toBe("12 PM"));
  it("formats 1:00 PM", () => expect(minsToTimeLabelFull(780)).toBe("1 PM"));
});

describe("secsToCountdown", () => {
  it("formats 0", () => {
    const r = secsToCountdown(0);
    expect(r.hours).toBe("00");
    expect(r.minutes).toBe("00");
    expect(r.seconds).toBe("00");
    expect(r.negative).toBe(false);
  });
  it("formats 1h 23m 45s", () => {
    const r = secsToCountdown(5025);
    expect(r.hours).toBe("01");
    expect(r.minutes).toBe("23");
    expect(r.seconds).toBe("45");
  });
  it("handles negative", () => {
    expect(secsToCountdown(-60).negative).toBe(true);
  });
});

describe("formatDuration", () => {
  it("formats short", () => expect(formatDuration(90)).toBe("01:30"));
  it("formats long", () => expect(formatDuration(3661)).toBe("1:01:01"));
});

describe("formatUntil", () => {
  it("less than 1 min", () => expect(formatUntil(0.5)).toBe("now"));
  it("5 min", () => expect(formatUntil(5)).toBe("in 5 min"));
  it("hours", () => expect(formatUntil(125)).toBe("in 2h 5m"));
});
