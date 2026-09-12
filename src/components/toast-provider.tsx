"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cardSpring } from "@/lib/animations";

interface Toast {
  id: number;
  title: string;
  body?: string;
}

interface ToastContextValue {
  push: (title: string, body?: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  push: () => {},
});

let nextToastId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (title: string, body?: string) => {
      const id = nextToastId++;
      setToasts((prev) => [...prev.slice(-2), { id, title, body }]);
      const timer = setTimeout(() => dismiss(id), 3000);
      timers.current.set(id, timer);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-[70] flex flex-col items-center gap-2 px-4 pt-[calc(env(safe-area-inset-top)+8px)]"
        aria-live="polite"
      >
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.button
              key={toast.id}
              initial={{ opacity: 0, y: -12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={cardSpring}
              onClick={() => dismiss(toast.id)}
              className="pointer-events-auto w-full max-w-sm rounded-2xl bg-tint px-4 py-3 text-left shadow-lg shadow-black/10 ring-1 ring-black/5 backdrop-blur-xl dark:ring-white/10"
            >
              <p className="text-sm font-semibold text-label">{toast.title}</p>
              {toast.body ? (
                <p className="mt-0.5 text-[13px] text-label-2">{toast.body}</p>
              ) : null}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  return useCallback(
    (title: string, body?: string) => ctx.push(title, body),
    [ctx]
  );
}