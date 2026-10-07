import Lenis from "lenis";
import {
  gsap,
  ScrollTrigger,
  prefersReduced,
  type Cleanup,
} from "@/lib/fx/core";

/**
 * Event dispatched on window after scrollToTop finishes.
 * Mirrors the legacy "lenis:settled" CustomEvent from slater-bundle.js.
 */
export const LENIS_SETTLED = "lenis:settled";

let lenis: Lenis | null = null;
let rafFn: ((time: number) => void) | null = null;

function teardownInstance(instance: Lenis, raf: ((time: number) => void) | null) {
  if (raf) gsap.ticker.remove(raf);
  instance.destroy();
}

/**
 * Lenis singleton. Mirrors legacy initLenis: wrapper window, duration 1.2,
 * smoothWheel, touchMultiplier 2, exponential easing, driven via gsap.ticker
 * with lagSmoothing(0), forwarding scroll events to ScrollTrigger.
 *
 * Mobile fast-path: smooth-scroll hijacking janks on touch devices and
 * costs a full rAF loop + ScrollTrigger churn. On coarse pointers / small
 * viewports we skip Lenis entirely and keep native scroll (zero JS cost).
 *
 * Idempotent: re-init destroys the previous instance first. Under
 * prefers-reduced-motion no instance is created (native scroll stays).
 */
export function initLenis(): Cleanup {
  if (lenis) {
    const prev = lenis;
    const prevRaf = rafFn;
    lenis = null;
    rafFn = null;
    teardownInstance(prev, prevRaf);
  }
  if (prefersReduced()) return () => {};
  try {
    // Touch phones/tablets: native scroll is faster and doesn't fight the
    // browser's own fling physics. Skip Lenis to save CPU + battery.
    if (
      window.matchMedia("(max-width: 991px)").matches ||
      window.matchMedia("(pointer: coarse)").matches
    ) {
      return () => {};
    }
  } catch {
    /* matchMedia unavailable — fall through to Lenis */
  }

  const instance = new Lenis({
    wrapper: window,
    duration: 1.2,
    smoothWheel: true,
    touchMultiplier: 2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    infinite: false,
  });
  lenis = instance;

  const onScroll = () => {
    ScrollTrigger.update();
  };
  instance.on("scroll", onScroll);

  const raf = (time: number) => {
    instance.raf(time * 1000);
  };
  rafFn = raf;
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);

  let cleaned = false;
  return () => {
    if (cleaned) return;
    cleaned = true;
    if (rafFn === raf) rafFn = null;
    if (lenis === instance) lenis = null;
    teardownInstance(instance, raf);
  };
}

export function getLenis(): Lenis | null {
  return lenis;
}

export function lenisStop(): void {
  lenis?.stop();
}

export function lenisStart(): void {
  lenis?.start();
}

export function lenisResize(): void {
  lenis?.resize();
}

/**
 * Smooth-scroll to top, then dispatch LENIS_SETTLED on window.
 * Falls back to native scrolling when Lenis is absent (e.g. reduced motion).
 */
export function scrollToTop(): void {
  const finish = () => {
    window.dispatchEvent(new CustomEvent(LENIS_SETTLED));
  };
  const instance = lenis;
  if (!instance || prefersReduced()) {
    window.scrollTo(0, 0);
    finish();
    return;
  }
  let settled = false;
  const once = () => {
    if (settled) return;
    settled = true;
    finish();
  };
  try {
    instance.scrollTo(0, { onComplete: once });
  } catch {
    window.scrollTo(0, 0);
    once();
    return;
  }
  // Safety net in case onComplete never fires (e.g. interrupted).
  window.setTimeout(once, 2000);
}
