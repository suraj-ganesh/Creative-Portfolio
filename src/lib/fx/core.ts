import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { CustomEase } from "gsap/CustomEase";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";

gsap.registerPlugin(
  ScrollTrigger,
  SplitText,
  Draggable,
  InertiaPlugin,
  CustomEase,
  MorphSVGPlugin,
);

export { gsap, ScrollTrigger, SplitText, Draggable, InertiaPlugin };

/** Durations mirror --dur-* tokens and legacy slater-bundle constants. */
export const DUR = { XS: 0.2, S: 0.4, M: 0.8, L: 1.2, STAGGER: 0.1 } as const;

export const DESKTOP_QUERY = "(min-width: 992px)";
export const isDesktop = () =>
  window.matchMedia(DESKTOP_QUERY).matches;
// Legacy parity: the original bleibtgleich.dev animates unconditionally —
// its bundle never consults prefers-reduced-motion. Gating on it here made
// the whole site render static for anyone with the OS "animation effects"
// toggle off, while the original kept animating. Keep this pinned to false
// so behavior matches the reference site exactly.
export const prefersReduced = () => false;

export type Cleanup = () => void;
export const noopCleanup: Cleanup = () => {};

/** Remote-debug status: SiteFx writes lifecycle info here so a static page
 *  can be diagnosed from the browser console via `window.__fxStatus`. */
export interface FxStatus {
  boot: string[];
  errors: string[];
  preloader: string;
  modules: string[];
  triggers: number;
  webgl2: boolean;
  osReducedMotion: boolean;
  viewport: string;
}

declare global {
  interface Window {
    __fxStatus?: FxStatus;
  }
}

export function fxStatus(): FxStatus {
  if (typeof window === "undefined") {
    return {
      boot: [], errors: [], preloader: "ssr", modules: [],
      triggers: 0, webgl2: false, osReducedMotion: false, viewport: "",
    };
  }
  window.__fxStatus ??= {
    boot: [], errors: [], preloader: "pending", modules: [],
    triggers: 0,
    webgl2: !!document.createElement("canvas").getContext("webgl2"),
    osReducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
  };
  return window.__fxStatus;
}

export function fxLog(step: string): void {
  try {
    fxStatus().boot.push(`${Math.round(performance.now())}ms ${step}`);
    // eslint-disable-next-line no-console
    console.log(`[fx] ${step}`);
  } catch {
    /* logging must never break animation */
  }
}

export function q<T extends Element = Element>(
  sel: string,
  scope: ParentNode = document,
): T | null {
  return scope.querySelector<T>(sel);
}

export function qa<T extends Element = Element>(
  sel: string,
  scope: ParentNode = document,
): T[] {
  return Array.from(scope.querySelectorAll<T>(sel));
}
