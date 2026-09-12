"use client";

import { AnimatePresence, motion } from "framer-motion";
import { digitSpring } from "@/lib/animations";

function Digit({ value }: { value: string }) {
  return (
    <span className="relative inline-block overflow-hidden align-baseline">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -14, opacity: 0 }}
          transition={digitSpring}
          className="inline-block tabular-nums will-change-transform"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function Unit({ value }: { value: string }) {
  return (
    <span className="inline-flex">
      <Digit value={value[0]} />
      <Digit value={value[1]} />
    </span>
  );
}

export function CountdownDigits({
  hours,
  minutes,
  seconds,
  showHours,
  className,
}: {
  hours: string;
  minutes: string;
  seconds: string;
  showHours?: boolean;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-baseline ${className ?? ""}`}>
      {showHours ? (
        <>
          <Unit value={hours} />
          <span className="px-0.5 opacity-50">:</span>
        </>
      ) : null}
      <Unit value={minutes} />
      <span className="px-0.5 opacity-50">:</span>
      <Unit value={seconds} />
    </span>
  );
}

export function CountdownLabel({ seconds }: { seconds: number }) {
  const abs = Math.abs(Math.floor(seconds));
  const h = Math.floor(abs / 3600);
  const m = Math.floor((abs % 3600) / 60);
  const s = abs % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <CountdownDigits
      hours={pad(h)}
      minutes={pad(m)}
      seconds={pad(s)}
      showHours={h > 0}
    />
  );
}