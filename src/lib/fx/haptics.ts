import { prefersReduced, type Cleanup } from "@/lib/fx/core";

/**
 * Haptic taps on [data-haptic] elements.
 *
 * Legacy initHaptics delegated to an external `window._haptics` plugin
 * (referenced but never defined in slater-bundle.js), so this port drives
 * `navigator.vibrate` directly with the same data-attribute hook.
 */
const PATTERNS: Record<string, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 30,
};

export function initHaptics(): Cleanup {
  const onClick = (e: MouseEvent) => {
    const target = (e.target as Element | null)?.closest?.("[data-haptic]");
    if (!target) return;
    if (prefersReduced()) return;
    if (
      typeof navigator === "undefined" ||
      typeof navigator.vibrate !== "function"
    )
      return;
    const kind =
      (target as HTMLElement).dataset.haptic || "medium";
    const pattern = PATTERNS[kind] ?? 10;
    try {
      navigator.vibrate(pattern);
    } catch {
      // vibrate() may throw on some platforms when called with bad input
    }
  };
  document.addEventListener("click", onClick);
  return () => {
    document.removeEventListener("click", onClick);
  };
}
