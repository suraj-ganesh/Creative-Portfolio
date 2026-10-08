"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap, ScrollTrigger, DUR, prefersReduced, fxLog, fxStatus, isMobile, qa } from "@/lib/fx/core";
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
import { initReveals, killReveals, revealNow } from "@/lib/fx/reveal";
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

/** Which desktop-only FX hooks the current page actually hosts. Pages
 *  without one (work, contact, 404) skip the heavy chunks entirely, and
 *  engines whose hooks are absent are never imported. */
type DesktopFxName = "globe" | "fluid" | "canvas";

function desktopHooks(): DesktopFxName[] {
  const names: DesktopFxName[] = [];
  try {
    if (document.querySelector('[data-globe="wrap"]')) names.push("globe");
    if (document.querySelector("[data-fluid-reveal]")) names.push("fluid");
    if (document.querySelector("[data-infinite-canvas]"))
      names.push("canvas");
  } catch {
    return ["globe", "fluid", "canvas"];
  }
  return names;
}

// Generation counter for the desktop-FX lifecycle. Teardown bumps it;
// async loads/destroys capture it and bail out once superseded, so a
// slow chunk can never destroy instances owned by a newer page (the old
// document-wide destroy used to resolve after the new page's init and
// wipe its freshly created globe/fluid).
let fxGen = 0;

async function loadDesktopFx(
  names: DesktopFxName[],
  gen: number,
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
  if (gen !== fxGen) {
    // Superseded while importing (route change / hero swap landed
    // meanwhile): tear down what was just created instead of handing
    // it to a page that no longer owns it.
    for (const fn of cleanups) {
      try {
        fn();
      } catch {
        /* ignore */
      }
    }
    return [];
  }
  if (cleanups.length) desktopFxLoaded = true;
  return cleanups;
}

let desktopFxLoaded = false;

/** Backstop for instances missed by the synchronous page cleanups
 *  (detached hosts from commits that landed before teardown ran).
 *  Only ever destroys DETACHED instances — connected hosts belong to
 *  the current page's init and are never touched, so this can resolve
 *  at any time without racing a newer init.
 *  Never imports the heavy chunks just to prune — pages that never
 *  loaded them (mobile, hook-less pages) have nothing to destroy. */
async function pruneDetachedDesktopFx(gen: number): Promise<void> {
  if (!desktopFxLoaded) return;
  try {
    const [g, f] = await Promise.all([
      import("@/lib/fx/globe"),
      import("@/lib/fx/fluid"),
    ]);
    if (gen !== fxGen) return;
    try {
      g.destroyDetachedGlobe();
    } catch {
      /* ignore */
    }
    try {
      f.destroyDetachedFluid();
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
  const navTimerRef = useRef(0);

  pathRef.current = pathname;

  // Last-resort recovery: if a route commit never settles (crashed or
  // aborted), the per-route effect below never runs and the app would sit
  // blurred with scroll locked and every link dead. Reset to a usable
  // state instead — if the late commit still lands, that effect finishes
  // the transition normally.
  const armNavWatchdog = useCallback(() => {
    window.clearTimeout(navTimerRef.current);
    navTimerRef.current = window.setTimeout(() => {
      navTimerRef.current = 0;
      if (pendingRef.current === null) return;
      pendingRef.current = null;
      document.body.classList.remove("is-transitioning");
      const root = pageRoot();
      try {
        if (root) gsap.set(root, { clearProps: "filter,opacity,visibility" });
      } catch {
        /* ignore */
      }
      lenisStart();
    }, 12000);
  }, []);

  const disarmNavWatchdog = useCallback(() => {
    window.clearTimeout(navTimerRef.current);
    navTimerRef.current = 0;
  }, []);

  const teardownPage = useCallback(() => {
    // Bump the generation FIRST so any in-flight desktop-FX load/destroy
    // resolves stale and stands down instead of touching the next page.
    fxGen += 1;
    const gen = fxGen;
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
    // Backstop for detached instances missed above (fire and forget —
    // it only destroys disconnected hosts, so it can never race init).
    void pruneDetachedDesktopFx(gen);
  }, []);

  const initPage = useCallback(() => {
    // Capture the generation: async desktop-FX loads below stand down
    // if a teardown supersedes them before they resolve.
    const gen = fxGen;
    updateNavIndicators();
    // Preloader hooks ([data-preloader]) remount with every page, but the
    // preloader sequence itself runs only once per session — and its base
    // CSS stages those hooks hidden. Without this, remounted hooks (hero
    // logo cell, work header texts) stay invisible forever on revisits.
    // Only visibility is forced here; opacity/transform staging owned by
    // the reveal system is left untouched.
    try {
      qa<HTMLElement>("[data-preloader]").forEach((el) => {
        gsap.set(el, { visibility: "visible" });
      });
    } catch {
      /* reveal wiring below still applies */
    }
    // Static work page on phones: unhide everything instantly with zero
    // ScrollTriggers or scrub timelines — the bento grid just renders, and
    // every tile stays reachable no matter what animation does.
    try {
      const mobile =
        window.matchMedia("(max-width: 991px)").matches ||
        window.matchMedia("(pointer: coarse)").matches;
      const work =
        document.querySelector('main[data-page="works"]') !== null;
      if (mobile && work) {
        revealNow();
        try {
          ScrollTrigger.refresh();
        } catch {
          /* ignore */
        }
        lenisResize();
        return;
      }
    } catch {
      /* matchMedia unavailable — fall through to the animated path */
    }
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
    // lightweight FX above — phones skip this entirely (zero three.js),
    // as do pages with no desktop-FX hooks (work, contact, 404). Only
    // engines whose hooks exist in the DOM are imported.
    // NOTE: on home the full hero (fluid/orbit hooks) swaps in a beat
    // after this runs (HeroLite first paint) — the hero:swapped handler
    // below re-runs teardown+init onto the swapped DOM, so the fluid
    // engine still boots there.
    if (isDesktopFx()) {
      const needed = desktopHooks();
      if (needed.length) {
        void loadDesktopFx(needed, gen).then((extra) => {
          if (gen !== fxGen) return;
          for (const fn of extra) pageCleanups.current.push(fn);
          try {
            lenisResize();
            ScrollTrigger.refresh();
          } catch {
            /* ignore */
          }
        });
      }
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
    // Mobile fast-path: blur on the whole <main> forces a full-page GPU
    // composite pass on every frame — extremely expensive on phone GPUs.
    // On mobile, do a simple opacity fade (GPU-cheap) instead.
    if (isMobile()) {
      gsap.fromTo(
        root,
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          duration: DUR.S,
          ease: "power2.out",
          overwrite: "auto",
          clearProps: "opacity,visibility",
          onComplete: () => {
            try { ScrollTrigger.refresh(); } catch { /* ignore */ }
            lenisStart();
          },
        },
      );
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
      // Warm the full home-hero chunk while idle (desktop only — phones
      // never load it). Back-navigations to home then swap instantly
      // instead of flashing the static hero mid-intro.
      try {
        if (isDesktopFx()) {
          const warm = () => {
            void import("@/components/home/Hero").catch(() => {});
          };
          const w = window as Window & {
            requestIdleCallback?: (cb: () => void) => void;
          };
          if (typeof w.requestIdleCallback === "function")
            w.requestIdleCallback(warm);
          else window.setTimeout(warm, 2500);
        }
      } catch {
        /* prefetch is best-effort */
      }
      fxLog(
        `initPage done, ScrollTriggers: ${ScrollTrigger.getAll().length}, modules: ${fxStatus().modules.join(",")}`,
      );
    };
    void runPreloader().then(finishBoot, (err) => {
      console.error("[fx] preloader failed:", err);
      finishBoot();
    });
    // The home hero mounts static first and swaps in the full animated
    // hero once its chunk loads — rewire page FX onto the swapped DOM.
    // If boot hasn't finished, the swap is irrelevant (boot inits later).
    const onHeroSwapped = () => {
      if (!readyRef.current) return;
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
      playIntroSafe();
    };
    window.addEventListener("hero:swapped", onHeroSwapped);
    return () => {
      cancelled = true;
      disarmNavWatchdog();
      window.removeEventListener("hero:swapped", onHeroSwapped);
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
  }, [initPage, teardownPage, disarmNavWatchdog]);

  // Per-route init + transition completion.
  useEffect(() => {
    if (!readyRef.current) return;
    disarmNavWatchdog();
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
  }, [pathname, teardownPage, initPage, enter, disarmNavWatchdog]);

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
      armNavWatchdog();

      document.body.classList.add("is-transitioning");
      closeMenu();
      lenisStop();
      const root = pageRoot();
      const go = () => router.push(pendingRef.current ?? url.pathname);
      if (!root || prefersReduced()) {
        go();
        return;
      }
      // Mobile fast-path: skip the leave blur — a full-page blur filter
      // causes massive GPU overdraw on phone hardware. Just navigate.
      if (isMobile()) {
        go();
        return;
      }
      if ((window as unknown as { __noLeave?: boolean }).__noLeave) {
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
