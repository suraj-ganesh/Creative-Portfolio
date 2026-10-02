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
export const prefersReduced = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export type Cleanup = () => void;
export const noopCleanup: Cleanup = () => {};

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
