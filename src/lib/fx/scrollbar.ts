import { gsap, DESKTOP_QUERY, type Cleanup } from "@/lib/fx/core";
import { getLenis, LENIS_SETTLED } from "@/lib/fx/lenis";

/**
 * Custom scrollbar driven by the Lenis singleton.
 * Mirrors legacy initCustomScrollbar: desktop only, .scrollbar-wrap /
 * .scrollbar-thumb hooks, drag thumb to scroll (immediate), click track to
 * jump (animated), auto-hide after 1s idle, `is-scrollbar-dragging` class
 * while dragging.
 *
 * Two deliberate adaptations (no barba / no Lenis-guaranteed context):
 * - legacy guards on `window.__transitionRunning` become a check for
 *   `body.is-transitioning` (set by page transitions when present);
 * - legacy puts the dragging class on `document.documentElement` — kept as-is;
 * - when no Lenis instance exists (e.g. prefers-reduced-motion) the
 *   scrollbar falls back to native window scroll values so it stays
 *   functional instead of hiding.
 */
const HIDE_DELAY_MS = 1000;
const RESIZE_DEBOUNCE_MS = 150;
const DRAGGING_CLASS = "is-scrollbar-dragging";
const TRANSITIONING_CLASS = "is-transitioning";

export function initCustomScrollbar(): Cleanup {
  const wrap = document.querySelector<HTMLElement>(".scrollbar-wrap");
  const thumb = wrap?.querySelector<HTMLElement>(".scrollbar-thumb");
  if (!wrap || !thumb) return () => {};

  const mm = gsap.matchMedia();
  mm.add(DESKTOP_QUERY, () => {
    let trackH = 0;
    let thumbH = 0;
    let dragging = false;
    let hovering = false;
    let grabOffset = 0;
    let hidden: boolean | null = null;
    let noScroll = false;
    let hideTimer: ReturnType<typeof setTimeout> | null = null;
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    let attachedScrollHandler: (() => void) | null = null;

    const isTransitioning = () =>
      document.body.classList.contains(TRANSITIONING_CLASS);

    const readScroll = (): { pos: number; limit: number } => {
      const lenis = getLenis();
      if (lenis && lenis.limit > 0 && !lenis.isStopped) {
        return { pos: lenis.scroll, limit: lenis.limit };
      }
      const limit = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      return { pos: window.scrollY, limit };
    };

    const scrollToPos = (pos: number, immediate: boolean) => {
      const lenis = getLenis();
      if (lenis && lenis.limit > 0) {
        lenis.scrollTo(pos, { immediate });
      } else if (immediate) {
        window.scrollTo(0, pos);
      } else {
        window.scrollTo({ top: pos, behavior: "smooth" });
      }
    };

    const setThumbY = gsap.quickTo(thumb, "y", {
      duration: 0.15,
      ease: "none",
    });

    const setHidden = (value: boolean) => {
      if (hidden === value) return;
      hidden = value;
      gsap.to(wrap, {
        autoAlpha: value ? 0 : 1,
        duration: 0.3,
        overwrite: "auto",
      });
    };

    const scheduleHide = () => {
      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        if (!dragging && !hovering && !noScroll) setHidden(true);
      }, HIDE_DELAY_MS);
    };

    const show = () => {
      if (noScroll) return;
      setHidden(false);
      scheduleHide();
    };

    /** Recompute scrollability; hides the bar when there is nothing to scroll. */
    const checkScrollable = (): boolean => {
      noScroll = readScroll().limit <= 0;
      if (noScroll) {
        if (hideTimer) clearTimeout(hideTimer);
        setHidden(true);
      }
      return noScroll;
    };

    const position = () => {
      const { pos, limit } = readScroll();
      if (limit <= 0) return;
      const y = gsap.utils.clamp(0, 1, pos / limit) * (trackH - thumbH);
      if (dragging) gsap.set(thumb, { y });
      else setThumbY(y);
    };

    const measure = () => {
      trackH = wrap.clientHeight;
      if (checkScrollable()) return;
      thumbH = thumb.offsetHeight;
      position();
    };

    const onScroll = () => {
      if (isTransitioning()) return;
      checkScrollable();
      if (!noScroll) show();
      if (!dragging) position();
    };

    const jumpTo = (clientY: number, immediate: boolean) => {
      const { limit } = readScroll();
      if (limit <= 0) return;
      const rect = wrap.getBoundingClientRect();
      const padTop = parseFloat(getComputedStyle(wrap).paddingTop) || 0;
      const y = gsap.utils.clamp(
        0,
        trackH - thumbH,
        clientY - rect.top - padTop - grabOffset,
      );
      const frac = trackH - thumbH > 0 ? y / (trackH - thumbH) : 0;
      gsap.set(thumb, { y });
      scrollToPos(frac * limit, immediate);
    };

    const onThumbDown = (e: PointerEvent) => {
      if (isTransitioning() || hidden) return;
      dragging = true;
      if (hideTimer) clearTimeout(hideTimer);
      const y = gsap.getProperty(thumb, "y") as number;
      setThumbY(y, y);
      const rect = thumb.getBoundingClientRect();
      grabOffset = e.clientY - rect.top;
      thumb.setPointerCapture(e.pointerId);
      document.documentElement.classList.add(DRAGGING_CLASS);
      e.preventDefault();
    };

    const onThumbMove = (e: PointerEvent) => {
      if (dragging) jumpTo(e.clientY, true);
    };

    const onThumbUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      try {
        thumb.releasePointerCapture(e.pointerId);
      } catch {
        // capture may already be released
      }
      document.documentElement.classList.remove(DRAGGING_CLASS);
      const y = gsap.getProperty(thumb, "y") as number;
      setThumbY(y, y);
      scheduleHide();
    };

    const onTrackDown = (e: PointerEvent) => {
      if (isTransitioning() || hidden) return;
      if (e.target === thumb || thumb.contains(e.target as Node)) return;
      grabOffset = thumbH / 2;
      jumpTo(e.clientY, false);
      const y = gsap.getProperty(thumb, "y") as number;
      setThumbY(y, y);
      show();
    };

    const onEnter = () => {
      hovering = true;
      if (!noScroll) {
        if (hideTimer) clearTimeout(hideTimer);
        setHidden(false);
      }
    };

    const onLeave = () => {
      hovering = false;
      if (!dragging) scheduleHide();
    };

    const onResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(measure, RESIZE_DEBOUNCE_MS);
    };

    const onSettled = () => {
      ensureAttached();
      measure();
    };

    const onTick = () => {
      ensureAttached();
      const was = noScroll;
      checkScrollable();
      if (was && !noScroll) show();
    };

    const onNativeScroll = () => {
      if (!getLenis()) onScroll();
    };

    function ensureAttached() {
      const lenis = getLenis();
      if (lenis && attachedScrollHandler === null) {
        const handler = () => onScroll();
        attachedScrollHandler = handler;
        lenis.on("scroll", handler);
      } else if (!lenis && attachedScrollHandler !== null) {
        attachedScrollHandler = null;
      }
    }

    ensureAttached();
    thumb.addEventListener("pointerdown", onThumbDown);
    thumb.addEventListener("pointermove", onThumbMove);
    thumb.addEventListener("pointerup", onThumbUp);
    thumb.addEventListener("pointercancel", onThumbUp);
    wrap.addEventListener("pointerdown", onTrackDown);
    wrap.addEventListener("pointerenter", onEnter);
    wrap.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onNativeScroll, { passive: true });
    window.addEventListener(LENIS_SETTLED, onSettled);
    gsap.ticker.add(onTick);
    measure();
    if (!checkScrollable()) setHidden(true);

    return () => {
      const lenis = getLenis();
      if (lenis && attachedScrollHandler) {
        lenis.off("scroll", attachedScrollHandler);
      }
      attachedScrollHandler = null;
      thumb.removeEventListener("pointerdown", onThumbDown);
      thumb.removeEventListener("pointermove", onThumbMove);
      thumb.removeEventListener("pointerup", onThumbUp);
      thumb.removeEventListener("pointercancel", onThumbUp);
      wrap.removeEventListener("pointerdown", onTrackDown);
      wrap.removeEventListener("pointerenter", onEnter);
      wrap.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onNativeScroll);
      window.removeEventListener(LENIS_SETTLED, onSettled);
      gsap.ticker.remove(onTick);
      if (hideTimer) clearTimeout(hideTimer);
      if (resizeTimer) clearTimeout(resizeTimer);
      gsap.killTweensOf(wrap);
      document.documentElement.classList.remove(DRAGGING_CLASS);
    };
  });

  return () => {
    mm.revert();
  };
}
