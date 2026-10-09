import {
  gsap,
  ScrollTrigger,
  prefersReduced,
  qa,
  type Cleanup,
  noopCleanup,
  isMobile,
} from "@/lib/fx/core";
import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(CustomEase);

/** Legacy easing registered at bundle boot (`CustomEase.create("osmo", "0.625,0.05,0,1")`). */
function ensureOsmoEase() {
  try {
    if (!CustomEase.get("osmo")) CustomEase.create("osmo", "0.625,0.05,0,1");
  } catch {
    /* ease registry unavailable — tweens fall back to defaults */
  }
}

// Layout constants preserved verbatim from legacy initOrbitTiles.
const X_RADIUS = 1; // x radius as a multiple of tile width
const X_RADIUS_PORTRAIT = 2.8; // wider spread for narrow 9:16 tiles so the
// orbit keeps the same on-screen diameter as landscape 4/3 cards
const Y_RADIUS = 0; // y radius as a multiple of tile width
const BLUR_MAX = 0.04; // max blur (× tile width) at the back of the orbit
const MIN_SCALE = 0.2;
const MIN_OPACITY = 1;
const MIN_BRIGHTNESS = 0.3;
const STEP_DURATION = 2.5;
const STEP_DELAY = 0;
const STEP_STAGGER = 0.03 * STEP_DURATION;
const SPIN_DURATION: number = 24;

const STATUS_ATTR = "data-orbit-tiles-item-status";

function initRoot(root: HTMLElement): Cleanup {
  // Mobile lite: blur+brightness per-tile per-frame is the single most
  // expensive style on phone GPUs (forces a repaint per tile). Drop the
  // filter entirely there — transform/opacity alone composite on the GPU.
  let lite = false;
  try {
    lite =
      window.matchMedia("(max-width: 991px)").matches ||
      window.matchMedia("(pointer: coarse)").matches;
  } catch {
    lite = false;
  }
  const collection = root.querySelector<HTMLElement>(
    "[data-orbit-tiles-collection]",
  );
  if (collection) gsap.set(collection, { display: "flex" });

  const list = root.querySelector<HTMLElement>("[data-orbit-tiles-list]");
  const items = Array.from(
    root.querySelectorAll<HTMLElement>("[data-orbit-tiles-item]"),
  );
  const count = items.length;
  if (count < 2) {
    // Legacy bails here without laying out; restore the collection override.
    // Nothing to position, so release the CSS staging immediately.
    try {
      root.dataset.orbitReady = "1";
    } catch {
      /* dataset unavailable — CSS fallback reveals in 4s */
    }
    return () => {
      if (collection) gsap.set(collection, { clearProps: "display" });
    };
  }

  const states = items.map(() => ({ progress: 0 }));
  let activeIndex = -1;

  /** Index of the tile nearest the front of the orbit. */
  const nearestIndex = () =>
    states.reduce((best, state, i) => {
      const dist = (v: number) => {
        const m = (((v % count) + count) % count + count) % count;
        return Math.min(m, count - m);
      };
      return dist(i - state.progress) <
        dist(best - states[best].progress)
        ? i
        : best;
    }, 0);

  const updateStatuses = () => {
    const idx = nearestIndex();
    if (idx === activeIndex) return;
    activeIndex = idx;
    items.forEach((el, i) => {
      el.setAttribute(STATUS_ATTR, i === activeIndex ? "active" : "not-active");
    });
  };

  /** Position every tile along the orbit for the current progress values. */
  const layout = () => {
    const w = items[0].offsetWidth;
    const h = items[0].offsetHeight;
    // Portrait 9:16 tiles are much narrower than landscape cards — widen
    // the radius proportionally so the orbit keeps its on-screen diameter.
    const isPortrait = h > w * 1.2;
    const rx = w * (isPortrait ? X_RADIUS_PORTRAIT : X_RADIUS);
    const ry = w * Y_RADIUS;
    const blurMax = w * BLUR_MAX;
    updateStatuses();
    items.forEach((el, i) => {
      const r = ((i - states[i].progress) / count) * Math.PI * 2;
      const front = (Math.cos(r) + 1) / 2;
      const eased = Math.pow(front, 1.3);
      if (lite) {
        // GPU-cheap path: transform + opacity only, no filter.
        gsap.set(el, {
          x: Math.sin(r) * rx,
          y: Math.cos(r) * ry,
          scale: gsap.utils.interpolate(MIN_SCALE, 1, eased),
          opacity: gsap.utils.interpolate(MIN_OPACITY, 1, eased),
          zIndex: Math.round(1000 * eased),
        });
      } else {
        gsap.set(el, {
          x: Math.sin(r) * rx,
          y: Math.cos(r) * ry,
          scale: gsap.utils.interpolate(MIN_SCALE, 1, eased),
          opacity: gsap.utils.interpolate(MIN_OPACITY, 1, eased),
          filter: `blur(${gsap.utils.interpolate(blurMax, 0, eased)}px) brightness(${gsap.utils.interpolate(MIN_BRIGHTNESS, 1, eased)})`,
          zIndex: Math.round(1000 * eased),
        });
      }
    });
  };

  const clearAll = () => {
    items.forEach((el) => el.removeAttribute(STATUS_ATTR));
    gsap.set(items, { clearProps: "all" });
    if (list) gsap.set(list, { clearProps: "all" });
    if (collection) gsap.set(collection, { clearProps: "all" });
    // Re-arm the CSS staging so a remount never flashes unpositioned.
    try {
      delete root.dataset.orbitReady;
    } catch {
      /* ignore */
    }
  };

  /** Release the CSS pre-layout staging once tiles hold positions. */
  const markReady = () => {
    try {
      root.dataset.orbitReady = "1";
    } catch {
      /* dataset unavailable — CSS fallback reveals in 4s */
    }
  };

  if (prefersReduced()) {
    layout();
    markReady();
    let dead = false;
    return () => {
      if (!dead) {
        dead = true;
        clearAll();
      }
    };
  }

  // Mobile fast-path: skip the continuous advance()/spin loop entirely.
  // Tiles are laid out in their initial positions and stay static —
  // they remain tappable and visible without burning a rAF loop.
  if (isMobile()) {
    layout();
    markReady();
    let dead = false;
    return () => {
      if (!dead) {
        dead = true;
        clearAll();
      }
    };
  }

  let stepTl: gsap.core.Timeline | null = null;
  let nextStep: gsap.core.Tween | null = null;
  let running = false;

  const spins: gsap.core.Tween[] =
    list && SPIN_DURATION !== 0
      ? [
          gsap.to(list, {
            rotate: 360,
            duration: SPIN_DURATION,
            ease: "none",
            repeat: -1,
            paused: true,
          }),
          gsap.to(items, {
            rotate: -360,
            duration: SPIN_DURATION,
            ease: "none",
            repeat: -1,
            paused: true,
          }),
        ]
      : [];

  const advance = () => {
    if (!running) return;
    const head = nearestIndex();
    const ordered = states
      .map((state, i) => ({ state, offset: (i - head + count) % count }))
      .sort((a, b) => a.offset - b.offset);
    const tl = gsap.timeline({
      paused: true,
      onComplete: () => {
        if (running) nextStep = gsap.delayedCall(STEP_DELAY, advance);
      },
    });
    ordered.forEach(({ state }, i) => {
      tl.to(
        state,
        {
          progress: state.progress + 1,
          duration: STEP_DURATION,
          ease: "osmo",
          onUpdate: layout,
        },
        i * STEP_STAGGER,
      );
    });
    stepTl = tl;
    tl.play();
  };

  const pause = () => {
    running = false;
    stepTl?.pause();
    nextStep?.pause();
    spins.forEach((t) => t.pause());
  };

  const play = () => {
    running = true;
    spins.forEach((t) => t.play());
    if (stepTl && stepTl.progress() < 1) stepTl.play();
    else advance();
  };

  layout();
  markReady();
  // Legacy never tears this down; the native port tracks it for cleanup.
  const trigger = ScrollTrigger.create({
    trigger: root,
    start: "top bottom",
    end: "bottom top",
    onToggle: (self) => (self.isActive ? play() : pause()),
  });

  let dead = false;
  return () => {
    if (dead) return;
    dead = true;
    pause();
    stepTl?.kill();
    stepTl = null;
    nextStep?.kill();
    nextStep = null;
    spins.forEach((t) => t.kill());
    gsap.killTweensOf(states);
    trigger.kill();
    clearAll();
  };
}

/**
 * Orbiting/floating hero cards ([data-orbit-tiles-init] /
 * [data-orbit-tiles-collection|list|item]). No-op when hooks are absent.
 */
export function initOrbitTiles(scope: ParentNode = document): Cleanup {
  const roots =
    scope instanceof Element &&
    scope.matches("[data-orbit-tiles-init]")
      ? [scope as HTMLElement]
      : qa<HTMLElement>("[data-orbit-tiles-init]", scope);
  if (!roots.length) return noopCleanup;
  ensureOsmoEase();
  const cleanups = roots.map(initRoot);
  let dead = false;
  return () => {
    if (dead) return;
    dead = true;
    cleanups.forEach((fn) => fn());
  };
}
