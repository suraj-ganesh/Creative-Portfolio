"use client";

import { useEffect, useState, type ComponentType } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import HeroLite from "@/components/home/HeroLite";

/** Full animation only where it can actually run smoothly. */
function canAnimate(): boolean {
  try {
    if (window.matchMedia("(max-width: 991px)").matches) return false;
    if (window.matchMedia("(pointer: coarse)").matches) return false;
    const nav = navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    };
    if (nav.connection?.saveData) return false;
    if (nav.connection?.effectiveType) {
      if (/2g|3g/.test(nav.connection.effectiveType)) return false;
    }
    if ((navigator.hardwareConcurrency || 8) <= 2) return false;
  } catch {
    return true;
  }
  return true;
}

/**
 * SSR-safe hero switch. First paint (server + client) is ALWAYS the static
 * HeroLite, so there is no hydration mismatch and phones never download
 * the animation code. Capable devices then dynamically import the full
 * Hero (code-split chunk, loaded after first paint under the loader cover)
 * and notify SiteFx to (re)run the page FX on the swapped DOM.
 */
export default function HomeHero() {
  const [FullHero, setFullHero] =
    useState<ComponentType<Record<string, never>> | null>(null);

  useEffect(() => {
    if (!canAnimate()) return;
    let live = true;
    void import("./Hero")
      .then((m) => {
        if (live) setFullHero(() => m.default);
      })
      .catch((err) => {
        console.error("[ui] full hero failed to load, keeping static:", err);
      });
    return () => {
      live = false;
    };
  }, []);

  // The full hero's DOM commits here — tell SiteFx to wire reveals/intro
  // on it (boot may already have run against the static hero).
  useEffect(() => {
    if (!FullHero) return;
    const t = window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent("hero:swapped"));
    }, 50);
    return () => window.clearTimeout(t);
  }, [FullHero]);

  return (
    <ErrorBoundary fallback={<HeroLite />}>
      {FullHero ? <FullHero /> : <HeroLite />}
    </ErrorBoundary>
  );
}
