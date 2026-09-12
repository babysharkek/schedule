"use client";

import type { Letter } from "@/lib/types";

function letterColor(letter: string): string {
  const colors: Record<string, string> = {
    A: "#007AFF",
    B: "#FF9500",
    C: "#34C759",
    D: "#AF52DE",
  };
  return colors[letter] ?? "#007AFF";
}

export function LetterBadge({
  letter,
  size = "md",
  dimmed,
}: {
  letter: Letter | string;
  size?: "sm" | "md" | "lg";
  dimmed?: boolean;
}) {
  const color = letterColor(letter);
  const px =
    size === "sm" ? "h-6 w-6 text-[11px]" : size === "lg" ? "h-12 w-12 text-2xl" : "h-9 w-9 text-base";
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${px} ${
        dimmed ? "opacity-50" : ""
      }`}
      style={{
        color: dimmed ? "var(--label-3)" : "#fff",
        background: dimmed ? "var(--fill)" : color,
        boxShadow: dimmed
          ? "none"
          : `0 4px 14px -6px ${color}`,
      }}
      aria-label={`Day ${letter}`}
    >
      {letter}
    </span>
  );
}