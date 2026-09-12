import Dexie, { type Table } from "dexie";
import type { Block, DayOverride } from "@/lib/types";
import { DEFAULT_SETTINGS } from "@/lib/defaults";
import type { AppSettings } from "@/lib/types";

class SaturnDatabase extends Dexie {
  blocks!: Table<Block, string>;
  meta!: Table<{ key: string; value: unknown }, string>;
  dayOverrides!: Table<DayOverride, string>;

  constructor() {
    super("saturn");
    this.version(1).stores({
      blocks: "id, day, orderIndex",
      meta: "key",
      dayOverrides: "date",
    });
  }
}

export const db = new SaturnDatabase();

export const blocksRepo = {
  async saveDay(
    day: number,
    blocks: Block[]
  ): Promise<void> {
    await db.transaction("rw", db.blocks, async () => {
      await db.blocks.where("day").equals(day).delete();
      await db.blocks.bulkPut(blocks);
    });
  },

  async update(block: Block): Promise<void> {
    await db.blocks.put(block);
  },

  async remove(id: string): Promise<void> {
    await db.blocks.delete(id);
  },

  async clear(): Promise<void> {
    await db.blocks.clear();
  },
};

export const metaRepo = {
  async get<T>(key: string, fallback: T): Promise<T> {
    const row = await db.meta.get(key);
    return (row?.value as T) ?? fallback;
  },

  async set(key: string, value: unknown): Promise<void> {
    await db.meta.put({ key, value });
  },
};

export const settingsRepo = {
  async get(): Promise<AppSettings> {
    return metaRepo.get<AppSettings>("settings", DEFAULT_SETTINGS);
  },

  async save(settings: AppSettings): Promise<void> {
    await metaRepo.set("settings", settings);
  },

  async update(patch: Partial<AppSettings>): Promise<AppSettings> {
    const current = await this.get();
    const next = { ...current, ...patch };
    await this.save(next);
    return next;
  },
};

export const overridesRepo = {
  async all(): Promise<DayOverride[]> {
    return db.dayOverrides.toArray();
  },

  async set(override: DayOverride): Promise<void> {
    await db.dayOverrides.put(override);
  },

  async remove(date: string): Promise<void> {
    await db.dayOverrides.delete(date);
  },

  async clear(): Promise<void> {
    await db.dayOverrides.clear();
  },
};