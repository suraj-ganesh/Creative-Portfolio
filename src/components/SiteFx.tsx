"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap, ScrollTrigger, DUR, prefersReduced } from "@/lib/fx/core";
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
import { initNav, closeMenu, updateNavIndicators } from "@/lib/fx/nav";
import { initStickyName } from "@/lib/fx/sticky-name";
import { initGlobe, destroyGlobe } from "@/lib/fx/globe";
import { initFluidReveal, destroyFluidReveal } from "@/lib/fx/fluid";
import { initContactDial } from "@/lib/fx/dial";
import { initOrbitTiles } from "@/lib/fx/orbit";
import { initInfiniteCanvas, destroyInfiniteCanvas } from "@/lib/fx/canvas";

function pageRoot(): HTMLElement | null {
  return document.querySelector("main");
}

function scrollTopImmediate() {
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(0, { immediate: true });
  else window.scrollTo(0, 0);
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
    for (const fn of pageCleanups.current) {
      try {
        fn();
      } catch {
        /* ignore */
      }
    }
    pageCleanups.current = [];
    killReveals();
    destroyGlobe();
    destroyFluidReveal();
    destroyInfiniteCanvas();
  }, []);

  const initPage = useCallback(() => {
    updateNavIndicators();
    pageCleanups.current = [
      initReveals(),
      initLinks(),
      initTiltCursor(),
      initGlobe(),
      initFluidReveal(),
      initContactDial(),
      initOrbitTiles(),
      initInfiniteCanvas(),
      initStickyName(),
    ];
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
        onComplete: () => lenisStart(),
      },
    );
  }, []);

  // Boot once: persistent systems + first-visit preloader, then first page init.
  useEffect(() => {
    const bootCleanups = [
      initLenis(),
      initHaptics(),
      initCustomScrollbar(),
      initNav(),
    ];
    let cancelled = false;
    void runPreloader().then(() => {
      if (cancelled) return;
      readyRef.current = true;
      initPage();
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
    teardownPage();
    scrollTopImmediate();
    initPage();
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
