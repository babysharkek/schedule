import { describe, it, expect } from "vitest";
import type { AppSettings } from "./types";
import {
  buildExport,
  validateImport,
} from "./export";

const testSettings: AppSettings = {
  rotationStartDate: "2026-09-01",
  holidays: [],
  periods: [],
  theme: "system",
  reminderLeadMins: 5,
  remindersEnabled: false,
  fontScale: 1,
};

describe("buildExport / validateImport", () => {
  it("round-trips export and import", () => {
    const exported = buildExport(testSettings, [], []);
    const result = validateImport(exported);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.settings.rotationStartDate).toBe("2026-09-01");
    }
  });

  it("rejects invalid data", () => {
    const result = validateImport({ not: "saturn" });
    expect(result.ok).toBe(false);
  });

  it("rejects missing fields", () => {
    const result = validateImport({
      app: "saturn",
      version: 1,
      blocks: [],
      dayOverrides: [],
      settings: { notValid: true },
    });
    expect(result.ok).toBe(false);
  });
});
