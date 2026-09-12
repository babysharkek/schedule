"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, Settings02Icon } from "@hugeicons/core-free-icons";
import { useRouter } from "next/navigation";
import { useHaptics } from "@/hooks/use-haptics";

export function ScreenHeader({
  title,
  backTo,
  height = "pt-[max(env(safe-area-inset-top),16px)]",
}: {
  title: string;
  backTo?: string;
  height?: string;
}) {
  const router = useRouter();
  const haptics = useHaptics();

  return (
    <header
      className={`sticky top-0 z-40 mb-4 flex items-center gap-3 px-4 py-3 ${height} glass-strong`}
    >
      {backTo ? (
        <button
          onClick={() => {
            haptics("light");
            router.push(backTo);
          }}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-fill text-label"
          aria-label="Back"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={18} strokeWidth={2} />
        </button>
      ) : null}
      <h1 className="text-[22px] font-bold leading-none tracking-tight">
        {title}
      </h1>
      {!backTo ? (
        <button
          onClick={() => {
            haptics("light");
            router.push("/settings");
          }}
          className="ml-auto flex h-9 w-9 items-center justify-center rounded-full bg-fill text-label-2"
          aria-label="Settings"
        >
          <HugeiconsIcon icon={Settings02Icon} size={18} strokeWidth={1.8} />
        </button>
      ) : null}
    </header>
  );
}

export function PageSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 mt-6 px-4 text-[13px] font-semibold uppercase tracking-wide text-label-2">
      {children}
    </h2>
  );
}