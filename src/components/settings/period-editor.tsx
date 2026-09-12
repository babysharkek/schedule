"use client";

import type { AppSettings } from "@/lib/types";
import { settingsRepo } from "@/services/storage";
import { useToast } from "@/components/toast-provider";

function timeValue(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function fromTimeValue(v: string): number | null {
  if (!v) return null;
  const [h, m] = v.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

export function PeriodEditor({
  periods,
  enabled,
}: {
  periods: AppSettings["periods"];
  enabled: boolean;
}) {
  const toast = useToast();

  const update = async (index: number, field: "startMins" | "endMins", raw: string) => {
    const value = fromTimeValue(raw);
    if (value == null) return;
    const next = periods.map((p, i) =>
      i === index ? { ...p, [field]: value } : p
    );
    await settingsRepo.update({ periods: next });
    if (value <= (field === "startMins" ? periods[index].endMins : periods[index].startMins)) {
      toast("Check the time", `${field === "startMins" ? "Start" : "End"} overlaps`);
    }
  };

  return (
    <div className="ios-group">
      {periods.map((p, i) => (
        <div key={p.number} className="ios-row flex items-center">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-fill text-[13px] font-semibold tabular-nums text-label-2">
            {p.number}
          </span>
          <div className="ml-3 flex flex-1 items-center justify-end gap-3">
            <label className="flex items-center gap-1 text-label-2">
              <input
                type="time"
                value={timeValue(p.startMins)}
                disabled={!enabled}
                onChange={(e) => update(i, "startMins", e.target.value)}
                className="ion-input-inline ios-input w-[92px] px-2 py-1 tabular-nums"
                aria-label={`Period ${p.number} start`}
              />
            </label>
            <span className="text-label-3">–</span>
            <label className="flex items-center gap-1 text-label-2">
              <input
                type="time"
                value={timeValue(p.endMins)}
                disabled={!enabled}
                onChange={(e) => update(i, "endMins", e.target.value)}
                className="ion-input-inline ios-input w-[92px] px-2 py-1 tabular-nums"
                aria-label={`Period ${p.number} end`}
              />
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}