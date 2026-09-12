"use client";

import { useEffect, useRef } from "react";
import type { ResolvedBlock } from "@/lib/types";
import { getNowUpNext } from "@/lib/timetable";
import { notify } from "@/services/notifications";
import { useToast } from "@/components/toast-provider";

function makeKey(kind: string, blockId: string): string {
  return `${kind}:${blockId}`;
}

export function useReminders(
  blocks: ResolvedBlock[],
  now: Date,
  leadMins: number,
  enabled: boolean
): void {
  const push = useToast();
  const firedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled || !blocks.length) return;
    const nowMins =
      now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
    const info = getNowUpNext(blocks, nowMins);
    const didFire = (key: string) => firedRef.current.has(key);
    const fire = (key: string, title: string, body?: string) => {
      if (didFire(key)) return;
      firedRef.current.add(key);
      notify(title, body);
      push(title, body);
    };

    if (info.status === "during" && info.current) {
      if (info.untilCurrentEnd <= leadMins && info.untilCurrentEnd > 0) {
        fire(
          makeKey("end:", info.current.id),
          labelFor(info.current),
          `Ends in ${Math.max(1, Math.ceil(info.untilCurrentEnd))} min`
        );
      }
    }

    if (
      (info.status === "free" || info.status === "before") &&
      info.next
    ) {
      if (info.untilNextStart <= leadMins && info.untilNextStart > 0) {
        fire(
          makeKey("start:", info.next.id),
          `Up next: ${labelFor(info.next)}`,
          `Starts in ${Math.max(1, Math.ceil(info.untilNextStart))} min`
        );
      }
    }
  }, [blocks, now, leadMins, enabled, push]);
}

function labelFor(block: ResolvedBlock): string {
  if (block.type === "lunch") return "Lunch";
  return block.periodNum
    ? `${block.subject || `Period ${block.periodNum}`} (P${block.periodNum})`
    : block.subject || "Class";
}