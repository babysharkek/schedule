import type { ResolvedBlock } from "./types";

export function pad2(n: number): string {
  return Math.floor(n).toString().padStart(2, "0");
}

export function minsToTimeLabel(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = Math.floor(mins % 60);
  return `${pad2(h)}:${pad2(m)}`;
}

export function minsToTimeLabelFull(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = Math.floor(mins % 60);
  const ampm = h < 12 ? "AM" : "PM";
  const h12 = h % 12 || 12;
  return m === 0 ? `${h12} ${ampm}` : `${h12}:${pad2(m)} ${ampm}`;
}

export function minsToMinutesOfDay(mins: number): number {
  return Math.floor(mins);
}

export function timeLabelToMins(h: number, m: number): number {
  return h * 60 + m;
}

export function dateToMins(d: Date): number {
  return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;
}

export interface CountdownParts {
  negative: boolean;
  hours: string;
  minutes: string;
  seconds: string;
}

export function secsToCountdown(totalSecs: number): CountdownParts {
  const negative = totalSecs < 0;
  const abs = Math.abs(Math.floor(totalSecs));
  const h = Math.floor(abs / 3600);
  const m = Math.floor((abs % 3600) / 60);
  const s = abs % 60;
  return {
    negative,
    hours: pad2(h),
    minutes: pad2(m),
    seconds: pad2(s),
  };
}

export function minsToCountdown(mins: number): CountdownParts {
  return secsToCountdown(mins * 60);
}

export function formatDuration(totalSecs: number): string {
  const abs = Math.abs(Math.floor(totalSecs));
  const h = Math.floor(abs / 3600);
  const m = Math.floor((abs % 3600) / 60);
  const s = abs % 60;
  if (h > 0) return `${h}:${pad2(m)}:${pad2(s)}`;
  return `${pad2(m)}:${pad2(s)}`;
}

export function formatUntil(mins: number): string {
  if (mins < 0) return "ended";
  if (mins < 1) return "now";
  if (mins < 60) return `in ${Math.ceil(mins)} min`;
  return `in ${Math.floor(mins / 60)}h ${Math.round(mins % 60)}m`;
}

export function formatBlockTime(block: ResolvedBlock): string {
  return `${minsToTimeLabel(block.startMins)} \u2013 ${minsToTimeLabel(block.endMins)}`;
}

export function formatMinutesRange(start: number, end: number): string {
  return `${minsToTimeLabel(start)} \u2013 ${minsToTimeLabel(end)}`;
}
