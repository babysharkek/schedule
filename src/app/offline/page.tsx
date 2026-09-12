"use client";

import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { InfoIcon } from "@hugeicons/core-free-icons";
import { cardSpring } from "@/lib/animations";

export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col items-center justify-center gap-6 px-8 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={cardSpring}
        className="glass flex flex-col items-center rounded-[28px] px-8 py-12 text-center"
      >
        <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-fill text-label-2">
          <HugeiconsIcon icon={InfoIcon} size={30} strokeWidth={1.5} />
        </span>
        <h1 className="text-2xl font-bold">You&apos;re offline</h1>
        <p className="mt-2 max-w-[16rem] text-[15px] leading-snug text-label-2">
          No problem — your schedule is stored on this device. Everything you
          see here keeps working.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 rounded-2xl bg-accent px-6 py-3 text-[15px] font-semibold text-white"
        >
          Try again
        </button>
      </motion.div>

      <p className="max-w-[18rem] text-center text-[13px] leading-snug text-label-3">
        Add Saturn to your home screen for the full app experience with its own
        icon.
      </p>
    </main>
  );
}