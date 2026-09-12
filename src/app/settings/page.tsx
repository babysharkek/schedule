"use client";

import { useMemo, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PlusIcon,
  TrashIcon,
  ChevronDownIcon,
} from "@hugeicons/core-free-icons";
import { ScreenHeader, PageSectionTitle } from "@/components/header";
import { LetterBadge } from "@/components/letter-badge";
import { PeriodEditor } from "@/components/settings/period-editor";
import { LetterDayEditor } from "@/components/settings/letter-day-editor";
import { OverrideManager } from "@/components/settings/override-manager";
import { BackupSection } from "@/components/settings/backup";
import { IosRow } from "@/components/settings/row";
import { useSettings, useBlocks, useOverrides } from "@/hooks/use-data";
import { settingsRepo } from "@/services/storage";
import { LETTERS } from "@/lib/types";
import type { ThemeMode } from "@/lib/types";
import { pressSpring } from "@/lib/animations";
import { useHaptics } from "@/hooks/use-haptics";
import { useToast } from "@/components/toast-provider";
import {
  getNotificationPermission,
  requestNotificationPermission,
} from "@/services/notifications";

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "system", label: "Auto" },
  { value: "dark", label: "Dark" },
];

const SCALES = [
  { value: 1, label: "100%" },
  { value: 1.15, label: "115%" },
  { value: 1.3, label: "130%" },
];

const LEAD_OPTIONS = [
  { value: 0, label: "On time" },
  { value: 5, label: "5 min" },
  { value: 10, label: "10 min" },
  { value: 15, label: "15 min" },
  { value: 20, label: "20 min" },
];

function Segmented<T extends string | number>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex rounded-[28px] bg-fill p-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={String(o.value)}
            onClick={() => onChange(o.value)}
            className="relative flex-1 rounded-[24px] px-2 py-2"
          >
            {active ? (
              <motion.span
                layoutId={`seg-${String(o.value)}`}
                className="absolute inset-0 rounded-[24px] bg-white shadow-sm"
                style={{ boxShadow: "0 2px 10px -4px rgba(0,0,0,0.15)" }}
                transition={pressSpring}
              />
            ) : null}
            <span
              className={`relative text-[13px] font-semibold ${
                active ? "text-label" : "text-label-2"
              }`}
            >
              {o.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function SettingsPage() {
  const settings = useSettings();
  const blocks = useBlocks();
  const overrides = useOverrides();
  const haptics = useHaptics();
  const toast = useToast();

  const blocksByDay = useMemo(
    () => LETTERS.map((_, i) => blocks.filter((b) => b.day === i)),
    [blocks]
  );

  const [expanded, setExpanded] = useState<number | null>(0);
  const [perm, setPerm] = useState<NotificationPermission | "unsupported">(
    () => getNotificationPermission()
  );
  const [holidayInput, setHolidayInput] = useState("");

  useEffect(() => {
    const id =
      typeof window !== "undefined"
        ? requestAnimationFrame(() => setPerm(getNotificationPermission()))
        : 0;
    return () => {
      if (id) cancelAnimationFrame(id);
    };
  }, []);

  const setTheme = async (theme: ThemeMode) => {
    haptics("light");
    await settingsRepo.update({ theme });
  };

  const setScale = async (fontScale: number) => {
    haptics("light");
    await settingsRepo.update({ fontScale });
  };

  const setLead = async (reminderLeadMins: number) => {
    await settingsRepo.update({ reminderLeadMins });
  };

  const toggleReminders = async (enabled: boolean) => {
    haptics("light");
    if (enabled) {
      const p = await requestNotificationPermission();
      setPerm(p);
      if (p !== "granted") {
        if (p === "unsupported") {
          toast("Not supported", "This device/browser can't send notifications");
        } else {
          toast("Permission needed", "Allow notifications in system settings");
        }
        return;
      }
    }
    await settingsRepo.update({ remindersEnabled: enabled });
  };

  const addHoliday = async () => {
    if (!holidayInput) return;
    const next = [...settings.holidays, holidayInput].sort();
    await settingsRepo.update({ holidays: next });
    haptics("light");
    setHolidayInput("");
  };

  const removeHoliday = async (d: string) => {
    haptics("light");
    await settingsRepo.update({
      holidays: settings.holidays.filter((h) => h !== d),
    });
  };

  const saveStart = async (v: string) => {
    await settingsRepo.update({ rotationStartDate: v });
  };

  return (
    <main className="mx-auto w-full max-w-lg px-4 pb-safe-tab">
      <ScreenHeader title="Settings" />

      {/* Appearance */}
      <PageSectionTitle>Appearance</PageSectionTitle>
      <div className="ios-group px-3 py-3">
        <p className="px-1 pb-2.5 text-[15px]">Theme</p>
        <div className="px-1">
          <Segmented
            value={settings.theme}
            onChange={(v) => void setTheme(v)}
            options={THEME_OPTIONS}
          />
        </div>
        <p className="px-1 pb-2.5 pt-5 text-[15px]">Text size</p>
        <div className="px-1">
          <Segmented
            value={settings.fontScale}
            onChange={(v) => void setScale(v)}
            options={SCALES}
          />
        </div>
      </div>

      {/* Rotation */}
      <PageSectionTitle>Rotation</PageSectionTitle>
      <div className="ios-group">
        <div className="ios-row">
          <span className="text-[15px]">First letter day</span>
        </div>
        <div className="ios-row">
          <input
            type="date"
            value={settings.rotationStartDate}
            onChange={(e) => void saveStart(e.target.value)}
            className="ios-input w-full"
            aria-label="First letter day"
          />
        </div>
        <div className="ios-row flex items-center gap-2">
          <input
            type="date"
            value={holidayInput}
            onChange={(e) => setHolidayInput(e.target.value)}
            className="ios-input flex-1"
            aria-label="Add holiday"
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            transition={pressSpring}
            onClick={() => void addHoliday()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-white"
            aria-label="Add holiday"
          >
            <HugeiconsIcon icon={PlusIcon} size={16} strokeWidth={2.5} />
          </motion.button>
        </div>
        {settings.holidays.length ? (
          <div className="flex flex-wrap gap-2 px-4 pb-3">
            {settings.holidays.map((h) => (
              <span
                key={h}
                className="flex items-center gap-1.5 rounded-full bg-fill px-3 py-1.5 text-[13px] font-medium"
              >
                {h}
                <button
                  onClick={() => void removeHoliday(h)}
                  className="text-bad/80"
                  aria-label={`Remove ${h}`}
                >
                  <HugeiconsIcon icon={TrashIcon} size={13} strokeWidth={2} />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="px-4 pb-3 text-[13px] text-label-3">
            School closes on these dates — the rotation skips them.
          </p>
        )}
      </div>

      {/* Letter days */}
      <PageSectionTitle>Day schedules</PageSectionTitle>
      <div className="ios-group">
        {LETTERS.map((letter, i) => (
          <div key={letter}>
            {i > 0 ? <div className="mx-4 h-px bg-sep" /> : null}
            <button
              onClick={() => {
                haptics("light");
                setExpanded((e) => (e === i ? null : i));
              }}
              className="ios-row flex w-full items-center"
            >
              <LetterBadge letter={letter as "A"} size="sm" />
              <span className="ml-3 text-[15px] font-semibold">
                Day {letter}
              </span>
              <span className="ml-auto text-[13px] text-label-3">
                {blocksByDay[i].length} block{blocksByDay[i].length === 1 ? "" : "s"}
              </span>
              <motion.span
                animate={{ rotate: expanded === i ? 180 : 0 }}
                className="ml-1.5 text-label-3"
              >
                <HugeiconsIcon icon={ChevronDownIcon} size={16} strokeWidth={2.2} />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {expanded === i ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={pressSpring}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-4 pt-1">
                    <LetterDayEditor day={i} blocks={blocksByDay[i]} />
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Period times */}
      <PageSectionTitle>Period times</PageSectionTitle>
      <div className="ios-group">
        <PeriodEditor periods={settings.periods} enabled={true} />
      </div>
      <p className="mt-2 px-1 text-[12px] text-label-3">
        Times fill in automatically for classes. Set each period once here.
      </p>

      {/* Irregular days */}
      <PageSectionTitle>Irregular days</PageSectionTitle>
      <OverrideManager overrides={overrides} />
      <p className="mt-2 px-1 text-[12px] text-label-3">
        A swapped or one-off calendar day (e.g. Thursday runs the C plan).
      </p>

      {/* Reminders */}
      <PageSectionTitle>Reminders</PageSectionTitle>
      <div className="ios-group">
        <div className="ios-row flex items-center">
          <span className="text-[15px]">Before a block starts</span>
        </div>
        <div className="mt-1 px-4 pb-3">
          <Segmented
            value={settings.reminderLeadMins}
            onChange={(v) => void setLead(v)}
            options={LEAD_OPTIONS}
          />
        </div>
        <div className="h-px bg-sep mx-4" />
        <div className="ios-row">
          <span className="text-[15px]">Send notifications</span>
        </div>
        <p className="px-4 pb-1 pr-16 text-[13px] text-label-2">
          {perm === "granted"
            ? "Notifications are allowed."
            : perm === "unsupported"
              ? "This browser can't send notifications."
              : "Saturn will ask for permission once you switch this on."}
        </p>
        <div className="ios-row">
          <IosToggleRow
            checked={settings.remindersEnabled}
            onChange={(v) => void toggleReminders(v)}
          />
        </div>
      </div>

      {/* Data */}
      <PageSectionTitle>Data</PageSectionTitle>
      <BackupSection />

      {/* About */}
      <PageSectionTitle>About</PageSectionTitle>
      <div className="ios-group">
        <IosRow label="Saturn" value="Schedule app" />
        <IosRow label="Version" value="1.0.0" />
      </div>
      <p className="mt-4 px-1 pb-2 text-center text-[12px] text-label-3">
        Everything runs locally on your device — nothing is sent anywhere.
      </p>
    </main>
  );
}

function IosToggleRow({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative ml-auto inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors"
      style={{ background: checked ? "var(--accent)" : "var(--fill)" }}
    >
      <motion.span
        layout
        transition={pressSpring}
        className="h-7 w-7 rounded-full bg-white shadow-sm"
        style={{ marginLeft: checked ? "auto" : "2px", marginRight: checked ? "2px" : "auto" }}
      />
    </button>
  );
}