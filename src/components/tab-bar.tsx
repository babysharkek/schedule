"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon,
  Calendar02Icon,
  Settings02Icon,
} from "@hugeicons/core-free-icons";
import { motion } from "framer-motion";
import { pressSpring } from "@/lib/animations";
import { useHaptics } from "@/hooks/use-haptics";
import { useRouter } from "next/navigation";

const TABS = [
  {
    key: "/",
    label: "Today",
    icon: Home01Icon,
  },
  {
    key: "/calendar",
    label: "Schedule",
    icon: Calendar02Icon,
  },
  {
    key: "/settings",
    label: "Settings",
    icon: Settings02Icon,
  },
] as const;

export function TabBar({ active }: { active: string }) {
  const router = useRouter();
  const haptics = useHaptics();

  return (
    <nav
      aria-label="Primary"
      className="glass-strong fixed inset-x-0 bottom-0 z-50 border-t border-black/[0.08] dark:border-white/[0.08]"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around">
        {TABS.map((tab) => {
          const isActive = active === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                haptics("light");
                if (active !== tab.key) router.push(tab.key);
              }}
              className="relative flex flex-1 flex-col items-center gap-0.5 pb-[max(env(safe-area-inset-bottom),6px)] pt-2 text-label-2"
              aria-current={isActive ? "page" : undefined}
            >
              {isActive ? (
                <motion.span
                  layoutId="tab-pill"
                  transition={pressSpring}
                  className="absolute top-0 h-0.5 w-10 rounded-full bg-accent"
                />
              ) : null}
              <motion.span
                whileTap={{ scale: 0.86 }}
                transition={pressSpring}
              >
                <HugeiconsIcon
                  icon={tab.icon}
                  size={24}
                  strokeWidth={isActive ? 2.2 : 1.6}
                  color={isActive ? "var(--accent)" : "currentColor"}
                />
              </motion.span>
              <span
                className={`text-[10px] font-medium ${isActive ? "text-accent" : ""}`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}