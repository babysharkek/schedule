import type { Block, DayOverride, AppSettings, ExportFile } from "./types";

export function buildExport(
  settings: AppSettings,
  blocks: Block[],
  dayOverrides: DayOverride[]
): ExportFile {
  return {
    app: "saturn",
    version: 1,
    exportedAt: new Date().toISOString(),
    settings,
    blocks,
    dayOverrides,
  };
}

function isExportFile(v: unknown): v is ExportFile {
  if (typeof v !== "object" || v === null) return false;
  const obj = v as Record<string, unknown>;
  return (
    obj.app === "saturn" &&
    obj.version === 1 &&
    Array.isArray(obj.blocks) &&
    Array.isArray(obj.dayOverrides) &&
    typeof obj.settings === "object"
  );
}

export function validateImport(
  json: unknown
): { ok: true; data: ExportFile } | { ok: false; error: string } {
  if (!isExportFile(json)) {
    return {
      ok: false,
      error: "Invalid file format. Expected a Saturn schedule export.",
    };
  }
  const s = json.settings;
  if (!Array.isArray(s.periods) || !Array.isArray(s.holidays)) {
    return { ok: false, error: "Invalid settings in export file." };
  }
  return { ok: true, data: json };
}

export function downloadJson(data: unknown, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function readJsonFile(file: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(JSON.parse(reader.result as string));
      } catch {
        reject(new Error("Invalid JSON file."));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsText(file);
  });
}
