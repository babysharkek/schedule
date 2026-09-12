"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/toast-provider";
import { useSettings } from "@/hooks/use-data";
import { ServiceWorkerRegister } from "@/components/sw-register";

export function AppProviders({ children }: { children: ReactNode }) {
  const settings = useSettings();

  return (
    <ThemeProvider settings={settings}>
      <ToastProvider>
        <ServiceWorkerRegister />
        {children}
      </ToastProvider>
    </ThemeProvider>
  );
}