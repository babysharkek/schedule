import type { HapticPattern } from "@/services/haptics";
import { haptic } from "@/services/haptics";

export function useHaptics() {
  return haptic as (pattern?: HapticPattern) => void;
}