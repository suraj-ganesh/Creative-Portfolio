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
 * playing any reveals — so text, nav and media all appear only after
 * loading has completed.
 *
 * Why it exists: the hero/work videos take a while to buffer, while the
 * legacy time-based preloader can finish before they are watchable. This
 * loader eases toward real readiness:
 *   - every <video> on the page counts once it can render frames
 *     (`loadeddata` / `canplaythrough`, or `readyState >= 2` on poll),
 *   - plus the window `load` event as one extra unit,
 *   - with a minimum visible time so the count-up reads, and a hard
 *     maximum so it can never hang (errors count as done).
 *
 * Initial-load only: it lives in the root layout, which React keeps mounted
 * across client-side route changes — so it runs on full document loads
 * (first visit / refresh) and never re-appears on SPA navigations.
 *
 * While active it hides the legacy `[data-preloader="count"]` readout via
 * the `is-initial-loading` body class so there is only ever one percentage
 * on screen.
 */

const MIN_DISPLAY_MS = 1400;
const MAX_WAIT_MS = 10000;
const VIDEO_GRACE_MS = 3000;
const OBSERVE_WINDOW_MS = 4000;

export default function InitialLoader() {
  // Rendered on first paint (including SSR) so the counter is visible
  // immediately; removed once loading completes.
  const [value, setValue] = useState(1);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const startedAt = performance.now();
    let loadTime = -1;
    let disposed = false;
    let settled = false;

    const videos = new Set<HTMLVideoElement>();
    const readyVideos = new Set<HTMLVideoElement>();

    document.body.classList.add("is-initial-loading");

    const detachFns = new Map<HTMLVideoElement, () => void>();

    function attach(video: HTMLVideoElement): void {
      if (videos.has(video)) return;
      videos.add(video);
      if (video.readyState >= 2 || video.error) {
        readyVideos.add(video);
        return;
      }
      const onReady = () => {
        readyVideos.add(video);
        detach();
      };
      const onError = () => {
        // A failed source must never stall the loader.
        readyVideos.add(video);
        detach();
      };
      const detach = () => {
        video.removeEventListener("loadeddata", onReady);
        video.removeEventListener("canplaythrough", onReady);
        video.removeEventListener("error", onError);
        detachFns.delete(video);
      };
      detachFns.set(video, detach);
      video.addEventListener("loadeddata", onReady);
      video.addEventListener("canplaythrough", onReady);
      video.addEventListener("error", onError);
    }

    const collect = (root: ParentNode) => {
      root.querySelectorAll("video").forEach(attach);
    };
    collect(document);

    // Videos render just after hydration — keep watching briefly so late
    // <video> nodes (orbit tiles, globe textures) are tracked too.
    const observer = new MutationObserver((mutations) => {
      if (performance.now() - startedAt > OBSERVE_WINDOW_MS) return;
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node instanceof HTMLVideoElement) attach(node);
          else if (node instanceof Element) collect(node);
        }
      }
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    let windowLoaded = document.readyState === "complete";
    if (windowLoaded) loadTime = performance.now();
    const onLoad = () => {
      windowLoaded = true;
      loadTime = performance.now();
    };
    if (!windowLoaded) window.addEventListener("load", onLoad, { once: true });

    // Webfonts shift text after paint — treat them as a load unit so the
    // cover only lifts once type is final.
    let fontsReady = false;
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

    const release = () => {
      document.body.classList.remove("is-initial-loading");
      setGone(true);
    };

    const tick = () => {
      if (disposed) return;
      const now = performance.now();
      const elapsed = now - startedAt;

      // Poll: some videos buffer without re-firing events.
      videos.forEach((v) => {
        if (v.readyState >= 2 || v.error) readyVideos.add(v);
      });
      // Grace: lazy (non-autoplay) videos may never buffer past metadata —
      // stop waiting for stragglers shortly after window load.
      if (
        windowLoaded &&
        loadTime >= 0 &&
        now - loadTime > VIDEO_GRACE_MS
      ) {
        videos.forEach((v) => readyVideos.add(v));
      }

      const total = videos.size + 2; // +1 window load, +1 webfonts
      const done =
        readyVideos.size + (windowLoaded ? 1 : 0) + (fontsReady ? 1 : 0);
      const allReady = done >= total;
      const timedOut = elapsed >= MAX_WAIT_MS;
      const minElapsed = elapsed >= MIN_DISPLAY_MS;

      let target: number;
      if ((allReady || timedOut) && minElapsed) {
        target = 100;
      } else {
        // Creep toward 90% while assets are pending so the number always
        // moves, then snap to 100 once everything is ready.
        target = 1 + 89 * (total > 0 ? done / total : 0);
      }

      displayed += Math.max((target - displayed) * 0.1, 0.2);
      if (target < 100 && displayed > 99) displayed = 99;
      if (target === 100 && displayed >= 99.4) displayed = 100;

      const current = Math.floor(displayed);
      if (current !== lastInt) {
        lastInt = current;
        setValue(current);
      }

      if (displayed >= 100) {
        // The counter hit 100%: release the gate immediately so the intro
        // sequence can start behind the cover fade — no content is visible
        // before this point.
        notifyLoaderDone();
        finishTimer = window.setTimeout(() => {
          if (disposed) return;
          setLeaving(true);
          // Let the fade play, then unmount. Keep the legacy count hidden
          // until the legacy preloader has settled too, so the two never
          // overlap (legacy finishes on `lenis:settled`).
          window.setTimeout(() => {
            if (disposed) return;
            if (settled) {
              release();
            } else {
              const fallback = window.setTimeout(release, 1500);
              window.addEventListener(
                "lenis:settled",
                () => {
                  window.clearTimeout(fallback);
                  release();
                },
                { once: true },
              );
            }
          }, 600);
        }, 250);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(finishTimer);
      observer.disconnect();
      detachFns.forEach((detach) => detach());
      window.removeEventListener("load", onLoad);
      window.removeEventListener("lenis:settled", onSettled);
      document.body.classList.remove("is-initial-loading");
    };
  }, []);

  if (gone) return null;

  return (
    <div
      aria-hidden="true"
      className={`initial-loader${leaving ? " is-leaving" : ""}`}
    >
      <div className="initial-loader__cover" />
      <span className="initial-loader__value">{value}%</span>
    </div>
  );
}
