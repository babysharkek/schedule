const HAPTIC_TAPS: Record<HapticPattern, number[]> = {
  none: [],
  tap: [10],
  light: [8],
  medium: [12, 25, 12],
  success: [16],
  error: [28, 60, 28],
};

export type HapticPattern = "none" | "tap" | "light" | "medium" | "success" | "error";

function isCapacitor(): boolean {
  return typeof window !== "undefined" && "Capacitor" in window;
}

export function haptic(pattern: HapticPattern = "tap"): void {
  if (typeof navigator === "undefined") return;

  if (isCapacitor()) {
    void import("@capacitor/haptics")
      .then(({ Haptics, ImpactStyle }) => {
        void Haptics.impact({
          style: ImpactStyle[patternToStyle(pattern)],
        });
      })
      .catch(() => {});
    return;
  }

  if ("vibrate" in navigator) {
    navigator.vibrate(HAPTIC_TAPS[pattern]);
  }
}

function patternToStyle(pattern: HapticPattern): "Light" | "Medium" | "Heavy" {
  switch (pattern) {
    case "medium":
      return "Medium";
    case "error":
      return "Heavy";
    default:
      return "Light";
  }
}