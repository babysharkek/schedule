"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Settings02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cardSpring } from "@/lib/animations";

export function EmptyState() {
  return (
    <section className="px-4 pt-[max(env(safe-area-inset-top),20px)]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={cardSpring}
        className="glass relative flex flex-col items-center overflow-hidden rounded-[28px] px-8 py-12 text-center"
      >
        <span
          className="mb-5 flex h-20 w-20 items-center justify-center rounded-[22px] text-label-2"
          style={{ background: "var(--fill)" }}
        >
          <HugeiconsIcon icon={Settings02Icon} size={36} strokeWidth={1.5} />
        </span>
        <h1 className="text-2xl font-bold">No schedule yet</h1>
        <p className="mt-2 max-w-[260px] text-[15px] text-label-2">
          Add your letter days and class periods in Settings to start seeing
          your day at a glance.
        </p>
        <Link
          href="/settings"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-[15px] font-semibold text-white"
        >
          Go to Settings
        </Link>
      </motion.div>
    </section>
  );
}