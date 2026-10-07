"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap, ScrollTrigger, DUR, prefersReduced, fxLog, fxStatus } from "@/lib/fx/core";
import {
  initLenis,
  lenisStop,
  lenisStart,
  lenisResize,
  getLenis,
} from "@/lib/fx/lenis";
import { initHaptics } from "@/lib/fx/haptics";
import { initLinks } from "@/lib/fx/links";
import { initTiltCursor } from "@/lib/fx/tilt";
import { initCustomScrollbar } from "@/lib/fx/scrollbar";
import { initReveals, killReveals } from "@/lib/fx/reveal";
import { runPreloader } from "@/lib/fx/preloader";
import { playHeroIntro, killHeroIntro, revealHeroInstant } from "@/lib/fx/heroIntro";
import { initNav, closeMenu, updateNavIndicators } from "@/lib/fx/nav";
import { initStickyName } from "@/lib/fx/sticky-name";
import { initContactDial } from "@/lib/fx/dial";
import { initContactPills } from "@/lib/fx/pills";
import { initOrbitTiles } from "@/lib/fx/orbit";
import { initThemeDots } from "@/lib/fx/theme-liquid";

/**
 * Desktop-only FX (three.js globe, WebGL fluid, infinite canvas) are
 * dynamically imported so phones never download them. Per Next.js
 * lazy-loading guidance, `import()` splits these into separate chunks
 * fetched only when `isDesktopFx()` is true.
 */
function isDesktopFx(): boolean {
  try {
    return window.matchMedia("(min-width: 992px)").matches;
  } catch {
    return true;
  }
}

async function loadDesktopFx(
  names: Array<"globe" | "fluid" | "canvas">,
): Promise<Array<() => void>> {
  if (!isDesktopFx()) return [];
  const cleanups: Array<() => void> = [];
  try {
    if (names.includes("globe")) {
      const m = await import("@/lib/fx/globe");
      cleanups.push(m.initGlobe());
    }
  } catch (err) {
    console.error("[fx] globe failed:", err);
  }
  try {
    if (names.includes("fluid")) {
      const m = await import("@/lib/fx/fluid");
      cleanups.push(m.initFluidReveal());
    }
  } catch (err) {
    console.error("[fx] fluid failed:", err);
  }
  try {
    if (names.includes("canvas")) {
      const m = await import("@/lib/fx/canvas");
      cleanups.push(m.initInfiniteCanvas());
    }
  } catch (err) {
    console.error("[fx] canvas failed:", err);
  }
  return cleanups;
}

async function destroyDesktopFx(): Promise<void> {
  try {
    const [g, f, c] = await Promise.all([
      import("@/lib/fx/globe"),
      import("@/lib/fx/fluid"),
      import("@/lib/fx/canvas"),
    ]);
    try {
      g.destroyGlobe();
    } catch {
      /* ignore */
    }
    try {
      f.destroyFluidReveal();
    } catch {
      /* ignore */
    }
    try {
      c.destroyInfiniteCanvas();
    } catch {
      /* ignore */
    }
  } catch {
    /* chunk not loaded yet (mobile) — nothing to destroy */
  }
}

function pageRoot(): HTMLElement | null {
  return document.querySelector("main");
}

function isHomePage(): boolean {
  return document.querySelector('main[data-page="home"]') !== null;
}

/** Play the serial hero entrance (logo -> line -> name -> texts -> menu
 *  -> lever). Falls back to an instant reveal so staged content can
 *  never strand hidden. */
function playIntroSafe(): void {
  if (!isHomePage()) return;
  try {
    playHeroIntro();
  } catch (err) {
    console.error("[fx] hero intro failed:", err);
    try {
      revealHeroInstant();
    } catch {
      /* ignore */
    }
  }
}

/** Run an fx init safely: a throwing module logs and yields a no-op cleanup
 * instead of breaking the whole init chain. */
function safe(name: string, init: () => () => void): () => void {
  try {
    const cleanup = init();
    fxStatus().modules.push(name);
    return cleanup;
  } catch (err) {
    const msg = `${name}: ${err instanceof Error ? err.message : String(err)}`;
    fxStatus().errors.push(msg);
    console.error(`[fx] ${name} failed:`, err);
    return () => {};
  }
}

function scrollTopImmediate() {
  // Lenis ignores programmatic scrolls while stopped — force it, fall
  // back to native, and verify on the next frame. A failed reset here
  // used to strand new pages mid-scroll with no further recovery.
  try {
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo(0, 0);
  } catch {
    try {
      window.scrollTo(0, 0);
    } catch {
      /* ignore */
    }
  }
  requestAnimationFrame(() => {
    try {
      if (window.scrollY > 2) window.scrollTo(0, 0);
    } catch {
      /* ignore */
    }
  });
}

/** Native replacement for the Barba fade/blur page transition. */
export default function SiteFx() {
  const pathname = usePathname();
  const router = useRouter();
  const pathRef = useRef(pathname);
  const pendingRef = useRef<string | null>(null);
  const readyRef = useRef(false);
  const pageCleanups = useRef<(() => void)[]>([]);

  pathRef.current = pathname;

  const teardownPage = useCallback(() => {
    try {
      killHeroIntro();
    } catch {
      /* ignore */
    }
    for (const fn of pageCleanups.current) {
      try {
        fn();
      } catch {
        /* ignore */
      }
    }
    pageCleanups.current = [];
    killReveals();
    // Desktop chunks may not be loaded on mobile — fire and forget.
    void destroyDesktopFx();
  }, []);

  const initPage = useCallback(() => {
    updateNavIndicators();
    pageCleanups.current = [
      safe("reveals", () => initReveals()),
      safe("links", () => initLinks()),
      safe("tilt", () => initTiltCursor()),
      safe("dial", () => initContactDial()),
      safe("pills", () => initContactPills()),
      safe("orbit", () => initOrbitTiles()),
      safe("sticky", () => initStickyName()),
      safe("themedots", () => initThemeDots()),
    ];
    // Heavy desktop-only engines load in a separate chunk, after the
    // lightweight FX above — phones skip this entirely (zero three.js).
    if (isDesktopFx()) {
      void loadDesktopFx(["globe", "fluid", "canvas"]).then((extra) => {
        for (const fn of extra) pageCleanups.current.push(fn);
        try {
          lenisResize();
          ScrollTrigger.refresh();
        } catch {
          /* ignore */
        }
      });
    }
    lenisResize();
    ScrollTrigger.refresh();
  }, []);

  const enter = useCallback(() => {
    document.body.classList.remove("is-transitioning");
    const root = pageRoot();
    if (!root || prefersReduced()) {
      lenisStart();
      return;
    }
    // Safety net: if the fade-in tween is ever killed before completing,
    // the page would sit invisible with scroll locked. Force recovery.
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      lenisStart();
    };
    const safety = window.setTimeout(() => {
      if (!root.isConnected) {
        finish();
        return;
      }
      try {
        gsap.killTweensOf(root);
        gsap.set(root, { clearProps: "filter,opacity,visibility" });
      } catch {
        /* ignore */
      }
      try {
        ScrollTrigger.refresh();
      } catch {
        /* ignore */
      }
      finish();
    }, 2500);
    gsap.fromTo(
      root,
      { filter: "blur(12px)", autoAlpha: 0 },
      {
        filter: "blur(0px)",
        autoAlpha: 1,
        duration: DUR.M,
        ease: "power2.out",
        overwrite: "auto",
        clearProps: "filter,opacity,visibility",
        onComplete: () => {
          window.clearTimeout(safety);
          try {
            ScrollTrigger.refresh();
          } catch {
            /* ignore */
          }
          finish();
        },
      },
    );
  }, []);

  // Boot once: persistent systems + first-visit preloader, then first page init.
  useEffect(() => {
    fxLog("boot start");
    const bootCleanups = [
      safe("lenis", initLenis),
      safe("haptics", initHaptics),
      safe("scrollbar", initCustomScrollbar),
      safe("nav", initNav),
    ];
    let cancelled = false;
    const t0 = performance.now();
    const finishBoot = () => {
      if (cancelled) return;
      fxLog(`preloader resolved in ${Math.round(performance.now() - t0)}ms`);
      readyRef.current = true;
      initPage();
      playIntroSafe();
      fxLog(
        `initPage done, ScrollTriggers: ${ScrollTrigger.getAll().length}, modules: ${fxStatus().modules.join(",")}`,
      );
    };
    void runPreloader().then(finishBoot, (err) => {
      console.error("[fx] preloader failed:", err);
      finishBoot();
    });
    return () => {
      cancelled = true;
      for (const fn of bootCleanups) {
        try {
          fn();
        } catch {
          /* ignore */
        }
      }
      teardownPage();
      readyRef.current = false;
    };
  }, [initPage, teardownPage]);

  // Per-route init + transition completion.
  useEffect(() => {
    if (!readyRef.current) return;
    const wasTransition = pendingRef.current !== null;
    pendingRef.current = null;
    // A throw anywhere below used to strand the new page (hidden reveals,
    // stopped scroll). Isolate each stage so the page always ends usable.
    try {
      updateNavIndicators();
    } catch {
      /* ignore */
    }
    try {
      teardownPage();
    } catch {
      /* ignore */
    }
    scrollTopImmediate();
    try {
      initPage();
    } catch {
      /* ignore */
    }
    // Replaying the serial hero entrance on later home visits keeps the
    // flow identical to the initial load.
    playIntroSafe();
    if (wasTransition) enter();
    else lenisStart();
  }, [pathname, teardownPage, initPage, enter]);

  // Intercept same-origin navigations for the leave animation.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      )
        return;
      const anchor = (e.target as HTMLElement | null)?.closest?.(
        "a[href]",
      ) as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download"))
        return;
      const raw = anchor.getAttribute("href") ?? "";
      if (!raw || raw.startsWith("#")) return;
      let url: URL;
      try {
        url = new URL(raw, window.location.origin);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === pathRef.current || pendingRef.current) return;
      e.preventDefault();
      pendingRef.current = url.pathname + url.search;

      document.body.classList.add("is-transitioning");
      closeMenu();
      lenisStop();
      const root = pageRoot();
      const go = () => router.push(pendingRef.current ?? url.pathname);
      if (!root || prefersReduced()) {
        go();
        return;
      }
      void gsap
        .to(root, {
          filter: "blur(24px)",
          autoAlpha: 0,
          duration: DUR.M,
          ease: "power2.in",
          overwrite: "auto",
        })
        .then(go);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [router]);

  return null;
}
