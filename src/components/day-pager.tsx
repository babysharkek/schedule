"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import type { ReactNode } from "react";
import { carouselSpring, pressSpring } from "@/lib/animations";
import { LETTERS } from "@/lib/types";
import { useHaptics } from "@/hooks/use-haptics";

export function DayPager({
  initialPage,
  onPageChange,
  children,
  className,
}: {
  initialPage: number;
  onPageChange?: (page: number) => void;
  children: (page: number) => ReactNode;
  className?: string;
}) {
  const [page, setPage] = useState(initialPage);
  const [width, setWidth] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const spring = useSpring(x, carouselSpring);
  const haptics = useHaptics();

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => setWidth(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    if (!width) return;
    x.set(-page * width);
  }, [page, width, x]);

  const goTo = (target: number) => {
    const clamped = Math.max(0, Math.min(LETTERS.length - 1, target));
    if (clamped === page) return;
    setPage(clamped);
    onPageChange?.(clamped);
    haptics("light");
  };

  const maxX = -(LETTERS.length - 1) * Math.max(width, 1);

  return (
    <div className={className}>
      <div
        ref={wrapRef}
        className="overflow-hidden"
      >
        <motion.div
          className="flex cursor-grab active:cursor-grabbing"
          style={{ x: spring }}
          drag="x"
          dragConstraints={{ left: maxX, right: 0 }}
          dragElastic={0.08}
          dragMomentum={false}
          onDragEnd={(_, info) => {
            const current = -x.get();
            let target = Math.round(current / Math.max(width, 1));
            if (info.velocity.x < -500) target += 1;
            else if (info.velocity.x > 500) target -= 1;
            goTo(target);
          }}
        >
          {LETTERS.map((_, i) => (
            <div
              key={i}
              className="shrink-0 px-0.5"
              style={{ width: `${100 / LETTERS.length}%` }}
            >
              {children(i)}
            </div>
          ))}
        </motion.div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-2">
        {LETTERS.map((letter, i) => {
          const active = i === page;
          return (
            <motion.button
              key={letter}
              whileTap={{ scale: 0.85 }}
              transition={pressSpring}
              onClick={() => goTo(i)}
              className="relative flex h-10 w-12 items-center justify-center rounded-xl text-base font-semibold"
              style={{
                background: active ? "var(--label)" : "var(--bg2)",
                color: active ? "var(--bg2)" : "var(--label-2)",
              }}
              aria-label={`Day ${letter}`}
              aria-pressed={active}
            >
              {letter}
              <span
                className={`absolute -top-0.5 right-1 text-[9px] font-bold ${
                  active ? "text-label-3" : "text-label-3"
                }`}
              >
                {i === initialPage ? "\u2022" : ""}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}