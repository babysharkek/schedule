"use client";

import { useRef } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Download01Icon, FileExportIcon } from "@hugeicons/core-free-icons";
import { useBlocks, useSettings, useOverrides } from "@/hooks/use-data";
import { buildExport, validateImport, readJsonFile } from "@/lib/export";
import { dateKey } from "@/lib/rotation";
import { blocksRepo, overridesRepo, settingsRepo } from "@/services/storage";
import { useToast } from "@/components/toast-provider";

export function BackupSection() {
  const settings = useSettings();
  const blocks = useBlocks();
  const overrides = useOverrides();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const exportBackup = () => {
    const data = buildExport(settings, blocks, overrides);
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `saturn-backup-${dateKey(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Backup exported", "Saved as a JSON file");
  };

  const importBackup = async (file: File) => {
    try {
      const json = await readJsonFile(file);
      const result = validateImport(json);
      if (!result.ok) {
        toast("Import failed", result.error);
        return;
      }
const { settings: s, blocks: b, dayOverrides: o } = result.data;
      await settingsRepo.save(s);
      await blocksRepo.clear();
      let i = 0;
      for (const block of b)
        await blocksRepo.update({ ...block, orderIndex: i++ });
      await overridesRepo.clear();
      for (const ov of o) await overridesRepo.set(ov);
      toast("Backup restored", "Schedule imported");
    } catch {
      toast("Import failed", "Could not read that file");
    }
  };

  return (
    <div>
      <div className="ios-group">
        <button onClick={exportBackup} className="ios-row flex w-full items-center">
          <HugeiconsIcon icon={Download01Icon} size={18} strokeWidth={1.8} />
          <span className="ml-3 text-[15px]">Export backup (JSON)</span>
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="ios-row flex w-full items-center"
        >
          <HugeiconsIcon icon={FileExportIcon} size={18} strokeWidth={1.8} />
          <span className="ml-3 text-[15px]">Import backup</span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void importBackup(f);
            e.target.value = "";
          }}
        />
      </div>
      <p className="mt-2 px-1 text-[12px] text-label-3">
        Everything stays on this device in IndexedDB. Export a JSON file anytime
        to move it or back it up.
      </p>
    </div>
  );
}