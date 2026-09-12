"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import type { AppSettings } from "@/lib/types";

function resolveTheme(mode: AppSettings["theme"]): "light" | "dark" {
  if (mode === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return mode;
}

export function applyTheme(settings: AppSettings) {
  const root = document.documentElement;
  const theme = resolveTheme(settings.theme);
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  root.style.setProperty("--font-scale", String(settings.fontScale || 1));
}

export function ThemeProvider({
  settings,
  children,
}: {
  settings: AppSettings;
  children: ReactNode;
}) {
  useEffect(() => {
    applyTheme(settings);
  }, [settings]);

  useEffect(() => {
    if (settings.theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme(settings);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [settings]);

  return children as unknown as ReactNode;
}