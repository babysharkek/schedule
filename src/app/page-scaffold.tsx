"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { TabBar } from "@/components/tab-bar";
import { screenSpring, fadeUp } from "@/lib/animations";

export function PageScaffold({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/";
  const reduced = useReducedMotion();

  return (
    <div className="relative flex h-full flex-col">
      <div className="flex-1">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.main
            key={pathname}
            initial={reduced ? { opacity: 0 } : fadeUp.initial}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -12 }}
            transition={screenSpring}
            className="mx-auto w-full max-w-lg pb-[calc(env(safe-area-inset-bottom)+88px)]"
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>
      <TabBar active={pathname} />
    </div>
  );
}