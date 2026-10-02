import { DUR, gsap, q, qa, type Cleanup } from "@/lib/fx/core";
import { lenisResize } from "@/lib/fx/lenis";

/**
 * Pinned big-name scroll reveal, ported from legacy `initStickyNameReveal`
 * plus the `stickyName` scroll machine. Drives `.sticky-name-inner` width /
 * opacity with a paused timeline that plays at page bottom and reverses when
 * leaving. Disabled on the archive namespace (fixed-position fallback).
 *
 * Legacy goo-filter text animation is simplified to plain autoAlpha tweens.
 * Lenis scroll position is read from the window (Lenis scrolls natively),
 * gated on preloader completion via the `lenis:settled` event.
 */
export function initStickyName(): Cleanup {
  const cleanups: Cleanup[] = [];
  const inner = q<HTMLElement>(".sticky-name-inner");
  if (!inner) return () => {};

  const metas = qa<HTMLElement>('[data-sticky-meta="text"]');
  const wrap =
    inner.closest<HTMLElement>(".sticky-name-wrap") ?? inner.parentElement;

  const isArchive = (): boolean =>
    document.querySelector('[data-barba-namespace="archive"]') !== null;

  // Archive namespace: fixed fallback, no scroll machine.
  if (isArchive()) {
    if (wrap) gsap.set(wrap, { position: "fixed", bottom: 0, left: 0, right: 0 });
    const raf = requestAnimationFrame(() => lenisResize());
    return () => {
      cancelAnimationFrame(raf);
      if (wrap)
        gsap.set(wrap, { clearProps: "position,bottom,left,right" });
    };
  }

  if (wrap) gsap.set(wrap, { clearProps: "position,bottom,left,right" });
  gsap.set(inner, { clearProps: "width", opacity: 0 });
  hideMeta(true);

  let tl: gsap.core.Timeline | null = null;
  let triggered = false;
  let ready = qa("[data-preloader]").length === 0;
  let built = false;
  let settledTimer: ReturnType<typeof setTimeout> | null = null;

  function hideMeta(instant: boolean): void {
    gsap.killTweensOf(metas);
    if (instant || metas.length === 0) gsap.set(metas, { autoAlpha: 0 });
    else gsap.to(metas, { autoAlpha: 0, duration: DUR.S, ease: "power2.in" });
  }

  function revealMeta(): void {
    gsap.killTweensOf(metas);
    if (metas.length === 0) return;
    gsap.fromTo(
      metas,
      { autoAlpha: 0, y: 10 },
      {
        autoAlpha: 1,
        y: 0,
        duration: DUR.S,
        ease: "power3.out",
        stagger: DUR.STAGGER,
        overwrite: "auto",
      },
    );
  }

  function atBottom(): boolean {
    const limit = document.documentElement.scrollHeight - window.innerHeight;
    return limit <= 2 || window.scrollY >= limit - 2;
  }

  function checkBottom(): void {
    if (!ready || !built || !tl) return;
    if (isArchive()) {
      if (triggered) {
        triggered = false;
        hideMeta(false);
        tl.reverse();
      }
      return;
    }
    const bottom = atBottom();
    if (bottom && !triggered) {
      triggered = true;
      tl.play();
    } else if (!bottom && triggered) {
      triggered = false;
      hideMeta(false);
      tl.reverse();
    }
  }

  function build(): void {
    if (built) return;
    built = true;
    gsap.set(inner, { opacity: 1 });
    gsap.set(metas, { visibility: "visible" });
    hideMeta(true);
    tl = gsap
      .timeline({
        paused: true,
        onReverseComplete: () => hideMeta(true),
      })
      .fromTo(
        inner,
        { width: "100%" },
        { width: "29.45rem", duration: DUR.M, ease: "power4.inOut" },
      )
      .fromTo(
        inner,
        { opacity: 0.1 },
        { opacity: 1, duration: DUR.S, ease: "power2.inOut" },
        `-=${DUR.S}`,
      )
      .add(() => revealMeta());
    tl.progress(0).pause();

    const onScroll = () => checkBottom();
    window.addEventListener("scroll", onScroll, { passive: true });
    cleanups.push(() => window.removeEventListener("scroll", onScroll));
    const onSettled = () => checkBottom();
    window.addEventListener("lenis:settled", onSettled);
    cleanups.push(() => window.removeEventListener("lenis:settled", onSettled));
    const delayed = gsap.delayedCall(0.15, checkBottom);
    cleanups.push(() => delayed.kill());
  }

  function markReady(): void {
    if (ready) return;
    ready = true;
    if (settledTimer !== null) {
      clearTimeout(settledTimer);
      settledTimer = null;
    }
    build();
  }

  if (ready) {
    build();
  } else {
    window.addEventListener("lenis:settled", markReady, { once: true });
    cleanups.push(() => window.removeEventListener("lenis:settled", markReady));
    // Fallback so the name never stays hidden if the event is missed.
    settledTimer = setTimeout(markReady, 6000);
  }

  return () => {
    if (settledTimer !== null) clearTimeout(settledTimer);
    cleanups.forEach((fn) => fn());
    tl?.kill();
    tl = null;
    triggered = false;
    built = false;
    gsap.killTweensOf([inner, ...metas]);
  };
}
