"use client";

import { useLiveQuery } from "dexie-react-hooks";
import type { Block, DayOverride } from "@/lib/types";
import { db, settingsRepo, overridesRepo } from "@/services/storage";
import { DEFAULT_SETTINGS } from "@/lib/defaults";
import type { AppSettings } from "@/lib/types";

export function useBlocks(): Block[] {
  return useLiveQuery(() => db.blocks.toArray(), [], []) ?? [];
}

export function useBlocksForDay(day: number): Block[] {
  const blocks = useBlocks();
  return blocks
    .filter((b) => b.day === day)
    .sort((a, b) => a.orderIndex - b.orderIndex);
}

export function useSettings(): AppSettings {
  return (
    useLiveQuery(() => settingsRepo.get(), [], DEFAULT_SETTINGS) ??
    DEFAULT_SETTINGS
  );
}

export function useOverrides(): DayOverride[] {
  return (
    useLiveQuery(() => overridesRepo.all(), [], []) ?? []
  );
}