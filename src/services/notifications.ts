"use client";

export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (!isNotificationSupported()) return "unsupported";
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (!isNotificationSupported()) return "unsupported";
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

export function canNotify(): boolean {
  return isNotificationSupported() && Notification.permission === "granted";
}

export function notify(title: string, body?: string): void {
  if (!canNotify()) return;
  try {
    const n = new Notification(title, {
      body,
      icon: "/pwa/icon-192.png",
      badge: "/pwa/icon-192.png",
      tag: `saturn-${Date.now()}`,
    });
    n.onclick = () => {
      window.focus();
      n.close();
    };
  } catch {
    // notification may be unavailable in some contexts
  }
}