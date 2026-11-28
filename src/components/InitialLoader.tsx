"use client";

import { useEffect, useState } from "react";
import { notifyLoaderDone } from "@/lib/loaderGate";

/**
 * InitialLoader — fullscreen loading cover with a bottom-left percentage
 * counter (1% -> 100%) that only runs on the initial page load, mirroring
 * the reference site (bleibtgleich.dev).
 *
 * Nothing underneath is visible until the counter reaches 100%: a
 * theme-colored cover hides all content, scroll is locked, and the legacy
 * intro sequence waits on the loader gate (`lib/loaderGate.ts`) before
 * playing any reveals.
 *
 * The counter is deliberately time-based. Videos use `poster` + lazy
 * `preload`, so waiting for them to buffer made first paint depend on
 * third-party media and stranded slow/blocked clients behind the cover.
 * Webfonts are given a short grace period only; hard ceilings guarantee
 * the gate and cover always release.
 */

const MIN_DISPLAY_MS = 1200;
const MAX_WAIT_MS = 2200;
const FORCE_RELEASE_MS = 3200;
const MOBILE_MIN_DISPLAY_MS = 500;
const MOBILE_MAX_WAIT_MS = 800;
const MOBILE_FORCE_RELEASE_MS = 1400;

function isMobileFastPath(): boolean {
  try {
    if (window.matchMedia("(max-width: 991px)").matches) return true;
    if (window.matchMedia("(pointer: coarse)").matches) return true;
    const nav = navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    };
    const conn = nav.connection;
    if (conn?.saveData) return true;
    if (conn?.effectiveType && /2g|3g|slow/.test(conn.effectiveType))
      return true;
  } catch {
    /* ignore */
  }
  return false;
}

export default function InitialLoader() {
  const [value, setValue] = useState(1);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const flags = window as Window & {
      __fxBootAt?: number;
      __fxFastLoaderReleased?: boolean;
    };
    if (flags.__fxFastLoaderReleased) {
      setGone(true);
      return;
    }
    const bootAt = flags.__fxBootAt;
    const startedAt =
      typeof bootAt === "number" && bootAt >= 0 ? bootAt : performance.now();
    const fastPath = isMobileFastPath();
    const minDisplayMs = fastPath ? MOBILE_MIN_DISPLAY_MS : MIN_DISPLAY_MS;
    const maxWaitMs = fastPath ? MOBILE_MAX_WAIT_MS : MAX_WAIT_MS;
    const forceReleaseMs = fastPath
      ? MOBILE_FORCE_RELEASE_MS
      : FORCE_RELEASE_MS;
    let disposed = false;
    let fontsReady = false;
    let settled = false;

    document.body.classList.add("is-initial-loading");

    try {
      if (document.fonts?.ready) {
        document.fonts.ready.then(
          () => {
            fontsReady = true;
          },
          () => {
            fontsReady = true;
          },
        );
      } else {
        fontsReady = true;
      }
    } catch {
      fontsReady = true;
    }

    const onSettled = () => {
      settled = true;
    };
    window.addEventListener("lenis:settled", onSettled);

    let raf = 0;
    let displayed = 1;
    let lastInt = 1;
    let finishTimer = 0;
    let forceTimer = 0;
    let released = false;

    const release = () => {
      if (released || disposed) return;
      released = true;
      document.body.classList.remove("is-initial-loading");
      if (forceTimer) {
        window.clearTimeout(forceTimer);
        forceTimer = 0;
      }
      setGone(true);
    };

    const tick = () => {
      if (disposed || released) return;
      const elapsed = performance.now() - startedAt;
      const ready = fontsReady || elapsed >= maxWaitMs;
      const target =
        ready && elapsed >= minDisplayMs
          ? 100
          : 1 + 89 * Math.min(elapsed / minDisplayMs, 1);

      if (fastPath && target === 100) displayed = 100;
      else displayed += Math.max((target - displayed) * 0.12, 0.5);
      if (target < 100 && displayed > 99) displayed = 99;
      if (target === 100 && displayed >= 99.4) displayed = 100;

      const current = Math.floor(displayed);
      if (current !== lastInt) {
        lastInt = current;
        setValue(current);
      }

      if (displayed >= 100) {
        try {
          notifyLoaderDone();
        } catch {
          /* ignore */
        }
        finishTimer = window.setTimeout(() => {
          if (disposed) return;
          setLeaving(true);
          window.setTimeout(() => {
            if (disposed) return;
            if (fastPath) {
              release();
              return;
            }
            if (settled) {
              release();
            } else {
              const fallback = window.setTimeout(release, 500);
              window.addEventListener(
                "lenis:settled",
                () => {
                  window.clearTimeout(fallback);
                  release();
                },
                { once: true },
              );
            }
          }, fastPath ? 300 : 450);
        }, fastPath ? 0 : 150);
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    forceTimer = window.setTimeout(() => {
      if (disposed || released) return;
      try {
        notifyLoaderDone();
      } catch {
        /* ignore */
      }
      release();
    }, forceReleaseMs);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(finishTimer);
      window.clearTimeout(forceTimer);
      window.removeEventListener("lenis:settled", onSettled);
      document.body.classList.remove("is-initial-loading");
    };
  }, []);

  if (gone) return null;

  return (
    <div
      aria-hidden="true"
      className={`initial-loader${leaving ? " is-leaving" : ""}`}
      suppressHydrationWarning
    >
      <div className="initial-loader__cover" />
      <span className="initial-loader__value" suppressHydrationWarning>
        {value}%
      </span>
    </div>
  );
}
